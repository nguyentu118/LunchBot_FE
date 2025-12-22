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

    // ✅ GHN API fields
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
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

    // ✅ GHN API fields
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
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

    // ✅ GHN API fields
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
}

// ✅ GHN API Response types
export interface GHNProvince {
    ProvinceID: number;
    ProvinceName: string;
    Code: string;
    IsEnable: number;
    RegionID: number;
    UpdatedDate: string;
    CanUpdateCOD: boolean;
    Status: number;
}

export interface GHNDistrict {
    DistrictID: number;
    ProvinceID: number;
    DistrictName: string;
    Code: string;
    Type: number;
    SupportType: number;
    IsEnable: number;
    UpdatedDate: string;
    CanUpdateCOD: boolean;
    Status: number;
}

export interface GHNWard {
    WardCode: string;
    DistrictID: number;
    WardName: string;
    WardType: string;
    IsEnable: number;
    UpdatedDate: string;
    CanUpdateCOD: boolean;
    Status: number;
}

// ✅ Select option types
export interface SelectOption {
    label: string;
    value: string | number;
}