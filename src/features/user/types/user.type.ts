// src/features/user/types/user.type.ts (Tạo mới hoặc thêm vào file types hiện có)

export interface UserMeDTO {
    fullName: string;
    isLoggedIn: boolean;
}

export interface CartCountDTO {
    count: number;
}
export interface BankInfo {
    bankAccountNumber: string;
    bankName: string;
    bankAccountName: string;
    bankBranch?: string;
    hasBankInfo: boolean;
}

export interface BankInfoResponse {
    success: boolean;
    data?: BankInfo;
    message?: string;
}

export interface UpdateBankInfoRequest {
    bankAccountNumber: string;
    bankName: string;
    bankAccountName: string;
    bankBranch?: string;
}