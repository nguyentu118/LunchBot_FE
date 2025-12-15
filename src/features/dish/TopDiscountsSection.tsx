import React, { useState, useEffect } from 'react';
import {Container, Row, Col, Alert, Spinner, Button} from 'react-bootstrap';
import { getTopDiscountedDishes } from './services/DishService';
import { DishDiscount } from './types/DishDiscount';
import DiscountDishCard from './DiscountDishCard';
import {ChevronRight, Zap} from "lucide-react";

const TopDiscountsSection: React.FC = () => {
    const [dishes, setDishes] = useState<DishDiscount[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const data = await getTopDiscountedDishes();
                setDishes(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải món ăn giảm giá:", err);
                setError("Không thể tải danh sách món ăn ưu đãi từ hệ thống.");
                setIsLoading(false);
            }
        };

        fetchDiscounts();
    }, []);

    // 1. Hiển thị Loading
    if (isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </Container>
        );
    }

    // 2. Hiển thị Lỗi
    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    // 3. Hiển thị khi không có dữ liệu
    if (dishes.length === 0) {
        return (
            <Container className="my-5">
                <Alert variant="info">Hiện tại không có món ăn nào đang được giảm giá.</Alert>
            </Container>
        );
    }

    // 4. Hiển thị 8 món ăn theo layout 4x2
    return (
        <Container className="py-4">
            <h2 className="fw-bold mb-3 d-flex align-items-center">
                <Zap size={28} className="me-2 text-danger" fill="currentColor" />
                Ưu Đãi Giảm Giá Lớn Nhất Hôm Nay
            </h2>

            {/* Sử dụng lưới Bootstrap: 4 cột trên màn hình trung bình trở lên (col-md-3) */}
            <Row  className="g-3 mb-3">
                {dishes.map((dish) => (
                    <Col key={dish.id} xs={12} sm={6} md={3}>
                        {/* Tái sử dụng Component Thẻ món ăn */}
                        <DiscountDishCard dish={dish} />
                    </Col>
                ))}
            </Row>

            {/* Hiển thị chỉ 8 món, nếu muốn xem thêm có thể thêm Button */}
            <div className="text-center mt-3">
                <Button variant="danger" className="fw-bold px-4 py-2 shadow-lg">
                    Xem thêm các món ưu đãi
                    <ChevronRight size={20} className="ms-2"/>
                </Button>
            </div>
        </Container>
    );
};

export default TopDiscountsSection;