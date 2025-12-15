import React from 'react';
import { Card, Badge} from 'react-bootstrap';
import {MapPin, Clock, Tag, Plus} from 'lucide-react';
import { DishDiscount } from './types/DishDiscount'; // Đảm bảo đường dẫn chính xác

interface DiscountDishCardProps {
    dish: DishDiscount;
}

// Hàm định dạng tiền tệ Việt Nam (VND)
const formatCurrency = (value: number| undefined|null): string => {
    if(value === undefined || value === null ) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const DiscountDishCard: React.FC<DiscountDishCardProps> = ({ dish }) => {
    const hasDiscount = dish.discountedPrice < dish.originalPrice;
    const finalPrice = hasDiscount ? dish.discountedPrice : dish.originalPrice;

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
                        {Math.round(dish.discountPercentage)}% OFF
                    </Badge>
                )}

                {/* Badge Coupon */}
                <Badge
                    bg={dish.couponCode ? "primary" : "warning"}
                    text={dish.couponCode ? "white" : "dark"}
                    className="position-absolute top-0 end-0 m-2 px-2 py-1 fw-bold d-flex align-items-center"
                >
                    <Tag size={14} className="me-1" />
                    {dish.couponCode || 'GIẢM GIÁ'}
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
                        <span className="text-truncate">{dish.address}</span>
                    </div>
                    <div className="text-end flex-shrink-0">
                        <div className="fw-bold text-danger" style={{ fontSize: '0.95rem' }}>
                            {formatCurrency(finalPrice)}
                        </div>
                        {hasDiscount && (
                            <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.7rem' }}>
                                {formatCurrency(dish.originalPrice)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Thời gian chế biến */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="small text-muted d-flex align-items-center">
                        <Clock size={14} className="me-1 text-success" />
                        Thời gian: <strong>{dish.preparationTime} phút</strong>
                    </div>
                    <button
                        className="btn btn-sm btn-warning rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: '36px', height: '36px' }}
                        title="Thêm vào giỏ hàng"
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

export default DiscountDishCard;