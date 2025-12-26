// src/features/notification/components/NotificationDropdown.tsx

import React, {useEffect, useState, useCallback, useRef} from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { Bell, Check, CheckCheck, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { NotificationApiService } from '../services/NotificationApi.service';
import { NotificationWebSocketService } from '../services/NotificationWebSocket.service';
import { INotification, NotificationType } from '../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const wsServiceRef = useRef(NotificationWebSocketService.getInstance());
    const isConnectedRef = useRef(false);


    // Lấy icon theo loại thông báo
    const getNotificationIcon = (type: NotificationType): JSX.Element => {
        const iconProps = { size: 20, className: "me-2" };

        switch (type) {
            case NotificationType.ORDER_CREATED:
                return <Bell {...iconProps} className="me-2 text-info" />;
            case NotificationType.ORDER_CONFIRMED:
                return <CheckCheck {...iconProps} className="me-2 text-success" />;
            case NotificationType.ORDER_PREPARING:
                return <Clock {...iconProps} className="me-2 text-warning" />;
            case NotificationType.ORDER_DELIVERING:
                return <Clock {...iconProps} className="me-2 text-primary" />;
            case NotificationType.ORDER_COMPLETED:
                return <Check {...iconProps} className="me-2 text-success" />;
            case NotificationType.ORDER_CANCELLED:
                return <Trash2 {...iconProps} className="me-2 text-danger" />;
            default:
                return <Bell {...iconProps} className="me-2 text-secondary" />;
        }
    };

    // Lấy màu badge theo loại thông báo
    const getNotificationBadgeColor = (type: NotificationType): string => {
        switch (type) {
            case NotificationType.ORDER_CONFIRMED:
            case NotificationType.ORDER_COMPLETED:
                return 'success';
            case NotificationType.ORDER_PREPARING:
            case NotificationType.ORDER_DELIVERING:
                return 'warning';
            case NotificationType.ORDER_CANCELLED:
                return 'danger';
            default:
                return 'info';
        }
    };

    // Load notifications
    const loadNotifications = async () => {
        try {
            setLoading(true);
            const [allNotifications, count] = await Promise.all([
                NotificationApiService.getAllNotifications(),
                NotificationApiService.getUnreadCount(),
            ]);

            setNotifications(allNotifications);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi nhận notification mới từ WebSocket
    const handleNewNotification = useCallback((notification: INotification) => {

        setNotifications(prev => {
            // ✅ Kiểm tra duplicate trước khi thêm
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                console.warn('⚠️ Duplicate notification detected:', notification.id);
                return prev;
            }
            return [notification, ...prev];
        });

        setUnreadCount(prev => prev + 1);


        // Play notification sound (optional)
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.log('Cannot play sound:', e));
        } catch (e) {
            console.log('Audio error:', e);
        }
    }, []);

    // Kết nối WebSocket khi component mount
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found');
            return;
        }

        // ✅ Kiểm tra đã connect chưa
        if (isConnectedRef.current) {
            return;
        }


        // Load notifications
        loadNotifications();

        // Connect WebSocket
        wsServiceRef.current.connect(token, handleNewNotification);
        isConnectedRef.current = true;

        // ✅ Cleanup khi unmount
        return () => {
            wsServiceRef.current.disconnect();
            isConnectedRef.current = false;
        };
    }, []);

    // Đánh dấu đã đọc
    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await NotificationApiService.markAsRead(notificationId);

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Không thể đánh dấu đã đọc');
        }
    };

    // Đánh dấu tất cả đã đọc
    const handleMarkAllAsRead = async () => {
        try {
            await NotificationApiService.markAllAsRead();

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );
            setUnreadCount(0);
            toast.success('Đã đánh dấu tất cả đã đọc');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Không thể đánh dấu tất cả đã đọc');
        }
    };

    // Xóa notification
    const handleDelete = async (notificationId: number) => {
        try {
            await NotificationApiService.deleteNotification(notificationId);

            const deletedNotif = notifications.find(n => n.id === notificationId);
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            toast.success('Đã xóa thông báo');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Không thể xóa thông báo');
        }
    };

    // Format time
    const formatTime = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: vi
            });
        } catch {
            return 'Vừa xong';
        }
    };

    return (
        <Dropdown
            show={showDropdown}
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            align="end"
        >
            <Dropdown.Toggle
                as="div"
                className="text-white position-relative cursor-pointer"
                style={{ cursor: 'pointer' }}
            >
                <Bell size={24} color="#FFF" />
                {unreadCount > 0 && (
                    <Badge
                        pill
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu
                className="shadow-lg"
                style={{
                    minWidth: '350px',
                    maxWidth: '400px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    zIndex: 9999
                }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <h6 className="mb-0 fw-bold">Thông báo</h6>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-sm btn-link text-primary p-0"
                            onClick={handleMarkAllAsRead}
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <Bell size={40} className="mb-2 opacity-50" />
                        <p className="mb-0">Không có thông báo</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <Dropdown.Item
                            key={notif.id}
                            className={`px-3 py-2 ${!notif.isRead ? 'bg-light' : ''}`}
                            style={{ whiteSpace: 'normal' }}
                        >
                            <div className="d-flex">
                                <div className="flex-shrink-0">
                                    {getNotificationIcon(notif.type)}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                                            {notif.title}
                                        </h6>
                                        <Badge
                                            bg={getNotificationBadgeColor(notif.type)}
                                            className="ms-2"
                                            style={{ fontSize: '0.65rem' }}
                                        >
                                            {notif.type}
                                        </Badge>
                                    </div>
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                                        {notif.content}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            {formatTime(notif.sentAt)}
                                        </small>
                                        <div>
                                            {!notif.isRead && (
                                                <button
                                                    className="btn btn-sm btn-link text-primary p-0 me-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notif.id);
                                                    }}
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-link text-danger p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notif.id);
                                                }}
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Dropdown.Item>
                    ))
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationDropdown;