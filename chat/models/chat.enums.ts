export enum MessageType {
	TEXT = 'text',
	IMAGE = 'image',
	VIDEO = 'video',
	AUDIO = 'audio',
	FILE = 'file',
	LOCATION = 'location',
}

export enum MessageStatus {
	SENT = 'sent',
	DELIVERED = 'delivered',
	READ = 'read',
	FAILED = 'failed',
}

export enum ConversationType {
	DIRECT = 'direct',
	GROUP = 'group',
}
