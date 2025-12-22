// src/features/shipping/utils/shipping.utils.ts

/**
 * Format phí giao hàng thành chuỗi tiền tệ Việt Nam
 */
export const formatShippingFee = (fee: number): string => {
    return new Intl.NumberFormat('vi-VN').format(fee) + '₫';
};

/**
 * Kiểm tra xem phí giao hàng có hợp lệ không
 */
export const isValidShippingFee = (fee: number): boolean => {
    return fee > 0 && !isNaN(fee) && isFinite(fee);
};

/**
 * Tính tổng tiền thanh toán
 */
export const calculateTotalAmount = (
    itemsTotal: number,
    serviceFee: number,
    shippingFee: number,
    discountAmount: number
): number => {
    return itemsTotal + serviceFee + shippingFee - discountAmount;
};

/**
 * Lấy phí giao hàng mặc định dựa vào khoảng cách (estimation)
 * Phí này sẽ được thay thế khi GHN API trả về giá trị thực
 */
export const getDefaultShippingFee = (districtId?: number): number => {
    // Phí mặc định chung: 25.000 VND
    return 25000;
};

/**
 * Validate địa chỉ trước khi tính phí giao hàng
 */
export const validateAddressForShipping = (address: {
    districtId?: number;
    wardCode?: string;
}): { isValid: boolean; error?: string } => {
    if (!address.districtId) {
        return { isValid: false, error: 'Quận/Huyện không hợp lệ' };
    }

    if (!address.wardCode) {
        return { isValid: false, error: 'Phường/Xã không hợp lệ' };
    }

    return { isValid: true };
};

/**
 * GHN District IDs - Danh sách huyện theo tỉnh
 * (Có thể mở rộng với dữ liệu từ GHN API)
 */
export const GHN_DISTRICTS = {
    'Hà Nội': {
        'Ba Đình': 1440,
        'Hoàn Kiếm': 1441,
        'Tây Hồ': 1442,
        'Cầu Giấy': 1443,
        'Đống Đa': 1444,
        'Hai Bà Trưng': 1445,
        'Hoàng Mai': 1446,
        'Long Biên': 1447,
        'Nam Từ Liêm': 1448,
        'Bắc Từ Liêm': 1449,
        'Thanh Xuân': 1450,
    },
    'TP. Hồ Chí Minh': {
        'Quận 1': 3695,
        'Quận 2': 3696,
        'Quận 3': 3697,
        'Quận 4': 3698,
        'Quận 5': 3699,
        'Quận 6': 3700,
        'Quận 7': 3701,
        'Quận 8': 3702,
        'Quận 9': 3703,
        'Quận 10': 3704,
        'Quận 11': 3705,
        'Quận 12': 3706,
        'Bình Thạnh': 3707,
        'Bình Tân': 3708,
        'Gò Vấp': 3709,
        'Phú Nhuận': 3710,
        'Tân Bình': 3711,
        'Tân Phú': 3712,
        'Thủ Đức': 3713,
        'Cần Thơ': 3714,
    }
};

/**
 * Lấy District ID từ tên quận/huyện và tỉnh
 */
export const getDistrictId = (province: string, district: string): number | undefined => {
    return GHN_DISTRICTS[province as keyof typeof GHN_DISTRICTS]?.[district as any];
};

/**
 * Retry logic cho tính phí giao hàng (nếu cần)
 */
export const retryCalculateShippingFee = async (
    calculateFn: () => Promise<number>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<number> => {
    let lastError: Error = new Error('Unknown error');

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await calculateFn();
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${i + 1}/${maxRetries} failed. Retrying in ${delayMs}ms...`);

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError;
};