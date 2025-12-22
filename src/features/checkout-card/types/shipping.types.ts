// src/features/shipping/types/shipping.types.ts

/**
 * Phí giao hàng từ GHN API
 */
export interface ShippingFeeResponse {
    fee: number;           // Phí giao hàng (VND)
    isCalculated: boolean; // True nếu được tính toán từ GHN, false nếu sử dụng fallback
}

/**
 * Chi tiết phí giao hàng từ GHN
 */
export interface GHNShippingFeeDetail {
    total: number;          // Tổng phí
    service_fee: number;    // Phí dịch vụ
    insurance_fee: number;  // Phí bảo hiểm
    vat: number;           // Thuế VAT
    discount: number;      // Giảm giá
}

/**
 * Request tính phí giao hàng
 */
export interface CalculateShippingFeeRequest {
    from_district_id: number;    // ID huyện gửi hàng (cửa hàng)
    to_district_id: number;      // ID huyện nhận hàng (địa chỉ)
    to_ward_code: string;        // Mã phường nhận hàng
    weight: number;              // Cân nặng (g)
    length: number;              // Chiều dài (cm)
    width: number;               // Chiều rộng (cm)
    height: number;              // Chiều cao (cm)
    service_id: number;          // ID dịch vụ GHN
}

/**
 * Response từ GHN API
 */
export interface GHNApiResponse {
    code: number;                           // Response code (0 = success)
    message: string;                        // Message
    data: {
        total: number;                      // Tổng phí
        service_fee: number;                // Phí dịch vụ
        insurance_fee: number;              // Phí bảo hiểm
        vat: number;                       // VAT
        discount: number;                   // Giảm giá
        pick_shift: number | null;         // Ca lấy hàng
    };
}