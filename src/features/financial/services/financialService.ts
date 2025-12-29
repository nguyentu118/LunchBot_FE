import axiosInstance from "../../../config/axiosConfig";
import { WithdrawalCreateDTO, WithdrawalRequest } from "../types/financial.types";

export const financialService = {
    // Rút tiền thường
    requestWithdrawal: async (data: WithdrawalCreateDTO) => {
        return await axiosInstance.post('/merchants/financial/withdraw', data);
    },

    // Thanh lý hợp đồng
    liquidateContract: async (data: WithdrawalCreateDTO) => {
        return await axiosInstance.post('/merchants/financial/liquidate', data);
    },

    // Lịch sử giao dịch
    getHistory: async (): Promise<WithdrawalRequest[]> => {
        const response = await axiosInstance.get<WithdrawalRequest[]>('/merchants/financial/history');
        return response.data;
    }
};