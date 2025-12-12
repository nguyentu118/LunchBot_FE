// File: src/types/suggestedDish.ts

export interface SuggestedDish {
    id: number;
    name: string;
    imageUrl: string; // Ảnh đại diện món
    merchantAddress: string; // Địa chỉ của Merchant (Địa chỉ)
    preparationTime: number; // Thời gian chế biến (phút)
    price: number; // Giá gốc
    discountPrice: number; // Giá sau giảm (nếu có)
    discountPercentage: number; // % giảm giá
    //couponCode: string

}