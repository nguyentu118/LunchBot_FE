// src/features/user/services/UserApi.services.ts

import axiosInstance from '../../../config/axiosConfig';
import { UserMeDTO } from '../types/user.type';

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
};