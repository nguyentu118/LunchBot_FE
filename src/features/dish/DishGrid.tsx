// src/components/dish/DishGrid.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DishCard from './DishCard';

interface Dish {
    id: number;
    name: string;
    slug?: string;
    price: number;
    discountPrice: number | null;
    imageUrl: string;
    merchantName: string;
    preparationTime: number;
}

interface DishGridProps {
    title: string;
    dishes: Dish[];
    loading?: boolean;
    emptyMessage?: string;
    brandColor?: string;
    onAddToCart?: (dishId: number) => void;
    autoScroll?: boolean;
    autoScrollInterval?: number;
}

const DishGrid: React.FC<DishGridProps> = ({
                                               title,
                                               dishes,
                                               loading = false,
                                               emptyMessage = 'Chưa có dữ liệu',
                                               brandColor = '#FF5E62',
                                               onAddToCart,
                                               autoScroll = false,
                                               autoScrollInterval = 3000
                                           }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Kiểm tra trạng thái scroll
    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
    };

    // Auto scroll logic
    useEffect(() => {
        if (!autoScroll || dishes.length === 0) return;

        const container = scrollContainerRef.current;
        if (!container) return;

        const intervalId = setInterval(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;

            if (currentScroll >= maxScroll) {
                // Quay về đầu khi đến cuối
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Scroll sang phải
                const cardWidth = 280; // Chiều rộng card + gap
                container.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }, autoScrollInterval);

        return () => clearInterval(intervalId);
    }, [autoScroll, autoScrollInterval, dishes.length]);

    useEffect(() => {
        checkScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            return () => container.removeEventListener('scroll', checkScrollButtons);
        }
    }, [dishes]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 280; // Chiều rộng card + gap
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className="mt-5">
            {/* Header với title */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4
                    className="fw-bold mb-0 border-start border-4 ps-3"
                    style={{ borderColor: brandColor }}
                >
                    {title}
                </h4>

                {/* Nút điều khiển scroll */}
                {!loading && dishes.length > 0 && (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                            style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                opacity: canScrollLeft ? 1 : 0.3,
                                cursor: canScrollLeft ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                        >
                            <ChevronLeft size={20} color={brandColor} />
                        </button>

                        <button
                            className="btn btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                            style={{
                                width: '36px',
                                height: '36px',
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                opacity: canScrollRight ? 1 : 0.3,
                                cursor: canScrollRight ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                        >
                            <ChevronRight size={20} color={brandColor} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner
                        animation="border"
                        size="sm"
                        style={{ color: brandColor }}
                    />
                    <p className="text-muted mt-2 small">Đang tải...</p>
                </div>
            ) : dishes.length > 0 ? (
                <div
                    ref={scrollContainerRef}
                    className="d-flex gap-3 overflow-x-auto pb-3"
                    style={{
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                        WebkitOverflowScrolling: 'touch' // iOS smooth scroll
                    }}
                >
                    <style>
                        {`
                            .d-flex.overflow-x-auto::-webkit-scrollbar {
                                display: none; /* Chrome/Safari/Opera */
                            }
                        `}
                    </style>

                    {dishes.map((dish) => (
                        <div
                            key={dish.id}
                            className="flex-shrink-0"
                            style={{ width: '260px' }}
                        >
                            <DishCard
                                dish={dish}
                                brandColor={brandColor}
                                onAddToCart={onAddToCart}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <p className="text-muted">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
};

export default DishGrid;