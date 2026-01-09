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

    const handleApprove = async (id: number) => {
        const merchant = requests.find(r => r.merchantId === id);

        toast((t) => (
            <div style={{ minWidth: '400px', maxWidth: '480px' }}>
                {/* Header với icon và tiêu đề */}
                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <CheckCircle size={26} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="fw-bold mb-1" style={{ fontSize: '17px', color: '#1f2937' }}>
                            Xác nhận duyệt đối tác
                        </h5>
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                            Quyết định này sẽ có hiệu lực ngay lập tức
                        </p>
                    </div>
                </div>

                {/* Thông tin merchant */}
                {merchant && (
                    <div className="mb-3">
                        <div
                            className="rounded-3 p-3 mb-3"
                            style={{
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                border: '1px solid #bbf7d0'
                            }}
                        >
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Store size={18} className="text-success" />
                                <span className="fw-bold" style={{ fontSize: '15px', color: '#166534' }}>
                                {merchant.restaurantName}
                            </span>
                            </div>
                            <div className="small text-success-emphasis">
                                ID: {merchant.merchantId}
                            </div>
                        </div>

                        {/* Revenue info */}
                        <div
                            className="rounded-3 p-3"
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted" style={{ fontSize: '13px' }}>
                                <DollarSign size={14} className="me-1" style={{ marginTop: '-2px' }} />
                                Doanh thu tháng này:
                            </span>
                                <span className="fw-bold text-success" style={{ fontSize: '15px' }}>
                                {formatCurrency(merchant.currentMonthRevenue)}
                            </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted" style={{ fontSize: '13px' }}>Trạng thái:</span>
                                {merchant.currentMonthRevenue >= 100000000 ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="rounded-circle"
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                background: '#10b981',
                                                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
                                            }}
                                        ></div>
                                        <Badge
                                            bg="success"
                                            className="rounded-pill px-3 py-1"
                                            style={{ fontSize: '12px', fontWeight: '600' }}
                                        >
                                            Đạt chuẩn
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="rounded-circle"
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                background: '#f59e0b',
                                                boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)'
                                            }}
                                        ></div>
                                        <Badge
                                            bg="warning"
                                            text="dark"
                                            className="rounded-pill px-3 py-1"
                                            style={{ fontSize: '12px', fontWeight: '600' }}
                                        >
                                            Chưa đạt
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="d-flex gap-2 justify-content-end pt-2">
                    <Button
                        variant="light"
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 fw-semibold"
                        style={{
                            fontSize: '14px',
                            border: '1px solid #e5e7eb',
                            color: '#6b7280'
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const loadingToast = toast.loading('Đang xử lý...', {
                                style: {
                                    borderRadius: '10px',
                                    background: '#1f2937',
                                    color: '#fff',
                                }
                            });
                            try {
                                await adminPartnerService.approveRequest(id);
                                toast.dismiss(loadingToast);
                                toast.success(
                                    <div className="d-flex align-items-start gap-3">
                                        <div>
                                            <strong className="d-block mb-1" style={{ fontSize: '15px' }}>
                                                Duyệt thành công!
                                            </strong>
                                            <div className="text-muted" style={{ fontSize: '13px' }}>
                                                {merchant?.restaurantName} đã trở thành đối tác thân thiết
                                            </div>
                                        </div>
                                    </div>,
                                    {
                                        duration: 4000,
                                        style: {
                                            borderRadius: '12px',
                                            background: '#fff',
                                            padding: '16px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                            border: '1px solid #10b981'
                                        }
                                    }
                                );
                                fetchRequests();
                            } catch (error: any) {
                                toast.dismiss(loadingToast);
                                toast.error(
                                    <div className="d-flex align-items-start gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            }}
                                        >
                                            <XCircle size={22} className="text-white" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <strong className="d-block mb-1" style={{ fontSize: '15px' }}>
                                                Lỗi khi duyệt
                                            </strong>
                                            <div className="text-muted" style={{ fontSize: '13px' }}>
                                                {error.response?.data?.message || "Vui lòng thử lại"}
                                            </div>
                                        </div>
                                    </div>,
                                    {
                                        duration: 4000,
                                        style: {
                                            borderRadius: '12px',
                                            background: '#fff',
                                            padding: '16px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                            border: '1px solid #ef4444'
                                        }
                                    }
                                );
                            }
                        }}
                        className="px-4 fw-semibold"
                        style={{
                            fontSize: '14px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        Xác nhận duyệt
                    </Button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                background: 'white',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '500px'
            }
        });
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