import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(WsLoggingInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const client: Socket = context.switchToWs().getClient();
		const data = context.switchToWs().getData();
		const pattern = context.getHandler().name;

		const startTime = Date.now();
		const clientId = client.id;
		const userId = (client as any).userId || 'anonymous';

		this.logger.log(`[${clientId}] User ${userId} -> ${pattern}`, JSON.stringify(data));

		return next.handle().pipe(
			tap((response) => {
				const duration = Date.now() - startTime;
				this.logger.log(
					`[${clientId}] ${pattern} completed in ${duration}ms`,
					response ? JSON.stringify(response) : 'no response'
				);
			}),
			catchError((error) => {
				const duration = Date.now() - startTime;
				this.logger.error(`[${clientId}] ${pattern} failed in ${duration}ms: ${error.message}`);
				return throwError(() => error);
			})
		);
	}
}

@Injectable()
export class WsTransformInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			tap((response) => {
				if (response && typeof response === 'object') {
					// Add metadata to response
					response.timestamp = new Date().toISOString();
					response.success = !response.error;
				}
			})
		);
	}
}
