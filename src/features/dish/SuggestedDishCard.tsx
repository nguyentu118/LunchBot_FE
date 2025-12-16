import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import {MapPin, Clock, Tag, ShoppingCart} from 'lucide-react';
import { SuggestedDish } from './types/suggestedDish';
import {useCart} from "../cart/hooks/useCart.ts";

interface SuggestedDishCardProps {
    dish: SuggestedDish;
}

// Hàm định dạng tiền tệ Việt Nam (VND)
const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const SuggestedDishCard: React.FC<SuggestedDishCardProps> = ({ dish }) => {
    // Logic giá
    const { addToCart, isLoading } = useCart();
    const hasDiscount = dish.discountPrice < dish.price;
    const finalPrice = hasDiscount ? dish.discountPrice : dish.price;

    // Format discount string
    const discountString = (dish.discountPercentage && dish.discountPercentage > 0)
        ? `${Math.round(dish.discountPercentage)}% OFF`
        : '';

    // Format preparation time
    const timeString = dish.preparationTime ? `${dish.preparationTime} phút` : '30 phút';

    // Badge text
    const badgeText = hasDiscount ? 'GIẢM GIÁ' : 'GỢI Ý';

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn trigger onClick của Card
        await addToCart(dish.id, 1);
    };

    return (
        <Card
            className="h-100 shadow-sm border-0 position-relative mb-3"
            style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
            }}
        >
            {/* Ảnh và Badge */}
            <div className="position-relative overflow-hidden">
                <Card.Img
                    variant="top"
                    src={dish.imageUrl || 'default-dish.jpg'}
                    alt={dish.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                />

                {/* Badge Discount (Nếu có % giảm giá) */}
                {hasDiscount && (
                    <Badge bg="danger" className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-6 fw-bold">
                        {discountString}
                    </Badge>
                )}

                {/* Badge Coupon/Gợi ý */}
                <Badge
                    bg={hasDiscount ? "warning" : "primary"}
                    text={hasDiscount ? "dark" : "white"}
                    className="position-absolute top-0 end-0 m-2 px-2 py-1 fw-bold d-flex align-items-center"
                >
                    <Tag size={14} className="me-1" />
                    {badgeText}
                </Badge>
            </div>

            <Card.Body className="d-flex flex-column p-3">
                {/* Tên món */}
                <Card.Title className="h6 fw-bold mb-2 text-truncate" title={dish.name}>
                    {dish.name}
                </Card.Title>

                {/* ⭐ FIX: Địa chỉ và Giá - GIỐNG CŨ NHƯNG TRUNCATE ĐỊA CHỈ */}
                <div className="d-flex align-items-start justify-content-between mb-1">
                    {/* Địa chỉ - Truncate với ... khi dài quá */}
                    <div
                        className="small text-muted d-flex align-items-center me-3"
                        style={{
                            minWidth: 0, // ⭐ Quan trọng: Cho phép flex item shrink
                            flex: '1 1 auto'
                        }}
                    >
                        <MapPin size={14} className="me-1 text-primary flex-shrink-0" />
                        <span
                            className="text-truncate"
                            title={dish.merchantAddress}
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {dish.merchantAddress}
                        </span>
                    </div>

                    {/* Giá - Luôn hiển thị đầy đủ, không bị đẩy */}
                    <div className="text-end flex-shrink-0">
                        <div className="fw-bold text-danger" style={{ fontSize: '0.95rem' }}>
                            {formatCurrency(finalPrice)}
                        </div>
                        {hasDiscount && (
                            <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.7rem' }}>
                                {formatCurrency(dish.price)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Thời gian chế biến và nút giỏ hàng */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="small text-muted d-flex align-items-center">
                        <Clock size={14} className="me-1 text-success" />
                        Thời gian: <strong>{timeString}</strong>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="btn btn-sm btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                        style={{
                            width: '36px',
                            height: '36px',
                            transition: 'transform 0.2s',
                            opacity: isLoading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="Thêm vào giỏ hàng"
                    >
                        <ShoppingCart size={16} style={{ color: "#FF5E62" }} />
                    </button>
                </div>
            </Card.Body>

            <Card.Footer className="bg-white border-top-0 pt-0 pb-3 px-3">
            </Card.Footer>
        </Card>
    );
};

export default SuggestedDishCard;