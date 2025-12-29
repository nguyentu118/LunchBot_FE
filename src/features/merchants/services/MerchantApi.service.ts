import axiosInstance from "../../../config/axiosConfig.ts";

export interface MerchantDTO {
    id: number;
    restaurantName: string;
    avatarUrl: string | null;
    address: string;
    phone: string;
    email: string;
    openTime: string | null;
    closeTime: string | null;
}

export interface MerchantPageResponse {
    content: MerchantDTO[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

export class MerchantApiService {
    /**
     * Lấy danh sách merchants với phân trang và tìm kiếm
     */
    static async getAllMerchants(
        page: number = 0,
        size: number = 12,
        keyword?: string
    ): Promise<MerchantPageResponse> {
        try {
            const params: any = { page, size };
            if (keyword && keyword.trim()) {
                params.keyword = keyword.trim();
            }

            const response = await axiosInstance.get(`/merchants/all`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching merchants:', error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết một merchant
     */
    static async getMerchantById(id: number): Promise<MerchantDTO> {
        try {
            const response = await axiosInstance.get(`/merchants/profile/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching merchant detail:', error);
            throw error;
        }
    }
}