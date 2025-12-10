import {
    type AdminMerchantListResponse,
    type AdminMerchantResponse,
    type MerchantLockRequest,
    type MerchantApprovalRequest, MerchantStatus, type PageResponse, MerchantReProcessRequest
} from "../types/merchant.types.ts";
import axiosInstance from "../../../../config/axiosConfig.ts";
import axios from "axios";

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
            const response = await axiosInstance.put<AdminMerchantResponse>(
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
            const response = await axiosInstance.put<AdminMerchantResponse>(
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
            const response = await axiosInstance.get<PageResponse<AdminMerchantListResponse>>(
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
            const response = await axiosInstance.get<PageResponse<AdminMerchantListResponse>>(
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
            const response = await axiosInstance.get<PageResponse<AdminMerchantListResponse>>(
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
            const response = await axiosInstance.get<AdminMerchantResponse>(
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
            const response = await axiosInstance.put<AdminMerchantResponse>(
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