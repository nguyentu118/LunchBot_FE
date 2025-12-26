export enum MerchantStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    LOCKED = 'LOCKED'
}

export interface MerchantApprovalRequest {
    approved: boolean;
    reason: string;
}
export interface MerchantLockRequest {
    lock: boolean; // true = khóa, false = mở khóa
    reason: string;
}
export interface MerchantReProcessRequest {
    reason: string; // Lý do quản trị viên quyết định xét duyệt lại
}

export interface AdminMerchantResponse {
    id: number;
    restaurantName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    openTime: string;
    closeTime: string;
    revenueTotal: number;
    currentBalance: number;
    status: MerchantStatus;
    isLocked: boolean;
    isApproved: boolean;
    rejectionReason?: string;
    registrationDate: string;
    approvalDate?: string;
    lockedAt?: string;
    dishCount: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    monthlyRevenue: number;
    dishes: DishSimpleResponse[];
    partnerStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DishSimpleResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    isActive: boolean;
    viewCount: number;
    orderCount: number;
}

export interface AdminMerchantListResponse {
    id: number;
    restaurantName: string;
    ownerName: string;
    email: string;
    phone: string;
    status: MerchantStatus;
    isLocked: boolean;
    isApproved: boolean;
    revenueTotal: number;
    currentBalance: number;
    registrationDate: string;
    dishCount: number;
    orderCount: number;
    openTime: string;
    closeTime: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
export interface PartnerRequestDto {
    merchantId: number; // Đây là Merchant ID
    restaurantName: string;
    address: string;
    phone: string;
    avatarUrl: string;
    partnerStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    currentMonthRevenue: number;
}