import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DishCardProps {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    merchantName: string;
    viewCount: number;
    preparationTime?: number;
}

const DishCard: React.FC<DishCardProps> = ({
                                               id,
                                               name,
                                               price,
                                               discountPrice,
                                               imageUrl,
                                               merchantName,
                                               viewCount,
                                               preparationTime
                                           }) => {
    const navigate = useNavigate();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleClick = () => {
        navigate(`/dishes/${id}`);
    };

    const discountPercent = discountPrice
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;

    return (
        <div className="dish-card" onClick={handleClick}>
            <div className="dish-card-image">
                <img src={imageUrl} alt={name} />
                {discountPrice && (
                    <div className="discount-badge">-{discountPercent}%</div>
                )}
            </div>

            <div className="dish-card-content">
                <h3 className="dish-card-name">{name}</h3>
                <p className="dish-card-merchant">{merchantName}</p>

                <div className="dish-card-meta">
                    {preparationTime && (
                        <span className="prep-time">⏱️ {preparationTime} phút</span>
                    )}
                    <span className="view-count">👁️ {viewCount}</span>
                </div>

                <div className="dish-card-footer">
                    <div className="price-section">
                        {discountPrice ? (
                            <>
                                <span className="original-price">{formatPrice(price)}</span>
                                <span className="discount-price">{formatPrice(discountPrice)}</span>
                            </>
                        ) : (
                            <span className="current-price">{formatPrice(price)}</span>
                        )}
                    </div>

                    <button className="btn-add-cart" onClick={(e) => {
                        e.stopPropagation();
                        // Handle add to cart
                        console.log('Add to cart:', id);
                    }}>
                        🛒
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DishCard;