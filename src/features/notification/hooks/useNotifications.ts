// useNotifications.ts
import { useEffect, useState, useRef } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '../types/notification.types';

if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
}

const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

export const useNotifications = (userEmail: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);

    useEffect(() => {
        if (!userEmail) return;

        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) return;

        const socket = new SockJS(WEBSOCKET_URL);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: { Authorization: `Bearer ${token}` },

            onConnect: () => {
                setIsConnected(true);
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
            onDisconnect: () => setIsConnected(false),
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            subscriptionRef.current?.unsubscribe();
            stompClientRef.current?.deactivate();
        };
    }, [userEmail]);

    // ✅ Hàm Đánh dấu đã đọc
    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(n => (String(n.id) === String(notificationId) ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // ✅ Hàm Đánh dấu tất cả đã đọc
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // 🔥 HÀM XÓA CỦA BẠN ĐÂY:
    const deleteNotification = (notificationId: number) => {
        setNotifications(prev => {
            // Tìm thông báo trước khi xóa để kiểm tra trạng thái đọc
            const target = prev.find(n => String(n.id) === String(notificationId));

            // Nếu thông báo tồn tại và chưa đọc, thì trừ unreadCount
            if (target && !target.isRead) {
                setUnreadCount(count => Math.max(0, count - 1));
            }

            // Trả về danh sách mới đã lọc bỏ thông báo có ID này
            return prev.filter(n => String(n.id) !== String(notificationId));
        });
    };

    return {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification, // ✅ Nhớ export ra để NotificationBell.tsx dùng được
        setNotifications,
        setUnreadCount,
    };
};