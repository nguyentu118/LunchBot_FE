import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Spinner, Badge, Button, Table, Row, Col } from 'react-bootstrap';
import { Search, ChevronLeft, ChevronRight, Package, MapPin, Phone, User, CheckCircle } from 'lucide-react';
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
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

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
        setExpandedOrderId(null);

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

                {/* ==================== ORDERS SECTION ==================== */}
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
                            {/* Orders List */}
                            <div>
                                {orders.map((order) => {
                                    const isExpanded = expandedOrderId === order.id;
                                    const customerName = order.shippingAddress?.contactName || 'N/A';
                                    const customerPhone = order.shippingAddress?.phone || 'N/A';
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
                                                            <User size={14} className="me-1" />
                                                            {customerName}
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

                                                        {/* RIGHT: Customer Info */}
                                                        <Col md={4} className="border-start">
                                                            <h6 className="text-muted mb-3">
                                                                <User size={18} className="me-2" />
                                                                Thông tin khách hàng:
                                                            </h6>
                                                            <div className="mb-3">
                                                                <div className="d-flex align-items-start mb-2">
                                                                    <User size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                                                                    <div>
                                                                        <small className="text-muted d-block">Tên khách hàng</small>
                                                                        <span className="fw-semibold">{customerName}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex align-items-start mb-2">
                                                                    <Phone size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                                                                    <div>
                                                                        <small className="text-muted d-block">Số điện thoại</small>
                                                                        <span className="fw-semibold">{customerPhone}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex align-items-start mb-3">
                                                                    <MapPin size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                                                                    <div>
                                                                        <small className="text-muted d-block">Địa chỉ giao hàng</small>
                                                                        <span className="text-dark">{fullAddress}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex align-items-center p-2 rounded"
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
            </div>
        </div>
    );
};

export default OrderByDish;