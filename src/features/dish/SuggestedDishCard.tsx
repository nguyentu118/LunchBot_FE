import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import {MapPin, Clock, Tag, Plus} from 'lucide-react';
import { SuggestedDish } from './types/suggestedDish';
import {useCart} from "../cart/hooks/useCart.ts";

interface SuggestedDishCardProps {
    dish: SuggestedDish;
}

// Hàm định dạng tiền tệ Việt Nam (VND) - Giống DealCard
const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const SuggestedDishCard: React.FC<SuggestedDishCardProps> = ({ dish }) => {
    const { addToCart } = useCart();

    // Logic giống DealCard trong Homepage
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

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Chặn sự kiện click lan ra ngoài (để không bị nhảy trang)

        // 🔥 CẬP NHẬT: Truyền đầy đủ thông tin món để cache
        addToCart(
            dish.id,
            1,
            {
                name: dish.name,
                image: dish.imageUrl || 'default-dish.jpg',
                price: finalPrice // Sử dụng giá sau giảm (nếu có)
            }
        );
    };

    return (
        <Card className="h-100 shadow-sm border-0 position-relative mb-3">
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

                {/* Địa chỉ và Giá */}
                <div className="d-flex align-items-start justify-content-between mb-1">
                    <div className="small text-muted d-flex align-items-center flex-grow-1 me-2">
                        <MapPin size={14} className="me-1 text-primary flex-shrink-0" />
                        <span className="text-truncate">{dish.merchantAddress}</span>
                    </div>
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

                {/* Thời gian chế biến */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="small text-muted d-flex align-items-center">
                        <Clock size={14} className="me-1 text-success" />
                        Thời gian: <strong>{timeString}</strong>
                    </div>
                    <button
                        className="btn btn-sm btn-warning rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: '36px', height: '36px' }}
                        title="Thêm vào giỏ hàng"
                        onClick={handleAddToCart}
                    >
                        <Plus size={20} strokeWidth={3} color="black" />
                    </button>
                </div>
            </Card.Body>

            <Card.Footer className="bg-white border-top-0 pt-0 pb-3 px-3">
            </Card.Footer>
        </Card>
    );
};

export default SuggestedDishCard;