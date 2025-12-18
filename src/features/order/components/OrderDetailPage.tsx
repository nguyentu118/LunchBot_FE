// src/features/orders/pages/OrderDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import {useParams, useNavigate, Navigate} from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Store, Calendar, CreditCard, FileText, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import Navigation from '../../../components/layout/Navigation';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderTimeline from '../components/OrderTimeline';

// Services
import { orderService } from '../services/orderService';

// Types
import { Order, OrderStatus, PAYMENT_METHOD_CONFIG, PAYMENT_STATUS_CONFIG } from '../types/order.types';

// Utils
import { formatCurrency } from '../utils/formatUtils';
import { formatDateTime } from '../utils/dateUtils';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    // State
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Cancel modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Load order
    useEffect(() => {
        if (orderId) {
            loadOrderDetail(parseInt(orderId));
        }
    }, [orderId]);

    const loadOrderDetail = async (id: number) => {
        try {
            setIsLoading(true);
            setError('');
            const data = await orderService.getOrderById(id);
            setOrder(data);
        } catch (err: any) {
            console.error('Error loading order:', err);
            const errorMsg = err.response?.data?.error || 'Không thể tải thông tin đơn hàng';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle cancel order
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy đơn');
            return;
        }

        if (!order) return;

        try {
            setIsCancelling(true);
            const updatedOrder = await orderService.cancelOrder(order.id, cancelReason);
            setOrder(updatedOrder);
            setShowCancelModal(false);
            setCancelReason('');
            toast.success('Đã hủy đơn hàng thành công');
        } catch (err: any) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.error || 'Không thể hủy đơn hàng');
        } finally {
            setIsCancelling(false);
        }
    };

    // Check if order can be cancelled
    const canCancelOrder = order?.status === OrderStatus.PENDING ||
        order?.status === OrderStatus.CONFIRMED;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !order) {
        return <Navigate to="/order-notfound" replace />;
    }

    return (
        <div className="bg-light min-vh-100">
            <Navigation />

            <Container className="py-4">
                {/* Header */}
                <div className="mb-4">
                    <Button
                        variant="link"
                        className="text-decoration-none p-0 mb-3"
                        onClick={() => navigate('/orders')}
                    >
                        <ArrowLeft size={20} className="me-2" />
                        Quay lại danh sách đơn hàng
                    </Button>

                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="fw-bold mb-2">Chi tiết đơn hàng</h2>
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted">Mã đơn: <strong>{order.orderNumber}</strong></span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                        </div>

                        {/* Cancel button */}
                        {canCancelOrder && (
                            <Button
                                variant="outline-danger"
                                onClick={() => setShowCancelModal(true)}
                            >
                                Hủy đơn hàng
                            </Button>
                        )}
                    </div>
                </div>

                <Row>
                    {/* Left Column */}
                    <Col lg={8}>
                        {/* Timeline */}
                        <OrderTimeline
                            status={order.status}
                            orderDate={order.orderDate}
                            expectedDeliveryTime={order.expectedDeliveryTime}
                            completedAt={order.completedAt}
                            cancelledAt={order.cancelledAt}
                        />

                        {/* Cancellation reason */}
                        {order.status === OrderStatus.CANCELLED && order.cancellationReason && (
                            <Alert variant="danger" className="mb-4">
                                <strong>Lý do hủy:</strong> {order.cancellationReason}
                            </Alert>
                        )}

                        {/* Order Items */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="mb-3">Sản phẩm đã đặt ({order.totalItems} món)</h6>
                                <div className="divide-y">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="d-flex py-3">
                                            {/* Image */}
                                            <img
                                                src={item.dishImage || '/placeholder-dish.jpg'}
                                                alt={item.dishName}
                                                className="rounded me-3"
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover'
                                                }}
                                            />

                                            {/* Info */}
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{item.dishName}</h6>
                                                <p className="text-muted mb-1">
                                                    {formatCurrency(item.unitPrice)} x {item.quantity}
                                                </p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-end">
                                                <div className="fw-semibold text-danger">
                                                    {formatCurrency(item.totalPrice)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Merchant Info */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="mb-3">Thông tin cửa hàng</h6>
                                <div className="d-flex align-items-start mb-3">
                                    <Store size={20} className="text-danger me-2 mt-1" />
                                    <div>
                                        <div className="fw-semibold">{order.merchantName}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start mb-3">
                                    <MapPin size={20} className="text-muted me-2 mt-1" />
                                    <div className="text-muted">{order.merchantAddress}</div>
                                </div>
                                <div className="d-flex align-items-start">
                                    <Phone size={20} className="text-muted me-2 mt-1" />
                                    <div className="text-muted">{order.merchantPhone}</div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Shipping Address */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="mb-3">Địa chỉ giao hàng</h6>
                                <div className="mb-2">
                                    <strong>{order.shippingAddress.contactName}</strong>
                                    <Badge bg="secondary" className="ms-2">
                                        {order.shippingAddress.phone}
                                    </Badge>
                                </div>
                                <p className="text-muted mb-0">
                                    {order.shippingAddress.fullAddress}
                                </p>
                            </Card.Body>
                        </Card>

                        {/* Notes */}
                        {order.notes && (
                            <Card className="shadow-sm border-0 mb-4">
                                <Card.Body>
                                    <h6 className="mb-2 d-flex align-items-center">
                                        <FileText size={20} className="me-2" />
                                        Ghi chú
                                    </h6>
                                    <p className="text-muted mb-0">{order.notes}</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>

                    {/* Right Column */}
                    <Col lg={4}>
                        {/* Order Info */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="mb-3">Thông tin đơn hàng</h6>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted d-flex align-items-center">
                                        <Calendar size={16} className="me-2" />
                                        Ngày đặt
                                    </span>
                                    <span>{formatDateTime(order.orderDate)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted d-flex align-items-center">
                                        <CreditCard size={16} className="me-2" />
                                        Thanh toán
                                    </span>
                                    <span>
                                        {PAYMENT_METHOD_CONFIG[order.paymentMethod].icon}{' '}
                                        {PAYMENT_METHOD_CONFIG[order.paymentMethod].label}
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Trạng thái thanh toán</span>
                                    <Badge bg={PAYMENT_STATUS_CONFIG[order.paymentStatus].variant}>
                                        {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Price Summary */}
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                <h6 className="mb-3">Chi tiết thanh toán</h6>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Tạm tính</span>
                                    <span>{formatCurrency(order.itemsTotal)}</span>
                                </div>

                                {order.discountAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span className="d-flex align-items-center">
                                            <Tag size={16} className="me-2" />
                                            Giảm giá
                                            {order.couponCode && (
                                                <Badge bg="success" className="ms-2">
                                                    {order.couponCode}
                                                </Badge>
                                            )}
                                        </span>
                                        <span>-{formatCurrency(order.discountAmount)}</span>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Phí dịch vụ</span>
                                    <span>{formatCurrency(order.serviceFee)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Phí giao hàng</span>
                                    <span>{formatCurrency(order.shippingFee)}</span>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between align-items-center">
                                    <strong>Tổng cộng</strong>
                                    <h5 className="text-danger fw-bold mb-0">
                                        {formatCurrency(order.totalAmount)}
                                    </h5>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Cancel Order Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Hủy đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3">
                        Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:
                    </p>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="VD: Đặt nhầm món, thay đổi kế hoạch..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleCancelOrder}
                        disabled={isCancelling || !cancelReason.trim()}
                    >
                        {isCancelling ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Đang xử lý...
                            </>
                        ) : (
                            'Xác nhận hủy'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrderDetailPage;