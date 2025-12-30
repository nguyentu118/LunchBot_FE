import React, {useEffect, useState} from 'react';
import {Table, Badge, Button, Tabs, Tab, Card, Pagination, Spinner} from 'react-bootstrap';
import {AlertTriangle, CheckCircle, XCircle} from 'lucide-react';
import {adminReconciliationService, AdminReconciliationRequestResponse} from './service/adminReconciliationService';
import toast from 'react-hot-toast';

import { NotificationType } from '../../notification/types/notification.types';
import { useNotifications } from '../../notification/hooks/useNotifications';

const AdminReconciliationPage: React.FC = () => {
    // --- STATE ---
    const [requests, setRequests] = useState<AdminReconciliationRequestResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('PENDING');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // ✅ Subscribe to notifications
    const userEmail = localStorage.getItem('userEmail') || '';
    const { notifications } = useNotifications(userEmail);

    // --- FETCH DATA ---
    const fetchRequests = async () => {
        try {
            setLoading(true);
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
        setPage(0);
    }, [activeTab]);

    useEffect(() => {
        fetchRequests();
    }, [page, activeTab]);

    // ✅ Auto-refresh khi nhận notification từ Merchant
    useEffect(() => {
        const reconciliationNotifications = notifications.filter(n =>
            n.type === NotificationType.RECONCILIATION_REQUEST_CREATED ||
            n.type === NotificationType.RECONCILIATION_CLAIM_SUBMITTED
        );

        if (reconciliationNotifications.length > 0) {
            fetchRequests();
            const latest = reconciliationNotifications[0];
            if (latest.type === NotificationType.RECONCILIATION_REQUEST_CREATED) {
                toast('💰 Yêu cầu đối soát mới!', { icon: '🔔' });
            } else {
                toast('🚨 Báo cáo sai sót mới!', { icon: '⚠️' });
            }
        }
    }, [notifications]);

    // --- HANDLERS ---

    // ✅ FIX: Dismiss ngay lập tức, xử lý async sau
    const executeApprove = async (id: number, toastId: string) => {
        // 1. Dismiss toast NGAY
        toast.dismiss(toastId);

        // 2. Hiển thị loading toast mới
        const loadingId = toast.loading("Đang xử lý phê duyệt...");

        try {
            await adminReconciliationService.approveRequest(id);
            toast.success("Đã duyệt yêu cầu thành công!", { id: loadingId });
            await fetchRequests();
        } catch (error) {
            toast.error("Lỗi khi duyệt yêu cầu", { id: loadingId });
        } finally {
            setProcessingId(null);
        }
    };

    const handleApprove = (req: AdminReconciliationRequestResponse) => {
        setProcessingId(req.id);

        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white shadow-lg rounded-3`}
                style={{
                    maxWidth: '380px',
                    width: '100%',
                    borderLeft: '5px solid #198754',
                    pointerEvents: 'auto'
                }}
            >
                <div className="p-3">
                    <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-success bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0">
                            <CheckCircle size={20} className="text-success"/>
                        </div>
                        <h6 className="fw-bold text-dark mb-0 ms-2" style={{fontSize: '0.95rem'}}>
                            Xác nhận duyệt đối soát?
                        </h6>
                    </div>

                    <div className="bg-light rounded-2 p-2 mb-3 border border-secondary border-opacity-25" style={{fontSize: '0.9rem'}}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-secondary small">Merchant</span>
                            <span className="fw-bold text-dark">{req.merchantName}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-secondary small">Tháng</span>
                            <span className="fw-semibold text-dark">{req.yearMonth}</span>
                        </div>

                        <div className="border-top border-secondary border-opacity-25 my-2"></div>

                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-secondary small">Thực nhận</span>
                            <span className="fw-bold text-success" style={{fontSize: '1rem'}}>
                                {formatCurrency(req.netRevenue)}
                            </span>
                        </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            variant="light"
                            size="sm"
                            className="border border-secondary text-secondary fw-500 px-3"
                            style={{fontSize: '0.85rem'}}
                            onClick={() => {
                                // ✅ FIX: Dismiss ngay + reset state
                                toast.dismiss(t.id);
                                setProcessingId(null);
                            }}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            className="px-3 fw-bold"
                            style={{fontSize: '0.85rem'}}
                            onClick={() => {
                                // ✅ FIX: Truyền toastId vào để dismiss ngay
                                executeApprove(req.id, t.id);
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

    // ✅ FIX: Xử lý reject tương tự
    const handleRejectSubmit = async (
        id: number,
        rejectionReason: string,
        adminNotes: string,
        toastId: string
    ) => {
        // 1. Dismiss toast NGAY
        toast.dismiss(toastId);

        // 2. Hiển thị loading
        const loadingId = toast.loading("Đang xử lý từ chối...");

        try {
            await adminReconciliationService.rejectRequest(id, {
                rejectionReason,
                adminNotes
            });
            toast.success("Đã từ chối yêu cầu", { id: loadingId });
            await fetchRequests();
        } catch {
            toast.error("Lỗi khi từ chối yêu cầu", { id: loadingId });
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (id: number) => {
        setProcessingId(id);

        const reasonRef = { current: '' };
        const notesRef = { current: '' };

        toast.custom((t) => (
            <div
                className="bg-white shadow-lg rounded-3"
                style={{
                    maxWidth: '380px',
                    width: '100%',
                    borderLeft: '5px solid #dc3545',
                    pointerEvents: 'auto'
                }}
            >
                <div className="p-3">
                    <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-danger bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0">
                            <XCircle size={20} className="text-danger"/>
                        </div>
                        <h6 className="fw-bold text-dark mb-0 ms-2" style={{fontSize: '0.95rem'}}>
                            Từ chối đối soát?
                        </h6>
                    </div>

                    <div className="mb-3">
                        <label className="fw-semibold small">
                            Lý do từ chối <span className="text-danger">*</span>
                        </label>
                        <textarea
                            rows={2}
                            className="form-control"
                            placeholder="Nhập lý do sai lệch..."
                            onChange={(e) => (reasonRef.current = e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="small">Ghi chú nội bộ</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ghi chú thêm..."
                            onChange={(e) => (notesRef.current = e.target.value)}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <Button
                            size="sm"
                            variant="light"
                            className="border border-secondary"
                            onClick={() => {
                                // ✅ FIX: Dismiss ngay
                                toast.dismiss(t.id);
                                setProcessingId(null);
                            }}
                        >
                            Hủy bỏ
                        </Button>

                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                                if (!reasonRef.current.trim()) {
                                    toast.error("Vui lòng nhập lý do từ chối");
                                    return;
                                }

                                // ✅ FIX: Truyền toastId để dismiss ngay
                                handleRejectSubmit(id, reasonRef.current, notesRef.current, t.id);
                            }}
                        >
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center'
        });
    };

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
                    <th className="text-end">Tổng Đơn</th>
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
                                            req.status === 'REPORTED' ? 'warning' : 'info'
                                } text={req.status === 'REPORTED' ? 'dark' : 'light'}>
                                    {req.statusDisplay}
                                </Badge>
                            </td>
                            <td>
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
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => handleApprove(req)}
                                            title="Duyệt"
                                            disabled={processingId !== null}
                                        >
                                            <CheckCircle size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => openRejectModal(req.id)}
                                            title="Từ chối"
                                            disabled={processingId !== null}
                                        >
                                            <XCircle size={16} />
                                        </Button>
                                    </div>
                                )}
                                {req.status !== 'PENDING' && req.status !== 'REPORTED' && (
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
        </div>
    );
};

export default AdminReconciliationPage;