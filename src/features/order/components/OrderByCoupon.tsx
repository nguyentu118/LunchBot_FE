import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Spinner, Badge, Button, Table, Row, Col, Form } from 'react-bootstrap';
import { Search, ChevronLeft, ChevronRight, Package, MapPin, Ticket, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { orderService } from '../services/orderService';

// Types
import {
    OrderResponse,
    CouponStatisticsResponse,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS
} from '../types/order.types';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ✅ FIX 1: Cập nhật interface Coupon để khớp với API response
interface Coupon {
    id: number;
    code: string;  // ✅ THAY ĐỔI: từ couponCode -> code
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';  // ✅ THÊM MỚI
    discountValue: number;  // ✅ THAY ĐỔI: thay discountPercentage/discountAmount
    minOrderValue?: number;
    usageLimit?: number;
    usedCount?: number;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
    createdAt?: string;
}

const OrderByCoupons: React.FC = () => {
    // State - Coupons
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

    // Pagination - Coupons
    const [couponCurrentPage, setCouponCurrentPage] = useState(0);
    const couponsPerPage = 8;

    // State - Orders & Statistics
    const [couponStats, setCouponStats] = useState<CouponStatisticsResponse | null>(null);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // UI State
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    const brandColor = '#ff5e62';

    // ==================== LOAD COUPON STATISTICS ====================
    const loadCouponStatistics = useCallback(async (couponId: number) => {
        if (!couponId) {
            console.warn('No coupon ID provided');
            return;
        }

        setIsLoadingOrders(true);
        setError(null);
        setExpandedOrderId(null);

        try {
            console.log('Loading statistics for coupon:', couponId);
            const response = await orderService.getCouponStatistics(couponId);
            console.log('Coupon statistics loaded:', response);

            setCouponStats(response);
            setOrders(response.orders || []);

            if (!response.orders || response.orders.length === 0) {
                console.warn('No orders for this coupon');
                setError('Mã giảm giá này chưa được sử dụng trong đơn hàng nào');
            }
        } catch (err: any) {
            console.error('Error loading coupon statistics:', err);
            const errorMsg = err.response?.data?.message || 'Không thể tải thống kê mã giảm giá';
            setError(errorMsg);
            toast.error(errorMsg);
            setCouponStats(null);
            setOrders([]);
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    // ==================== LOAD COUPONS ====================
    const loadCoupons = useCallback(async () => {
        setIsLoadingCoupons(true);
        setError(null);

        try {
            console.log('Loading coupons...');
            const response = await orderService.getMerchantCoupons();
            console.log('Raw coupons response:', response);

            // Ensure response is an array
            const couponsArray = Array.isArray(response) ? response : [];
            console.log('Coupons array:', couponsArray);
            console.log('Coupons length:', couponsArray.length);

            if (couponsArray.length === 0) {
                console.warn('No coupons found');
                setCoupons([]);
                setSelectedCouponId(null);
                setSelectedCoupon(null);
                setError('Chưa có mã giảm giá nào');
                setIsLoadingCoupons(false);
                return;
            }

            setCoupons(couponsArray);

            // Auto-select first coupon
            const firstCoupon = couponsArray[0];
            console.log('First coupon:', firstCoupon);
            setSelectedCouponId(firstCoupon.id);
            setSelectedCoupon(firstCoupon);

            // Load statistics for first coupon
            await loadCouponStatistics(firstCoupon.id);

        } catch (err: any) {
            console.error('Error loading coupons:', err);
            console.error('Error response:', err.response?.data);
            toast.error('Không thể tải danh sách mã giảm giá');
            setCoupons([]);
            setSelectedCouponId(null);
            setSelectedCoupon(null);
            setError('Lỗi khi tải mã giảm giá');
        } finally {
            setIsLoadingCoupons(false);
        }
    }, [loadCouponStatistics]);

    // Load coupons on mount ONLY
    useEffect(() => {
        console.log('Component mounted, loading coupons...');
        loadCoupons();
    }, []); // Empty dependency - load only once

    // ==================== HANDLERS ====================
    const handleCouponSelect = async (coupon: Coupon) => {
        console.log('Selecting coupon:', coupon);
        setSelectedCouponId(coupon.id);
        setSelectedCoupon(coupon);
        await loadCouponStatistics(coupon.id);
    };

    const toggleOrderExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // ✅ FIX 2: Cập nhật filter để dùng field 'code'
    // ==================== COUPON PAGINATION ====================
    const filteredCoupons = coupons.filter(coupon =>
        coupon.code?.toLowerCase().includes(searchKeyword.toLowerCase())  // ✅ THAY ĐỔI: couponCode -> code
    );

    const totalCouponPages = Math.ceil(filteredCoupons.length / couponsPerPage);
    const displayedCoupons = filteredCoupons.slice(
        couponCurrentPage * couponsPerPage,
        (couponCurrentPage + 1) * couponsPerPage
    );

    const handleNextCouponPage = () => {
        if (couponCurrentPage < totalCouponPages - 1) {
            setCouponCurrentPage(couponCurrentPage + 1);
        }
    };

    const handlePrevCouponPage = () => {
        if (couponCurrentPage > 0) {
            setCouponCurrentPage(couponCurrentPage - 1);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="bg-white rounded-3 shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>
            <div className="p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">Thống kê đơn hàng theo mã giảm giá</h5>
                        <small className="text-muted">Chọn một mã giảm giá để xem danh sách đơn hàng sử dụng mã này</small>
                    </div>
                </div>

                <Row className="g-3">
                    {/* ==================== LEFT SIDE: COUPONS LIST ==================== */}
                    <Col lg={4}>
                        <div className="bg-light rounded p-3" style={{ minHeight: '600px', maxHeight: '600px', overflowY: 'auto' }}>
                            <h6 className="fw-bold mb-3">
                                Danh sách mã giảm giá ({filteredCoupons.length})
                            </h6>

                            {/* Search Input */}
                            <Form.Group className="mb-3">
                                <Form.Control
                                    placeholder="Tìm theo mã..."
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value);
                                        setCouponCurrentPage(0);
                                    }}
                                    size="sm"
                                />
                            </Form.Group>

                            {/* Coupons Loading */}
                            {isLoadingCoupons ? (
                                <div className="text-center py-5">
                                    <Spinner size="sm" animation="border" style={{ color: brandColor }} />
                                    <p className="text-muted small mt-2">Đang tải mã giảm giá...</p>
                                </div>
                            ) : filteredCoupons.length > 0 ? (
                                <>
                                    {/* Coupons List */}
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        {displayedCoupons.map((coupon) => (
                                            <div
                                                key={coupon.id}
                                                className="p-3 rounded"
                                                style={{
                                                    backgroundColor: selectedCouponId === coupon.id ? brandColor : '#fff',
                                                    color: selectedCouponId === coupon.id ? 'white' : 'black',
                                                    cursor: 'pointer',
                                                    border: `1px solid ${selectedCouponId === coupon.id ? brandColor : '#dee2e6'}`,
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => handleCouponSelect(coupon)}
                                            >
                                                {/* ✅ FIX 3: Hiển thị coupon.code thay vì coupon.couponCode */}
                                                <div className="fw-semibold d-flex align-items-center gap-2 mb-1">
                                                    <Ticket size={16} />
                                                    {coupon.code}  {/* ✅ THAY ĐỔI: couponCode -> code */}
                                                </div>

                                                {/* ✅ FIX 4: Hiển thị discount dựa trên discountType và discountValue */}
                                                <small className="d-block mt-2">
                                                    {coupon.discountType === 'PERCENTAGE'
                                                        ? `Giảm ${coupon.discountValue}%`  // ✅ THAY ĐỔI
                                                        : `Giảm ${coupon.discountValue?.toLocaleString()} ₫`}  {/* ✅ THAY ĐỔI */}
                                                </small>

                                                {/* Thêm thông tin minOrderValue nếu có */}
                                                {coupon.minOrderValue && (
                                                    <small className="d-block text-muted" style={{ opacity: 0.7 }}>
                                                        Đơn tối thiểu: {coupon.minOrderValue.toLocaleString()} ₫
                                                    </small>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Coupon Pagination */}
                                    {totalCouponPages > 1 && (
                                        <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                            <small className="text-muted">
                                                Trang {couponCurrentPage + 1} / {totalCouponPages}
                                            </small>
                                            <div className="btn-group btn-group-sm">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handlePrevCouponPage}
                                                    disabled={couponCurrentPage === 0}
                                                >
                                                    <ChevronLeft size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handleNextCouponPage}
                                                    disabled={couponCurrentPage >= totalCouponPages - 1}
                                                >
                                                    <ChevronRight size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Alert variant="info" className="mb-0">
                                    {searchKeyword ? 'Không tìm thấy mã giảm giá nào' : 'Chưa có mã giảm giá nào'}
                                </Alert>
                            )}
                        </div>
                    </Col>

                    {/* ==================== RIGHT SIDE: ORDERS & STATISTICS ==================== */}
                    <Col lg={8}>
                        <div>
                            {/* ✅ FIX 5: Hiển thị selectedCoupon.code thay vì couponCode */}
                            <h6 className="fw-bold mb-3">
                                Thống kê: {selectedCoupon?.code || 'mã giảm giá'}  {/* ✅ THAY ĐỔI */}
                                {couponStats && (
                                    <Badge bg="secondary" className="ms-2">
                                        {couponStats.totalOrders} đơn
                                    </Badge>
                                )}
                            </h6>

                            {/* Statistics Cards */}
                            {couponStats && (
                                <Row className="mb-3 g-3">
                                    <Col md={6}>
                                        <Card className="shadow-sm border-0">
                                            <Card.Body className="text-center">
                                                <div className="text-muted small mb-1">Tổng doanh thu</div>
                                                <div className="fw-bold" style={{ fontSize: '1.5rem', color: brandColor }}>
                                                    {couponStats.totalRevenue?.toLocaleString() || '0'} ₫
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="shadow-sm border-0">
                                            <Card.Body className="text-center">
                                                <div className="text-muted small mb-1">Tổng giảm giá</div>
                                                <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#FF9800' }}>
                                                    {couponStats.totalDiscountGiven?.toLocaleString() || '0'} ₫
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            )}

                            {/* Error Alert */}
                            {error && !isLoadingOrders && (
                                <Alert variant="info" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            {/* Loading State */}
                            {isLoadingOrders ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" style={{ color: brandColor }} />
                                    <p className="text-muted mt-2 small">Đang tải đơn hàng...</p>
                                </div>
                            ) : orders.length > 0 ? (
                                <>
                                    {/* Orders List */}
                                    <div>
                                        {orders.map((order) => {
                                            const isExpanded = expandedOrderId === order.id;
                                            const fullAddress = order.shippingAddress?.fullAddress || 'Chưa có địa chỉ';

                                            return (
                                                <Card
                                                    key={order.id}
                                                    className="mb-3 border rounded shadow-sm"
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {/* HEADER - Order Summary */}
                                                    <Card.Body
                                                        className="p-3"
                                                        onClick={() => toggleOrderExpand(order.id)}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center w-100">
                                                            <div className="flex-grow-1">
                                                                <span className="fw-bold">#{order.orderNumber || order.id}</span>
                                                                <span className="text-muted ms-2 small">
                                                                    {formatDate(order.orderDate)}
                                                                </span>
                                                                <div className="small text-muted mt-1">
                                                                    <Package size={14} className="me-1" />
                                                                    {order.items?.length || 0} mục
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <span className="text-success fw-bold" style={{ fontSize: '1rem' }}>
                                                                    {order.totalAmount?.toLocaleString() || '0'} ₫
                                                                </span>
                                                                <Badge
                                                                    style={{
                                                                        backgroundColor: ORDER_STATUS_COLORS[order.status] || '#6c757d'
                                                                    }}
                                                                >
                                                                    {ORDER_STATUS_LABELS[order.status] || order.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Card.Body>

                                                    {/* EXPANDED DETAILS */}
                                                    {isExpanded && (
                                                        <Card.Body className="border-top p-3 bg-light">
                                                            <Row>
                                                                {/* LEFT: Items */}
                                                                <Col md={8}>
                                                                    <h6 className="text-muted mb-3">
                                                                        <Package size={18} className="me-2" />
                                                                        Chi tiết món ăn:
                                                                    </h6>
                                                                    <Table hover size="sm" className="mb-0">
                                                                        <tbody>
                                                                        {order.items?.map((item, idx) => (
                                                                            <tr key={idx}>
                                                                                <td width="50">
                                                                                    <img
                                                                                        src={item.dishImage || 'https://via.placeholder.com/40'}
                                                                                        alt={item.dishName}
                                                                                        style={{
                                                                                            width: '40px',
                                                                                            height: '40px',
                                                                                            objectFit: 'cover',
                                                                                            borderRadius: '4px'
                                                                                        }}
                                                                                    />
                                                                                </td>
                                                                                <td className="align-middle">{item.dishName || 'N/A'}</td>
                                                                                <td className="align-middle text-center">x{item.quantity || 0}</td>
                                                                                <td className="align-middle text-end fw-semibold">
                                                                                    {item.totalPrice?.toLocaleString() || '0'} ₫
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                        </tbody>
                                                                    </Table>
                                                                </Col>

                                                                {/* RIGHT: Shipping Info */}
                                                                <Col md={4} className="border-start">
                                                                    <h6 className="text-muted mb-3">
                                                                        <MapPin size={18} className="me-2" />
                                                                        Thông tin giao hàng:
                                                                    </h6>
                                                                    <div className="mb-3">
                                                                        <div className="d-flex align-items-start mb-2">
                                                                            <MapPin size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                                                                            <div>
                                                                                <small className="text-muted d-block">Địa chỉ giao hàng</small>
                                                                                <span className="text-dark small">{fullAddress}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex align-items-center p-2 rounded mt-3"
                                                                             style={{backgroundColor: '#f8f9fa'}}>
                                                                            <strong className="me-2">Thanh toán:</strong>
                                                                            {order.paymentStatus === 'PAID' ? (
                                                                                <span className="text-success fw-semibold">
                                                                                    <CheckCircle size={16} className="me-1" />
                                                                                    Đã thanh toán
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-warning fw-semibold">
                                                                                    ⏳ Chưa thanh toán ({order.paymentMethod || 'COD'})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                !error && (
                                    <div className="text-center py-5">
                                        <Search size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
                                        <p className="text-muted">
                                            {selectedCouponId
                                                ? 'Chọn một mã giảm giá để xem đơn hàng'
                                                : 'Vui lòng chọn một mã giảm giá'}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default OrderByCoupons;