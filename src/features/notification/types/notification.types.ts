// src/features/notification/types/notification.types.ts

export enum NotificationType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_CONFIRMED = 'ORDER_CONFIRMED',
    ORDER_PREPARING = 'ORDER_PREPARING',
    ORDER_READY = 'ORDER_READY',
    ORDER_DELIVERING = 'ORDER_DELIVERING',
    ORDER_COMPLETED = 'ORDER_COMPLETED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',
    PROMOTION = 'PROMOTION',
    SYSTEM = 'SYSTEM',
}

export interface INotification {
    id: number;
    title: string;
    content: string;
    type: NotificationType;
    isRead: boolean;
    sentAt: string;
    readAt: string | null;
}

export interface INotificationResponse {
    notifications: INotification[];
    unreadCount: number;
}