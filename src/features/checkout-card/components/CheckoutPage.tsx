// src/features/checkout/pages/CheckoutPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
        loadCheckoutInfo();
    }, []);

    const loadCheckoutInfo = async () => {
        try {
            setIsLoading(true);
            setError('');

            const data = await checkoutService.getCheckoutInfo();
            setCheckoutData(data);

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

            // Nếu giỏ hàng trống, redirect về trang chủ
            if (errorMsg.includes('trống')) {
                setTimeout(() => navigate('/'), 2000);
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

            // Reload checkout data
            await loadCheckoutInfo();

            // Auto select new address
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

            // Reset selected address if deleted
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
            setCheckoutData(data);
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
            setCheckoutData(data);
            toast.success('Đã xóa mã giảm giá');
        } catch (err: any) {
            console.error('Error removing coupon:', err);
            toast.error('Không thể xóa mã giảm giá');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Place order
    const handlePlaceOrder = async () => {
        // Validation
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

            const orderData = {
                addressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod,
                couponCode: checkoutData?.appliedCouponCode || undefined,
                notes: notes.trim() || undefined
            };

            const order = await orderService.createOrder(orderData);

            toast.success('Đặt hàng thành công!');

            // Redirect to order detail page
            navigate(`/orders/${order.id}`);
        } catch (err: any) {
            console.error('Error placing order:', err);
            toast.error(err.response?.data?.error || 'Không thể đặt hàng. Vui lòng thử lại.');
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
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Về trang chủ
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
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default CheckoutPage;