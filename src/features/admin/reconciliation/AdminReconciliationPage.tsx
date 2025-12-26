import React, {useEffect, useState} from 'react';
import {Table, Badge, Button, Tabs, Tab, Card, Pagination, Spinner, Modal, Form} from 'react-bootstrap';
import {AlertTriangle, CheckCircle, XCircle} from 'lucide-react';
import {adminReconciliationService, AdminReconciliationRequestResponse} from './service/adminReconciliationService';
import toast from 'react-hot-toast';

const AdminReconciliationPage: React.FC = () => {
    // --- STATE ---
    const [requests, setRequests] = useState<AdminReconciliationRequestResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('PENDING');

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modal Reject State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    // --- FETCH DATA ---
    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Nếu tab là 'ALL' thì truyền status = undefined để lấy tất cả
            const statusParam = activeTab === 'ALL' ? undefined : activeTab;

            const data = await adminReconciliationService.getAllRequests(statusParam, page);
            setRequests(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Lỗi tải danh sách đối soát");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0); // Reset về trang 1 khi đổi tab
    }, [activeTab]);

    useEffect(() => {
        fetchRequests();
    }, [page, activeTab]);

    // --- HANDLERS ---

    // 1. Hàm thực thi (giữ nguyên)
    const executeApprove = async (id: number) => {
        const toastId = toast.loading("Đang xử lý phê duyệt...");
        try {
            await adminReconciliationService.approveRequest(id);
            toast.success("Đã duyệt yêu cầu thành công!", {id: toastId});
            fetchRequests();
        } catch (error) {
            toast.error("Lỗi khi duyệt yêu cầu", {id: toastId});
        }
    };

    // Hàm hiện Form xác nhận (Cân đối lại)
    const handleApprove = (req: AdminReconciliationRequestResponse) => {
        toast.custom((t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } bg-white shadow-lg rounded-3`}
                style={{
                    maxWidth: '420px',
                    width: '100%',
                    borderLeft: '5px solid #198754',
                    pointerEvents: 'auto'
                }}
            >
                <div className="p-4">
                    {/* Header với Icon */}
                    <div className="d-flex align-items-center mb-3">
                        <div
                            className="rounded-circle bg-success bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0">
                            <CheckCircle size={24} className="text-success"/>
                        </div>
                        <h6 className="fw-bold text-dark mb-0 ms-3">
                            Xác nhận duyệt đối soát?
                        </h6>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="bg-light rounded-2 p-3 mb-4 border border-secondary border-opacity-25">
                        {/* Dòng 1: Merchant */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-secondary small">Merchant</span>
                            <span className="fw-bold text-dark">{req.merchantName}</span>
                        </div>

                        {/* Dòng 2: Tháng */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-secondary small">Tháng</span>
                            <span className="fw-semibold text-dark">{req.yearMonth}</span>
                        </div>

                        {/* Divider */}
                        <div className="border-top border-secondary border-opacity-25 my-2"></div>

                        {/* Dòng 3: Doanh thu (Highlight) */}
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-secondary small">Thực nhận</span>
                            <span className="fw-bold text-success fs-5">
                            {formatCurrency(req.netRevenue)}
                        </span>
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            variant="light"
                            size="sm"
                            className="border border-secondary text-secondary fw-500 px-4"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            className="px-4 fw-bold"
                            onClick={() => {
                                toast.dismiss(t.id);
                                executeApprove(req.id);
                            }}
                        >
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
        });
    };

    // 2. Mở Modal Từ chối
    const openRejectModal = (id: number) => {
        setSelectedRequestId(id);
        setRejectionReason('');
        setAdminNotes('');
        setShowRejectModal(true);
    };

    // 3. Submit Từ chối
    const handleRejectSubmit = async () => {
        if (!selectedRequestId) return;
        if (!rejectionReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            await adminReconciliationService.rejectRequest(selectedRequestId, {
                rejectionReason,
                adminNotes
            });
            toast.success("Đã từ chối yêu cầu");
            setShowRejectModal(false);
            fetchRequests();
        } catch (error) {
            toast.error("Lỗi khi từ chối yêu cầu");
        }
    };

    // Helper: Format tiền
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(val);

    // --- RENDER TABLE ---
    const renderTable = () => (
        <div className="table-responsive">
            <Table hover className="align-middle">
                <thead className="bg-light">
                <tr>
                    <th>Merchant</th>
                    <th>Tháng</th>
                    <th className="text-end">Tổng đơn</th>
                    <th className="text-end">Thực nhận</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Ghi chú Merchant</th>
                    <th className="text-end">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-4">Không có dữ liệu</td>
                    </tr>
                ) : (
                    requests.map(req => (
                        <tr key={req.id}>
                            <td>
                                <div className="fw-bold">{req.merchantName}</div>
                                <small className="text-muted">ID: {req.merchantId}</small>
                            </td>
                            <td><Badge bg="info">{req.yearMonth}</Badge></td>
                            <td className="text-end">{req.totalOrders}</td>
                            <td className="text-end fw-bold text-success">
                                {formatCurrency(req.netRevenue)}
                            </td>
                            <td className="text-center">
                                <Badge bg={
                                    req.status === 'APPROVED' ? 'success' :
                                        req.status === 'REJECTED' ? 'danger' :
                                            req.status === 'REPORTED' ? 'warning' : 'info' // Thêm màu warning cho REPORTED
                                } text={req.status === 'REPORTED' ? 'dark' : 'light'}>
                                    {req.statusDisplay}
                                </Badge>
                            </td>
                            <td>
                                {/* Nếu là REPORTED thì hiện icon cảnh báo và lý do màu đỏ */}
                                {req.status === 'REPORTED' ? (
                                    <div className="text-danger fw-bold d-flex align-items-center gap-1"
                                         style={{fontSize: '0.9rem'}}>
                                        <AlertTriangle size={14}/>
                                        {req.merchantNotes}
                                    </div>
                                ) : (
                                    <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
            {req.merchantNotes || '-'}
        </span>
                                )}
                            </td>
                            <td className="text-end">
                                {(req.status === 'PENDING' || req.status === 'REPORTED') && (
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button size="sm" variant="success" onClick={() => handleApprove(req)} title="Duyệt">
                                            <CheckCircle size={16} />
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => openRejectModal(req.id)} title="Từ chối">
                                            <XCircle size={16} />
                                        </Button>
                                    </div>
                                )}
                                {req.status !== 'PENDING' && (
                                    <small className="text-muted">
                                        {req.reviewedByName ? `Duyệt bởi: ${req.reviewedByName}` : 'Đã xử lý'}
                                    </small>
                                )}
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </Table>
        </div>
    );

    return (
        <div className="container-fluid p-0">
            <h4 className="mb-4 fw-bold text-secondary">Quản Lý Đối Soát Doanh Thu</h4>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'PENDING')} className="mb-3">
                        <Tab eventKey="PENDING" title="Đang chờ duyệt">
                            {loading ?
                                <div className="text-center py-3"><Spinner animation="border"/></div> : renderTable()}
                        </Tab>
                        <Tab eventKey="REPORTED" title="Khiếu nại / Báo cáo">
                            {loading ? <div className="text-center py-3"><Spinner animation="border"/></div> : renderTable()}
                        </Tab>
                        <Tab eventKey="ALL" title="Lịch sử toàn bộ">
                            {loading ?
                                <div className="text-center py-3"><Spinner animation="border"/></div> : renderTable()}
                        </Tab>
                    </Tabs>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev disabled={page === 0} onClick={() => setPage(p => p - 1)}/>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <Pagination.Item key={idx} active={idx === page} onClick={() => setPage(idx)}>
                                        {idx + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next disabled={page === totalPages - 1}
                                                 onClick={() => setPage(p => p + 1)}/>
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* MODAL TỪ CHỐI */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">Từ chối đối soát</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Lý do từ chối <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea" rows={3}
                            placeholder="Nhập lý do sai lệch..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Ghi chú nội bộ (Admin only)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ghi chú thêm..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Hủy</Button>
                    <Button variant="danger" onClick={handleRejectSubmit}>Xác nhận Từ chối</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminReconciliationPage;