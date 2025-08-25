import {
	Entity,
	PrimaryKey,
	Property,
	ManyToMany,
	Collection,
	OneToMany,
	Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../user/user.entity';
import { Message } from './message.entity';
import { ConversationType } from './chat.enums';

@Entity()
export class Conversation {
	@PrimaryKey()
	id: string = v4();

	@Enum(() => ConversationType)
	type: ConversationType = ConversationType.DIRECT;

	@Property({ nullable: true })
	name?: string;

	@Property({ nullable: true })
	avatar?: string;

	@Property({ nullable: true })
	description?: string;

	@ManyToMany(() => User, undefined, { owner: true })
	participants = new Collection<User>(this);

	@OneToMany(() => Message, (message) => message.conversation)
	messages = new Collection<Message>(this);

	@Property()
	isArchived: boolean = false;

	@Property()
	isMuted: boolean = false;

	@Property()
	isPinned: boolean = false;

	@Property()
	createdAt: Date = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
