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
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  constructor() {
    // In a real app, this would come from environment variables
    this.url =
      process.env.NODE_ENV === "production"
        ? "wss://your-production-websocket-url.com/ws"
        : "ws://localhost:8080/ws";
  }

  connect(userId: string): Promise<void> {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return Promise.resolve();
    }

    this.userId = userId;
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?userId=${userId}`);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
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
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }
    this.stopHeartbeat();
    this.userId = null;
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

  // Specific message sending methods
  sendTextMessage(
    conversationId: string,
    receiverId: string,
    content: string
  ): void {
    this.sendMessage("message_sent", {
      conversationId,
      receiverId,
      content,
      messageType: "text",
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
    });
  }

  removeMessageReaction(messageId: string, emoji: string): void {
    this.sendMessage("message_reaction_removed", {
      messageId,
      emoji,
    });
  }

  private handleMessage(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
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

// Mock WebSocket for development (when real WebSocket server is not available)
export class MockWebSocketService {
  private eventHandlers = new Map<
    WebSocketEventType,
    WebSocketEventHandler[]
  >();
  private isConnected = false;

  async connect(userId: string): Promise<void> {
    console.log("Mock WebSocket connected for user:", userId);
    this.isConnected = true;
    return Promise.resolve();
  }

  disconnect(): void {
    console.log("Mock WebSocket disconnected");
    this.isConnected = false;
  }

  sendMessage(type: WebSocketEventType, data: any): void {
    console.log("Mock WebSocket sending:", { type, data });

    // Simulate receiving our own message for testing
    if (type === "message_sent") {
      setTimeout(() => {
        this.simulateMessageReceived(data);
      }, 100);
    }
  }

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

  sendTextMessage(
    conversationId: string,
    receiverId: string,
    content: string
  ): void {
    this.sendMessage("message_sent", {
      conversationId,
      receiverId,
      content,
      messageType: "text",
    });
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.sendMessage(isTyping ? "typing_start" : "typing_stop", {
      conversationId,
    });
  }

  markMessageAsRead(messageId: string, conversationId: string): void {
    this.sendMessage("message_read", { messageId, conversationId });
  }

  markMessageAsDelivered(messageId: string): void {
    this.sendMessage("message_delivered", { messageId });
  }

  addMessageReaction(messageId: string, emoji: string): void {
    this.sendMessage("message_reaction_added", { messageId, emoji });
  }

  removeMessageReaction(messageId: string, emoji: string): void {
    this.sendMessage("message_reaction_removed", { messageId, emoji });
  }

  private simulateMessageReceived(sentData: any): void {
    const mockEvent: WebSocketEvent = {
      type: "message_received",
      data: {
        id: Date.now().toString(),
        ...sentData,
        isRead: false,
        isDelivered: true,
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const handlers = this.eventHandlers.get("message_received");
    if (handlers) {
      handlers.forEach((handler) => handler(mockEvent));
    }
  }

  get isConnected(): boolean {
    return this.isConnected;
  }

  get connectionState(): string {
    return this.isConnected ? "connected" : "disconnected";
  }
}

// Export the appropriate service based on environment
export const chatService =
  process.env.NODE_ENV === "development"
    ? new MockWebSocketService()
    : webSocketService;
