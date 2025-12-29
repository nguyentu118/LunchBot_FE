import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Card, Tabs, Tab, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { CheckCircle, XCircle, CreditCard, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminFinancialService } from '../services/adminFinancialService';
import {AdminWithdrawalRequest} from "../types/adminFinancial.types.ts";

const AdminWithdrawalPage: React.FC = () => {
    const [requests, setRequests] = useState<AdminWithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('PENDING');

    // State cho Modal Từ chối
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Nếu tab là ALL thì truyền null hoặc không truyền, tùy backend xử lý.
            // Ở đây giả sử tab ALL sẽ gọi API lấy hết, còn PENDING chỉ lấy pending.
            const statusParam = activeTab === 'ALL' ? undefined : activeTab;
            const data = await adminFinancialService.getRequests(statusParam);
            setRequests(data);
        } catch (error) {
            toast.error("Lỗi tải danh sách rút tiền");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    // Format tiền & ngày
    const formatCurrency = (val: any) => {
        const numberVal = Number(val);
        if (isNaN(numberVal)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberVal);
    };
    const formatDate = (dateString: any) => {
        if (!dateString) return '-';
        try {
            if (Array.isArray(dateString)) {
                const [year, month, day, hour, minute] = dateString;
                return new Date(year, month - 1, day, hour, minute).toLocaleString('vi-VN');
            }
            return new Date(dateString).toLocaleString('vi-VN');
        } catch (e) {
            return 'Lỗi ngày';
        }
    };

    // 1. Hàm thực thi gọi API (Tách ra để gọi khi bấm nút Xác nhận trên Toast)
    const executeApprove = async (id: number) => {
        const toastId = toast.loading("Đang cập nhật trạng thái...");
        try {
            await adminFinancialService.approveRequest(id);
            toast.success("Đã duyệt yêu cầu thành công!", { id: toastId });
            fetchRequests(); // Reload lại danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi duyệt", { id: toastId });
        }
    };

    // 2. Hàm hiển thị Toast xác nhận (Thay thế window.confirm)
    const handleApprove = (id: number) => {
        toast.custom((t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } bg-white shadow-lg rounded-3 d-flex pointer-events-auto border-0`}
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    borderLeft: '5px solid #198754' // Viền xanh lá bên trái
                }}
            >
                <div className="p-3 w-100">
                    <div className="d-flex align-items-start">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <CheckCircle size={24} className="text-success" />
                        </div>

                        {/* Nội dung */}
                        <div className="ms-3 flex-grow-1">
                            <h6 className="fw-bold mb-1 text-dark">Xác nhận chuyển khoản?</h6>
                            <p className="text-muted small mb-3">
                                Bạn xác nhận đã chuyển tiền thành công cho Merchant này bên ngoài hệ thống?
                            </p>

                            {/* Nút bấm */}
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-muted border"
                                    onClick={() => toast.dismiss(t.id)}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    variant="success"
                                    size="sm"
                                    className="fw-bold px-3"
                                    onClick={() => {
                                        toast.dismiss(t.id); // Tắt toast
                                        executeApprove(id);  // Gọi API
                                    }}
                                >
                                    Đã chuyển & Duyệt
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ), {
            duration: Infinity, // Không tự tắt để Admin kịp đọc
            position: 'top-center',
        });
    };

    // Xử lý Từ chối
    const handleRejectSubmit = async () => {
        if (!selectedId || !rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }
        try {
            await adminFinancialService.rejectRequest(selectedId, rejectReason);
            toast.success("Đã từ chối và hoàn tiền về ví Merchant");
            setShowRejectModal(false);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi từ chối");
        }
    };

    // Copy số tài khoản
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép STK");
    };

    return (
        <div className="container-fluid p-0">
            <h4 className="fw-bold mb-4 text-secondary">Quản lý Rút tiền & Dòng tiền</h4>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'PENDING')} className="mb-3">
                        <Tab eventKey="PENDING" title="Đang chờ xử lý (Cần chuyển khoản)" />
                        <Tab eventKey="APPROVED" title="Đã duyệt" />
                        <Tab eventKey="REJECTED" title="Đã từ chối" />
                    </Tabs>

                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border"/></div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-5 text-muted">Không có dữ liệu</div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="bg-light">
                                <tr>
                                    <th>ID / Ngày</th>
                                    <th>Nhà hàng</th>
                                    <th>Thông tin Ngân hàng (Thụ hưởng)</th>
                                    <th className="text-end">Số tiền rút</th>
                                    <th className="text-end">Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td>
                                            <div className="fw-bold">#{req.id}</div>
                                            <small className="text-muted">{formatDate(req.requestedAt)}</small>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{req.merchant?.restaurantName}</div>
                                            <small className="text-muted">{req.merchant?.phone}</small>
                                            {/* Check nếu đây là yêu cầu Thanh lý (toàn bộ tiền) */}
                                            {req.adminNotes?.includes('THANH LÝ') &&
                                                <Badge bg="danger" className="ms-2">Thanh lý</Badge>
                                            }
                                        </td>
                                        <td>
                                            <Card className="bg-light border-0 p-2" style={{maxWidth: '300px'}}>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold text-primary">{req.merchant?.bankName}</span>
                                                    <CreditCard size={16} className="text-muted"/>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <code className="fs-6 text-dark">{req.merchant?.bankAccountNumber}</code>
                                                    <Copy size={14} className="cursor-pointer text-muted" onClick={() => copyToClipboard(req.merchant?.bankAccountNumber)} />
                                                </div>
                                                <div className="small text-uppercase text-muted mt-1">{req.merchant?.bankAccountHolder}</div>
                                            </Card>
                                        </td>
                                        <td className="text-end">
                                            <h5 className="fw-bold text-success mb-0">{formatCurrency(req.amount)}</h5>
                                        </td>
                                        <td className="text-end">
                                            {req.status === 'PENDING' && (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button size="sm" variant="success" onClick={() => handleApprove(req.id)} title="Đã chuyển khoản & Duyệt">
                                                        <CheckCircle size={16} /> Duyệt
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => {
                                                        setSelectedId(req.id);
                                                        setRejectReason('');
                                                        setShowRejectModal(true);
                                                    }} title="Từ chối & Hoàn tiền">
                                                        <XCircle size={16} /> Từ chối
                                                    </Button>
                                                </div>
                                            )}
                                            {req.status === 'REJECTED' && <span className="text-danger small">{req.adminNotes}</span>}
                                            {req.status === 'APPROVED' && <Badge bg="success">Thành công</Badge>}
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
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">Từ chối & Hoàn tiền</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning" className="small">
                        Hành động này sẽ <strong>HOÀN LẠI TIỀN</strong> về ví của Merchant.
                    </Alert>
                    <Form.Group>
                        <Form.Label>Lý do từ chối <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea" rows={3}
                            placeholder="VD: Sai thông tin ngân hàng, Tên chủ thẻ không khớp..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Hủy</Button>
                    <Button variant="danger" onClick={handleRejectSubmit}>Xác nhận Hoàn tiền</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminWithdrawalPage;