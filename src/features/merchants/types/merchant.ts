// src/features/merchants/types/merchant.ts

export interface PopularMerchantDto {
    id: number;
    name: string;
    cuisine?: string;           // ✅ THAY ĐỔI: từ description → cuisine
    address?: string;
    phoneNumber?: string;
    imageUrl: string;          // ✅ THAY ĐỔI: từ avatarUrl → imageUrl
    rating?: number;
    totalOrders?: number;
    priceRange?: string;        // ✅ THÊM MỚI: thay vì averagePrice
    deliveryTime?: string;
    deliveryFee?: string;       // ✅ THÊM MỚI
    reviews?: string;           // ✅ THÊM MỚI
}

export interface MerchantApiResponse {
    data: PopularMerchantDto[];
    message?: string;
}