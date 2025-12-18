import React, { useEffect, useState } from 'react';
import { Badge, Button, Container, Spinner, Table, Accordion, Row, Col } from 'react-bootstrap';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getMerchantOrders, updateOrderStatus, OrderResponse, ORDER_STATUS } from './services/merchantOrderService';
import { CheckCircle, XCircle, Package, Truck, Search, MapPin, Phone, User } from 'lucide-react';

interface MerchantOrderManagerProps {
    filters: {
        keyword: string;
        status: string;
        date: string;
    };
}

const MerchantOrderManager: React.FC<MerchantOrderManagerProps> = ({ filters }) => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getMerchantOrders(filters.status || undefined);

            let filteredData = data;

            // Lọc theo ngày
            if (filters.date) {
                filteredData = filteredData.filter((order: OrderResponse) =>
                    order.orderDate.startsWith(filters.date)
                );
            }

            // Lọc theo Keyword (Tên khách, Mã đơn, Số điện thoại)
            if (filters.keyword) {
                const lowerKeyword = filters.keyword.toLowerCase();
                filteredData = filteredData.filter((order: OrderResponse) =>
                    (order.shippingAddress?.contactName && order.shippingAddress.contactName.toLowerCase().includes(lowerKeyword)) ||
                    (order.orderNumber && order.orderNumber.toLowerCase().includes(lowerKeyword)) ||
                    (order.shippingAddress?.phone && order.shippingAddress.phone.includes(filters.keyword))
                );
            }

            setOrders(filteredData);
        } catch (error) {
            console.error('❌ Lỗi khi tải đơn hàng:', error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            toast.success(`Cập nhật trạng thái thành công!`);
            fetchOrders();
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case ORDER_STATUS.PENDING: return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
            case ORDER_STATUS.CONFIRMED: return <Badge bg="info">Đã xác nhận</Badge>;
            case ORDER_STATUS.PROCESSING: return <Badge bg="primary">Đang chế biến</Badge>;
            case ORDER_STATUS.READY: return <Badge bg="info">Đã xong món</Badge>;
            case ORDER_STATUS.DELIVERING: return <Badge bg="primary">Đang giao</Badge>;
            case ORDER_STATUS.COMPLETED: return <Badge bg="success">Hoàn thành</Badge>;
            case ORDER_STATUS.CANCELLED: return <Badge bg="danger">Đã hủy</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const renderActionButtons = (order: OrderResponse) => {
        return (
            <div className="d-flex gap-2 justify-content-end flex-wrap">
                {order.status === ORDER_STATUS.PENDING && (
                    <>
                        <Button variant="outline-danger" size="sm" onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.CANCELLED)}>
                            <XCircle size={16}/> Hủy
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.PROCESSING)}>
                            <CheckCircle size={16}/> Nhận đơn & Nấu
                        </Button>
                    </>
                )}

                {order.status === ORDER_STATUS.PROCESSING && (
                    <Button variant="info" size="sm" className="text-white" onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.READY)}>
                        <Package size={16}/> Món đã xong
                    </Button>
                )}

                {order.status === ORDER_STATUS.READY && (
                    <span className="text-muted fst-italic small">
                        <Truck size={16} className="me-1"/> Đang chờ tài xế lấy món...
                    </span>
                )}

                {(order.status === ORDER_STATUS.DELIVERING || order.status === ORDER_STATUS.COMPLETED) && (
                    <span className="text-success small fw-bold">
                        <CheckCircle size={16} className="me-1"/> {order.status === ORDER_STATUS.DELIVERING ? 'Shipper đang giao' : 'Đơn thành công'}
                    </span>
                )}

                {order.status === ORDER_STATUS.CANCELLED && (
                    <span className="text-danger small fw-bold">
                        <XCircle size={16} className="me-1"/> Đã hủy đơn
                    </span>
                )}
            </div>
        );
    };

    return (
        <Container fluid className="p-0">
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : (
                <Accordion defaultActiveKey="0">
                    {orders.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Search size={48} className="mb-3 opacity-50"/>
                            <p>Không tìm thấy đơn hàng nào phù hợp.</p>
                        </div>
                    ) : null}

                    {orders.map((order, index) => {
                        const customerName = order.shippingAddress?.contactName || 'N/A';
                        const customerPhone = order.shippingAddress?.phone || 'N/A';
                        const fullAddress = order.shippingAddress?.fullAddress || 'Chưa có địa chỉ';

                        return (
                            <Accordion.Item eventKey={index.toString()} key={order.id} className="mb-3 border rounded shadow-sm">
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                        <div>
                                            <span className="fw-bold">#{order.orderNumber || order.id}</span>
                                            <span className="text-muted ms-2 small">
                                                {format(new Date(order.orderDate), 'HH:mm dd/MM/yyyy')}
                                            </span>
                                            <div className="small text-muted mt-1">
                                                <User size={14} className="me-1" />
                                                {customerName}
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="text-success fw-bold">{order.totalAmount?.toLocaleString() || '0'} đ</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Row>
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
                                                            {item.totalPrice?.toLocaleString() || '0'} đ
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                        </Col>
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

                                            <hr/>
                                            <h6 className="text-muted mb-3">Hành động:</h6>
                                            {renderActionButtons(order)}
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}
        </Container>
    );
};

export default MerchantOrderManager;