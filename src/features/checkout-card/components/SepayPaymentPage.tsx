import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Spinner, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, ArrowLeft, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService, SepayPaymentResponse } from '../services/paymentService';

const SepayPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const paymentData = location.state?.paymentData as SepayPaymentResponse;

    const [isPaid, setIsPaid] = useState(false);
    const [checkCount, setCheckCount] = useState(0);

    const isMountedRef = useRef(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(false);

    // Validate dữ liệu
    useEffect(() => {
        if (!paymentData) {
            toast.error("Không tìm thấy thông tin thanh toán");
            navigate('/cart');
        }
    }, [paymentData, navigate]);

    // Polling logic
    useEffect(() => {
        if (!paymentData || isPollingRef.current) {
            return;
        }

        isPollingRef.current = true;

        const checkPaymentStatus = async () => {
            if (!isMountedRef.current) {
                return;
            }

            const currentCount = checkCount + 1;
            setCheckCount(currentCount);

            try {
                const response = await paymentService.checkSepayPayment({
                    txnRef: paymentData.txnRef,
                    amount: paymentData.amount
                });

                if (response.paid === true) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }

                    setIsPaid(true);
                    toast.success("Thanh toán thành công!");

                    setTimeout(() => {
                        if (isMountedRef.current) {
                            navigate('/orders', {
                                state: { orderId: response.orderId || paymentData.txnRef }
                            });
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking payment:', error);
            }
        };

        checkPaymentStatus();

        intervalRef.current = setInterval(() => {
            checkPaymentStatus();
        }, 2000);

        timeoutRef.current = setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (!isPaid) {
                toast.error('Hết thời gian chờ. Vui lòng kiểm tra lại đơn hàng.');
            }
        }, 60000);

        return () => {
            isMountedRef.current = false;
            isPollingRef.current = false;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [paymentData]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã sao chép ${label}`);
    };

    if (!paymentData) {
        return (
            <div className="p-5 text-center">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 py-4">
            <Container style={{ maxWidth: '800px' }}>
                <Button
                    variant="link"
                    className="text-decoration-none mb-3 p-0 text-muted"
                    onClick={() => navigate('/checkout')}
                >
                    <ArrowLeft size={18} className="me-1" /> Quay lại
                </Button>

                <div className="text-center mb-4">
                    <h3 className="fw-bold text-primary">Thanh toán qua SePay</h3>
                    <p className="text-muted">
                        Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới
                    </p>
                </div>

                <Row>
                    <Col md={5} className="mb-4">
                        <Card className="border-0 shadow-sm text-center h-100">
                            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                {isPaid ? (
                                    <div className="py-5">
                                        <CheckCircle
                                            size={80}
                                            className="text-success mb-3"
                                        />
                                        <h5 className="text-success fw-bold">
                                            Thanh toán thành công!
                                        </h5>
                                        <p className="text-muted small">
                                            Đang chuyển hướng...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="qr-container p-2 border rounded mb-3 bg-white">
                                            <img
                                                src={paymentData.qrCodeUrl}
                                                alt="QR Code"
                                                className="img-fluid"
                                                style={{ maxWidth: '250px' }}
                                            />
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-primary">
                                            <Spinner animation="border" size="sm" />
                                            <small className="fw-bold">
                                                Đang chờ thanh toán...
                                            </small>
                                        </div>
                                        <small className="text-muted mt-2 d-block">
                                            Hệ thống tự động cập nhật sau vài giây
                                        </small>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={7}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">
                                    Thông tin chuyển khoản
                                </h5>

                                <div className="mb-3">
                                    <label className="text-muted small">Ngân hàng</label>
                                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                        <span className="fw-bold">
                                            {paymentData.bankName}
                                        </span>
                                        <Badge bg="primary">QR 24/7</Badge>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="text-muted small">Số tài khoản</label>
                                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                        <span className="fw-bold fs-5 text-dark">
                                            {paymentData.accountNumber}
                                        </span>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => copyToClipboard(
                                                paymentData.accountNumber,
                                                "Số tài khoản"
                                            )}
                                        >
                                            <Copy size={16} className="text-primary"/>
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="text-muted small">Chủ tài khoản</label>
                                    <div className="p-2 bg-light rounded fw-bold text-uppercase">
                                        {paymentData.accountName}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="text-muted small">Số tiền</label>
                                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                        <span className="fw-bold fs-5 text-danger">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(paymentData.amount)}
                                        </span>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => copyToClipboard(
                                                paymentData.amount.toString(),
                                                "Số tiền"
                                            )}
                                        >
                                            <Copy size={16} className="text-primary"/>
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="text-muted small">
                                        Nội dung chuyển khoản{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                        <span className="fw-bold text-dark">
                                            {paymentData.content}
                                        </span>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => copyToClipboard(
                                                paymentData.content,
                                                "Nội dung"
                                            )}
                                        >
                                            <Copy size={16} className="text-dark"/>
                                        </Button>
                                    </div>
                                    <small className="text-danger mt-1 d-block">
                                        * Vui lòng nhập chính xác nội dung này để được tự động xác nhận.
                                    </small>
                                </div>

                                {!isPaid && (
                                    <Alert variant="info" className="mb-0 small">
                                        <QrCode size={16} className="me-2" />
                                        Mẹo: Bạn có thể dùng tính năng "Quét QR" trong app ngân hàng
                                        để không phải nhập tay.
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SepayPaymentPage;