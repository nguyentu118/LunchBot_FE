// src/features/orders/pages/OrderDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Store, Calendar, CreditCard, FileText, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

import Navigation from '../../../components/layout/Navigation';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderTimeline from '../components/OrderTimeline';

import { orderService } from '../services/orderService';
import { Order, OrderStatus, PAYMENT_METHOD_CONFIG, PAYMENT_STATUS_CONFIG } from '../types/order.types';

import { formatCurrency } from '../utils/formatUtils';
import { formatDateTime } from '../utils/dateUtils';

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (orderId) {
            loadOrderDetail();
        }
    }, [orderId]);

    const loadOrderDetail = async () => {
        try {
            setIsLoading(true);
            setError('');
            const id = parseInt(orderId || '0', 10);

            if (isNaN(id) || id <= 0) {
                throw new Error('ID đơn hàng không hợp lệ');
            }

            const data = await orderService.getOrderById(id);
            setOrder(data);
        } catch (err: any) {
            console.error('Error fetching order:', err);
            const msg = err.response?.data?.message || err.message || 'Không thể tải chi tiết đơn hàng';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy đơn');
            return;
        }

        try {
            setIsCancelling(true);
            const updatedOrder = await orderService.cancelOrder(order.id, cancelReason);
            setOrder(updatedOrder);
            setShowCancelModal(false);
            setCancelReason('');
            toast.success('Hủy đơn hàng thành công');
        } catch (err: any) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.error || 'Không thể hủy đơn hàng');
        } finally {
            setIsCancelling(false);
        }
    };

    const canCancelOrder =
        order?.status === OrderStatus.PENDING ||
        order?.status === OrderStatus.CONFIRMED;

    // Loading
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error || !order) {
        return (
            <>
                <Navigation />
                <Container className="py-5">
                    <Alert variant="danger" className="text-center">
                        <Alert.Heading>Lỗi!</Alert.Heading>
                        <p>{error || 'Không tìm thấy thông tin đơn hàng'}</p>
                        <Button variant="outline-danger" onClick={() => navigate('/orders')}>
                            Quay lại danh sách
                        </Button>
                    </Alert>
                </Container>
            </>
        );
    }

    const paymentMethodLabel =
        PAYMENT_METHOD_CONFIG[order.paymentMethod]?.label || order.paymentMethod;
    const paymentStatusInfo =
        PAYMENT_STATUS_CONFIG[order.paymentStatus] ||
        { label: order.paymentStatus, variant: 'secondary' };

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navigation />

            <Container className="py-4">
                {/* Back button */}
                <Button
                    variant="link"
                    className="text-decoration-none text-dark p-0 mb-4 d-flex align-items-center"
                    onClick={() => navigate('/orders')}
                >
                    <ArrowLeft size={20} className="me-2" /> Quay lại danh sách
                </Button>

                <Row>
                    {/* Left Column */}
                    <Col lg={8}>
                        {/* Order Header & Timeline */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h4 className="fw-bold mb-1">Đơn hàng #{order.orderNumber}</h4>
                                        <div className="text-muted small d-flex align-items-center">
                                            <Calendar size={14} className="me-2" />
                                            {formatDateTime(order.orderDate)}
                                        </div>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                <OrderTimeline
                                    status={order.status}
                                    orderDate={order.orderDate}
                                    expectedDeliveryTime={order.expectedDeliveryTime}
                                    completedAt={order.completedAt}
                                    cancelledAt={order.cancelledAt}
                                />
                            </Card.Body>
                        </Card>

                        {/* Cancellation reason */}
                        {order.status === OrderStatus.CANCELLED && order.cancellationReason && (
                            <Alert variant="danger" className="mb-4">
                                <strong>Lý do hủy:</strong> {order.cancellationReason}
                            </Alert>
                        )}

                        {/* Order Items */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white py-3 fw-bold">
                                Chi tiết món ăn ({order.totalItems || order.items.length})
                            </Card.Header>
                            <Card.Body className="p-0">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item) => (
                                        <div key={item.id} className="d-flex align-items-center p-3 border-bottom">
                                            <img
                                                src={item.dishImage || '/placeholder-dish.jpg'}
                                                alt={item.dishName}
                                                className="rounded me-3"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-0 fw-bold">{item.dishName}</h6>
                                                <small className="text-muted">
                                                    {formatCurrency(item.unitPrice)} x {item.quantity}
                                                </small>
                                            </div>
                                            <div className="text-end fw-bold text-danger">
                                                {formatCurrency(item.totalPrice)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-3 text-center text-muted">Không có sản phẩm</p>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Merchant Info */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                    <Store size={18} className="me-2 text-danger" /> Thông tin cửa hàng
                                </h6>
                                <div className="mb-2">
                                    <div className="fw-semibold">{order.merchantName}</div>
                                </div>
                                <div className="mb-2 text-muted small d-flex align-items-start">
                                    <MapPin size={14} className="me-2 mt-1" />
                                    <span>{order.merchantAddress}</span>
                                </div>
                                <div className="text-muted small d-flex align-items-center">
                                    <Phone size={14} className="me-2" />
                                    <span>{order.merchantPhone}</span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Notes */}
                        {order.notes && (
                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    <h6 className="fw-bold mb-2 d-flex align-items-center">
                                        <FileText size={18} className="me-2" /> Ghi chú
                                    </h6>
                                    <p className="text-muted mb-0">{order.notes}</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>

                    {/* Right Column */}
                    <Col lg={4}>
                        {/* Shipping Address */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                                    <MapPin size={18} className="me-2" /> Địa chỉ giao hàng
                                </h6>
                                <p className="mb-1 fw-bold">{order.shippingAddress?.contactName}</p>
                                <p className="text-muted small mb-2">{order.shippingAddress?.fullAddress}</p>
                                <p className="text-muted small mb-0">
                                    <Phone size={14} className="me-1" /> {order.shippingAddress?.phone}
                                </p>
                            </Card.Body>
                        </Card>

                        {/* Payment Summary */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                                    <CreditCard size={18} className="me-2" /> Thanh toán
                                </h6>

                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-muted">Phương thức:</span>
                                    <span className="fw-bold">{paymentMethodLabel}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-3 small">
                                    <span className="text-muted">Trạng thái:</span>
                                    <Badge bg={paymentStatusInfo.variant}>
                                        {paymentStatusInfo.label}
                                    </Badge>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between mb-2 small">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(order.itemsTotal)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2 text-muted small">
                                    <span>Phí giao hàng:</span>
                                    <span>{formatCurrency(order.shippingFee)}</span>
                                </div>

                                {order.serviceFee > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-muted small">
                                        <span>Phí dịch vụ:</span>
                                        <span>{formatCurrency(order.serviceFee)}</span>
                                    </div>
                                )}

                                {order.discountAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-success small">
                                        <span className="d-flex align-items-center">
                                            <Tag size={14} className="me-1" /> Giảm giá
                                            {order.couponCode && (
                                                <Badge bg="success" className="ms-2 small">
                                                    {order.couponCode}
                                                </Badge>
                                            )}
                                        </span>
                                        <span>-{formatCurrency(order.discountAmount)}</span>
                                    </div>
                                )}

                                {order.shippingPartnerName && (
                                    <div className="d-flex justify-content-between mb-2 text-muted small">
                                        <span>Đơn vị vận chuyển:</span>
                                        <span className="fw-semibold">{order.shippingPartnerName}</span>
                                    </div>
                                )}

                                <hr />

                                <div className="d-flex justify-content-between fw-bold fs-5 text-danger">
                                    <span>Tổng cộng:</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Cancel Button */}
                        {canCancelOrder && (
                            <Button
                                variant="outline-danger"
                                className="w-100 py-2 fw-bold"
                                onClick={() => setShowCancelModal(true)}
                            >
                                Hủy đơn hàng
                            </Button>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Cancel Order Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-danger">Xác nhận hủy đơn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-3">Bạn chắc chắn muốn hủy đơn hàng này? Vui lòng cho biết lý do:</p>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="VD: Đặt nhầm món, thay đổi kế hoạch..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        disabled={isCancelling}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowCancelModal(false)}
                        disabled={isCancelling}
                    >
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