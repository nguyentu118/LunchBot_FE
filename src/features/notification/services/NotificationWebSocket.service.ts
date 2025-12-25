// src/features/notification/services/NotificationWebSocket.service.ts

import { Client, IMessage } from '@stomp/stompjs';
import { INotification } from '../types/notification.types';

// Sử dụng global SockJS từ window
declare global {
    interface Window {
        SockJS: any;
    }
}

export class NotificationWebSocketService {
    private static instance: NotificationWebSocketService;
    private stompClient: Client | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 3000;

    private constructor() {}

    static getInstance(): NotificationWebSocketService {
        if (!NotificationWebSocketService.instance) {
            NotificationWebSocketService.instance = new NotificationWebSocketService();
        }
        return NotificationWebSocketService.instance;
    }

    /**
     * Kết nối WebSocket với SockJS
     */
    connect(token: string, onNotificationReceived: (notification: INotification) => void): void {
        if (this.isConnected) {
            console.log('WebSocket already connected');
            return;
        }

        // Kiểm tra SockJS có sẵn không
        if (typeof window.SockJS === 'undefined') {
            console.error('SockJS is not loaded. Please add SockJS script to index.html');
            return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const socketUrl = `${baseUrl}/ws`;

        console.log('Connecting to WebSocket at:', socketUrl);

        this.stompClient = new Client({
            webSocketFactory: () => new window.SockJS(socketUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: this.reconnectDelay,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = () => {
            console.log('✅ WebSocket Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Subscribe to personal notification queue
            this.stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
                try {
                    const notification: INotification = JSON.parse(message.body);
                    console.log('📬 New notification received:', notification);
                    onNotificationReceived(notification);
                } catch (error) {
                    console.error('Error parsing notification:', error);
                }
            });

            // Send subscribe message to backend
            this.stompClient?.publish({
                destination: '/app/notifications/subscribe',
                body: JSON.stringify({ action: 'subscribe' }),
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.error('❌ STOMP Error:', frame.headers['message']);
            console.error('Details:', frame.body);
            this.handleReconnect(token, onNotificationReceived);
        };

        this.stompClient.onWebSocketClose = () => {
            console.log('WebSocket connection closed');
            this.isConnected = false;
            this.handleReconnect(token, onNotificationReceived);
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('❌ WebSocket Error:', error);
        };

        this.stompClient.activate();
    }

    /**
     * Xử lý reconnect
     */
    private handleReconnect(
        token: string,
        onNotificationReceived: (notification: INotification) => void
    ): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect(token, onNotificationReceived);
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnect attempts reached');
        }
    }

    /**
     * Ngắt kết nối WebSocket
     */
    disconnect(): void {
        if (this.stompClient && this.isConnected) {
            this.stompClient.deactivate();
            this.isConnected = false;
            this.reconnectAttempts = 0;
            console.log('WebSocket disconnected');
        }
    }

    /**
     * Kiểm tra trạng thái kết nối
     */
    isWebSocketConnected(): boolean {
        return this.isConnected;
    }
}