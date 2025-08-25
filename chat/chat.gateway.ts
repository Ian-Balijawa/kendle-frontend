import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
	OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
	Injectable,
	Logger,
	UseGuards,
	UsePipes,
	UseFilters,
	UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { WebSocketMessageDto, TypingIndicatorDto, MarkMessageAsReadDto } from './models/chat.dto';
import { WsAuthGuard, AuthenticatedSocket } from './guards/ws-auth.guard';
import { WsExceptionFilter, AllWsExceptionsFilter } from './filters/ws-exception.filter';
import { WsValidationPipe } from './pipes/ws-validation.pipe';
import {
	WsLoggingInterceptor,
	WsTransformInterceptor,
} from './interceptors/ws-logging.interceptor';

@Injectable()
@UseFilters(new AllWsExceptionsFilter(), new WsExceptionFilter())
@UseInterceptors(WsLoggingInterceptor, WsTransformInterceptor)
@WebSocketGateway({
	namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(ChatGateway.name);
	private connectedUsers = new Map<string, string>(); // userId -> socketId
	private userSockets = new Map<string, string>(); // socketId -> userId
	private typingUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds

	constructor(private readonly chatService: ChatService) {}

	afterInit(server: Server) {
		this.logger.log('Chat WebSocket Gateway initialized');
	}

	async handleConnection(client: AuthenticatedSocket) {
		const userId = client.userId!; // Already authenticated by adapter

		// Store user connection
		this.connectedUsers.set(userId, client.id);
		this.userSockets.set(client.id, userId);

		// Join user to their personal room
		await client.join(`user_${userId}`);

		// Get user's conversations and join those rooms
		try {
			const conversations = await this.chatService.getUserConversations(userId);
			for (const conversation of conversations) {
				await client.join(`conversation_${conversation.id}`);
			}
		} catch (error) {
			this.logger.error(`Error loading conversations for user ${userId}:`, error);
		}

		// Notify others that user is online
		this.server.emit('user_online', {
			type: 'user_online',
			data: { userId },
			timestamp: new Date().toISOString(),
		});

		this.logger.log(`User ${userId} connected with socket ${client.id}`);
	}

	async handleDisconnect(client: AuthenticatedSocket) {
		const userId = this.userSockets.get(client.id);

		if (userId) {
			// Remove user from connected users
			this.connectedUsers.delete(userId);
			this.userSockets.delete(client.id);

			// Remove from typing indicators
			this.typingUsers.forEach((users, conversationId) => {
				if (users.has(userId)) {
					users.delete(userId);
					// Notify others that user stopped typing
					this.server.to(`conversation_${conversationId}`).emit('typing_stop', {
						type: 'typing_stop',
						data: { userId, conversationId },
						timestamp: new Date().toISOString(),
					});
				}
			});

			// Notify others that user is offline
			this.server.emit('user_offline', {
				type: 'user_offline',
				data: { userId },
				timestamp: new Date().toISOString(),
			});

			this.logger.log(`User ${userId} disconnected`);
		}
	}

	@UseGuards(WsAuthGuard)
	@UsePipes(new WsValidationPipe())
	@SubscribeMessage('send_message')
	async handleMessage(
		@MessageBody() data: WebSocketMessageDto,
		@ConnectedSocket() client: AuthenticatedSocket
	) {
		// Send message through service
		const message = await this.chatService.sendMessage(
			{
				content: data.content,
				receiverId: data.receiverId,
				conversationId: data.conversationId,
				messageType: data.messageType,
				replyToId: data.replyToId,
				metadata: data.metadata,
			},
			client.userId!
		);

		// Emit to conversation participants
		this.server.to(`conversation_${data.conversationId}`).emit('message_received', {
			type: 'message_received',
			data: message,
			timestamp: new Date().toISOString(),
		});

		// Send delivery confirmation to sender
		client.emit('message_delivered', {
			type: 'message_delivered',
			data: { messageId: message.id, conversationId: data.conversationId },
			timestamp: new Date().toISOString(),
		});

		return { success: true, message };
	}

	@UseGuards(WsAuthGuard)
	@UsePipes(new WsValidationPipe())
	@SubscribeMessage('mark_message_read')
	async handleMarkAsRead(
		@MessageBody() data: MarkMessageAsReadDto,
		@ConnectedSocket() client: AuthenticatedSocket
	) {
		await this.chatService.markMessageAsRead(data.messageId, client.userId!);

		// Notify conversation participants about read status
		this.server.to(`conversation_${data.conversationId}`).emit('message_read', {
			type: 'message_read',
			data: { messageId: data.messageId, userId: client.userId },
			timestamp: new Date().toISOString(),
		});

		return { success: true };
	}

	@UseGuards(WsAuthGuard)
	@UsePipes(new WsValidationPipe())
	@SubscribeMessage('typing_indicator')
	async handleTyping(
		@MessageBody() data: TypingIndicatorDto,
		@ConnectedSocket() client: AuthenticatedSocket
	) {
		const { conversationId, isTyping } = data;

		// Update typing indicators
		if (!this.typingUsers.has(conversationId)) {
			this.typingUsers.set(conversationId, new Set());
		}

		const typingUsersInConversation = this.typingUsers.get(conversationId)!;

		if (isTyping) {
			typingUsersInConversation.add(client.userId!);

			// Notify others in conversation (except sender)
			client.to(`conversation_${conversationId}`).emit('typing_start', {
				type: 'typing_start',
				data: { userId: client.userId, conversationId },
				timestamp: new Date().toISOString(),
			});
		} else {
			typingUsersInConversation.delete(client.userId!);

			// Notify others in conversation (except sender)
			client.to(`conversation_${conversationId}`).emit('typing_stop', {
				type: 'typing_stop',
				data: { userId: client.userId, conversationId },
				timestamp: new Date().toISOString(),
			});
		}

		return { success: true };
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('join_conversation')
	async handleJoinConversation(
		@MessageBody() data: { conversationId: string },
		@ConnectedSocket() client: AuthenticatedSocket
	) {
		// Verify user is participant in conversation
		const conversation = await this.chatService.getConversationById(
			data.conversationId,
			client.userId!
		);

		if (conversation) {
			await client.join(`conversation_${data.conversationId}`);
			return { success: true };
		} else {
			return { error: 'Not authorized to join conversation' };
		}
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('leave_conversation')
	async handleLeaveConversation(
		@MessageBody() data: { conversationId: string },
		@ConnectedSocket() client: AuthenticatedSocket
	) {
		await client.leave(`conversation_${data.conversationId}`);

		// Remove from typing indicators if present
		const typingUsers = this.typingUsers.get(data.conversationId);
		if (typingUsers && client.userId) {
			typingUsers.delete(client.userId);
		}

		return { success: true };
	}

	/**
	 * Check if user is online
	 */
	isUserOnline(userId: string): boolean {
		return this.connectedUsers.has(userId);
	}

	/**
	 * Get online users count
	 */
	getOnlineUsersCount(): number {
		return this.connectedUsers.size;
	}

	/**
	 * Send notification to specific user
	 */
	async sendNotificationToUser(userId: string, notification: any): Promise<void> {
		const socketId = this.connectedUsers.get(userId);
		if (socketId) {
			this.server.to(`user_${userId}`).emit('notification', {
				type: 'notification',
				data: notification,
				timestamp: new Date().toISOString(),
			});
		}
	}

	/**
	 * Notify conversation about new message (used by service)
	 */
	async notifyNewMessage(conversationId: string, message: any): Promise<void> {
		this.server.to(`conversation_${conversationId}`).emit('message_received', {
			type: 'message_received',
			data: message,
			timestamp: new Date().toISOString(),
		});
	}

	/**
	 * Notify about new conversation creation
	 */
	async notifyNewConversation(userId: string, conversation: any): Promise<void> {
		this.server.to(`user_${userId}`).emit('conversation_created', {
			type: 'conversation_created',
			data: conversation,
			timestamp: new Date().toISOString(),
		});
	}
}
