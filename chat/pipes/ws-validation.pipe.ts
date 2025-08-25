import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
	constructor() {
		super({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			exceptionFactory: (errors) => {
				const messages = errors.map((error) => {
					const constraints = error.constraints;
					return constraints ? Object.values(constraints).join(', ') : 'Validation failed';
				});
				return new WsException(`Validation failed: ${messages.join('; ')}`);
			},
		});
	}

	async transform(value: any, metadata: ArgumentMetadata) {
		try {
			return await super.transform(value, metadata);
		} catch (error) {
			if (error instanceof WsException) {
				throw error;
			}
			throw new WsException('Validation failed');
		}
	}
}
