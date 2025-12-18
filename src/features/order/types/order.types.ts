// src/features/orders/types/order.types.ts

export enum OrderStatus {
    PENDING = 'PENDING',           // Chờ xác nhận
    CONFIRMED = 'CONFIRMED',       // Đã xác nhận
    PROCESSING = 'PROCESSING',       // Đang chuẩn bị
    READY = 'READY',              // Sẵn sàng giao
    DELIVERING = 'DELIVERING',     // Đang giao
    COMPLETED = 'COMPLETED',       // Hoàn thành
    CANCELLED = 'CANCELLED'        // Đã hủy
}

export enum PaymentStatus {
    PENDING = 'PENDING',           // Chờ thanh toán
    PAID = 'PAID',                // Đã thanh toán
    FAILED = 'FAILED',            // Thanh toán thất bại
    REFUNDED = 'REFUNDED'         // Đã hoàn tiền
}

export enum PaymentMethod {
    COD = 'COD',                  // Tiền mặt
    BANK_TRANSFER = 'BANK_TRANSFER', // Chuyển khoản
    MOMO = 'MOMO',               // Ví MoMo
    VNPAY = 'VNPAY'              // VNPay
}

export interface OrderItem {
    id: number;
    dishId: number;
    dishName: string;
    dishImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface OrderAddress {
    id: number;
    contactName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    building?: string;
    fullAddress: string;
    isDefault: boolean;
}

export interface Order {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;

    // Merchant info
    merchantId: number;
    merchantName: string;
    merchantAddress: string;
    merchantPhone: string;

    // Shipping
    shippingAddress: OrderAddress;

    // Items
    items: OrderItem[];
    totalItems: number;

    // Pricing
    itemsTotal: number;
    discountAmount: number;
    serviceFee: number;
    shippingFee: number;
    totalAmount: number;

    // Additional info
    couponCode?: string;
    notes?: string;

    // Timestamps
    orderDate: string;
    expectedDeliveryTime?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
}

export interface CreateOrderRequest {
    addressId: number;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
}

export interface CancelOrderRequest {
    reason: string;
}

// Status display configs
export const ORDER_STATUS_CONFIG = {
    [OrderStatus.PENDING]: {
        label: 'Chờ xác nhận',
        variant: 'warning',
        color: '#ffc107'
    },
    [OrderStatus.CONFIRMED]: {
        label: 'Đã xác nhận',
        variant: 'info',
        color: '#17a2b8'
    },
    [OrderStatus.PROCESSING]: {
        label: 'Đang chuẩn bị',
        variant: 'primary',
        color: '#007bff'
    },
    [OrderStatus.READY]: {
        label: 'Sẵn sàng giao',
        variant: 'success',
        color: '#28a745'
    },
    [OrderStatus.DELIVERING]: {
        label: 'Đang giao hàng',
        variant: 'primary',
        color: '#007bff'
    },
    [OrderStatus.COMPLETED]: {
        label: 'Hoàn thành',
        variant: 'success',
        color: '#28a745'
    },
    [OrderStatus.CANCELLED]: {
        label: 'Đã hủy',
        variant: 'danger',
        color: '#dc3545'
    }
};

export const PAYMENT_METHOD_CONFIG = {
    [PaymentMethod.COD]: {
        label: 'Tiền mặt (COD)',
        icon: '💵'
    },
    [PaymentMethod.BANK_TRANSFER]: {
        label: 'Chuyển khoản ngân hàng',
        icon: '🏦'
    },
    [PaymentMethod.MOMO]: {
        label: 'Ví MoMo',
        icon: '📱'
    },
    [PaymentMethod.VNPAY]: {
        label: 'VNPay',
        icon: '💳'
    }
};

export const PAYMENT_STATUS_CONFIG = {
    [PaymentStatus.PENDING]: {
        label: 'Chờ thanh toán',
        variant: 'warning',
        color: '#ffc107'
    },
    [PaymentStatus.PAID]: {
        label: 'Đã thanh toán',
        variant: 'success',
        color: '#28a745'
    },
    [PaymentStatus.FAILED]: {
        label: 'Thanh toán thất bại',
        variant: 'danger',
        color: '#dc3545'
    },
    [PaymentStatus.REFUNDED]: {
        label: 'Đã hoàn tiền',
        variant: 'info',
        color: '#17a2b8'
    }
};