// src/features/admin/refund/types/refund.type.ts

export type RefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface RefundRequest {
    id: number;
    orderId: number;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    refundAmount: number;
    customerBankAccount: string;
    customerBankName: string;
    customerAccountName: string;
    refundStatus: RefundStatus;
    refundReason: string;
    transactionRef: string;
    refundTransactionRef: string | null;
    createdAt: string;
    processedAt: string | null;
    processedBy: string | null;
    notes: string | null;
}

export interface ConfirmRefundPayload {
    refundTransactionRef: string;
    notes: string;
}

export interface RefundFilter {
    status?: RefundStatus;
    searchTerm?: string;
}