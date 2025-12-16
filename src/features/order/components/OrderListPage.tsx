// src/features/orders/pages/OrdersListPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import Navigation from '../../../components/layout/Navigation';
import OrderStatusBadge from '../components/OrderStatusBadge';

// Services
import { orderService } from '../services/orderService';

// Types
import { Order } from '../types/order.types';

// Utils
import { formatCurrency } from '../utils/formatUtils';
import { formatDateTime } from '../utils/dateUtils';

const OrdersListPage: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Load orders
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            setError('');
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err: any) {
            console.error('Error loading orders:', err);
            const errorMsg = err.response?.data?.error || 'Không thể tải danh sách đơn hàng';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100">
            <Navigation />

            <Container className="py-4">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="fw-bold d-flex align-items-center">
                        <ShoppingBag size={32} className="text-danger me-3" />
                        Đơn hàng của tôi
                    </h2>
                </div>

                {/* Error */}
                {error && (
                    <Alert variant="danger">
                        {error}
                    </Alert>
                )}

                {/* Empty state */}
                {!isLoading && !error && orders.length === 0 && (
                    <Card className="shadow-sm border-0 text-center py-5">
                        <Card.Body>
                            <ShoppingBag size={64} className="text-muted mb-3" />
                            <h5 className="mb-2">Chưa có đơn hàng nào</h5>
                            <p className="text-muted mb-4">
                                Hãy đặt món ngay để thưởng thức những món ăn ngon!
                            </p>
                            <Button variant="primary" onClick={() => navigate('/')}>
                                Khám phá món ăn
                            </Button>
                        </Card.Body>
                    </Card>
                )}

                {/* Orders list */}
                {orders.length > 0 && (
                    <div className="row g-3">
                        {orders.map((order) => (
                            <div key={order.id} className="col-12">
                                <Card
                                    className="shadow-sm border-0 cursor-pointer hover-shadow"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <Card.Body>
                                        {/* Header */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <strong>{order.orderNumber}</strong>
                                                    <OrderStatusBadge status={order.status} size="sm" />
                                                </div>
                                                <small className="text-muted">
                                                    {formatDateTime(order.orderDate)}
                                                </small>
                                            </div>
                                            <ChevronRight size={20} className="text-muted" />
                                        </div>

                                        {/* Merchant */}
                                        <div className="mb-3">
                                            <div className="fw-semibold text-dark mb-1">
                                                {order.merchantName}
                                            </div>
                                            <small className="text-muted">
                                                {order.totalItems} món • {formatCurrency(order.totalAmount)}
                                            </small>
                                        </div>

                                        {/* Items preview */}
                                        <div className="d-flex gap-2 mb-3">
                                            {order.items.slice(0, 3).map((item) => (
                                                <img
                                                    key={item.id}
                                                    src={item.dishImage || '/placeholder-dish.jpg'}
                                                    alt={item.dishName}
                                                    className="rounded"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ))}
                                            {order.items.length > 3 && (
                                                <div
                                                    className="rounded bg-light d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px'
                                                    }}
                                                >
                                                    <small className="text-muted">
                                                        +{order.items.length - 3}
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                            <span className="text-muted">Tổng thanh toán</span>
                                            <strong className="text-danger">
                                                {formatCurrency(order.totalAmount)}
                                            </strong>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default OrdersListPage;