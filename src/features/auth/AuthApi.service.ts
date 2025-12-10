import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth'; // Đảm bảo trỏ đúng BE

/**
 * Gọi API Backend để kích hoạt tài khoản bằng token
 * @param token Token xác thực từ URL
 */
export const activateAccount = async (token: string) => {
    try {
        // Sử dụng GET /api/auth/activate?token=...
        const response = await axios.get(`${BASE_URL}/activate?token=${token}`);
        return response.data; // Trả về thông báo thành công
    } catch (error) {
        // Xử lý lỗi từ Backend (ví dụ: Token hết hạn, không hợp lệ)
        if (axios.isAxiosError(error) && error.response) {
            // Ném ra thông báo lỗi từ Backend
            throw new Error(error.response.data || "Lỗi kích hoạt tài khoản.");
        }
        throw new Error("Không thể kết nối đến máy chủ.");
    }
};