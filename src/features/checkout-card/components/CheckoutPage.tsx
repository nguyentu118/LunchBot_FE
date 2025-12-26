// src/features/checkout/pages/CheckoutPage.tsx
// Cập nhật để tích hợp VNPay khi chọn thanh toán bằng thẻ

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import AddressSelector from '../components/AddressSelector';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import CouponInput from '../components/CouponInput';
import OrderSummary from '../components/OrderSummary';
import Navigation from '../../../components/layout/Navigation';

// Services
import { checkoutService } from '../services/checkoutService';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { shippingService } from '../services/shippingService';
import { paymentService } from '../services/paymentService'; // ✅ Import payment service

// Types
import { CheckoutResponse, PaymentMethod } from '../types/checkout.types';
import { Address, AddressFormData } from '../types/address.types';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedDishIds = searchParams.get('items')?.split(',').map(Number) || [];

    // State
    const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const [notes, setNotes] = useState('');

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

    // Fetch checkout info
    useEffect(() => {
        if (selectedDishIds.length === 0) {
            toast.error('Vui lòng chọn món để thanh toán');
            navigate('/cart');
            return;
        }

        loadCheckoutInfo();
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

            console.log('✅ Phí giao hàng:', fee, 'VND');
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
        const confirmDelete = () => new Promise((resolve, reject) => {
            toast((t) => (
                <div className="d-flex flex-column gap-2">
                    <div className="fw-bold text-danger">Xóa địa chỉ?</div>
                    <div className="text-muted small">
                        Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác.
                    </div>
                    <div className="d-flex gap-2 mt-2">
                        <button
                            className="btn btn-danger btn-sm flex-grow-1"
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                        >
                            Xóa
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm flex-grow-1"
                            onClick={() => {
                                toast.dismiss(t.id);
                                reject(new Error('User cancelled'));
                            }}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ), {
                duration: Infinity,
                position: 'top-center',
            });
        });

        try {
            await confirmDelete();
            await addressService.deleteAddress(addressId);
            toast.success('Xóa địa chỉ thành công');
            await loadCheckoutInfo();

            if (selectedAddressId === addressId) {
                setSelectedAddressId(null);
                setShippingFee(0);

                if (checkoutData) {
                    setCheckoutData(prev => prev ? {
                        ...prev,
                        shippingFee: 0,
                        totalAmount: prev.itemsTotal + prev.serviceFee - prev.discountAmount
                    } : null);
                }
            }
        } catch (err: any) {
            if (err.message === 'User cancelled') return;
            console.error('Error deleting address:', err);
            toast.error(err.response?.data?.error || 'Không thể xóa địa chỉ');
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

    // ✅ Xử lý thanh toán VNPay
    // CheckoutPage.tsx
    const handleVNPayPayment = async () => {
        try {
            if (!checkoutData) return;
            setIsProcessing(true);

            const orderData = {
                dishIds: selectedDishIds,
                addressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod,
                couponCode: checkoutData?.appliedCouponCode || undefined,
                notes: notes.trim() || undefined,
                shippingFee: shippingFee,
                totalAmount: checkoutData.totalAmount,
                userEmail: user?.email // ✅ THÊM email
            };

            // ✅ LƯU VÀO LOCALSTORAGE TRƯỚC KHI REDIRECT
            localStorage.setItem('pendingOrderData', JSON.stringify(orderData));

            const orderDescription = JSON.stringify({
                items: selectedDishIds,
                addressId: selectedAddressId,
                amount: checkoutData.totalAmount,
                merchantName: checkoutData.merchantName,
                userEmail: user?.email // ✅ THÊM email để IPN có thể tạo order
            });

            const vnpayUrl = await paymentService.createVNPayPayment(
                checkoutData.totalAmount,
                orderDescription
            );

            window.location.href = vnpayUrl;

        } catch (err: any) {
            toast.error(err.message || 'Không thể tạo thanh toán VNPay');
            setIsProcessing(false);
        }
    };

    // ✅ Xử lý đặt hàng COD
    const handleCODOrder = async () => {
        try {
            setIsProcessing(true);

            const orderData = {
                dishIds: selectedDishIds,
                addressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod,
                couponCode: checkoutData?.appliedCouponCode || undefined,
                notes: notes.trim() || undefined,
                shippingFee: shippingFee
            };

            console.log('🎁 Order payload:', orderData);

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

    // ✅ Handler chính cho nút đặt hàng
    const handlePlaceOrder = async () => {
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

        const confirmOrder = () => new Promise((resolve, reject) => {
            toast((t) => (
                <div className="d-flex flex-column gap-2">
                    <div className="fw-bold">Xác nhận đặt hàng?</div>
                    <div className="text-muted small">
                        {selectedPaymentMethod === PaymentMethod.CARD
                            ? 'Bạn sẽ được chuyển đến trang thanh toán VNPay'
                            : 'Đơn hàng sẽ được gửi đến địa chỉ ngay sau khi xác nhận'
                        }
                    </div>
                    <div className="d-flex gap-2 mt-2">
                        <button
                            className="btn btn-danger btn-sm flex-grow-1"
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                        >
                            Xác nhận
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm flex-grow-1"
                            onClick={() => {
                                toast.dismiss(t.id);
                                reject(new Error('Đã hủy'));
                            }}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ), {
                duration: Infinity,
                position: 'top-center',
            });
        });

        try {
            await confirmOrder();

            // ✅ Kiểm tra phương thức thanh toán
            if (selectedPaymentMethod === PaymentMethod.CARD) {
                await handleVNPayPayment();
            } else {
                await handleCODOrder();
            }

        } catch (err: any) {
            if (err.message === 'Đã hủy') return;
            // Error đã được xử lý trong các hàm con
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
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
            <Navigation />

            <Container className="py-4">
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

                    <h2 className="fw-bold d-flex align-items-center">
                        <ShoppingCart size={32} className="text-danger me-3" />
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
                                    <Spinner animation="border" size="sm" className="me-2" />
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

                            {/* ✅ Thông báo khi chọn VNPay */}
                            {selectedPaymentMethod === PaymentMethod.CARD && (
                                <Alert variant="info" className="mb-3">
                                    <CreditCard size={20} className="me-2" />
                                    <strong>Thanh toán VNPay:</strong> Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay
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
                            <div className="sticky-top" style={{ top: '20px', zIndex: 10 }}>
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
                                    disabled={isProcessing || !selectedAddressId || isCalculatingShippingFee}
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
                                                ? 'Đang chuyển đến VNPay...'
                                                : 'Đang xử lý...'
                                            }
                                        </>
                                    ) : (
                                        <>
                                            {selectedPaymentMethod === PaymentMethod.CARD ? (
                                                <>
                                                    <CreditCard size={20} className="me-2" />
                                                    Thanh toán VNPay
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart size={20} className="me-2" />
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