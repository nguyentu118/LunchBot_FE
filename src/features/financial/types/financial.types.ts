export interface WithdrawalRequest {
    id: number;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNotes?: string;
    requestedAt: string;
    processedAt?: string;
    merchant?: {
        id: number;
        restaurantName: string;
        bankName: string;
        bankAccountNumber: string;
        bankAccountHolder: string;
    };
}

export interface WithdrawalCreateDTO {
    amount: number;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
}