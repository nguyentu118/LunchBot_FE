import React, { useState, useCallback, useMemo } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import useSuggestedDishes from './hooks/useSuggestedDishes';
import { SuggestedDish } from './types/suggestedDish';
import SuggestedDishCard from './SuggestedDishCard';

const SuggestedDishesSection: React.FC = () => {
    const navigate = useNavigate();

    // ✅ Sử dụng hook có sẵn
    const { data: dishes, isLoading, error } = useSuggestedDishes();

    // State cho slider
    const [slideIndex, setSlideIndex] = useState<number>(0);

    // ✅ Tính toán maxSlideIndex
    const maxSlideIndex = useMemo(() => {
        return Math.max(0, dishes.length - 4);
    }, [dishes.length]);

    // ✅ Hàm điều hướng slider
    const nextSlide = useCallback(() => {
        setSlideIndex(prev => Math.min(prev + 1, maxSlideIndex));
    }, [maxSlideIndex]);

    const prevSlide = useCallback(() => {
        setSlideIndex(prev => Math.max(prev - 1, 0));
    }, []);

    const handleDishClick = useCallback((dishId: number) => {
        navigate(`/dishes/${dishId}`);
    }, [navigate]);

    // Style nút điều khiển (lấy từ yêu cầu của bạn)
    const navButtonStyle: React.CSSProperties = {
        width: '45px', // Tăng nhẹ kích thước để dễ bấm hơn
        height: '45px',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        zIndex: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    };

    // 1. Hiển thị Loading
    if (isLoading) {
        return (
            <Container className="py-5">
                <h2 className="fw-bold mb-3 d-flex align-items-center">
                    <Flame size={28} className="me-2 text-danger" fill="currentColor" />
                    Món Ăn Gợi Ý Hàng Đầu
                </h2>
                <Alert variant="info">Đang tải món ăn gợi ý...</Alert>
            </Container>
        );
    }

    // 2. Hiển thị Lỗi
    if (error) {
        return (
            <Container className="py-5">
                <h2 className="fw-bold mb-3 d-flex align-items-center">
                    <Flame size={28} className="me-2 text-danger" fill="currentColor" />
                    Món Ăn Gợi Ý Hàng Đầu
                </h2>
                <Alert variant="danger">Lỗi tải dữ liệu: {error}</Alert>
            </Container>
        );
    }

    // 3. Hiển thị khi không có dữ liệu
    if (dishes.length === 0) {
        return (
            <Container className="py-5">
                <h2 className="fw-bold mb-3 d-flex align-items-center">
                    <Flame size={28} className="me-2 text-danger" fill="currentColor" />
                    Món Ăn Gợi Ý Hàng Đầu
                </h2>
                <Alert variant="info">Hiện tại không có món ăn gợi ý.</Alert>
            </Container>
        );
    }

    // 4. Hiển thị Slider
    return (
        <Container className="py-4">
            {/* Header chỉ còn Title */}
            <div className="mb-3">
                <h2 className="fw-bold mb-0 d-flex align-items-center">
                    <Flame size={28} className="me-2 text-danger" fill="currentColor" />
                    Món Ăn Gợi Ý Hàng Đầu
                </h2>
            </div>

            {/* Wrapper bao quanh Slider và Nút bấm */}
            <div className="position-relative">

                {/* Nút Trái */}
                <button
                    className="btn btn-sm rounded-circle shadow position-absolute start-0 top-50 translate-middle-y d-none d-md-flex"
                    style={{
                        ...navButtonStyle,
                        opacity: slideIndex > 0 ? 1 : 0,
                        visibility: slideIndex > 0 ? 'visible' : 'hidden',
                        left: '0px'
                    }}
                    onClick={prevSlide}
                    disabled={slideIndex === 0}
                >
                    <ChevronLeft size={24} className="text-primary" />
                </button>

                {/* Slider Container - Thêm mx-2 để tách khỏi nút */}
                <div className="overflow-hidden mx-2">
                    <div
                        className="d-flex flex-row flex-nowrap gap-3"
                        style={{
                            transform: `translateX(-${slideIndex * 25}%)`,
                            transition: 'transform 0.5s ease-in-out'
                        }}
                    >
                        {dishes.map((dish: SuggestedDish) => (
                            <div
                                key={dish.id}
                                className="flex-shrink-0"
                                style={{
                                    width: 'calc(25% - 9px)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleDishClick(dish.id)}
                            >
                                <SuggestedDishCard dish={dish} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nút Phải */}
                <button
                    className="btn btn-sm rounded-circle shadow position-absolute end-0 top-50 translate-middle-y d-none d-md-flex"
                    style={{
                        ...navButtonStyle,
                        opacity: slideIndex < maxSlideIndex ? 1 : 0,
                        visibility: slideIndex < maxSlideIndex ? 'visible' : 'hidden',
                        right: '0px'
                    }}
                    onClick={nextSlide}
                    disabled={slideIndex >= maxSlideIndex}
                >
                    <ChevronRight size={24} className="text-primary" />
                </button>
            </div>

            <div className="text-center mt-3">
                <Button
                    as={Link}
                    to="/suggested"
                    variant="danger"
                    className="fw-bold px-4 py-2 shadow-lg d-inline-flex align-items-center"
                >
                    Xem thêm các món gợi ý
                    <ChevronRight size={20} className="ms-2"/>
                </Button>
            </div>
        </Container>
    );
};

export default SuggestedDishesSection;