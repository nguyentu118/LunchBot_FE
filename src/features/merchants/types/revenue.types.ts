export interface OrderRevenueDetail {
    orderId: number;
    orderNumber: string;
    orderDate: string;
    completedAt: string;
    itemsTotal: number;
    discountAmount: number;
    revenue: number;
}

export interface MonthlyRevenueResponse {
    merchantId: number;
    yearMonth: string; // "2025-12"
    totalOrders: number;
    totalGrossRevenue: number;
    platformCommissionRate: number;
    totalPlatformFee: number;
    netRevenue: number;
    orderDetails: OrderRevenueDetail[];
}
export interface ReconciliationRequestCreateDTO {
    yearMonth: string;      // "2023-12"
    merchantNotes?: string; // Ghi chú tùy chọn
}
export interface ReconciliationRequestResponse {
    id: number;
    yearMonth: string;
    totalOrders: number;
    totalGrossRevenue: number;
    netRevenue: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED'|'REPORTED' ;
    statusDisplay: string; // "Đang chờ xử lý", "Đã duyệt"...
    merchantNotes?: string;
    adminNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedByName?: string;
}

export interface ReconciliationSummaryResponse {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    latestRequest?: ReconciliationRequestResponse;
}

// --- DTO Mới cho Claim ---
export interface ReconciliationClaimDTO {
    yearMonth: string;
    reason: string; // Bắt buộc
}
export interface ReconciliationRequestResponse {
    id: number;
    yearMonth: string;
    totalOrders: number;
    totalGrossRevenue: number;
    netRevenue: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPORTED'; // <--- Thêm REPORTED
    statusDisplay: string;
    merchantNotes?: string;
    adminNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedByName?: string;
}
export interface CompletedOrderDTO {
    orderId: number;
    orderNumber: string;
    orderDate: string;
    completedAt: string;
    itemsTotal: number;
    discountAmount: number;
    revenue: number;
}

export interface CancelledOrderDTO {
    orderId: number;
    orderNumber: string;
    orderDate: string;
    cancelledAt: string;
    cancellationReason: string;
    cancelledBy: string; // "CUSTOMER" hoặc "MERCHANT"
}

export interface RevenueReportDTO {
    merchantId: number;
    merchantName: string;
    period: string; // "01/2025"
    exportedAt: string;
    totalGrossRevenue: number;
    totalOrders: number;
    completedOrders: number;
    completedOrderDetails: CompletedOrderDTO[];
    cancelledOrders: number;
    cancelledOrderDetails: CancelledOrderDTO[];
    averageOrderValue: number;
    platformCommissionRate: number;
    totalPlatformFee: number;
    netRevenue: number;
    previousMonthRevenue: number;
    revenueChange: number;
    revenueChangePercent: number;
    revenueChangeStatus: 'UP' | 'DOWN' | 'EQUAL';
}