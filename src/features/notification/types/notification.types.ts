// src/features/notification/types/notification.types.ts

// ========================================
// NOTIFICATION TYPES (ENUM)
// ========================================
export enum NotificationType {
    // System notifications
    SYSTEM = 'SYSTEM',
    SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
    SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',

    // Promotion notifications
    PROMOTION = 'PROMOTION',
    PROMOTION_NEW = 'PROMOTION_NEW',
    PROMOTION_EXPIRING = 'PROMOTION_EXPIRING',

    // Order notifications
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_CONFIRMED = 'ORDER_CONFIRMED',
    ORDER_PREPARING = 'ORDER_PREPARING',
    ORDER_READY = 'ORDER_READY',
    ORDER_DELIVERING = 'ORDER_DELIVERING',
    ORDER_COMPLETED = 'ORDER_COMPLETED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',

    // Payment notifications
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    REFUND_PROCESSED = 'REFUND_PROCESSED',

    // ⭐ Reconciliation notifications (MERCHANT & ADMIN)
    RECONCILIATION_REQUEST_CREATED = 'RECONCILIATION_REQUEST_CREATED',
    RECONCILIATION_REQUEST_APPROVED = 'RECONCILIATION_REQUEST_APPROVED',
    RECONCILIATION_REQUEST_REJECTED = 'RECONCILIATION_REQUEST_REJECTED',
    RECONCILIATION_CLAIM_SUBMITTED = 'RECONCILIATION_CLAIM_SUBMITTED',

    // General
    GENERAL = 'GENERAL',
}

// ========================================
// NOTIFICATION INTERFACE (MAIN)
// ========================================
export interface Notification {
    id: number;
    title: string;
    content: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    readAt?: string | null;
    sentAt?: string;

    // Optional metadata
    merchant?: {
        id: number;
        restaurantName: string;
    };
    user?: {
        id: number;
        email: string;
    };
}

// ========================================
// LEGACY INTERFACE (For backward compatibility)
// ========================================
export interface INotification {
    id: number;
    title: string;
    content: string;
    type: NotificationType;
    isRead: boolean;
    sentAt: string;
    readAt: string | null;
}

// ========================================
// API RESPONSE INTERFACES
// ========================================
export interface NotificationResponse {
    notifications: Notification[];
    unreadCount: number;
}

export interface INotificationResponse {
    notifications: INotification[];
    unreadCount: number;
}

// ========================================
// WEBSOCKET MESSAGE INTERFACE
// ========================================
export interface NotificationMessage {
    type: NotificationType;
    data: Notification;
    timestamp: string;
}