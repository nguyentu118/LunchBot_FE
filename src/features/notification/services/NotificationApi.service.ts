// src/features/notification/services/NotificationApi.services.ts

import axiosInstance from '../../../config/axiosConfig';
import { INotification } from '../types/notification.types';

export class NotificationApiService {
    private static readonly BASE_URL = '/notifications';

    /**
     * Lấy tất cả thông báo
     */
    static async getAllNotifications(): Promise<INotification[]> {
        const response = await axiosInstance.get<INotification[]>(this.BASE_URL);
        return response.data;
    }

    /**
     * Lấy thông báo chưa đọc
     */
    static async getUnreadNotifications(): Promise<INotification[]> {
        const response = await axiosInstance.get<INotification[]>(`${this.BASE_URL}/unread`);
        return response.data;
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    static async getUnreadCount(): Promise<number> {
        const response = await axiosInstance.get<number>(`${this.BASE_URL}/unread/count`);
        return response.data;
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    static async markAsRead(notificationId: number): Promise<void> {
        await axiosInstance.put(`${this.BASE_URL}/${notificationId}/read`);
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    static async markAllAsRead(): Promise<void> {
        await axiosInstance.put(`${this.BASE_URL}/read-all`);
    }

    /**
     * Xóa thông báo
     */
    static async deleteNotification(notificationId: number): Promise<void> {
        await axiosInstance.delete(`${this.BASE_URL}/${notificationId}`);
    }
}