import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { CheckCircle, XCircle, Store, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminPartnerService, } from '../services/adminPartnerService';
import {PartnerRequestDto} from "../types/merchant.types.ts";

const PartnerRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<PartnerRequestDto[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho Modal từ chối
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Fetch dữ liệu
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await adminPartnerService.getPendingRequests();
            setRequests(data);
        } catch (error) {
            toast.error("Lỗi tải danh sách yêu cầu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Format tiền tệ
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Xử lý Duyệt
    const handleApprove = async (id: number) => {
        if (!window.confirm("Xác nhận duyệt Merchant này thành Đối tác thân thiết?")) return;

        try {
            await adminPartnerService.approveRequest(id);
            toast.success("Đã duyệt thành công!");
            fetchRequests(); // Reload lại danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi duyệt.");
        }
    };

    // Xử lý Từ chối (Mở modal)
    const openRejectModal = (id: number) => {
        setSelectedId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    // Submit Từ chối
    const handleRejectSubmit = async () => {
        if (!selectedId || !rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do.");
            return;
        }

        try {
            await adminPartnerService.rejectRequest(selectedId, rejectReason);
            toast.success("Đã từ chối yêu cầu.");
            setShowRejectModal(false);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi từ chối.");
        }
    };

    return (
        <div className="container-fluid p-0">
            <h4 className="fw-bold mb-4 text-secondary">Xét duyệt Đối tác Thân thiết</h4>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-5 text-muted">Không có yêu cầu nào đang chờ duyệt.</div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="bg-light">
                                <tr>
                                    <th>Nhà hàng</th>
                                    <th>Địa chỉ / SĐT</th>
                                    <th className="text-end">Doanh thu tháng</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th className="text-end">Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {requests.map((req) => (
                                    <tr key={req.merchantId}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light p-2 rounded">
                                                    <Store size={20} className="text-primary"/>
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{req.restaurantName}</div>
                                                    <small className="text-muted">ID: {req.merchantId}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small">{req.address}</div>
                                            <div className="small text-muted">{req.phone}</div>
                                        </td>
                                        <td className="text-end">
                                            <div className="fw-bold text-success d-flex align-items-center justify-content-end gap-1">
                                                <DollarSign size={14}/>
                                                {formatCurrency(req.currentMonthRevenue)}
                                            </div>
                                            {req.currentMonthRevenue >= 100000000 ? (
                                                <Badge bg="success-subtle" text="success-emphasis" className="rounded-pill">Đạt chuẩn</Badge>
                                            ) : (
                                                <Badge bg="danger-subtle" text="danger-emphasis" className="rounded-pill">Chưa đạt</Badge>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Badge bg="warning" text="dark">Chờ duyệt</Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                variant="success" size="sm" className="me-2"
                                                onClick={() => handleApprove(req.merchantId)}
                                                title="Duyệt"
                                            >
                                                <CheckCircle size={16} />
                                            </Button>
                                            <Button
                                                variant="danger" size="sm"
                                                onClick={() => openRejectModal(req.merchantId)}
                                                title="Từ chối"
                                            >
                                                <XCircle size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal Từ chối */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">Từ chối yêu cầu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Lý do từ chối <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea" rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="VD: Doanh thu không ổn định, hồ sơ thiếu..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Hủy</Button>
                    <Button variant="danger" onClick={handleRejectSubmit}>Xác nhận</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PartnerRequestsPage;