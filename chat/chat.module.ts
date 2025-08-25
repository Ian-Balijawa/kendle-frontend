import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from './models/conversation.entity';
import { Message } from './models/message.entity';
import { MessageReaction } from './models/message-reaction.entity';
import { User } from '../user/user.entity';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { WsExceptionFilter, AllWsExceptionsFilter } from './filters/ws-exception.filter';
import { WsValidationPipe } from './pipes/ws-validation.pipe';
import {
	WsLoggingInterceptor,
	WsTransformInterceptor,
} from './interceptors/ws-logging.interceptor';
import { SocketIOAdapter } from './adapters/socket-io.adapter';
import envars from 'src/config/env-vars';

@Module({
	imports: [
		ConfigModule,
		MikroOrmModule.forFeature([Conversation, Message, MessageReaction, User]),
		JwtModule.register({
			secret: envars.JWT_TOKEN_SECRET || 'your-secret-key',
			signOptions: { expiresIn: '24h' },
		}),
	],
	controllers: [ChatController],
	providers: [
		ChatService,
		ChatGateway,
		WsAuthGuard,
		WsExceptionFilter,
		AllWsExceptionsFilter,
		WsValidationPipe,
		WsLoggingInterceptor,
		WsTransformInterceptor,
		SocketIOAdapter,
	],
	exports: [ChatService, ChatGateway, SocketIOAdapter],
})
export class ChatModule {}
