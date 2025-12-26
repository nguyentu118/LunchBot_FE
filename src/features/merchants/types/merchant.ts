// src/features/merchants/types/merchant.ts

export interface PopularMerchantDto {
    id: number;
    name: string;
    cuisine?: string;           // ✅ THAY ĐỔI: từ description → cuisine
    address?: string;
    phoneNumber?: string;
    imageUrl: string;          // ✅ THAY ĐỔI: từ avatarUrl → imageUrl
    rating?: number;
    totalOrders?: number;
    priceRange?: string;        // ✅ THÊM MỚI: thay vì averagePrice
    deliveryTime?: string;
    deliveryFee?: string;       // ✅ THÊM MỚI
    reviews?: string;           // ✅ THÊM MỚI
}

export interface MerchantApiResponse {
    data: PopularMerchantDto[];
    message?: string;
}
// 1. Định nghĩa Interface dữ liệu (Khớp với DTO Backend)
export interface OrderResponse {
    id: number;
    orderNumber: string;
    customerName: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
}

export interface RevenueStatisticsResponse {
    totalRevenue: number;
    totalOrders: number;
    orders: {
        content: OrderResponse[];
        totalPages: number;
        totalElements: number;
        number: number; // trang hiện tại
    };
}

export enum PartnerStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface MerchantProfileResponse {
    restaurantName: string;
    address: string;
    phone: string;
    avatarUrl: string;
    // --- THÊM 2 TRƯỜNG MỚI ---
    partnerStatus: PartnerStatus;
    currentMonthRevenue: number;
}