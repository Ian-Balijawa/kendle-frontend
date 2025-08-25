import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Conversation } from './models/conversation.entity';
import { Message } from './models/message.entity';
import { MessageReaction } from './models/message-reaction.entity';
import { User } from '../user/user.entity';
import {
	CreateConversationDto,
	SendMessageDto,
	UpdateMessageDto,
	AddReactionDto,
	UpdateConversationDto,
	ConversationResponseDto,
	MessageResponseDto,
} from './models/chat.dto';
import { ConversationType, MessageStatus, MessageType } from './models/chat.enums';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository( Conversation )
		private readonly conversationRepository: EntityRepository<Conversation>,
		@InjectRepository( Message )
		private readonly messageRepository: EntityRepository<Message>,
		@InjectRepository( MessageReaction )
		private readonly reactionRepository: EntityRepository<MessageReaction>,
		@InjectRepository( User )
		private readonly userRepository: EntityRepository<User>,
		private readonly em: EntityManager
	) { }

	/**
	 * Create a new conversation between users
	 */
	async createConversation(
		createConversationDto: CreateConversationDto,
		currentUserId: string
	): Promise<ConversationResponseDto> {
		const { participantIds, name, description } = createConversationDto;

		// Add current user to participants if not included
		const allParticipantIds = participantIds.includes( currentUserId )
			? participantIds
			: [...participantIds, currentUserId];

		// Fetch all participants
		const participants = await this.userRepository.find( {
			id: { $in: allParticipantIds },
		} );

		if ( participants.length !== allParticipantIds.length ) {
			throw new NotFoundException( 'One or more participants not found' );
		}

		// For direct conversations, check if one already exists
		if ( allParticipantIds.length === 2 ) {
			const existingConversation = await this.conversationRepository.findOne(
				{
					type: ConversationType.DIRECT,
					participants: { $in: allParticipantIds },
				},
				{
					populate: ['participants', 'messages'],
				}
			);

			if ( existingConversation ) {
				return this.formatConversationResponse( existingConversation, currentUserId );
			}
		}

		// Create new conversation
		const conversation = new Conversation();
		conversation.type =
			allParticipantIds.length === 2 ? ConversationType.DIRECT : ConversationType.GROUP;
		conversation.name = name;
		conversation.description = description;

		participants.forEach( ( participant ) => conversation.participants.add( participant ) );
		await this.em.persistAndFlush( conversation );

		// Populate for response
		await this.conversationRepository.populate( conversation, ['participants'] );

		return this.formatConversationResponse( conversation, currentUserId );
	}

	/**
	 * Get all conversations for a user
	 */
	async getUserConversations( userId: string ): Promise<ConversationResponseDto[]> {
		const conversations = await this.conversationRepository.find(
			{
				participants: { id: userId },
			},
			{
				populate: [
					'participants',
					'messages',
					'messages.sender',
					'messages.receiver',
					'messages.reactions',
					'messages.reactions.user'
				],
				orderBy: { updatedAt: 'DESC' },
			}
		);

		return conversations.map( ( conv ) => this.formatConversationResponse( conv, userId ) );
	}

	/**
	 * Get a specific conversation by ID
	 */
	async getConversationById(
		conversationId: string,
		userId: string
	): Promise<ConversationResponseDto> {
		const conversation = await this.conversationRepository.findOne(
			{
				id: conversationId,
				participants: { id: userId },
			},
			{
				populate: [
					'participants',
					'messages',
					'messages.sender',
					'messages.receiver',
					'messages.reactions',
					'messages.reactions.user'
				],
			}
		);

		if ( !conversation ) {
			throw new NotFoundException( 'Conversation not found' );
		}

		return this.formatConversationResponse( conversation, userId );
	}

	/**
	 * Send a message in a conversation
	 */
	async sendMessage( sendMessageDto: SendMessageDto, senderId: string ): Promise<MessageResponseDto> {
		const { content, receiverId, conversationId, messageType, replyToId, metadata } =
			sendMessageDto;

		// Verify conversation exists and user is participant
		const conversation = await this.conversationRepository.findOne(
			{
				id: conversationId,
				participants: { id: senderId },
			},
			{
				populate: ['participants'],
			}
		);

		if ( !conversation ) {
			throw new NotFoundException( 'Conversation not found' );
		}

		// Verify receiver is participant
		const isReceiverParticipant = conversation.participants
			.getItems()
			.some( ( p ) => p.id === receiverId );

		if ( !isReceiverParticipant ) {
			throw new ForbiddenException( 'Receiver is not a participant in this conversation' );
		}

		// Get sender and receiver
		const sender = await this.userRepository.findOneOrFail( { id: senderId } );
		const receiver = await this.userRepository.findOneOrFail( { id: receiverId } );

		// Create message
		const message = new Message();
		message.content = content;
		message.messageType = messageType || MessageType.TEXT;
		message.sender = sender;
		message.receiver = receiver;
		message.conversation = conversation;
		message.replyToId = replyToId;
		message.metadata = metadata;
		message.status = MessageStatus.SENT;
		message.isDelivered = true;
		message.deliveredAt = new Date();

		await this.em.persistAndFlush( message );

		// Update conversation's updatedAt
		conversation.updatedAt = new Date();
		await this.em.persistAndFlush( conversation );

		// Populate for response
		await this.messageRepository.populate( message, ['sender', 'receiver', 'reactions'] );

		return this.formatMessageResponse( message );
	}

	/**
	 * Get messages for a conversation
	 */
	async getConversationMessages(
		conversationId: string,
		userId: string,
		limit: number = 50,
		offset: number = 0
	): Promise<MessageResponseDto[]> {
		// Verify user is participant
		const conversation = await this.conversationRepository.findOne( {
			id: conversationId,
			participants: { id: userId },
		} );

		if ( !conversation ) {
			throw new NotFoundException( 'Conversation not found' );
		}

		const messages = await this.messageRepository.find(
			{
				conversation: { id: conversationId },
			},
			{
				populate: ['sender', 'receiver', 'reactions', 'reactions.user'],
				orderBy: { createdAt: 'DESC' },
				limit,
				offset,
			}
		);

		return messages.map( ( msg ) => this.formatMessageResponse( msg ) );
	}

	/**
	 * Mark message as read
	 */
	async markMessageAsRead( messageId: string, userId: string ): Promise<MessageResponseDto> {
		const message = await this.messageRepository.findOne(
			{
				id: messageId,
				receiver: { id: userId },
			},
			{
				populate: ['sender', 'receiver', 'reactions'],
			}
		);

		if ( !message ) {
			throw new NotFoundException( 'Message not found' );
		}

		if ( !message.isRead ) {
			message.isRead = true;
			message.readAt = new Date();
			await this.em.persistAndFlush( message );
		}

		return this.formatMessageResponse( message );
	}

	/**
	 * Mark all messages in conversation as read
	 */
	async markConversationAsRead( conversationId: string, userId: string ): Promise<void> {
		// Verify user is participant
		const conversation = await this.conversationRepository.findOne( {
			id: conversationId,
			participants: { id: userId },
		} );

		if ( !conversation ) {
			throw new NotFoundException( 'Conversation not found' );
		}

		await this.messageRepository.nativeUpdate(
			{
				conversation: { id: conversationId },
				receiver: { id: userId },
				isRead: false,
			},
			{
				isRead: true,
				readAt: new Date(),
			}
		);
	}

	/**
	 * Update a message
	 */
	async updateMessage(
		messageId: string,
		updateMessageDto: UpdateMessageDto,
		userId: string
	): Promise<MessageResponseDto> {
		const message = await this.messageRepository.findOne(
			{
				id: messageId,
				sender: { id: userId },
			},
			{
				populate: ['sender', 'receiver', 'reactions'],
			}
		);

		if ( !message ) {
			throw new NotFoundException( 'Message not found' );
		}

		message.content = updateMessageDto.content;
		message.isEdited = true;
		message.editedAt = new Date();

		await this.em.persistAndFlush( message );

		return this.formatMessageResponse( message );
	}

	/**
	 * Delete a message
	 */
	async deleteMessage( messageId: string, userId: string ): Promise<void> {
		const message = await this.messageRepository.findOne( {
			id: messageId,
			sender: { id: userId },
		} );

		if ( !message ) {
			throw new NotFoundException( 'Message not found' );
		}

		await this.em.removeAndFlush( message );
	}

	/**
	 * Add reaction to message
	 */
	async addReaction( addReactionDto: AddReactionDto, userId: string ): Promise<void> {
		const { emoji, messageId } = addReactionDto;

		const message = await this.messageRepository.findOneOrFail( { id: messageId } );
		const user = await this.userRepository.findOneOrFail( { id: userId } );

		// Check if reaction already exists
		const existingReaction = await this.reactionRepository.findOne( {
			message: { id: messageId },
			user: { id: userId },
			emoji,
		} );

		if ( existingReaction ) {
			// Remove existing reaction (toggle)
			await this.em.removeAndFlush( existingReaction );
		} else {
			// Add new reaction
			const reaction = new MessageReaction();
			reaction.emoji = emoji;
			reaction.message = message;
			reaction.user = user;

			await this.em.persistAndFlush( reaction );
		}
	}

	/**
	 * Update conversation settings
	 */
	async updateConversation(
		conversationId: string,
		updateConversationDto: UpdateConversationDto,
		userId: string
	): Promise<ConversationResponseDto> {
		const conversation = await this.conversationRepository.findOne(
			{
				id: conversationId,
				participants: { id: userId },
			},
			{
				populate: ['participants'],
			}
		);

		if ( !conversation ) {
			throw new NotFoundException( 'Conversation not found' );
		}

		Object.assign( conversation, updateConversationDto );
		await this.em.persistAndFlush( conversation );

		return this.formatConversationResponse( conversation, userId );
	}

	/**
	 * Get unread message count for user
	 */
	async getUnreadCount( userId: string ): Promise<number> {
		const count = await this.messageRepository.count( {
			receiver: { id: userId },
			isRead: false,
		} );

		return count;
	}

	/**
	 * Find or create direct conversation between two users
	 */
	async findOrCreateDirectConversation(
		userId1: string,
		userId2: string
	): Promise<ConversationResponseDto> {
		// Check if conversation already exists
		let conversation = await this.conversationRepository.findOne(
			{
				type: ConversationType.DIRECT,
				participants: { $in: [userId1, userId2] },
			},
			{
				populate: [
					'participants',
					'messages',
					'messages.sender',
					'messages.receiver',
					'messages.reactions',
					'messages.reactions.user'
				],
			}
		);

		if ( !conversation ) {
			// Create new conversation
			const createDto: CreateConversationDto = {
				participantIds: [userId2],
			};
			return this.createConversation( createDto, userId1 );
		}

		return this.formatConversationResponse( conversation, userId1 );
	}

	/**
	 * Format conversation for response
	 */
	private formatConversationResponse(
		conversation: Conversation,
		currentUserId: string
	): ConversationResponseDto {
		const participants = conversation.participants.getItems();
		const otherParticipants = participants.filter( ( p ) => p.id !== currentUserId );

		// Safely get messages, handling cases where the collection might not be initialized
		let messages: Message[] = [];
		let lastMessage: Message | undefined;
		let unreadCount = 0;

		try {
			if ( conversation.messages && conversation.messages.isInitialized() ) {
				messages = conversation.messages.getItems();
				lastMessage = messages.sort( ( a, b ) => b.createdAt.getTime() - a.createdAt.getTime() )[0];

				// Count unread messages
				unreadCount = messages.filter(
					( msg ) => msg.receiver.id === currentUserId && !msg.isRead
				).length;
			}
		} catch ( error ) {
			// If messages collection is not properly initialized, use defaults
			messages = [];
			lastMessage = undefined;
			unreadCount = 0;
		}

		return {
			id: conversation.id,
			type: conversation.type,
			name: conversation.name,
			avatar: conversation.avatar,
			description: conversation.description,
			participants: otherParticipants.map( ( p ) => ( {
				id: p.id,
				phoneNumber: p.phoneNumber,
				username: p.username,
				firstName: p.firstName,
				lastName: p.lastName,
				avatar: p.avatar,
				isVerified: p.isVerified,
				isProfileComplete: p.isProfileComplete,
				createdAt: p.createdAt.toISOString(),
				updatedAt: p.updatedAt.toISOString(),
				followersCount: p.followersCount,
				followingCount: p.followingCount,
				postsCount: p.postsCount,
			} ) ),
			lastMessage: lastMessage ? this.formatMessageResponse( lastMessage ) : undefined,
			unreadCount,
			isArchived: conversation.isArchived,
			isMuted: conversation.isMuted,
			isPinned: conversation.isPinned,
			createdAt: conversation.createdAt.toISOString(),
			updatedAt: conversation.updatedAt.toISOString(),
		};
	}

	/**
	 * Format message for response
	 */
	private formatMessageResponse( message: Message ): MessageResponseDto {
		// Safely get reactions, handling cases where the collection might not be initialized
		let reactions: Array<{
			id: string;
			emoji: string;
			userId: string;
			createdAt: string;
		}> = [];

		try {
			if ( message.reactions && message.reactions.isInitialized() ) {
				reactions = message.reactions.getItems().map( ( reaction ) => ( {
					id: reaction.id,
					emoji: reaction.emoji,
					userId: reaction.user.id,
					createdAt: reaction.createdAt.toISOString(),
				} ) );
			}
		} catch ( error ) {
			// If reactions collection is not properly initialized, return empty array
			reactions = [];
		}

		return {
			id: message.id,
			content: message.content,
			messageType: message.messageType,
			status: message.status,
			senderId: message.sender.id,
			receiverId: message.receiver.id,
			conversationId: message.conversation.id,
			isRead: message.isRead,
			isDelivered: message.isDelivered,
			isEdited: message.isEdited,
			editedAt: message.editedAt?.toISOString(),
			readAt: message.readAt?.toISOString(),
			deliveredAt: message.deliveredAt?.toISOString(),
			replyToId: message.replyToId,
			metadata: message.metadata,
			reactions,
			createdAt: message.createdAt.toISOString(),
			updatedAt: message.updatedAt.toISOString(),
		};
	}
}
