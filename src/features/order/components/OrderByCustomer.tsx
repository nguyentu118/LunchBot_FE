import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Spinner, Badge, Button, Table, Row, Col, Form } from 'react-bootstrap';
import { Search, ChevronLeft, ChevronRight, Package, MapPin, Phone, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { orderService } from '../services/orderService';

// Types
import {
    OrderResponse,
    UserResponseDTO,
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

interface OrderByCustomerProps {
    merchantDishes?: any[];
}

const OrderByCustomer: React.FC<OrderByCustomerProps> = () => {
    // ✅ FIX: Xóa merchantDishes vì không sử dụng
    // State - Customers
    const [customers, setCustomers] = useState<UserResponseDTO[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<UserResponseDTO | null>(null);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    // Pagination - Customers
    const [customerCurrentPage, setCustomerCurrentPage] = useState(0);
    const customersPerPage = 8;

    // State - Orders
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // UI State
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    const brandColor = '#ff5e62';

    // ==================== LOAD CUSTOMERS ====================
    const loadCustomers = useCallback(async () => {
        setIsLoadingCustomers(true);
        try {
            const response = await orderService.getCustomersByMerchant();
            setCustomers(response);

            if (response.length > 0) {
                setSelectedCustomerId(response[0].id);
                setSelectedCustomer(response[0]);
                // ✅ FIX: Load orders cho khách hàng đầu tiên
                loadOrdersByCustomer(response[0].id);
            }
        } catch (err) {
            console.error('❌ Error loading customers:', err);
            toast.error('Không thể tải danh sách khách hàng');
        } finally {
            setIsLoadingCustomers(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // ==================== LOAD ORDERS BY CUSTOMER ====================
    const loadOrdersByCustomer = useCallback(async (customerId: number) => {
        if (!customerId) return;

        setIsLoadingOrders(true);
        setError(null);
        setExpandedOrderId(null);

        try {
            const response = await orderService.getOrdersByCustomerForMerchant(customerId);
            setOrders(response);

            if (response.length === 0) {
                setError('Khách hàng này chưa có đơn hàng nào');
            }
        } catch (err: any) {
            console.error('❌ Error loading orders by customer:', err);
            const errorMsg = err.response?.data?.message || 'Không thể tải danh sách đơn hàng';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoadingOrders(false);
        }
    }, []);

    // ==================== HANDLERS ====================
    const handleCustomerSelect = (customer: UserResponseDTO) => {
        setSelectedCustomerId(customer.id);
        setSelectedCustomer(customer);
        loadOrdersByCustomer(customer.id);
    };

    const toggleOrderExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // ==================== CUSTOMER PAGINATION ====================
    const filteredCustomers = customers.filter(customer =>
        customer.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        customer.phone?.includes(searchKeyword) ||
        customer.email?.toLowerCase().includes(searchKeyword)
    );

    const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage);
    const displayedCustomers = filteredCustomers.slice(
        customerCurrentPage * customersPerPage,
        (customerCurrentPage + 1) * customersPerPage
    );

    const handleNextCustomerPage = () => {
        if (customerCurrentPage < totalCustomerPages - 1) {
            setCustomerCurrentPage(customerCurrentPage + 1);
        }
    };

    const handlePrevCustomerPage = () => {
        if (customerCurrentPage > 0) {
            setCustomerCurrentPage(customerCurrentPage - 1);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="bg-white rounded-3 shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>
            <div className="p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">Thống kê đơn hàng theo khách hàng</h5>
                        <small className="text-muted">Chọn một khách hàng để xem danh sách đơn hàng của họ</small>
                    </div>
                </div>

                <Row className="g-3">
                    {/* ==================== LEFT SIDE: CUSTOMERS LIST ==================== */}
                    <Col lg={4}>
                        <div className="bg-light rounded p-3" style={{ minHeight: '600px', maxHeight: '600px', overflowY: 'auto' }}>
                            <h6 className="fw-bold mb-3">
                                Danh sách khách hàng ({filteredCustomers.length})
                            </h6>

                            {/* Search Input */}
                            <Form.Group className="mb-3">
                                <Form.Control
                                    placeholder="Tìm theo tên, SĐT hoặc email..."
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value);
                                        setCustomerCurrentPage(0);
                                    }}
                                    size="sm"
                                />
                            </Form.Group>

                            {/* Customers Loading */}
                            {isLoadingCustomers ? (
                                <div className="text-center py-5">
                                    <Spinner size="sm" animation="border" style={{ color: brandColor }} />
                                </div>
                            ) : filteredCustomers.length > 0 ? (
                                <>
                                    {/* Customers List */}
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        {displayedCustomers.map((customer) => (
                                            <div
                                                key={customer.id}
                                                className="p-3 rounded"
                                                style={{
                                                    backgroundColor: selectedCustomerId === customer.id ? brandColor : '#fff',
                                                    color: selectedCustomerId === customer.id ? 'white' : 'black',
                                                    cursor: 'pointer',
                                                    border: `1px solid ${selectedCustomerId === customer.id ? brandColor : '#dee2e6'}`,
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => handleCustomerSelect(customer)}
                                            >
                                                <div className="fw-semibold d-flex align-items-center gap-2 mb-1">
                                                    <User size={16} />
                                                    {customer.fullName}
                                                </div>
                                                <small className="d-block">
                                                    <Phone size={12} className="me-1" />
                                                    {customer.phone}
                                                </small>
                                                <small className="d-block" style={{ opacity: 0.8 }}>
                                                    {customer.email}
                                                </small>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Customer Pagination */}
                                    {totalCustomerPages > 1 && (
                                        <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                            <small className="text-muted">
                                                Trang {customerCurrentPage + 1} / {totalCustomerPages}
                                            </small>
                                            <div className="btn-group btn-group-sm">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handlePrevCustomerPage}
                                                    disabled={customerCurrentPage === 0}
                                                >
                                                    <ChevronLeft size={14} />
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handleNextCustomerPage}
                                                    disabled={customerCurrentPage >= totalCustomerPages - 1}
                                                >
                                                    <ChevronRight size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Alert variant="info" className="mb-0">
                                    {searchKeyword ? 'Không tìm thấy khách hàng nào' : 'Chưa có khách hàng nào'}
                                </Alert>
                            )}
                        </div>
                    </Col>

                    {/* ==================== RIGHT SIDE: ORDERS LIST ==================== */}
                    <Col lg={8}>
                        <div>
                            <h6 className="fw-bold mb-3">
                                Đơn hàng của {selectedCustomer?.fullName || 'khách hàng'}
                                {orders.length > 0 && (
                                    <Badge bg="secondary" className="ms-2">
                                        {orders.length} đơn
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
                                            {selectedCustomerId
                                                ? 'Chọn một khách hàng để xem đơn hàng'
                                                : 'Vui lòng chọn một khách hàng'}
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

export default OrderByCustomer;