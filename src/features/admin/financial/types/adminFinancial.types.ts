export interface AdminWithdrawalRequest {
    id: number;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    adminNotes?: string;
    // Thông tin Merchant và Ngân hàng
    merchant: {
        id: number;
        restaurantName: string;
        phone: string;
        bankName: string;
        bankAccountNumber: string;
        bankAccountHolder: string;
    };
}