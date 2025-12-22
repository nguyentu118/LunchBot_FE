// src/features/merchants/components/OrderByDish.tsx
// ✅ OPTIMIZED: Expandable order cards with accordion style

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { orderService } from '../services/orderService';

// Types
import {
    OrderResponse,
    Dish,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS
} from '../types/order.types';

// Utils
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

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

interface OrderByDishProps {
    merchantDishes?: Dish[];
}

const OrderByDish: React.FC<OrderByDishProps> = ({ merchantDishes = [] }) => {
    // State - Dishes
    const [dishes, setDishes] = useState<Dish[]>(merchantDishes);
    const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
    const [dishesFetched, setDishesFetched] = useState(false);
    const [isLoadingDishes, setIsLoadingDishes] = useState(false);

    // Pagination - Dishes
    const [dishCurrentPage, setDishCurrentPage] = useState(0);
    const dishesPerPage = 6;

    // State - Orders
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null); // ✅ NEW

    // Pagination - Orders
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);

    // UI State
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const brandColor = '#ff5e62';

    // ==================== LOAD DISHES ====================
    const loadDishes = useCallback(async () => {
        if (dishesFetched) return;

        if (merchantDishes.length > 0) {
            setDishes(merchantDishes);
            if (merchantDishes.length > 0) {
                setSelectedDishId(merchantDishes[0].id);
            }
            setDishesFetched(true);
            return;
        }

        setIsLoadingDishes(true);
        try {
            const response = await orderService.getMerchantDishes();
            let dishesData: Dish[] = [];

            if (Array.isArray(response)) {
                dishesData = response;
            } else if (response && typeof response === 'object') {
                const possibleKeys = ['dishes', 'data', 'content', 'items', 'list'];
                for (const key of possibleKeys) {
                    if (Array.isArray(response[key])) {
                        dishesData = response[key];
                        break;
                    }
                }
            }

            setDishes(dishesData);
            if (dishesData.length > 0 && !selectedDishId) {
                setSelectedDishId(dishesData[0].id);
            }
        } catch (err) {
            console.error('❌ Error loading dishes:', err);
            toast.error('Không thể tải danh sách món ăn');
        } finally {
            setIsLoadingDishes(false);
            setDishesFetched(true);
        }
    }, [dishesFetched, merchantDishes, selectedDishId]);

    useEffect(() => {
        loadDishes();
    }, []);

    // ==================== LOAD ORDERS BY DISH ====================
    const loadOrdersByDish = useCallback(async (dishId: number, page: number = 0) => {
        if (!dishId) return;

        setIsLoadingOrders(true);
        setError(null);
        setExpandedOrderId(null); // ✅ Reset expanded order when changing page

        try {
            const response = await orderService.getOrdersByDish(dishId, page, pageSize);
            setOrders(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(page);

            if (response.content.length === 0 && page === 0) {
                setError('Chưa có đơn hàng nào chứa món ăn này');
            }
        } catch (err: any) {
            console.error('❌ Error loading orders by dish:', err);
            const errorMsg = err.response?.data?.error || 'Không thể tải danh sách đơn hàng';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoadingOrders(false);
        }
    }, [pageSize]);

    // ==================== HANDLERS ====================
    const handleDishSelect = (dishId: number) => {
        setSelectedDishId(dishId);
        setCurrentPage(0);
        loadOrdersByDish(dishId, 0);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1 && selectedDishId) {
            loadOrdersByDish(selectedDishId, currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0 && selectedDishId) {
            loadOrdersByDish(selectedDishId, currentPage - 1);
        }
    };

    // ✅ NEW: Toggle expand/collapse
    const toggleOrderExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // ==================== DISHES PAGINATION ====================
    const totalDishPages = Math.ceil(dishes.length / dishesPerPage);
    const displayedDishes = dishes.slice(
        dishCurrentPage * dishesPerPage,
        (dishCurrentPage + 1) * dishesPerPage
    );

    const handleNextDishPage = () => {
        if (dishCurrentPage < totalDishPages - 1) {
            setDishCurrentPage(dishCurrentPage + 1);
        }
    };

    const handlePrevDishPage = () => {
        if (dishCurrentPage > 0) {
            setDishCurrentPage(dishCurrentPage - 1);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="bg-white rounded-3 shadow-sm overflow-hidden" style={{ minHeight: '500px' }}>
            <div className="p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">Thống kê đơn hàng theo món ăn</h5>
                        <small className="text-muted">Chọn một món ăn để xem danh sách đơn hàng chứa món này</small>
                    </div>
                </div>

                {/* ==================== DISH SELECTOR WITH PAGINATION ==================== */}
                <div className="mb-4">
                    <label className="form-label fw-semibold small text-muted mb-2">Chọn món ăn</label>
                    {isLoadingDishes ? (
                        <div className="text-center py-3">
                            <Spinner size="sm" animation="border" style={{ color: brandColor }} />
                        </div>
                    ) : dishes.length > 0 ? (
                        <div>
                            {/* Dishes Grid - 6 per row */}
                            <div className="row g-2 mb-3">
                                {displayedDishes.map((dish) => (
                                    <div key={dish.id} className="col-md-6 col-lg-4 col-xl-2">
                                        <button
                                            className="btn w-100 text-start p-2"
                                            style={{
                                                backgroundColor: selectedDishId === dish.id ? brandColor : '#f8f9fa',
                                                color: selectedDishId === dish.id ? 'white' : 'black',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '0.5rem',
                                                transition: 'all 0.2s',
                                                fontSize: '0.85rem'
                                            }}
                                            onClick={() => handleDishSelect(dish.id)}
                                        >
                                            <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                                                {dish.name}
                                            </div>
                                            <small style={{ opacity: 0.8 }}>
                                                {formatCurrency(dish.price)}
                                            </small>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Dishes Pagination */}
                            {totalDishPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <small className="text-muted">
                                        Trang {dishCurrentPage + 1} / {totalDishPages} ({dishes.length} món)
                                    </small>
                                    <div className="btn-group btn-group-sm">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handlePrevDishPage}
                                            disabled={dishCurrentPage === 0}
                                        >
                                            <ChevronLeft size={14} />
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleNextDishPage}
                                            disabled={dishCurrentPage >= totalDishPages - 1}
                                        >
                                            <ChevronRight size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Alert variant="warning" className="mb-0">
                            Chưa có món ăn nào
                        </Alert>
                    )}
                </div>

                {/* Divider */}
                <hr className="my-4" />

                {/* ==================== ORDERS SECTION - EXPANDABLE ==================== */}
                <div>
                    <h6 className="fw-bold mb-3">
                        Danh sách đơn hàng
                        {totalElements > 0 && (
                            <Badge bg="secondary" className="ms-2">
                                {totalElements} đơn
                            </Badge>
                        )}
                    </h6>

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
                            {/* Orders List - EXPANDABLE */}
                            <div className="row g-2">
                                {orders.map((order) => {
                                    const isExpanded = expandedOrderId === order.id;

                                    return (
                                        <div key={order.id} className="col-12">
                                            {/* HEADER - Always Visible */}
                                            <Card
                                                className="border-0 shadow-sm"
                                                style={{
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer',
                                                    backgroundColor: isExpanded ? '#f8f9fa' : 'white'
                                                }}
                                            >
                                                <Card.Body
                                                    className="p-3"
                                                    onClick={() => toggleOrderExpand(order.id)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        {/* LEFT: Order info */}
                                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                                <strong style={{ fontSize: '0.9rem' }}>
                                                                    {order.orderNumber}
                                                                </strong>
                                                                <Badge
                                                                    style={{
                                                                        backgroundColor: ORDER_STATUS_COLORS[order.status] || '#6c757d',
                                                                        padding: '0.25rem 0.5rem',
                                                                        fontSize: '0.7rem'
                                                                    }}
                                                                >
                                                                    {ORDER_STATUS_LABELS[order.status] || order.status}
                                                                </Badge>
                                                            </div>
                                                            <small className="text-muted d-block">
                                                                {formatDate(order.orderDate)}
                                                            </small>
                                                        </div>

                                                        {/* MIDDLE: Order items count */}
                                                        <div className="text-center px-3" style={{ minWidth: '80px' }}>
                                                            <small className="text-muted d-block">Mục</small>
                                                            <strong style={{ fontSize: '0.9rem' }}>
                                                                {order.items.length}
                                                            </strong>
                                                        </div>

                                                        {/* RIGHT: Total amount + Toggle icon */}
                                                        <div className="text-end d-flex align-items-center gap-2" style={{ minWidth: '150px' }}>
                                                            <div>
                                                                <small className="text-muted d-block">Tổng tiền</small>
                                                                <div className="fw-bold" style={{ color: brandColor, fontSize: '1rem' }}>
                                                                    {formatCurrency(order.totalAmount)}
                                                                </div>
                                                            </div>
                                                            {/* ✅ Chevron Icon - Rotate when expanded */}
                                                            <ChevronDown
                                                                size={20}
                                                                style={{
                                                                    transition: 'transform 0.2s',
                                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    color: brandColor
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>

                                            {/* EXPANDED DETAILS - Collapsible */}
                                            {isExpanded && (
                                                <div
                                                    className="bg-light rounded-bottom p-3 mt-1"
                                                    style={{
                                                        animation: 'slideDown 0.2s ease-in-out',
                                                        borderLeft: `4px solid ${brandColor}`
                                                    }}
                                                >
                                                    {/* Customer Info */}
                                                    <div className="mb-3 pb-3 border-bottom">
                                                        <small className="text-muted d-block fw-semibold mb-2">👤 Khách hàng</small>
                                                        <div className="fw-semibold">{order.customerName}</div>
                                                        <small className="text-muted">{order.customerPhone}</small>
                                                    </div>

                                                    {/* Items Detail */}
                                                    <div className="mb-3 pb-3 border-bottom">
                                                        <small className="text-muted d-block fw-semibold mb-2">📦 Mục đơn hàng</small>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {order.items.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="badge"
                                                                    style={{
                                                                        backgroundColor: brandColor,
                                                                        color: 'white',
                                                                        padding: '0.5rem 0.75rem',
                                                                        fontSize: '0.8rem'
                                                                    }}
                                                                >
                                                                    {item.dishName} x{item.quantity}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Shipping Address */}
                                                    <div className="mb-3 pb-3 border-bottom">
                                                        <small className="text-muted d-block fw-semibold mb-2">🚚 Địa chỉ giao hàng</small>
                                                        <small style={{ fontSize: '0.85rem' }}>
                                                            {order.shippingAddress?.fullAddress || 'Chưa có địa chỉ'}
                                                        </small>
                                                    </div>

                                                    {/* Price Breakdown */}
                                                    <div>
                                                        <small className="text-muted d-block fw-semibold mb-2">💰 Chi tiết tiền</small>
                                                        <div className="row g-2 small">
                                                            <div className="col-6">
                                                                <span className="text-muted">Tiền hàng:</span>
                                                                <div className="fw-semibold">{formatCurrency(order.itemsTotal)}</div>
                                                            </div>
                                                            <div className="col-6">
                                                                <span className="text-muted">Phí dịch vụ:</span>
                                                                <div className="fw-semibold">{formatCurrency(order.serviceFee)}</div>
                                                            </div>
                                                            <div className="col-6">
                                                                <span className="text-muted">Phí giao hàng:</span>
                                                                <div className="fw-semibold">{formatCurrency(order.shippingFee)}</div>
                                                            </div>
                                                            <div className="col-6">
                                                                <span className="text-muted">Giảm giá:</span>
                                                                <div className="fw-semibold text-success">-{formatCurrency(order.discountAmount)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                    <small className="text-muted">
                                        Trang {currentPage + 1} / {totalPages}
                                    </small>
                                    <div className="btn-group btn-group-sm">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 0}
                                        >
                                            <ChevronLeft size={14} />
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleNextPage}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            <ChevronRight size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        !error && (
                            <div className="text-center py-5">
                                <Search size={48} className="text-muted mb-3" style={{ opacity: 0.5 }} />
                                <p className="text-muted">
                                    {selectedDishId
                                        ? 'Chưa có đơn hàng nào cho món ăn này'
                                        : 'Vui lòng chọn một món ăn'}
                                </p>
                            </div>
                        )
                    )}
                </div>

                {/* CSS for animation */}
                <style>{`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default OrderByDish;