// src/features/payment/pages/VNPayCallbackPage.tsx
// Xử lý callback từ VNPay sau khi thanh toán

import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { orderService } from '../../order/services/orderService';

const VNPayCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'error'>('processing');
    const [orderId, setOrderId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        handleVNPayCallback();
    }, []);

    // VNPayCallbackPage.tsx
    const handleVNPayCallback = async () => {
        try {
            const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
            const vnp_TxnRef = searchParams.get('vnp_TxnRef');

            if (vnp_ResponseCode === '00') {
                // ✅ Lấy orderData từ localStorage
                const pendingOrderDataStr = localStorage.getItem('pendingOrderData');

                if (!pendingOrderDataStr) {
                    // IPN đã xử lý xong rồi, chỉ cần hiển thị success
                    setStatus('success');
                    toast.success('Thanh toán thành công!');

                    // ✅ Query order từ vnp_TxnRef
                    const order = await orderService.getOrderByTransactionRef(vnp_TxnRef);
                    setOrderId(order.id);

                    setTimeout(() => navigate(`/orders/${order.id}`), 3000);
                    return;
                }

                // ✅ Fallback: Tạo order nếu IPN chưa xử lý
                const pendingOrderData = JSON.parse(pendingOrderDataStr);
                const order = await orderService.createOrder({
                    ...pendingOrderData,
                    vnpayTransactionRef: vnp_TxnRef,
                    paymentStatus: 'PAID'
                });

                localStorage.removeItem('pendingOrderData');
                setOrderId(order.id);
                setStatus('success');

                window.dispatchEvent(new Event('cartUpdated'));
                setTimeout(() => navigate(`/orders/${order.id}`), 3000);
            } else {
                setStatus('failed');
                // ... xử lý lỗi
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message);
        }
    };

    // Render processing state
    if (status === 'processing') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <Container>
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
                        <h3 className="mt-4 fw-bold">Đang xử lý thanh toán...</h3>
                        <p className="text-muted">Vui lòng không đóng trang này</p>
                    </div>
                </Container>
            </div>
        );
    }

    // Render success state
    if (status === 'success') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <Container>
                    <div className="text-center">
                        <div className="mb-4">
                            <CheckCircle size={80} className="text-success" />
                        </div>
                        <h2 className="fw-bold text-success mb-3">Thanh toán thành công!</h2>
                        <p className="text-muted mb-4">
                            Đơn hàng của bạn đã được tạo thành công và đang được xử lý.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate(`/orders/${orderId}`)}
                            >
                                Xem đơn hàng
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="lg"
                                onClick={() => navigate('/')}
                            >
                                Về trang chủ
                            </Button>
                        </div>
                        <p className="text-muted mt-3 small">
                            Tự động chuyển đến trang đơn hàng sau 3 giây...
                        </p>
                    </div>
                </Container>
            </div>
        );
    }

    // Render failed state
    if (status === 'failed') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <Container>
                    <div className="text-center">
                        <div className="mb-4">
                            <XCircle size={80} className="text-danger" />
                        </div>
                        <h2 className="fw-bold text-danger mb-3">Thanh toán thất bại!</h2>
                        <Alert variant="danger" className="mb-4">
                            <p className="mb-0">{errorMessage}</p>
                        </Alert>
                        <p className="text-muted mb-4">
                            Đơn hàng của bạn chưa được tạo. Vui lòng thử lại.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <Button
                                variant="danger"
                                size="lg"
                                onClick={() => navigate('/checkout')}
                            >
                                Thử lại
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="lg"
                                onClick={() => navigate('/cart')}
                            >
                                Về giỏ hàng
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // Render error state
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Container>
                <div className="text-center">
                    <div className="mb-4">
                        <AlertTriangle size={80} className="text-warning" />
                    </div>
                    <h2 className="fw-bold text-warning mb-3">Có lỗi xảy ra!</h2>
                    <Alert variant="warning" className="mb-4">
                        <p className="mb-0">{errorMessage}</p>
                    </Alert>
                    <p className="text-muted mb-4">
                        Vui lòng liên hệ với bộ phận hỗ trợ nếu vấn đề vẫn tiếp tục.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/cart')}
                        >
                            Về giỏ hàng
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            Về trang chủ
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default VNPayCallbackPage;