// useNotifications.ts
import { useEffect, useState, useRef } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '../types/notification.types';

if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
}

export const useNotifications = (userEmail: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const connectionAttemptRef = useRef<number>(0);
    const maxConnectionAttempts = 3;

    useEffect(() => {
        // ✅ KIỂM TRA: Chỉ connect khi có cả userEmail VÀ token
        if (!userEmail) {
            return;
        }

        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) {
            return;
        }

        // ✅ Kiểm tra số lần thử kết nối
        if (connectionAttemptRef.current >= maxConnectionAttempts) {
            return;
        }

        connectionAttemptRef.current += 1;
        console.log(`🔌 Connecting WebSocket for user: ${userEmail} (attempt ${connectionAttemptRef.current}/${maxConnectionAttempts})`);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

        // Nếu API_BASE có /api, thì bỏ nó đi cho WebSocket
        const WS_BASE = API_BASE.replace('/api', '');
        const WEBSOCKET_URL = `${WS_BASE}/ws`;

        console.log('🔌 WebSocket URL:', WEBSOCKET_URL);

        const socket = new SockJS(WEBSOCKET_URL);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 0, // ✅ TẮT auto-reconnect, tự xử lý
            heartbeatIncoming: 20000,
            heartbeatOutgoing: 20000,
            connectHeaders: { Authorization: `Bearer ${token}` },

            onConnect: () => {
                console.log('✅ WebSocket connected successfully');
                setIsConnected(true);
                connectionAttemptRef.current = 0; // Reset counter on success

                const destination = '/user/queue/notifications';

                try {
                    const subscription = stompClient.subscribe(destination, (message) => {
                        try {
                            const notification: Notification = JSON.parse(message.body);

                            // Chuẩn hóa date
                            if (Array.isArray(notification.createdAt)) {
                                const [year, month, day, hour, minute, second] = notification.createdAt as any;
                                notification.createdAt = new Date(year, month - 1, day, hour, minute, second).toISOString() as any;
                            }

                            setNotifications(prev => [notification, ...prev]);
                            setUnreadCount(prev => prev + 1);
                        } catch (error) {
                            console.error('❌ Error parsing notification:', error);
                        }
                    });
                    subscriptionRef.current = subscription;
                } catch (error) {
                    console.error('❌ Error during subscription:', error);
                }
            },

            onDisconnect: () => {
                console.log('🔌 WebSocket disconnected');
                setIsConnected(false);
            },

            onStompError: (frame) => {
                console.error('❌ STOMP error:', frame);
                setIsConnected(false);
                // ✅ KHÔNG retry nữa, để user tự refresh page
            },

            onWebSocketError: (error) => {
                console.error('❌ WebSocket error:', error);
                setIsConnected(false);
            }
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            console.log('🔌 Cleaning up WebSocket connection');
            connectionAttemptRef.current = 0;
            subscriptionRef.current?.unsubscribe();
            stompClientRef.current?.deactivate();
        };
    }, [userEmail]); // ✅ Chỉ chạy lại khi userEmail thay đổi

    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(n => (String(n.id) === String(notificationId) ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const deleteNotification = (notificationId: number) => {
        setNotifications(prev => {
            const target = prev.find(n => String(n.id) === String(notificationId));

            if (target && !target.isRead) {
                setUnreadCount(count => Math.max(0, count - 1));
            }

            return prev.filter(n => String(n.id) !== String(notificationId));
        });
    };

    return {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        setNotifications,
        setUnreadCount,
    };
};