import {
	Entity,
	PrimaryKey,
	Property,
	ManyToOne,
	Enum,
	OneToMany,
	Collection,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../user/user.entity';
import { Conversation } from './conversation.entity';
import { MessageReaction } from './message-reaction.entity';
import { MessageType, MessageStatus } from './chat.enums';

@Entity()
export class Message {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: 'text' })
	content!: string;

	@Enum(() => MessageType)
	messageType: MessageType = MessageType.TEXT;

	@Enum(() => MessageStatus)
	status: MessageStatus = MessageStatus.SENT;

	@ManyToOne(() => User)
	sender!: User;

	@ManyToOne(() => User)
	receiver!: User;

	@ManyToOne(() => Conversation)
	conversation!: Conversation;

	@Property()
	isRead: boolean = false;

	@Property()
	isDelivered: boolean = false;

	@Property()
	isEdited: boolean = false;

	@Property({ nullable: true })
	editedAt?: Date;

	@Property({ nullable: true })
	readAt?: Date;

	@Property({ nullable: true })
	deliveredAt?: Date;

	@Property({ nullable: true })
	replyToId?: string;

	@Property({ nullable: true, type: 'json' })
	metadata?: Record<string, any>;

	@OneToMany(() => MessageReaction, (reaction) => reaction.message)
	reactions = new Collection<MessageReaction>(this);

	@Property()
	createdAt: Date = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
