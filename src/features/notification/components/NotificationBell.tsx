import React, { useState } from 'react';
import { Dropdown, Badge, ListGroup, Button } from 'react-bootstrap';
import { Bell, User, Store, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationType } from '../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom'; // 1. Thêm navigate để tránh reload trang

interface NotificationBellProps {
    userEmail: string;
    userRole?: 'MERCHANT' | 'ADMIN' | 'USER';
    onNotificationClick?: (notificationId: number, type: NotificationType) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
                                                                      userEmail,
                                                                      userRole = 'MERCHANT',
                                                                      onNotificationClick
                                                                  }) => {
    const {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications(userEmail);

    const [show, setShow] = useState(false);
    const navigate = useNavigate(); // 2. Khởi tạo navigate

    // 🎯 Xử lý click vào tin nhắn
    const handleNotificationClick = (notificationId: number, type: NotificationType, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.notification-actions')) {
            return;
        }

        e.preventDefault();

        markAsRead(notificationId);

        if (onNotificationClick) {
            onNotificationClick(notificationId, type);
        } else {
            handleDefaultNavigation(type);
        }

        setShow(false);
    };

    const handleDeleteAction = (notificationId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (deleteNotification) {
            deleteNotification(notificationId);
        }
    };

    const handleDefaultNavigation = (type: NotificationType) => {
        const basePath = userRole === 'ADMIN' ? '/admin' : '/merchant';
        let targetUrl = '';

        if (type.includes('RECONCILIATION')) {
            targetUrl = `${basePath}/${userRole === 'ADMIN' ? 'reconciliation' : 'revenue'}`;
        } else if (type.includes('ORDER')) {
            targetUrl = `${basePath}/orders`;
        }

        if (targetUrl) {
            navigate(targetUrl);
        }
    };

    return (
        <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} align="end">
            <Dropdown.Toggle
                variant="light"
                id="notification-dropdown"
                className="position-relative border-0 p-2"
                style={{ background: 'transparent' }}
            >
                <Bell size={24} className={isConnected ? 'text-primary' : 'text-muted'} />
                {unreadCount > 0 && (
                    <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.65rem', padding: '0.25rem 0.4rem' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu
                className="py-0 border-0 shadow-lg"
                style={{ width: '380px', maxHeight: '500px', overflowY: 'auto' }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom sticky-top bg-white rounded-top">
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        {userRole === 'ADMIN' ? <User size={18} /> : <Store size={18} />}
                        Thông báo
                    </h6>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="btn btn-link btn-sm text-decoration-none p-0 fw-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllAsRead();
                            }}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Đọc tất cả
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <Bell size={32} className="mb-2 opacity-25" />
                        <p className="mb-0 small">Không có thông báo mới</p>
                    </div>
                ) : (
                    <ListGroup variant="flush">
                        {notifications.map((notification) => (
                            <ListGroup.Item
                                key={notification.id}
                                action
                                onClick={(e) => handleNotificationClick(notification.id, notification.type, e)}
                                className={`border-bottom px-3 py-2 ${!notification.isRead ? 'bg-light' : ''}`}
                                style={{ borderLeft: !notification.isRead ? '3px solid #0d6efd' : '3px solid transparent' }}
                            >
                                <div className="d-flex flex-column gap-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div
                                            className={`fw-bold small ${!notification.isRead ? 'text-dark' : 'text-muted'}`}
                                            dangerouslySetInnerHTML={{ __html: notification.title }}
                                        />
                                    </div>

                                    <div
                                        className="text-muted mb-1"
                                        style={{ fontSize: '0.8rem', lineHeight: '1.2' }}
                                        dangerouslySetInnerHTML={{ __html: notification.content }}
                                    />

                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </small>

                                        {/* Vùng Action độc lập */}
                                        <div className="notification-actions d-flex gap-2">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-primary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                >
                                                    <Check size={16} />
                                                </Button>
                                            )}
                                            <Button
                                                variant="link"
                                                className="p-0 text-danger"
                                                onClick={(e) => handleDeleteAction(notification.id, e)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};