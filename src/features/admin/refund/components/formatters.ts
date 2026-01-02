// src/utils/formatters.ts

/**
 * Format số tiền theo VND
 */
export const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
        return '0 ₫';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

/**
 * Format ngày giờ
 */
export const formatDateTime = (dateStr: string | Date): string => {
    try {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    } catch {
        return 'N/A';
    }
};

/**
 * Format ngày (không có giờ)
 */
export const formatDate = (dateStr: string | Date): string => {
    try {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    } catch {
        return 'N/A';
    }
};

/**
 * Format giờ
 */
export const formatTime = (dateStr: string | Date): string => {
    try {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    } catch {
        return 'N/A';
    }
};

/**
 * Tính khoảng cách thời gian (ago format)
 */
export const formatTimeAgo = (dateStr: string | Date): string => {
    try {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'vừa xong';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

        return formatDate(date);
    } catch {
        return 'N/A';
    }
};

/**
 * Format số điện thoại
 */
export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
};

/**
 * Format email (rút ngắn nếu quá dài)
 */
export const formatEmail = (email: string, maxLength: number = 30): string => {
    if (email.length <= maxLength) {
        return email;
    }

    return email.substring(0, maxLength) + '...';
};

/**
 * Format số tài khoản (ẩn số giữa)
 */
export const formatAccountNumber = (account: string): string => {
    if (!account || account.length < 8) {
        return account;
    }

    const firstFour = account.slice(0, 4);
    const lastFour = account.slice(-4);

    return `${firstFour}****${lastFour}`;
};

/**
 * Format text (cắt ngắn + ellipsis)
 */
export const formatText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
};