import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
	private readonly logger = new Logger(WsExceptionFilter.name);

	catch(exception: WsException, host: ArgumentsHost) {
		const client: Socket = host.switchToWs().getClient();
		const error = exception.getError();
		const message = typeof error === 'string' ? error : (error as any)?.message || 'Unknown error';

		this.logger.error(`WebSocket error for client ${client.id}: ${message}`);

		// Send error response to client
		client.emit('error', {
			type: 'error',
			message,
			timestamp: new Date().toISOString(),
		});

		// Don't call super.catch() to prevent default error handling
	}
}

@Catch()
export class AllWsExceptionsFilter extends BaseWsExceptionFilter {
	private readonly logger = new Logger(AllWsExceptionsFilter.name);

	catch(exception: any, host: ArgumentsHost) {
		const client: Socket = host.switchToWs().getClient();
		const message = exception?.message || 'Internal server error';

		this.logger.error(`Unhandled WebSocket error for client ${client.id}:`, exception);

		// Send generic error response to client
		client.emit('error', {
			type: 'error',
			message: 'Internal server error',
			timestamp: new Date().toISOString(),
		});
	}
}
