import axios, { AxiosError } from 'axios';
import {
    type AdminMerchantListResponse,
    type AdminMerchantResponse,
    type MerchantLockRequest,
    type MerchantApprovalRequest, MerchantStatus, type PageResponse, MerchantReProcessRequest
} from "../types/merchant.types.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Axios instance với interceptors
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export class MerchantApiService {
    private static readonly BASE_PATH = '/admin/merchants';

    /**
     * Approve or reject merchant registration
     */
    static async approveMerchant(
        merchantId: number,
        data: MerchantApprovalRequest
    ): Promise<AdminMerchantResponse> {
        try {
            const response = await apiClient.put<AdminMerchantResponse>(
                `${this.BASE_PATH}/${merchantId}/approval`,
                data
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    static async lockUnlockMerchant(
        merchantId: number,
        data: MerchantLockRequest
    ): Promise<AdminMerchantResponse> {
        try {
            const response = await apiClient.put<AdminMerchantResponse>(
                `${this.BASE_PATH}/${merchantId}/lock`,
                data
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get all merchants with pagination
     */
    static async getAllMerchants(
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<AdminMerchantListResponse>> {
        try {
            const response = await apiClient.get<PageResponse<AdminMerchantListResponse>>(
                this.BASE_PATH,
                { params: { page, size } }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get merchants by status
     */
    static async getMerchantsByStatus(
        status: MerchantStatus,
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<AdminMerchantListResponse>> {
        try {
            const response = await apiClient.get<PageResponse<AdminMerchantListResponse>>(
                `${this.BASE_PATH}/status/${status}`,
                { params: { page, size } }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Search merchants
     */
    static async searchMerchants(
        keyword: string,
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<AdminMerchantListResponse>> {
        try {
            const response = await apiClient.get<PageResponse<AdminMerchantListResponse>>(
                `${this.BASE_PATH}/search`,
                { params: { keyword, page, size } }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    static async getMerchantDetails(
        merchantId: number
    ): Promise<AdminMerchantResponse> {
        try {
            const response = await apiClient.get<AdminMerchantResponse>(
                `${this.BASE_PATH}/${merchantId}`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Task 26: Re-process rejected merchant
     */
    static async reProcessMerchant(
        merchantId: number,
        data: MerchantReProcessRequest
    ): Promise<AdminMerchantResponse> {
        try {
            const response = await apiClient.put<AdminMerchantResponse>(
                `${this.BASE_PATH}/${merchantId}/re-process`,
                data
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Error handler
     */
    private static handleError(error: unknown): Error {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message;
            return new Error(message);
        }
        return error as Error;
    }
}