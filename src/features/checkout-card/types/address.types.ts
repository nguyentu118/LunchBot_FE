// src/features/address/types/address.types.ts

export interface Address {
    id: number;
    contactName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    building?: string;
    isDefault: boolean;
    fullAddress: string;
    addressType: string; // "Mặc định", "Nhà riêng", "Văn phòng"
}

export interface AddressRequest {
    contactName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    building?: string;
    isDefault?: boolean;
}

export interface AddressFormData {
    contactName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    building: string;
    isDefault: boolean;
}