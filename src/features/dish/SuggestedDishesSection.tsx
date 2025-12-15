import React, { useState, useCallback, useMemo } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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

    // ✅ Tính toán maxSlideIndex bằng useMemo để tránh re-calculate mỗi lần render
    const maxSlideIndex = useMemo(() => {
        return Math.max(0, dishes.length - 4);
    }, [dishes.length]);

    // ✅ Hàm điều hướng slider - dependency là maxSlideIndex thay vì dishes.length
    const nextSlide = useCallback(() => {
        setSlideIndex(prev => Math.min(prev + 1, maxSlideIndex));
    }, [maxSlideIndex]);

    const prevSlide = useCallback(() => {
        setSlideIndex(prev => Math.max(prev - 1, 0));
    }, []);

    // Hàm xử lý click vào dish card để xem chi tiết
    const handleDishClick = useCallback((dishId: number) => {
        navigate(`/dishes/${dishId}`);
    }, [navigate]);

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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold mb-3 d-flex align-items-center">
                    <Flame size={28} className="me-2 text-danger" fill="currentColor" />
                    Món Ăn Gợi Ý Hàng Đầu
                </h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="light"
                        onClick={prevSlide}
                        disabled={slideIndex === 0}
                        className="rounded-circle shadow-sm"
                    >
                        <ChevronLeft size={24} className="text-primary" />
                    </Button>
                    <Button
                        variant="light"
                        onClick={nextSlide}
                        disabled={slideIndex >= maxSlideIndex}
                        className="rounded-circle shadow-sm"
                    >
                        <ChevronRight size={24} className="text-primary" />
                    </Button>
                </div>
            </div>

            {/* Slider Container */}
            <div className="overflow-hidden">
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
            <div className="text-center mt-3">
                <Button variant="danger" className="fw-bold px-4 py-2 shadow-lg">
                    Xem thêm các món gợi ý
                    <ChevronRight size={20} className="ms-2"/>
                </Button>
            </div>
        </Container>
    );
};

export default SuggestedDishesSection;