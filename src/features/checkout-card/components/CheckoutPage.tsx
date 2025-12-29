// src/features/checkout/pages/CheckoutPage.tsx
// Cập nhật để tích hợp VNPay khi chọn thanh toán bằng thẻ

import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Col, Container, Form, Row, Spinner} from 'react-bootstrap';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ArrowLeft, CreditCard, ShoppingCart, Trash2} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import AddressSelector from '../components/AddressSelector';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import CouponInput from '../components/CouponInput';
import OrderSummary from '../components/OrderSummary';
import Navigation from '../../../components/layout/Navigation';

// Services
import {checkoutService} from '../services/checkoutService';
import {addressService} from '../services/addressService';
import {orderService} from '../services/orderService';
import {shippingService} from '../services/shippingService';
import {paymentService} from '../services/paymentService';
import axiosInstance from '../../../config/axiosConfig';

// Types
import {CheckoutResponse, PaymentMethod} from '../types/checkout.types';
import {Address, AddressFormData} from '../types/address.types';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedDishIds = searchParams.get('items')?.split(',').map(Number) || [];

    // State
    const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const [notes, setNotes] = useState('');
    const [userEmail, setUserEmail] = useState<string>('');

    // Shipping fee state
    const [shippingFee, setShippingFee] = useState<number>(0);
    const [isCalculatingShippingFee, setIsCalculatingShippingFee] = useState(false);
    const [shippingFeeError, setShippingFeeError] = useState<string>('');

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Error state
    const [error, setError] = useState('');

    // ✅ Thêm state để chặn multiple popups
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [isDeletingAddressId, setIsDeletingAddressId] = useState<number | null>(null);
    const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);

    // ✅ Thêm ref để chặn hoàn toàn multiple clicks
    const isOrderingRef = useRef(false);

    // Fetch user email và checkout info
    useEffect(() => {
        if (selectedDishIds.length === 0) {
            toast.error('Vui lòng chọn món để thanh toán');
            navigate('/cart');
            return;
        }

        const initialize = async () => {
            try {
                // Lấy user email từ backend
                const response = await axiosInstance.get('/users/my');
                setUserEmail(response.data.email);

                // Sau đó load checkout info
                await loadCheckoutInfo();
            } catch (err: any) {
                console.error('Error initializing checkout:', err);
                if (err.response?.status === 401) {
                    toast.error('Vui lòng đăng nhập để thanh toán');
                    navigate('/login');
                } else {
                    toast.error('Không thể tải thông tin người dùng');
                }
            }
        };

        initialize();
    }, []);

    const loadCheckoutInfo = async () => {
        try {
            setIsLoading(true);
            setError('');

            const data = await checkoutService.getCheckoutInfo();

            const filteredItems = data.items.filter(item =>
                selectedDishIds.includes(item.dishId)
            );

            if (filteredItems.length === 0) {
                toast.error('Không tìm thấy món đã chọn trong giỏ hàng');
                navigate('/cart');
                return;
            }

            const itemsTotal = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
            const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = itemsTotal + data.serviceFee + data.shippingFee - data.discountAmount;

            setCheckoutData({
                ...data,
                items: filteredItems,
                totalItems: totalItems,
                itemsTotal: itemsTotal,
                totalAmount: totalAmount
            });

            // Auto select default address
            if (data.defaultAddressId) {
                setSelectedAddressId(data.defaultAddressId);
                await calculateShippingFeeForAddress(data.defaultAddressId);
            } else if (data.addresses.length > 0) {
                setSelectedAddressId(data.addresses[0].id);
                await calculateShippingFeeForAddress(data.addresses[0].id);
            }
        } catch (err: any) {
            console.error('Error loading checkout:', err);
            const errorMsg = err.response?.data?.error || 'Không thể tải thông tin thanh toán';
            setError(errorMsg);
            toast.error(errorMsg);

            if (errorMsg.includes('trống') || errorMsg.includes('nhiều cửa hàng')) {
                setTimeout(() => navigate('/cart'), 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const calculateShippingFeeForAddress = async (addressId: number) => {
        try {
            setIsCalculatingShippingFee(true);
            setShippingFeeError('');

            const fee = await shippingService.calculateShippingFee(addressId);
            setShippingFee(fee);

            if (checkoutData) {
                const newTotalAmount =
                    checkoutData.itemsTotal +
                    checkoutData.serviceFee +
                    fee -
                    checkoutData.discountAmount;

                setCheckoutData(prev => prev ? {
                    ...prev,
                    shippingFee: fee,
                    totalAmount: newTotalAmount
                } : null);
            }

        } catch (err: any) {
            console.error('Error calculating shipping fee:', err);
            setShippingFeeError(err.message || 'Không thể tính phí giao hàng');
            toast.error('⚠️ Không thể tính phí giao hàng. Sử dụng phí mặc định.');

            const defaultFee = 25000;
            setShippingFee(defaultFee);

            if (checkoutData) {
                const newTotalAmount =
                    checkoutData.itemsTotal +
                    checkoutData.serviceFee +
                    defaultFee -
                    checkoutData.discountAmount;

                setCheckoutData(prev => prev ? {
                    ...prev,
                    shippingFee: defaultFee,
                    totalAmount: newTotalAmount
                } : null);
            }
        } finally {
            setIsCalculatingShippingFee(false);
        }
    };

    // Address handlers
    const handleSelectAddress = async (address: Address) => {
        setSelectedAddressId(address.id);
        await calculateShippingFeeForAddress(address.id);
    };

    const handleAddAddress = async (data: AddressFormData) => {
        try {
            const newAddress = await addressService.createAddress(data);
            toast.success('Thêm địa chỉ thành công');
            await loadCheckoutInfo();
            setSelectedAddressId(newAddress.id);
            await calculateShippingFeeForAddress(newAddress.id);
        } catch (err: any) {
            console.error('Error adding address:', err);
            toast.error(err.response?.data?.error || 'Không thể thêm địa chỉ');
            throw err;
        }
    };

    const handleEditAddress = async (addressId: number, data: AddressFormData) => {
        try {
            await addressService.updateAddress(addressId, data);
            toast.success('Cập nhật địa chỉ thành công');
            await loadCheckoutInfo();
            if (selectedAddressId === addressId) {
                await calculateShippingFeeForAddress(addressId);
            }
        } catch (err: any) {
            console.error('Error updating address:', err);
            toast.error(err.response?.data?.error || 'Không thể cập nhật địa chỉ');
            throw err;
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        // 1. Chặn ngay lập tức nếu đang có action khác diễn ra
        if (isDeletePopupOpen || isDeletingAddressId !== null) return;

        setIsDeletePopupOpen(true);

        toast((t) =>
            (<div className="d-flex align-items-start gap-3">
                <div
                    className="rounded-circle bg-danger bg-opacity-10 p-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                    style={{
                        width: '40px',
                        height: '40px'
                    }}>
                    <Trash2 size={20} className="text-danger"/>
                </div>
                <div className="flex-grow-1">
                    <h6 className="fw-bold text-dark mb-2">
                        Xóa địa chỉ này?
                    </h6>
                    <p className="text-muted small mb-3">Hành động này không thể hoàn tác.</p>
                    <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-danger btn-sm px-3"
                                style={{backgroundColor: '#ff5e62', border: 'none'}}
                                onClick={async () => {
                                    toast.dismiss(t.id);
                                    await executeDelete(addressId);
                                }}> Xác nhận xóa
                        </button>
                        <button className="btn btn-light btn-sm px-3"
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    setIsDeletePopupOpen(false);
                                }}> Hủy
                        </button>
                    </div>
                </div>
            </div>),
            {
            duration: Infinity,
            position: 'top-center',
            style: {
                background: '#fff',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                minWidth: '320px',
            },
            onClose: () => setIsDeletePopupOpen(false)
        });
    };

// Hàm phụ trợ để tách logic xử lý API
    const executeDelete = async (addressId: number) => {
        try {
            setIsDeletingAddressId(addressId);
            await addressService.deleteAddress(addressId);
            toast.success('Đã xóa địa chỉ', {position: 'top-center'});
            await loadCheckoutInfo();

            if (selectedAddressId === addressId) {
                setSelectedAddressId(null);
                setShippingFee(0);
            }
        } catch (err: any) {
            toast.error('Lỗi khi xóa địa chỉ');
        } finally {
            setIsDeletingAddressId(null);
            setIsDeletePopupOpen(false);
        }
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            await addressService.setDefaultAddress(addressId);
            toast.success('Đã đặt làm địa chỉ mặc định');
            await loadCheckoutInfo();
        } catch (err: any) {
            console.error('Error setting default address:', err);
            toast.error(err.response?.data?.error || 'Không thể đặt địa chỉ mặc định');
            throw err;
        }
    };

    // Coupon handlers
    const handleApplyCoupon = async (code: string) => {
        try {
            setIsApplyingCoupon(true);
            const data = await checkoutService.applyCoupon(code);

            const filteredItems = data.items.filter(item =>
                selectedDishIds.includes(item.dishId)
            );

            if (filteredItems.length === 0) {
                toast.error('Không tìm thấy món đã chọn');
                navigate('/cart');
                return;
            }

            const itemsTotal = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
            const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = itemsTotal + data.serviceFee + shippingFee - data.discountAmount;

            setCheckoutData({
                ...data,
                items: filteredItems,
                totalItems: totalItems,
                itemsTotal: itemsTotal,
                totalAmount: totalAmount,
                shippingFee: shippingFee
            });

            toast.success(`Áp dụng mã "${code}" thành công!`);
        } catch (err: any) {
            console.error('Error applying coupon:', err);
            throw err;
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            setIsApplyingCoupon(true);
            const data = await checkoutService.removeCoupon();

            const filteredItems = data.items.filter(item =>
                selectedDishIds.includes(item.dishId)
            );

            if (filteredItems.length === 0) {
                toast.error('Không tìm thấy món đã chọn');
                navigate('/cart');
                return;
            }

            const itemsTotal = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
            const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = itemsTotal + data.serviceFee + shippingFee - data.discountAmount;

            setCheckoutData({
                ...data,
                items: filteredItems,
                totalItems: totalItems,
                itemsTotal: itemsTotal,
                totalAmount: totalAmount,
                shippingFee: shippingFee
            });

            toast.success('Đã xóa mã giảm giá');
        } catch (err: any) {
            console.error('Error removing coupon:', err);
            toast.error('Không thể xóa mã giảm giá');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Xử lý thanh toán VNPay
    const handleSepayPayment = async () => {
        try {
            if (!checkoutData) {
                return;
            }

            if (!selectedAddressId) {
                toast.error('Vui lòng chọn địa chỉ giao hàng');
                return;
            }

            if (!userEmail) {
                toast.error('Không tìm thấy thông tin người dùng');
                navigate('/login');
                return;
            }

            setIsProcessing(true);

            // Tạo payment request
            const paymentRequest = {
                items: selectedDishIds,
                addressId: selectedAddressId,
                amount: checkoutData.totalAmount,
                merchantName: checkoutData.merchantName,
                userEmail: userEmail,
                couponCode: checkoutData.appliedCouponCode,
                notes: notes.trim() || undefined,
                shippingFee: shippingFee
            };

            // Gọi API tạo payment
            const paymentResponse = await paymentService.createSepayPayment(paymentRequest);

            toast.success('Đã tạo thanh toán!');

            // Navigate đến trang hiển thị QR
            navigate('/payment/sepay', {
                state: {paymentData: paymentResponse}
            });

        } catch (err: any) {
            console.error('SePay payment error:', err);
            toast.error(err.message || 'Không thể tạo thanh toán');
            setIsProcessing(false);
            isOrderingRef.current = false;
        }
    };

    // Xử lý đặt hàng COD
    const handleCODOrder = async () => {
        try {
            if (!selectedAddressId) {
                toast.error('Vui lòng chọn địa chỉ giao hàng');
                return;
            }

            setIsProcessing(true);

            const orderData = {
                dishIds: selectedDishIds,
                addressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod,
                couponCode: checkoutData?.appliedCouponCode || undefined,
                notes: notes.trim() || undefined,
                shippingFee: shippingFee
            };

            const order = await orderService.createOrder(orderData);

            toast.success('Đặt hàng thành công!');

            window.dispatchEvent(new Event('cartUpdated'));

            navigate(`/orders/${order.id}`);

        } catch (err: any) {
            console.error('Error placing order:', err);
            const errorMsg = err.response?.data?.error || 'Không thể đặt hàng. Vui lòng thử lại.';
            toast.error(errorMsg);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    // ✅ ĐÃ FIX: handlePlaceOrder - Ngăn multiple order confirmations
    const handlePlaceOrder = async () => {
        // NGĂN MULTIPLE CLICKS
        if (isOrderingRef.current || isOrderConfirmOpen) {
            return;
        }

        if (!selectedAddressId) {
            toast.error('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!selectedPaymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        if (notes.length > 500) {
            toast.error('Ghi chú không được vượt quá 500 ký tự');
            return;
        }

        setIsOrderConfirmOpen(true); // ĐÁNH DẤU POPUP CONFIRM ĐANG MỞ
        isOrderingRef.current = true;

        const confirmOrder = () => new Promise<boolean>((resolve) => {
            const toastId = toast.custom((t) => (
                <div
                    className="bg-white rounded-3 p-4 border"
                    style={{
                        width: '380px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        opacity: t.visible ? 1 : 0,
                        transform: t.visible ? 'translateY(0)' : 'translateY(-10px)',
                        transition: 'all 0.15s ease-out',
                    }}
                >
                    <div className="d-flex gap-3">
                        {/* Icon */}
                        <div
                            className="flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#fff1f1',
                                borderRadius: '14px',
                                color: '#ff5e62'
                            }}
                        >
                            <ShoppingCart size={22}/>
                        </div>

                        {/* Nội dung */}
                        <div className="flex-grow-1">
                            <div className="fw-bold text-dark" style={{fontSize: '1rem', marginBottom: '4px'}}>
                                Xác nhận đặt hàng?
                            </div>
                            <div className="text-muted"
                                 style={{fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '14px'}}>
                                {selectedPaymentMethod === PaymentMethod.CARD
                                    ? 'Bạn sẽ được chuyển đến trang thanh toán SePay.'
                                    : 'Đơn hàng sẽ được gửi đến địa chỉ ngay sau khi xác nhận.'}
                            </div>

                            {/* Buttons */}
                            <div className="d-flex gap-2 justify-content-end">
                                <button
                                    className="btn btn-sm px-3 border-0 text-white"
                                    style={{
                                        backgroundColor: '#ff5e62',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        padding: '6px 12px',
                                        transition: 'all 0.1s ease'
                                    }}
                                    onClick={() => {
                                        toast.dismiss(toastId);
                                        setTimeout(() => resolve(true), 50);
                                    }}
                                    disabled={isProcessing}
                                >
                                    Xác nhận
                                </button>
                                <button
                                    className="btn btn-sm px-3 border-0"
                                    style={{
                                        backgroundColor: '#f1f3f5',
                                        color: '#495057',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        padding: '6px 12px',
                                        transition: 'all 0.1s ease'
                                    }}
                                    onClick={() => {
                                        toast.dismiss(toastId);
                                        setTimeout(() => {
                                            setIsOrderConfirmOpen(false);
                                            isOrderingRef.current = false;
                                            resolve(false);
                                        }, 50);
                                    }}
                                    disabled={isProcessing}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ), {
                duration: Infinity,
                position: 'top-center',
            });
        });

        try {
            const confirmed = await confirmOrder();

            if (!confirmed) {
                isOrderingRef.current = false;
                setIsOrderConfirmOpen(false);
                return;
            }

            setIsProcessing(true);

            if (selectedPaymentMethod === PaymentMethod.CARD) {
                await handleSepayPayment();
            } else {
                await handleCODOrder();
            }

        } catch (err: any) {
            if (err.message === 'Đã hủy') {
                return;
            }
            isOrderingRef.current = false;
            setIsOrderConfirmOpen(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Spinner animation="border" variant="primary"/>
                    <p className="mt-3">Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !checkoutData) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <Container>
                    <Alert variant="danger" className="text-center">
                        <h5>Có lỗi xảy ra</h5>
                        <p>{error}</p>
                        <Button variant="primary" onClick={() => navigate('/cart')}>
                            Quay lại giỏ hàng
                        </Button>
                    </Alert>
                </Container>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100">
            <Navigation/>

            <Container className="py-4">
                {/* Header */}
                <div className="mb-4">
                    <Button
                        variant="link"
                        className="text-decoration-none p-0 mb-3"
                        onClick={() => navigate('/cart')}
                    >
                        <ArrowLeft size={20} className="me-2"/>
                        Quay lại giỏ hàng
                    </Button>

                    <h2 className="fw-bold d-flex align-items-center">
                        <ShoppingCart size={32} className="text-danger me-3"/>
                        Thanh toán đơn hàng
                    </h2>
                </div>

                {checkoutData && (
                    <Row>
                        {/* Left Column */}
                        <Col lg={8}>
                            {/* Address Selector */}
                            <AddressSelector
                                addresses={checkoutData.addresses}
                                selectedAddressId={selectedAddressId}
                                onSelectAddress={handleSelectAddress}
                                onAddAddress={handleAddAddress}
                                onEditAddress={handleEditAddress}
                                onDeleteAddress={handleDeleteAddress}
                                onSetDefaultAddress={handleSetDefaultAddress}
                            />

                            {/* Shipping Fee Status */}
                            {isCalculatingShippingFee && (
                                <Alert variant="info" className="mb-3">
                                    <Spinner animation="border" size="sm" className="me-2"/>
                                    Đang tính phí giao hàng...
                                </Alert>
                            )}

                            {shippingFeeError && (
                                <Alert variant="warning" className="mb-3">
                                    ⚠️ {shippingFeeError}
                                </Alert>
                            )}

                            {/* Payment Method */}
                            <PaymentMethodSelector
                                selectedMethod={selectedPaymentMethod}
                                onSelectMethod={setSelectedPaymentMethod}
                            />

                            {/* Thông báo khi chọn VNPay */}
                            {selectedPaymentMethod === PaymentMethod.CARD && (
                                <Alert variant="info" className="mb-3">
                                    <CreditCard size={20} className="me-2"/>
                                    <strong>Thanh toán SePay:</strong> Bạn sẽ quét mã QR để thanh toán qua ứng dụng ngân
                                    hàng
                                </Alert>
                            )}

                            {/* Coupon */}
                            <CouponInput
                                appliedCouponCode={checkoutData.appliedCouponCode}
                                availableCoupons={checkoutData.availableCoupons}
                                onApplyCoupon={handleApplyCoupon}
                                onRemoveCoupon={handleRemoveCoupon}
                                isLoading={isApplyingCoupon}
                                discountAmount={checkoutData.discountAmount}
                            />

                            {/* Notes */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-body">
                                    <h6 className="mb-3">Ghi chú cho cửa hàng (không bắt buộc)</h6>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="VD: Giao hàng trước 12h, không gõ chuông..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        maxLength={500}
                                        isInvalid={notes.length > 500}
                                    />
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <small className={`${notes.length > 500 ? 'text-danger' : 'text-muted'}`}>
                                            {notes.length}/500 ký tự
                                        </small>
                                        {notes.length > 500 && (
                                            <small className="text-danger">
                                                Vượt quá giới hạn {notes.length - 500} ký tự
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Right Column - Order Summary */}
                        <Col lg={4}>
                            <div className="sticky-top" style={{top: '20px', zIndex: 10}}>
                                <OrderSummary
                                    merchantName={checkoutData.merchantName}
                                    merchantAddress={checkoutData.merchantAddress}
                                    items={checkoutData.items}
                                    totalItems={checkoutData.totalItems}
                                    itemsTotal={checkoutData.itemsTotal}
                                    discountAmount={checkoutData.discountAmount}
                                    serviceFee={checkoutData.serviceFee}
                                    shippingFee={shippingFee}
                                    totalAmount={checkoutData.totalAmount}
                                    appliedCouponCode={checkoutData.appliedCouponCode}
                                />

                                {/* Place Order Button */}
                                <Button
                                    variant="danger"
                                    size="lg"
                                    className="w-100 mt-3 fw-bold"
                                    onClick={handlePlaceOrder}
                                    disabled={
                                        isProcessing ||
                                        !selectedAddressId ||
                                        isCalculatingShippingFee ||
                                        isOrderingRef.current ||
                                        isOrderConfirmOpen
                                    }
                                >
                                    {isProcessing ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            {selectedPaymentMethod === PaymentMethod.CARD
                                                ? 'Đang tạo thanh toán...'
                                                : 'Đang xử lý...'
                                            }
                                        </>
                                    ) : (
                                        <>
                                            {selectedPaymentMethod === PaymentMethod.CARD ? (
                                                <>
                                                    <CreditCard size={20} className="me-2"/>
                                                    Thanh toán Online
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart size={20} className="me-2"/>
                                                    Đặt hàng
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default CheckoutPage;