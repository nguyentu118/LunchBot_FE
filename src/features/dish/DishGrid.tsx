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

        // Cho phép sai số nhỏ (1px) khi tính toán scroll
        setCanScrollLeft(container.scrollLeft > 1);
        setCanScrollRight(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 1
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
            // Kiểm tra lại khi resize window
            window.addEventListener('resize', checkScrollButtons);

            return () => {
                container.removeEventListener('scroll', checkScrollButtons);
                window.removeEventListener('resize', checkScrollButtons);
            };
        }
    }, [dishes]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 280; // Chiều rộng card + gap
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    // Style cho nút điều hướng chung
    const navButtonStyle: React.CSSProperties = {
        width: '40px',
        height: '40px',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        zIndex: 10,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    return (
        <div className="mt-5">
            {/* Header chỉ còn Title */}
            <div className="mb-4">
                <h4
                    className="fw-bold mb-0 border-start border-4 ps-3"
                    style={{ borderColor: brandColor }}
                >
                    {title}
                </h4>
            </div>

            {/* Content Wrapper - Có position relative để định vị nút */}
            <div className="position-relative">

                {/* Nút Trái */}
                {!loading && dishes.length > 0 && (
                    <button
                        className="btn rounded-circle shadow position-absolute start-0 top-50 translate-middle-y d-flex align-items-center justify-content-center"
                        style={{
                            ...navButtonStyle,
                            // Ẩn nút nếu không scroll được sang trái (đang ở đầu)
                            opacity: canScrollLeft ? 1 : 0,
                            visibility: canScrollLeft ? 'visible' : 'hidden',
                            left: '-20px' // Đẩy ra ngoài lề một chút (tùy chỉnh nếu bị che)
                        }}
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft size={24} color={brandColor} />
                    </button>
                )}

                {/* Main Content List */}
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
                        className="d-flex gap-3 overflow-x-auto pb-3 px-1" // Thêm px-1 để bóng đổ card không bị cắt
                        style={{
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE/Edge
                            WebkitOverflowScrolling: 'touch', // iOS smooth scroll
                            scrollBehavior: 'smooth'
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

                {/* Nút Phải */}
                {!loading && dishes.length > 0 && (
                    <button
                        className="btn rounded-circle shadow position-absolute end-0 top-50 translate-middle-y d-flex align-items-center justify-content-center"
                        style={{
                            ...navButtonStyle,
                            opacity: canScrollRight ? 1 : 0,
                            visibility: canScrollRight ? 'visible' : 'hidden',
                            right: '-20px' // Đẩy ra ngoài lề một chút
                        }}
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight size={24} color={brandColor} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DishGrid;