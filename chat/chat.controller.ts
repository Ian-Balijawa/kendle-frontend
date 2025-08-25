import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	Request,
	UseGuards,
	ParseUUIDPipe,
	ParseIntPipe,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiQuery,
	ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import {
	CreateConversationDto,
	SendMessageDto,
	UpdateMessageDto,
	AddReactionDto,
	UpdateConversationDto,
	ConversationResponseDto,
	MessageResponseDto,
} from './models/chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Post('conversations')
	@ApiOperation({ summary: 'Create a new conversation' })
	@ApiResponse({ status: 201, type: ConversationResponseDto })
	async createConversation(
		@Body() createConversationDto: CreateConversationDto,
		@Request() req: any
	): Promise<ConversationResponseDto> {
		return this.chatService.createConversation(createConversationDto, req.user.id);
	}

	@Get('conversations')
	@ApiOperation({ summary: 'Get all conversations for the current user' })
	@ApiResponse({ status: 200, type: [ConversationResponseDto] })
	async getUserConversations(@Request() req: any): Promise<ConversationResponseDto[]> {
		return this.chatService.getUserConversations(req.user.id);
	}

	@Get('conversations/:id')
	@ApiOperation({ summary: 'Get a specific conversation by ID' })
	@ApiParam({ name: 'id', description: 'Conversation ID' })
	@ApiResponse({ status: 200, type: ConversationResponseDto })
	async getConversationById(
		@Param('id', ParseUUIDPipe) id: string,
		@Request() req: any
	): Promise<ConversationResponseDto> {
		return this.chatService.getConversationById(id, req.user.id);
	}

	@Put('conversations/:id')
	@ApiOperation({ summary: 'Update conversation settings' })
	@ApiParam({ name: 'id', description: 'Conversation ID' })
	@ApiResponse({ status: 200, type: ConversationResponseDto })
	async updateConversation(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateConversationDto: UpdateConversationDto,
		@Request() req: any
	): Promise<ConversationResponseDto> {
		return this.chatService.updateConversation(id, updateConversationDto, req.user.id);
	}

	@Post('conversations/:id/messages')
	@ApiOperation({ summary: 'Send a message in a conversation' })
	@ApiParam({ name: 'id', description: 'Conversation ID' })
	@ApiResponse({ status: 201, type: MessageResponseDto })
	async sendMessage(
		@Param('id', ParseUUIDPipe) conversationId: string,
		@Body() sendMessageDto: SendMessageDto,
		@Request() req: any
	): Promise<MessageResponseDto> {
		// Ensure conversation ID matches the route parameter
		sendMessageDto.conversationId = conversationId;
		return this.chatService.sendMessage(sendMessageDto, req.user.id);
	}

	@Get('conversations/:id/messages')
	@ApiOperation({ summary: 'Get messages for a conversation' })
	@ApiParam({ name: 'id', description: 'Conversation ID' })
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of messages to fetch',
	})
	@ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
	@ApiResponse({ status: 200, type: [MessageResponseDto] })
	async getConversationMessages(
		@Param('id', ParseUUIDPipe) conversationId: string,
		@Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
		@Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
		@Request() req: any
	): Promise<MessageResponseDto[]> {
		return this.chatService.getConversationMessages(conversationId, req.user.id, limit, offset);
	}

	@Put('messages/:id')
	@ApiOperation({ summary: 'Update a message' })
	@ApiParam({ name: 'id', description: 'Message ID' })
	@ApiResponse({ status: 200, type: MessageResponseDto })
	async updateMessage(
		@Param('id', ParseUUIDPipe) messageId: string,
		@Body() updateMessageDto: UpdateMessageDto,
		@Request() req: any
	): Promise<MessageResponseDto> {
		return this.chatService.updateMessage(messageId, updateMessageDto, req.user.id);
	}

	@Delete('messages/:id')
	@ApiOperation({ summary: 'Delete a message' })
	@ApiParam({ name: 'id', description: 'Message ID' })
	@ApiResponse({ status: 204 })
	async deleteMessage(
		@Param('id', ParseUUIDPipe) messageId: string,
		@Request() req: any
	): Promise<void> {
		return this.chatService.deleteMessage(messageId, req.user.id);
	}

	@Put('messages/:id/read')
	@ApiOperation({ summary: 'Mark a message as read' })
	@ApiParam({ name: 'id', description: 'Message ID' })
	@ApiResponse({ status: 200, type: MessageResponseDto })
	async markMessageAsRead(
		@Param('id', ParseUUIDPipe) messageId: string,
		@Request() req: any
	): Promise<MessageResponseDto> {
		return this.chatService.markMessageAsRead(messageId, req.user.id);
	}

	@Put('conversations/:id/read')
	@ApiOperation({ summary: 'Mark all messages in a conversation as read' })
	@ApiParam({ name: 'id', description: 'Conversation ID' })
	@ApiResponse({ status: 204 })
	async markConversationAsRead(
		@Param('id', ParseUUIDPipe) conversationId: string,
		@Request() req: any
	): Promise<void> {
		return this.chatService.markConversationAsRead(conversationId, req.user.id);
	}

	@Post('messages/:id/reactions')
	@ApiOperation({ summary: 'Add or remove reaction to a message' })
	@ApiParam({ name: 'id', description: 'Message ID' })
	@ApiResponse({ status: 204 })
	async addReaction(
		@Param('id', ParseUUIDPipe) messageId: string,
		@Body() addReactionDto: AddReactionDto,
		@Request() req: any
	): Promise<void> {
		// Ensure message ID matches the route parameter
		addReactionDto.messageId = messageId;
		return this.chatService.addReaction(addReactionDto, req.user.id);
	}

	@Get('unread-count')
	@ApiOperation({ summary: 'Get unread message count for current user' })
	@ApiResponse({
		status: 200,
		schema: { type: 'object', properties: { count: { type: 'number' } } },
	})
	async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
		const count = await this.chatService.getUnreadCount(req.user.id);
		return { count };
	}

	@Post('conversations/direct')
	@ApiOperation({ summary: 'Find or create direct conversation with another user' })
	@ApiResponse({ status: 200, type: ConversationResponseDto })
	async findOrCreateDirectConversation(
		@Body() body: { userId: string },
		@Request() req: any
	): Promise<ConversationResponseDto> {
		return this.chatService.findOrCreateDirectConversation(req.user.id, body.userId);
	}
}
