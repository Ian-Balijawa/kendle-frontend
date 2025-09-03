
import { WebSocketEvent, WebSocketEventType } from "../types/chat";

export type WebSocketEventHandler = (event: WebSocketEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private eventHandlers = new Map<
    WebSocketEventType,
    WebSocketEventHandler[]
  >();
  private heartbeatInterval: number | null = null;
  private userId: string | null = null;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    const baseUrl = import.meta.env.VITE_WS_URL;
    this.url = baseUrl;
    console.log("WebSocket URL:", this.url);
  }

  async connect(userId: string): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return Promise.resolve();
    }

    this.userId = userId;
    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Connect to WebSocket with user authentication
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected successfully");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketEvent;
            this.handleMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.connectionPromise = null;

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }
    this.stopHeartbeat();
    this.userId = null;
    this.connectionPromise = null;
  }

  sendMessage(type: WebSocketEventType, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const event: WebSocketEvent = {
        type,
        data,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }

  // Event subscription methods
  on(eventType: WebSocketEventType, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: WebSocketEventType, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Specific message sending methods for better API integration
  sendTextMessage(
    conversationId: string,
    receiverId: string,
    content: string,
    replyToId?: string
  ): void {
    this.sendMessage("message_sent", {
      conversationId,
      receiverId,
      content,
      messageType: "text",
      replyToId,
    });
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.sendMessage(isTyping ? "typing_start" : "typing_stop", {
      conversationId,
      userId: this.userId,
    });
  }

  markMessageAsRead(messageId: string, conversationId: string): void {
    this.sendMessage("message_read", {
      messageId,
      conversationId,
    });
  }

  markMessageAsDelivered(messageId: string): void {
    this.sendMessage("message_delivered", {
      messageId,
    });
  }

  addMessageReaction(messageId: string, emoji: string): void {
    this.sendMessage("message_reaction_added", {
      messageId,
      emoji,
      userId: this.userId,
    });
  }

  removeMessageReaction(messageId: string, reactionId: string): void {
    this.sendMessage("message_reaction_removed", {
      messageId,
      reactionId,
      userId: this.userId,
    });
  }

  // New methods for better conversation management
  joinConversation(conversationId: string): void {
    this.sendMessage("conversation_joined", {
      conversationId,
      userId: this.userId,
    });
  }

  leaveConversation(conversationId: string): void {
    this.sendMessage("conversation_left", {
      conversationId,
      userId: this.userId,
    });
  }

  private handleMessage(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping", timestamp: new Date().toISOString() }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch((error) => {
          console.error("Reconnect failed:", error);
        });
      }
    }, delay);
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return "disconnected";
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "closed";
      default:
        return "unknown";
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Export the real WebSocket service
export const chatService = webSocketService;
