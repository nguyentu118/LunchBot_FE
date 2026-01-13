// src/features/notification/services/NotificationWebSocket.services.ts

import { Client, IMessage } from '@stomp/stompjs';
import { INotification } from '../types/notification.types';

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
    private maxReconnectAttempts: number = 3; // ✅ Giảm từ 5 xuống 3
    private reconnectDelay: number = 5000; // ✅ Tăng từ 3s lên 5s

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
        // ✅ Kiểm tra token trước
        if (!token) {
            console.warn('⚠️ No token provided, cannot connect WebSocket');
            return;
        }

        if (this.isConnected) {
            console.log('⏸️ Already connected, skipping');
            return;
        }

        // ✅ Kiểm tra số lần retry
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnect attempts reached. Stopping reconnection.');
            return;
        }

        // Kiểm tra SockJS có sẵn không
        if (typeof window.SockJS === 'undefined') {
            console.error('❌ SockJS is not loaded. Please add SockJS script to index.html');
            return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const socketUrl = `${baseUrl}/ws`;

        console.log(`🔌 Connecting to WebSocket: ${socketUrl} (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

        this.stompClient = new Client({
            webSocketFactory: () => new window.SockJS(socketUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 0, // ✅ Tắt auto-reconnect
            heartbeatIncoming: 20000, // ✅ Tăng lên 20s
            heartbeatOutgoing: 20000,
        });

        this.stompClient.onConnect = () => {
            console.log('✅ WebSocket connected successfully');
            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset counter

            // Subscribe to personal notification queue
            this.stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
                try {
                    const notification: INotification = JSON.parse(message.body);
                    onNotificationReceived(notification);
                } catch (error) {
                    console.error('❌ Error parsing notification:', error);
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
            this.isConnected = false;
            // ✅ KHÔNG auto-reconnect nữa
        };

        this.stompClient.onWebSocketClose = () => {
            console.log('🔌 WebSocket closed');
            this.isConnected = false;
            // ✅ KHÔNG auto-reconnect nữa
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('❌ WebSocket Error:', error);
            this.isConnected = false;
        };

        this.stompClient.activate();
    }

    /**
     * Xử lý reconnect - KHÔNG TỰ ĐỘNG GỌI NỮA
     */
    private handleReconnect(
        token: string,
        onNotificationReceived: (notification: INotification) => void
    ): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;

            console.log(`⏳ Reconnecting in ${this.reconnectDelay / 1000}s...`);

            setTimeout(() => {
                this.connect(token, onNotificationReceived);
            }, this.reconnectDelay);
        } else {
            console.error('❌ Max reconnect attempts reached');
        }
    }

    /**
     * Ngắt kết nối WebSocket
     */
    disconnect(): void {
        if (this.stompClient && this.isConnected) {
            console.log('🔌 Disconnecting WebSocket...');
            this.stompClient.deactivate();
            this.isConnected = false;
            this.reconnectAttempts = 0;
        }
    }

    /**
     * Kiểm tra trạng thái kết nối
     */
    isWebSocketConnected(): boolean {
        return this.isConnected;
    }
}