// src/utils/formatUtils.ts

/**
 * Format number to Vietnamese currency
 * @param amount Number to format
 * @returns Formatted currency string (e.g., "50.000đ")
 */
export const formatCurrency = (amount: number): string => {
    if (amount === null || amount === undefined) {
        return '0đ';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format number with thousand separators
 * @param num Number to format
 * @returns Formatted number string (e.g., "1.000.000")
 */
export const formatNumber = (num: number): string => {
    if (num === null || num === undefined) {
        return '0';
    }

    return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Format phone number to Vietnamese format
 * @param phone Phone number string
 * @returns Formatted phone (e.g., "0912 345 678")
 */
export const formatPhone = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format: 0912 345 678
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }

    // Format: 091 1223 344
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
};

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Format file size
 * @param bytes File size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format percentage
 * @param value Number value
 * @param total Total value
 * @returns Formatted percentage string (e.g., "75%")
 */
export const formatPercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${Math.round(percentage)}%`;
};

/**
 * Format distance
 * @param meters Distance in meters
 * @returns Formatted distance string (e.g., "1.5 km" or "500 m")
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format rating
 * @param rating Rating value (0-5)
 * @returns Formatted rating string (e.g., "4.5 ⭐")
 */
export const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)} ⭐`;
};

/**
 * Capitalize first letter
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeFirstLetter = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format full name
 * @param firstName First name
 * @param lastName Last name
 * @returns Full name
 */
export const formatFullName = (firstName: string, lastName: string): string => {
    return `${lastName} ${firstName}`.trim();
};

/**
 * Parse currency string to number
 * @param currencyStr Currency string (e.g., "50.000đ" or "50000")
 * @returns Number value
 */
export const parseCurrency = (currencyStr: string): number => {
    if (!currencyStr) return 0;
    // Remove all non-digit characters except comma and dot
    const cleaned = currencyStr.replace(/[^\d.,]/g, '');
    // Replace comma with empty string (Vietnamese format)
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
};

/**
 * Format order number
 * @param orderNumber Order number string
 * @returns Formatted order number
 */
export const formatOrderNumber = (orderNumber: string): string => {
    // Format: ORD-20231215-001 → ORD-001 (short version)
    if (!orderNumber) return '';
    const parts = orderNumber.split('-');
    if (parts.length === 3) {
        return `${parts[0]}-${parts[2]}`;
    }
    return orderNumber;
};

/**
 * Format address (Vietnamese format)
 * @param street Street
 * @param ward Ward
 * @param district District
 * @param province Province
 * @returns Full address
 */
export const formatAddress = (
    street?: string,
    ward?: string,
    district?: string,
    province?: string
): string => {
    const parts = [street, ward, district, province].filter(Boolean);
    return parts.join(', ');
};

/**
 * Mask email (for privacy)
 * @param email Email address
 * @returns Masked email (e.g., "a***@gmail.com")
 */
export const maskEmail = (email: string): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.charAt(0) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
};

/**
 * Mask phone number (for privacy)
 * @param phone Phone number
 * @returns Masked phone (e.g., "091***3344")
 */
export const maskPhone = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 8) return phone;
    return cleaned.slice(0, 3) + '***' + cleaned.slice(-4);
};

/**
 * Format card number (mask middle digits)
 * @param cardNumber Card number
 * @returns Masked card number (e.g., "1234 **** **** 5678")
 */
export const formatCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length !== 16) return cardNumber;
    return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`;
};