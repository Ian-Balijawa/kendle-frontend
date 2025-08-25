import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
	userId?: string;
	user?: any;
}

@Injectable()
export class WsAuthGuard implements CanActivate {
	private readonly logger = new Logger(WsAuthGuard.name);

	constructor(private readonly jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		try {
			const client: AuthenticatedSocket = context.switchToWs().getClient();
			const token = this.extractTokenFromSocket(client);

			if (!token) {
				throw new WsException('Authentication token missing');
			}

			const payload = this.jwtService.verify(token);
			if (!payload.sub) {
				throw new WsException('Invalid token payload');
			}

			client.userId = payload.sub;
			client.user = payload;

			return true;
		} catch (error) {
			this.logger.error('WebSocket authentication failed:', error.message);
			throw new WsException('Authentication failed');
		}
	}

	private extractTokenFromSocket(client: AuthenticatedSocket): string | null {
		const token = client.handshake.auth?.token || client.handshake.headers?.authorization;

		if (!token) {
			return null;
		}

		// Remove 'Bearer ' prefix if present
		return token.replace(/^Bearer\s+/, '');
	}
}
