import React, { useState, useCallback } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import {ChevronLeft, ChevronRight, Flame} from 'lucide-react';
import useSuggestedDishes from './hooks/useSuggestedDishes';
import { SuggestedDish } from './types/suggestedDish';
import SuggestedDishCard from './SuggestedDishCard';

const SuggestedDishesSection: React.FC = () => {
    // ✅ Sử dụng hook có sẵn thay vì useState + useEffect
    const { data: dishes, isLoading, error } = useSuggestedDishes();

    // State cho slider
    const [slideIndex, setSlideIndex] = useState<number>(0);

    // Hàm điều hướng slider
    const nextSlide = useCallback(() => {
        setSlideIndex(prev => Math.min(prev + 1, Math.max(0, dishes.length - 4)));
    }, [dishes.length]);

    const prevSlide = useCallback(() => {
        setSlideIndex(prev => Math.max(prev - 1, 0));
    }, []);

    // 1. Hiển thị Loading
    if (isLoading) {
        return (
            <Container className="py-5">
                <h2 className="fw-bold mb-3 d-flex align-items-center">
                    <Flame size={28} className="me-2 text-danger" fill="currentColor" />
                    Món Ăn Gợi Ý Hàng Đầu
                </h2>
                <Alert variant="info">Đang tải 8 món ăn gợi ý...</Alert>
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
                        disabled={slideIndex >= dishes.length - 4}
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
                            style={{ width: 'calc(25% - 9px)' }}
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