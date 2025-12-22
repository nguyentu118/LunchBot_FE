import { ShippingPartnerRequest, ShippingPartnerResponse } from '../types/driver';
import axiosInstance from "../../../../config/axiosConfig.ts";

export const getAllShippingPartners = async (): Promise<ShippingPartnerResponse[]> => {
    try {
        console.log("Fetching from endpoint: /delivery/list");
        const response = await axiosInstance.get("/delivery/list");

        // ✅ FIX: Parse nếu là string
        let data = response.data;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (parseError) {
                console.error("❌ Failed to parse JSON string:", parseError);
                return [];
            }
        }

        if (!Array.isArray(data)) {
            console.error("❌ Response is not array:", data);
            return [];
        }

        return data;

    } catch (error: any) {
        console.error("getAllShippingPartners Error:", error);
        throw error;
    }
};

export const getShippingPartnerById = async (id: number): Promise<ShippingPartnerResponse> => {
    try {
        const response = await axiosInstance.get(`/delivery/${id}`);

        // ✅ Apply same fix here
        let data = response.data;
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        console.log("Get By ID Response:", data);
        return data as ShippingPartnerResponse;
    } catch (error) {
        console.error("Get By ID Error:", error);
        throw error;
    }
};

export const createShippingPartner = async (data: ShippingPartnerRequest): Promise<ShippingPartnerResponse> => {
    try {
        const response = await axiosInstance.post("/delivery/create", data);

        let responseData = response.data;
        if (typeof responseData === 'string') {
            responseData = JSON.parse(responseData);
        }

        console.log("Create Response:", responseData);
        return responseData as ShippingPartnerResponse;
    } catch (error) {
        console.error("Create Error:", error);
        throw error;
    }
};

export const updateShippingPartner = async (id: number, data: ShippingPartnerRequest): Promise<ShippingPartnerResponse> => {
    try {
        const response = await axiosInstance.put(`/delivery/${id}`, data);

        let responseData = response.data;
        if (typeof responseData === 'string') {
            responseData = JSON.parse(responseData);
        }

        console.log("Update Response:", responseData);
        return responseData as ShippingPartnerResponse;
    } catch (error) {
        console.error("Update Error:", error);
        throw error;
    }
};

export const toggleLockPartner = async (id: number): Promise<void> => {
    try {
        console.log("Toggle lock for ID:", id);
        const response = await axiosInstance.patch(`/delivery/${id}/toggle-lock`);
        console.log("Toggle Lock Response:", response.data);
    } catch (error) {
        console.error("Toggle Lock Error:", error);
        throw error;
    }
};

export const setDefaultPartner = async (id: number): Promise<void> => {
    try {
        console.log("Set default partner ID:", id);
        const response = await axiosInstance.patch(`/delivery/${id}/set-default`);
        console.log("Set Default Response:", response.data);
    } catch (error) {
        console.error("Set Default Error:", error);
        throw error;
    }
};

export const toggleDriverLock = async (id: number, lockReason: string) => {
    try {
        const response = await axiosInstance.patch(`/delivery/${id}/toggle-lock`,
            {
                lockReason: lockReason
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error toggling driver lock:', error);
        throw error;
    }
};