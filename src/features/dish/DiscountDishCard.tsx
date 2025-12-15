import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { MapPin, Clock, Tag, Plus } from 'lucide-react';
import { DishDiscount } from './types/DishDiscount';
import { useCart } from "../cart/hooks/useCart.ts";

interface DiscountDishCardProps {
    dish: DishDiscount;
}

const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const DiscountDishCard: React.FC<DiscountDishCardProps> = ({ dish }) => {
    const navigate = useNavigate();
    const { addToCart, isLoading } = useCart();

    const hasDiscount = dish.discountedPrice < dish.originalPrice;
    const finalPrice = hasDiscount ? dish.discountedPrice : dish.originalPrice;

    // ✅ Navigate đến trang chi tiết
    const handleCardClick = () => {
        navigate(`/dishes/${dish.id}`);
    };

    // ✅ Thêm vào giỏ hàng (prevent propagation)
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn trigger onClick của Card
        await addToCart(dish.id, 1);
    };

    return (
        <Card
            className="h-100 shadow-sm border-0 position-relative mb-3"
            onClick={handleCardClick}
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
                    src={dish.imageUrl || 'https://placehold.co/300x200?text=No+Image'}
                    alt={dish.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                />

                {/* Badge Discount */}
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

                {/* Thời gian chế biến và nút thêm giỏ */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="small text-muted d-flex align-items-center">
                        <Clock size={14} className="me-1 text-success" />
                        Thời gian: <strong className="ms-1">{dish.preparationTime} phút</strong>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        className="btn btn-sm btn-warning rounded-circle d-flex align-items-center justify-content-center p-0"
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
                        {isLoading ? (
                            <div className="spinner-border spinner-border-sm text-dark" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) : (
                            <Plus size={20} strokeWidth={3} color="black" />
                        )}
                    </button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default DiscountDishCard;