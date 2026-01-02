// src/features/user/services/UserApi.services.ts

import axiosInstance from '../../../config/axiosConfig';
import {BankInfo, BankInfoResponse, UpdateBankInfoRequest, UserMeDTO} from '../types/user.type';

const USER_API = '/users';

export const UserApiService = {
    /**
     * Lấy thông tin cơ bản của User cho Header/Dropdown (Tên User)
     */
    getMeInfo: async (): Promise<UserMeDTO> => {
        try {
            const response = await axiosInstance.get(`${USER_API}/me`);

            // ⭐ Kiểm tra response structure
            // Nếu backend trả về { data: { fullName: "..." } }
            if (response.data.data) {
                return response.data.data;
            }

            // Nếu backend trả về { fullName: "..." } trực tiếp
            return response.data;
        } catch (error) {
            console.error("❌ Failed to fetch user info:", error);
            throw error; // ⭐ Throw error thay vì return default
        }
    },
    /**
     * Lấy thông tin ngân hàng của user
     * GET /api/users/bank-info
     */
    getBankInfo: async (): Promise<BankInfo> => {
        try {
            const response = await axiosInstance.get<BankInfoResponse>(`${USER_API}/bank-info`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Không thể lấy thông tin ngân hàng");
        } catch (error) {
            console.error("❌ Failed to fetch bank info:", error);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin ngân hàng
     * PUT /api/users/bank-info
     */
    updateBankInfo: async (bankInfo: UpdateBankInfoRequest): Promise<BankInfo> => {
        try {
            const response = await axiosInstance.put<BankInfoResponse>(
                `${USER_API}/bank-info`,
                bankInfo
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || "Không thể cập nhật thông tin ngân hàng");
        } catch (error) {
            console.error("❌ Failed to update bank info:", error);
            throw error;
        }
    },

    /**
     * Xóa thông tin ngân hàng
     * DELETE /api/users/bank-info
     */
    deleteBankInfo: async (): Promise<void> => {
        try {
            const response = await axiosInstance.delete<{ success: boolean; message?: string }>(
                `${USER_API}/bank-info`
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Không thể xóa thông tin ngân hàng");
            }
        } catch (error) {
            console.error("❌ Failed to delete bank info:", error);
            throw error;
        }
    },
};