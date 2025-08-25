import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../user/user.entity';
import { Message } from './message.entity';

@Entity()
export class MessageReaction {
	@PrimaryKey()
	id: string = v4();

	@Property()
	emoji!: string;

	@ManyToOne(() => User)
	user!: User;

	@ManyToOne(() => Message)
	message!: Message;

	@Property()
	createdAt: Date = new Date();
}
