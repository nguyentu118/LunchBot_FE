// src/features/payment/pages/SepayPaymentPage.tsx
// Trang thanh toán SePay - Hiển thị QR Code và tự động check payment

import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService, SepayPaymentResponse } from '../services/paymentService';

const SepayPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy payment data từ state (được truyền từ CheckoutPage)
    const paymentData = location.state?.paymentData as SepayPaymentResponse;

    const [checking, setChecking] = useState(false);
    const [paid, setPaid] = useState(false);
    const [countdown, setCountdown] = useState(900); // 15 phút = 900 giây
    const [autoPayCountdown, setAutoPayCountdown] = useState(10); // Countdown 10s
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [checkCount, setCheckCount] = useState(0);

    // Nếu không có payment data, redirect về cart
    useEffect(() => {
        if (!paymentData) {
            toast.error('Không tìm thấy thông tin thanh toán');
            navigate('/cart');
        } else {
        }
    }, [paymentData, navigate]);

    // Auto check payment mỗi 3 giây
    useEffect(() => {
        if (paymentData && !paid) {
            const interval = setInterval(() => {
                checkPaymentStatus();
            }, 3000); // 3 giây

            return () => clearInterval(interval);
        }
    }, [paymentData, paid]);

    // Countdown timer (15 phút)
    useEffect(() => {
        if (paymentData && !paid && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }

        // Hết thời gian
        if (countdown === 0 && !paid) {
            toast.error('Hết thời gian thanh toán');
            navigate('/cart');
        }
    }, [countdown, paid, paymentData]);

    // Auto-pay countdown (chỉ cho MOCK mode)
    useEffect(() => {
        if (paymentData?.mode === 'MOCK' && !paid && autoPayCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoPayCountdown(autoPayCountdown - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [autoPayCountdown, paid, paymentData]);

    const checkPaymentStatus = async () => {
        if (checking || !paymentData) return;

        setChecking(true);
        const currentCheck = checkCount + 1;
        setCheckCount(currentCheck);

        console.log(`🔍 [Check #${currentCheck}] Checking payment...`, {
            txnRef: paymentData.txnRef,
            amount: paymentData.amount
        });

        try {
            const response = await paymentService.checkSepayPayment({
                txnRef: paymentData.txnRef,
                amount: paymentData.amount
            });


            if (response.paid) {
                setPaid(true);
                setOrderId(response.orderId || null);
                setOrderNumber(response.orderNumber || '');

                toast.success('✅ Thanh toán thành công!');

                // Clear cart
                window.dispatchEvent(new Event('cartUpdated'));

                // Redirect sau 2 giây
                setTimeout(() => {
                    if (response.orderId) {
                        navigate(`/orders/${response.orderId}`);
                    } else {
                        navigate('/orders');
                    }
                }, 2000);
            } else {
                console.log(`⏳ [Check #${currentCheck}] Payment pending...`);
            }
        } catch (err: any) {
            console.error(`❌ [Check #${currentCheck}] Error:`, err);
            // Không hiển thị toast error để tránh spam
        } finally {
            setChecking(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã copy ${label}!`);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!paymentData) {
        return null;
    }

    if (paid) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <Container>
                    <Card className="text-center shadow-lg border-0">
                        <Card.Body className="p-5">
                            <CheckCircle size={80} className="text-success mb-4" />
                            <h2 className="fw-bold text-success mb-3">Thanh toán thành công!</h2>
                            <p className="text-muted mb-2">
                                Đơn hàng của bạn đã được tạo thành công.
                            </p>
                            {orderNumber && (
                                <p className="text-muted mb-4">
                                    Mã đơn hàng: <strong className="text-primary">{orderNumber}</strong>
                                </p>
                            )}
                            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                            <span className="text-muted">Đang chuyển đến trang đơn hàng...</span>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <Container>
                {/* Header */}
                <div className="mb-4">
                    <Button
                        variant="link"
                        className="text-decoration-none p-0 mb-3"
                        onClick={() => navigate('/cart')}
                    >
                        <ArrowLeft size={20} className="me-2" />
                        Quay lại giỏ hàng
                    </Button>

                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="fw-bold mb-0">Thanh toán đơn hàng</h2>
                        <div className="badge bg-warning text-dark fs-6">
                            ⏰ {formatTime(countdown)}
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* QR Code Section */}
                    <div className="col-lg-6 mb-4">
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Quét mã QR để thanh toán</h5>

                                <div className="position-relative">
                                    <div className="text-center bg-light p-4 rounded">
                                        <img
                                            src={paymentData.qrCodeUrl}
                                            alt="QR Code"
                                            className="img-fluid rounded"
                                            style={{ maxWidth: '320px' }}
                                        />
                                    </div>

                                    {checking && (
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <div className="bg-white rounded-circle p-3 shadow">
                                                <Spinner animation="border" variant="primary" />
                                            </div>
                                        </div>
                                    )}
                                </div>


                                {/* Checking status */}
                                {checking && (
                                    <Alert variant="info" className="mt-3 mb-0">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                    </Alert>
                                )}

                                <div className="mt-3">
                                    <Button
                                        variant="outline-primary"
                                        className="w-100"
                                        onClick={checkPaymentStatus}
                                        disabled={checking}
                                    >
                                        <RefreshCw size={18} className="me-2" />
                                        Kiểm tra thanh toán ngay
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Payment Info Section */}
                    <div className="col-lg-6 mb-4">
                        <Card className="shadow-sm border-0 mb-3">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Thông tin chuyển khoản</h5>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Ngân hàng:</span>
                                        <strong>{paymentData.bankName}</strong>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Số tài khoản:</span>
                                        <div className="d-flex align-items-center gap-2">
                                            <strong>{paymentData.accountNumber}</strong>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0"
                                                onClick={() => copyToClipboard(paymentData.accountNumber, 'số tài khoản')}
                                            >
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Tên tài khoản:</span>
                                        <strong>{paymentData.accountName}</strong>
                                    </div>
                                </div>

                                <hr />

                                <div className="mb-3 bg-warning bg-opacity-10 p-3 rounded">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">Số tiền:</span>
                                        <div className="d-flex align-items-center gap-2">
                                            <strong className="text-danger fs-5">
                                                {paymentData.amount.toLocaleString('vi-VN')} ₫
                                            </strong>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0"
                                                onClick={() => copyToClipboard(paymentData.amount.toString(), 'số tiền')}
                                            >
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary bg-opacity-10 p-3 rounded">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">Nội dung CK:</span>
                                        <div className="d-flex align-items-center gap-2">
                                            <code className="bg-white px-2 py-1 rounded">
                                                {paymentData.content}
                                            </code>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0"
                                                onClick={() => copyToClipboard(paymentData.content, 'nội dung')}
                                            >
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3">Hướng dẫn thanh toán</h6>
                                <ol className="mb-0 ps-3">
                                    <li className="mb-2">Mở ứng dụng ngân hàng trên điện thoại</li>
                                    <li className="mb-2">Quét mã QR hoặc chuyển khoản thủ công</li>
                                    <li className="mb-2">
                                        <strong className="text-danger">Nhập CHÍNH XÁC nội dung chuyển khoản</strong>
                                    </li>
                                    <li className="mb-0">Xác nhận thanh toán</li>
                                </ol>

                                <Alert variant="warning" className="mt-3 mb-0">
                                    <small>
                                        ⚠️ <strong>Lưu ý:</strong> Vui lòng nhập <strong>ĐÚNG NỘI DUNG</strong> chuyển khoản để đơn hàng được xác nhận tự động.
                                    </small>
                                </Alert>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default SepayPaymentPage;