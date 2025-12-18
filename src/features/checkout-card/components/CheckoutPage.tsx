// src/features/checkout/pages/CheckoutPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
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

// Types
import { CheckoutResponse, PaymentMethod } from '../types/checkout.types';
import { Address, AddressFormData } from '../types/address.types';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ✅ LẤY DANH SÁCH DISH ID TỪ URL
    const selectedDishIds = searchParams.get('items')?.split(',').map(Number) || [];

    // State
    const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const [notes, setNotes] = useState('');

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Error state
    const [error, setError] = useState('');

    // Fetch checkout info
    useEffect(() => {
        // ✅ KIỂM TRA: Nếu không có dishId nào được chọn → redirect về cart
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

            // ✅ LỌC CHỈ CÁC MÓN ĐÃ CHỌN
            const filteredItems = data.items.filter(item =>
                selectedDishIds.includes(item.dishId)
            );

            // ✅ KIỂM TRA: Nếu không còn món nào (có thể đã bị xóa)
            if (filteredItems.length === 0) {
                toast.error('Không tìm thấy món đã chọn trong giỏ hàng');
                navigate('/cart');
                return;
            }

            // ✅ TÍNH LẠI TỔNG TIỀN CHO CÁC MÓN ĐÃ CHỌN
            const itemsTotal = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
            const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

            // ✅ Tính lại totalAmount (itemsTotal + phí - giảm giá)
            const totalAmount = itemsTotal + data.serviceFee + data.shippingFee - data.discountAmount;

            // ✅ CẬP NHẬT DATA VỚI CÁC MÓN ĐÃ LỌC
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
            } else if (data.addresses.length > 0) {
                setSelectedAddressId(data.addresses[0].id);
            }
        } catch (err: any) {
            console.error('Error loading checkout:', err);
            const errorMsg = err.response?.data?.error || 'Không thể tải thông tin thanh toán';
            setError(errorMsg);
            toast.error(errorMsg);

            // Nếu giỏ hàng trống hoặc có nhiều merchant, redirect về cart
            if (errorMsg.includes('trống') || errorMsg.includes('nhiều cửa hàng')) {
                setTimeout(() => navigate('/cart'), 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Address handlers
    const handleSelectAddress = (address: Address) => {
        setSelectedAddressId(address.id);
    };

    const handleAddAddress = async (data: AddressFormData) => {
        try {
            const newAddress = await addressService.createAddress(data);
            toast.success('Thêm địa chỉ thành công');
            await loadCheckoutInfo();
            setSelectedAddressId(newAddress.id);
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
        } catch (err: any) {
            console.error('Error updating address:', err);
            toast.error(err.response?.data?.error || 'Không thể cập nhật địa chỉ');
            throw err;
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
            return;
        }

        try {
            await addressService.deleteAddress(addressId);
            toast.success('Xóa địa chỉ thành công');
            await loadCheckoutInfo();

            if (selectedAddressId === addressId) {
                setSelectedAddressId(null);
            }
        } catch (err: any) {
            console.error('Error deleting address:', err);
            toast.error(err.response?.data?.error || 'Không thể xóa địa chỉ');
            throw err;
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

            // ✅ LỌC LẠI ITEMS SAU KHI ÁP COUPON
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
            const totalAmount = itemsTotal + data.serviceFee + data.shippingFee - data.discountAmount;

            setCheckoutData({
                ...data,
                items: filteredItems,
                totalItems: totalItems,
                itemsTotal: itemsTotal,
                totalAmount: totalAmount
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

            // ✅ LỌC LẠI ITEMS SAU KHI XÓA COUPON
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
            const totalAmount = itemsTotal + data.serviceFee + data.shippingFee - data.discountAmount;

            setCheckoutData({
                ...data,
                items: filteredItems,
                totalItems: totalItems,
                itemsTotal: itemsTotal,
                totalAmount: totalAmount
            });

            toast.success('Đã xóa mã giảm giá');
        } catch (err: any) {
            console.error('Error removing coupon:', err);
            toast.error('Không thể xóa mã giảm giá');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // ✅ PLACE ORDER: GỬI CHỈ CÁC DISH ID ĐÃ CHỌN
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!selectedPaymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        if (!window.confirm('Xác nhận đặt hàng?')) {
            return;
        }

        try {
            setIsProcessing(true);

            // ✅ GỬI dishIds ĐÃ CHỌN LÊN BACKEND
            const orderData = {
                dishIds: selectedDishIds, // ← QUAN TRỌNG: Chỉ gửi món đã chọn
                addressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod,
                couponCode: checkoutData?.appliedCouponCode || undefined,
                notes: notes.trim() || undefined
            };

            console.log('📦 Order payload:', orderData); // Debug

            const order = await orderService.createOrder(orderData);

            toast.success('Đặt hàng thành công!');

            // ✅ Dispatch event để cập nhật cart count
            window.dispatchEvent(new Event('cartUpdated'));

            navigate(`/orders/${order.id}`);
        } catch (err: any) {
            console.error('Error placing order:', err);
            const errorMsg = err.response?.data?.error || 'Không thể đặt hàng. Vui lòng thử lại.';
            toast.error(errorMsg);
        } finally {
            setIsProcessing(false);
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

                            {/* Payment Method */}
                            <PaymentMethodSelector
                                selectedMethod={selectedPaymentMethod}
                                onSelectMethod={setSelectedPaymentMethod}
                            />

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
                                        placeholder="VD: Giao hàng trước 12h, không gọi chuông..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
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
                                    shippingFee={checkoutData.shippingFee}
                                    totalAmount={checkoutData.totalAmount}
                                    appliedCouponCode={checkoutData.appliedCouponCode}
                                />

                                {/* Place Order Button */}
                                <Button
                                    variant="danger"
                                    size="lg"
                                    className="w-100 mt-3 fw-bold"
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing || !selectedAddressId}
                                >
                                    {isProcessing ? (
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
                                        <>
                                            <ShoppingCart size={20} className="me-2" />
                                            Đặt hàng
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