import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsUUID,
	IsEnum,
	IsBoolean,
	IsArray,
	IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from './chat.enums';

export class CreateConversationDto {
	@ApiProperty({ description: 'Array of participant user IDs' })
	@IsArray()
	@IsUUID(4, { each: true })
	participantIds!: string[];

	@ApiPropertyOptional({ description: 'Conversation name for group chats' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ description: 'Conversation description' })
	@IsOptional()
	@IsString()
	description?: string;
}

export class SendMessageDto {
	@ApiProperty({ description: 'Message content' })
	@IsString()
	@IsNotEmpty()
	content!: string;

	@ApiProperty({ description: 'Receiver user ID' })
	@IsUUID()
	receiverId!: string;

	@ApiProperty({ description: 'Conversation ID' })
	@IsUUID()
	conversationId!: string;

	@ApiPropertyOptional({ enum: MessageType, description: 'Message type' })
	@IsOptional()
	@IsEnum(MessageType)
	messageType?: MessageType;

	@ApiPropertyOptional({ description: 'Message to reply to' })
	@IsOptional()
	@IsUUID()
	replyToId?: string;

	@ApiPropertyOptional({ description: 'Additional metadata' })
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>;
}

export class UpdateMessageDto {
	@ApiProperty({ description: 'Updated message content' })
	@IsString()
	@IsNotEmpty()
	content!: string;
}

export class MarkMessageAsReadDto {
	@ApiProperty({ description: 'Message ID to mark as read' })
	@IsUUID()
	messageId!: string;

	@ApiProperty({ description: 'Conversation ID' })
	@IsUUID()
	conversationId!: string;
}

export class AddReactionDto {
	@ApiProperty({ description: 'Emoji reaction' })
	@IsString()
	@IsNotEmpty()
	emoji!: string;

	@ApiProperty({ description: 'Message ID to react to' })
	@IsUUID()
	messageId!: string;
}

export class UpdateConversationDto {
	@ApiPropertyOptional({ description: 'Archive status' })
	@IsOptional()
	@IsBoolean()
	isArchived?: boolean;

	@ApiPropertyOptional({ description: 'Mute status' })
	@IsOptional()
	@IsBoolean()
	isMuted?: boolean;

	@ApiPropertyOptional({ description: 'Pin status' })
	@IsOptional()
	@IsBoolean()
	isPinned?: boolean;

	@ApiPropertyOptional({ description: 'Conversation name' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ description: 'Conversation description' })
	@IsOptional()
	@IsString()
	description?: string;
}

export class ConversationResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	type!: string;

	@ApiPropertyOptional()
	name?: string;

	@ApiPropertyOptional()
	avatar?: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ type: 'array', items: { type: 'object' } })
	participants!: any[];

	@ApiPropertyOptional()
	lastMessage?: any;

	@ApiProperty()
	unreadCount!: number;

	@ApiProperty()
	isArchived!: boolean;

	@ApiProperty()
	isMuted!: boolean;

	@ApiProperty()
	isPinned!: boolean;

	@ApiProperty()
	createdAt!: string;

	@ApiProperty()
	updatedAt!: string;
}

export class MessageResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	content!: string;

	@ApiProperty()
	messageType!: string;

	@ApiProperty()
	status!: string;

	@ApiProperty()
	senderId!: string;

	@ApiProperty()
	receiverId!: string;

	@ApiProperty()
	conversationId!: string;

	@ApiProperty()
	isRead!: boolean;

	@ApiProperty()
	isDelivered!: boolean;

	@ApiProperty()
	isEdited!: boolean;

	@ApiPropertyOptional()
	editedAt?: string;

	@ApiPropertyOptional()
	readAt?: string;

	@ApiPropertyOptional()
	deliveredAt?: string;

	@ApiPropertyOptional()
	replyToId?: string;

	@ApiPropertyOptional()
	metadata?: Record<string, any>;

	@ApiProperty({ type: 'array', items: { type: 'object' } })
	reactions!: any[];

	@ApiProperty()
	createdAt!: string;

	@ApiProperty()
	updatedAt!: string;
}

// WebSocket event DTOs
export class TypingIndicatorDto {
	@ApiProperty({ description: 'Conversation ID' })
	@IsUUID()
	conversationId!: string;

	@ApiProperty({ description: 'Whether user is typing' })
	@IsBoolean()
	isTyping!: boolean;
}

export class WebSocketMessageDto extends SendMessageDto {
	@ApiProperty({ description: 'Sender user ID' })
	@IsUUID()
	senderId!: string;
}
