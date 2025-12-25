import React, { useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Container,
    Spinner,
    Table,
    Accordion,
    Row,
    Col,
    Modal,
    Form,
    useAccordionButton,
    Card
} from 'react-bootstrap';
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
    const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);


    // State cho modal xác nhận hủy
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    // Danh sách lý do hủy phổ biến
    const cancelReasons = [
        'Hết nguyên liệu',
        'Quán quá đông, không kịp chuẩn bị',
        'Khách hàng yêu cầu hủy',
        'Địa chỉ giao hàng quá xa',
        'Không liên lạc được với khách hàng',
        'Khác (tự nhập)'
    ];


    //  Debounce keyword - chỉ update sau 500ms user ngừng gõ
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(filters.keyword);
        }, 500); // 500ms delay

        // Cleanup: Hủy timer cũ khi user gõ tiếp
        return () => clearTimeout(timer);
    }, [filters.keyword]);

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
// Chỉ fetch khi debouncedKeyword, status hoặc date thay đổi
    useEffect(() => {
        fetchOrders();
    }, [debouncedKeyword, filters.status, filters.date]);
    // Mở modal xác nhận hủy
    const handleCancelClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
        setCancelReason('');
        setCustomReason('');
    };

    // Đóng modal
    const handleCloseModal = () => {
        setShowCancelModal(false);
        setSelectedOrderId(null);
        setCancelReason('');
        setCustomReason('');
    };

    // Xử lý hủy đơn hàng
    const handleConfirmCancel = async () => {
        if (!selectedOrderId) return;

        // Xác định lý do cuối cùng
        let finalReason = cancelReason;
        if (cancelReason === 'Khác (tự nhập)') {
            if (!customReason.trim()) {
                toast.error('Vui lòng nhập lý do hủy');
                return;
            }
            finalReason = customReason.trim();
        } else if (!cancelReason) {
            toast.error('Vui lòng chọn lý do hủy');
            return;
        }

        try {
            // Gửi lý do hủy đến backend
            await updateOrderStatus(selectedOrderId, ORDER_STATUS.CANCELLED, {
                cancelReason: finalReason,
                cancelledBy: 'merchant'
            });

            toast.success(`Đã hủy đơn hàng. Khách hàng sẽ nhận được thông báo.`);
            handleCloseModal();
            fetchOrders();
        } catch (error) {
            toast.error("Hủy đơn hàng thất bại");
        }
    };

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

    function CustomToggle({ children, eventKey }: { children: React.ReactNode, eventKey: string }) {
        const decoratedOnClick = useAccordionButton(eventKey);

        return (
            <div
                className="accordion-button" // Class này giúp giữ nguyên giao diện mũi tên và style của Bootstrap
                onClick={decoratedOnClick}
                style={{ cursor: 'pointer', border: 'none', background: 'white' }}
            >
                {children}
            </div>
        );
    }


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
                                <Card.Header className="p-0 bg-white border-0">
                                    <CustomToggle eventKey={index.toString()}>
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
                                            <div className="d-flex align-items-center gap-2">
                                            <span className="fw-semibold" style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                                                {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} món
                                            </span>
                                                <span style={{ color: '#dee2e6', fontSize: '1.1rem' }}>|</span>
                                                <span className="text-success fw-bold" style={{ fontSize: '1.05rem' }}>
                                                {order.totalAmount?.toLocaleString() || '0'} ₫
                                            </span>
                                                {getStatusBadge(order.status)}

                                                {/* Action buttons on header */}
                                                <div className="d-flex gap-2 ms-2" onClick={(e) => e.stopPropagation()}>
                                                    {order.status === ORDER_STATUS.PENDING && (
                                                        <>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCancelClick(order.id);
                                                                }}
                                                            >
                                                                <XCircle size={16}/> Hủy
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(order.id, ORDER_STATUS.PROCESSING);
                                                                }}
                                                            >
                                                                <CheckCircle size={16}/> Nhận đơn
                                                            </Button>
                                                        </>
                                                    )}

                                                    {order.status === ORDER_STATUS.PROCESSING && (
                                                        <Button
                                                            variant="info"
                                                            size="sm"
                                                            className="text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(order.id, ORDER_STATUS.READY);
                                                            }}
                                                        >
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
                                                        <CheckCircle size={16} className="me-1"/>
                                                            {order.status === ORDER_STATUS.DELIVERING ? 'Đang giao' : 'Hoàn thành'}
                                                    </span>
                                                    )}

                                                    {order.status === ORDER_STATUS.CANCELLED && (
                                                        <span className="text-danger small fw-bold">
                                                        <XCircle size={16} className="me-1"/> Đã hủy
                                                    </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CustomToggle>
                                </Card.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col md={7}>
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
                                        <Col md={5} className="border-start">
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

                                                <div className="d-flex align-items-start mb-2">
                                                    <MapPin size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                                                    <div>
                                                        <small className="text-muted d-block">Địa chỉ giao hàng</small>
                                                        <span className="text-dark">{fullAddress}</span>
                                                    </div>
                                                </div>

                                                {order.expectedDeliveryTime && order.status !== ORDER_STATUS.CANCELLED &&(
                                                    <div className="d-flex align-items-start mb-3">
                                                        <Package size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                                                        <div>
                                                            <small className="text-muted d-block">Thời gian giao dự kiến</small>
                                                            <span className="text-primary fw-semibold">
                                                                {format(new Date(order.expectedDeliveryTime), 'HH:mm dd/MM/yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <hr className="my-3" />

                                            {/* Chi tiết thanh toán */}
                                            <h6 className="text-muted mb-3">Chi tiết thanh toán:</h6>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted small">Tạm tính:</span>
                                                    <span className="fw-semibold">
                                                        {(order.itemsTotal || 0).toLocaleString()} ₫
                                                    </span>
                                                </div>

                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted small">Phí giao hàng:</span>
                                                    <span className="fw-semibold">
                                                        {(order.shippingFee || 0).toLocaleString()} ₫
                                                    </span>
                                                </div>

                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted small">Phí dịch vụ:</span>
                                                    <span className="fw-semibold">
                                                        {(order.serviceFee || 0).toLocaleString()} ₫
                                                    </span>
                                                </div>

                                                {order.discountAmount && order.discountAmount > 0 && (
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="text-success small">Giảm giá:</span>
                                                        <span className="text-success fw-semibold">
                                                            -{order.discountAmount.toLocaleString()} ₫
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="d-flex justify-content-between pt-2 border-top mt-2">
                                                    <span className="fw-bold">Tổng thanh toán:</span>
                                                    <span className="text-success fw-bold" style={{ fontSize: '1.15rem' }}>
                                                        {order.totalAmount?.toLocaleString() || '0'} ₫
                                                    </span>
                                                </div>
                                            </div>
                                            {order.status !== ORDER_STATUS.CANCELLED && (<div className="d-flex align-items-center p-2 rounded"
                                                                                              style={{backgroundColor: '#f8f9fa'}}>
                                                <strong className="me-2 small">Trạng thái:</strong>
                                                {order.paymentStatus === 'PAID' ? (
                                                    <span className="text-success fw-semibold small">
                                                        <CheckCircle size={16} className="me-1" />
                                                        Đã thanh toán
                                                    </span>
                                                ) : (
                                                    <span className="text-warning fw-semibold small">
                                                        ⏳ Chưa thanh toán ({order.paymentMethod || 'COD'})
                                                    </span>
                                                )}
                                            </div>
                                            )}
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}
            {/* Modal xác nhận hủy đơn hàng */}
            <Modal show={showCancelModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <XCircle size={24} className="me-2 text-danger" />
                        Xác nhận hủy đơn hàng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3">
                        Vui lòng chọn lý do hủy đơn hàng. Khách hàng sẽ nhận được thông báo kèm lý do này.
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Lý do hủy đơn <span className="text-danger">*</span></Form.Label>
                        {cancelReasons.map((reason, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                id={`reason-${idx}`}
                                label={reason}
                                name="cancelReason"
                                value={reason}
                                checked={cancelReason === reason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="mb-2"
                            />
                        ))}
                    </Form.Group>

                    {cancelReason === 'Khác (tự nhập)' && (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Nhập lý do cụ thể <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Ví dụ: Hệ thống bếp đang bảo trì..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                maxLength={200}
                            />
                            <Form.Text className="text-muted">
                                {customReason.length}/200 ký tự
                            </Form.Text>
                        </Form.Group>
                    )}

                    <div className="alert alert-warning d-flex align-items-start mb-0">
                        <span className="me-2">⚠️</span>
                        <small>
                            Hành động này không thể hoàn tác. Khách hàng sẽ nhận được thông báo hủy đơn kèm lý do bạn đã chọn.
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmCancel}
                        disabled={!cancelReason || (cancelReason === 'Khác (tự nhập)' && !customReason.trim())}
                    >
                        <XCircle size={16} className="me-1" />
                        Xác nhận hủy đơn
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default MerchantOrderManager;