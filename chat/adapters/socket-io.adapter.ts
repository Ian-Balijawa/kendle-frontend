import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import envars from 'src/config/env-vars';

@Injectable()
export class SocketIOAdapter extends IoAdapter {
	private readonly logger = new Logger( SocketIOAdapter.name );
	private adapterConstructor?: any;

	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {
		super();
	}

	async connectToRedis(): Promise<void> {
		try {
			const redisUrl = `redis://${envars.REDIS_HOST}:${envars.REDIS_PORT}`

			if ( !redisUrl ) {
				this.logger.warn( 'Redis URL not configured, using memory adapter' );
				return;
			}

			const pubClient = createClient( { url: redisUrl } );
			const subClient = pubClient.duplicate();

			await Promise.all( [pubClient.connect(), subClient.connect()] );

			this.adapterConstructor = createAdapter( pubClient, subClient );
			this.logger.log( 'Connected to Redis for Socket.IO adapter' );
		} catch ( error ) {
			this.logger.error( 'Failed to connect to Redis:', error );
			this.logger.warn( 'Falling back to memory adapter' );
		}
	}

	createIOServer( port: number, options?: ServerOptions ): Server {
		const serverOptions: Partial<ServerOptions> = {
			...options,
			cors: {
				origin: this.getAllowedOrigins(),
				credentials: true,
				methods: ['GET', 'POST'],
			},
			transports: ['websocket', 'polling'],
			allowEIO3: true,
			pingTimeout: 60000,
			pingInterval: 25000,
		};

		const server = super.createIOServer( port, serverOptions );

		if ( this.adapterConstructor ) {
			server.adapter( this.adapterConstructor );
		}

		// Add connection middleware for authentication
		server.use( ( socket, next ) => {
			try {
				const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

				if ( !token ) {
					return next( new Error( 'Authentication token missing' ) );
				}

				const cleanToken = token.replace( /^Bearer\s+/, '' );
				const payload = this.jwtService.verify( cleanToken );

				if ( !payload.sub ) {
					return next( new Error( 'Invalid token payload' ) );
				}

				( socket as any ).userId = payload.sub;
				( socket as any ).user = payload;

				next();
			} catch ( error ) {
				this.logger.error( 'Socket authentication failed:', error.message );
				next( new Error( 'Authentication failed' ) );
			}
		} );

		server.on( 'connection', ( socket ) => {
			const userId = ( socket as any ).userId;
			this.logger.log( `User ${userId} connected with socket ${socket.id}` );

			socket.on( 'disconnect', ( reason ) => {
				this.logger.log( `User ${userId} disconnected: ${reason}` );
			} );
		} );

		return server;
	}

	private getAllowedOrigins(): string[] {
		const origins = this.configService.get<string>( 'CORS_ORIGINS', '*' );
		return origins === '*' ? ['*'] : origins.split( ',' );
	}
}
