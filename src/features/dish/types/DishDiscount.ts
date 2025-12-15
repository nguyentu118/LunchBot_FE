/**
 * Interface đại diện cho DishDiscountResponse từ Backend (Task 41)
 */
export interface DishDiscount {
    id: number;
    name: string;
    imageUrl: string; // Ảnh đại diện món
    address: string; // Địa chỉ của Merchant
    preparationTime: number; // Thời gian chế biến (phút)
    originalPrice: number; // Giá gốc (Dùng number cho đơn giản, nếu backend trả về String thì dùng string)
    discountedPrice: number; // Giá đã giảm
    discountPercentage: number; // % giảm giá (number vì đã được làm tròn ở Backend)
    couponCode: string | null; // coupon (nếu có)
}