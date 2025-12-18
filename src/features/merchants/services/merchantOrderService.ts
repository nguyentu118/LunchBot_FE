import axiosInstance from "../../../config/axiosConfig";

// Định nghĩa kiểu dữ liệu cho Order (khớp với Backend)
export interface OrderItem {
    id: number;
    dishName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    dishImage: string;
}

export interface OrderResponse {
    id: number;
    orderNumber: string; // ví dụ: ORD-12345
    customerName: string;
    orderDate: string;
    totalAmount: number;
    status: string; // PENDING, PROCESSING, v.v.
    items: OrderItem[];
    paymentStatus: string;
    paymentMethod?: string
    deliveryAddress: string;
    shippingAddress: ShippingAddress;
}

// Các trạng thái đơn hàng (Khớp với Enum Backend)
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    DELIVERING: 'DELIVERING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

export const getMerchantOrders = async (status?: string) => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get('/merchants/orders', { params });
    return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const response = await axiosInstance.put(`/merchants/orders/${orderId}/status`, null, {
        params: { status }
    });
    return response.data;
};
export interface ShippingAddress {
    id: number;
    contactName: string;
    phone: string;
    fullAddress: string;
    building?: string;
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
}