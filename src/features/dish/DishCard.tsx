import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner } from 'react-bootstrap';
import { Store, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from '../cart/hooks/useCart.ts';

interface DishCardProps {
    dish: {
        id: number;
        name: string;
        slug?: string;
        price: number;
        discountPrice: number | null;
        imageUrl: string;
        merchantName: string;
        preparationTime: number;
    };
    brandColor?: string;
    onAddToCart?: (dishId: number) => void;
}

const DishCard: React.FC<DishCardProps> = ({
                                               dish,
                                               brandColor = '#FF5E62',
                                               onAddToCart
                                           }) => {
    const navigate = useNavigate();
    const { addToCart, isLoading } = useCart();

    const finalPrice = dish.discountPrice || dish.price;
    const hasDiscount = dish.discountPrice && dish.discountPrice < dish.price;
    const discountPercent = hasDiscount
        ? Math.round(((dish.price - dish.discountPrice!) / dish.price) * 100)
        : 0;

    const handleCardClick = () => {
        navigate(`/dishes/${dish.id}`);
    };

    const handleAddToCartClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(dish.id);
        } else {
            await addToCart(dish.id, 1);
        }
    };

    return (
        <div
            className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
            style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={handleCardClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
            }}
        >
            {/* Ảnh món ăn */}
            <div className="position-relative">
                <img
                    src={dish.imageUrl || 'https://placehold.co/300x200?text=No+Image'}
                    className="card-img-top object-fit-cover"
                    alt={dish.name}
                    style={{ height: '160px' }}
                />
                {hasDiscount && (
                    <Badge
                        bg="danger"
                        className="position-absolute top-0 end-0 m-2 px-2 py-1"
                    >
                        -{discountPercent}%
                    </Badge>
                )}
            </div>

            {/* Thông tin món ăn */}
            <div className="card-body">
                <h6
                    className="card-title fw-bold mb-2"
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                    title={dish.name}
                >
                    {dish.name}
                </h6>

                <div className="d-flex align-items-center mb-2">
                    <Store size={14} className="text-muted me-1 flex-shrink-0" />
                    <small className="text-muted text-truncate">
                        {dish.merchantName}
                    </small>
                </div>

                <div className="d-flex align-items-center mb-3">
                    <Clock size={14} className="text-success me-1" />
                    <small className="text-muted">
                        {dish.preparationTime || 15} phút
                    </small>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <span
                            className="fw-bold"
                            style={{ color: brandColor, fontSize: '1rem' }}
                        >
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(finalPrice)}
                        </span>
                        {hasDiscount && (
                            <div
                                className="text-muted text-decoration-line-through"
                                style={{ fontSize: '0.75rem' }}
                            >
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(dish.price)}
                            </div>
                        )}
                    </div>

                    {/* Nút giỏ hàng */}
                    <button
                        className="btn btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                        onClick={handleAddToCartClick}
                        disabled={isLoading}
                        style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: 'white', // Màu nền mặc định
                            border: '1px solid #dee2e6', // Viền mặc định
                            transition: 'all 0.2s ease' // Hiệu ứng chuyển màu mượt
                        }}
                        // Xử lý Hover bằng Javascript
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#d3d4d5'; // Đổi nền sang màu Xám
                                e.currentTarget.style.borderColor = '#c6c7c8';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = 'white'; // Trả về màu Trắng
                                e.currentTarget.style.borderColor = '#dee2e6';
                            }
                        }}
                    >
                        {isLoading ? (
                            <Spinner animation="border" size="sm" style={{ width: '1rem', height: '1rem', color: brandColor }} />
                        ) : (
                            // Icon vẫn giữ nguyên màu BrandColor trong mọi trường hợp
                            <ShoppingCart size={16} style={{ color: brandColor }} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DishCard;