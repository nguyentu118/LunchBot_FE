import React, {useEffect, useState} from 'react';
import {Table, Badge, Button, Tabs, Tab, Card, Pagination, Spinner, Modal} from 'react-bootstrap';
import {AlertTriangle, CheckCircle, XCircle, Download, Eye} from 'lucide-react';
import {AdminReconciliationRequestResponse, adminReconciliationService} from './service/adminReconciliationService';
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

    // Toast Reject State
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showRejectToast, setShowRejectToast] = useState(false);

    // Modal xem chi tiết báo cáo sai sót
    const [showClaimDetailModal, setShowClaimDetailModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<AdminReconciliationRequestResponse | null>(null);
    const [downloadingFile, setDownloadingFile] = useState(false);

    // âœ… Subscribe to notifications
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

    // âœ… Auto-refresh khi nhận notification từ Merchant
    useEffect(() => {
        const reconciliationNotifications = notifications.filter(n =>
            n.type === NotificationType.RECONCILIATION_REQUEST_CREATED ||
            n.type === NotificationType.RECONCILIATION_CLAIM_SUBMITTED
        );

        if (reconciliationNotifications.length > 0) {
            fetchRequests();

            const latest = reconciliationNotifications[0];
            if (latest.type === NotificationType.RECONCILIATION_REQUEST_CREATED) {
                toast('🎯 Yêu cầu đối soát mới!', { icon: '📋' });
            } else {
                toast('🚨 Báo cáo sai sót mới!', { icon: '⚠️' });
            }
        }
    }, [notifications]);

    // --- HANDLERS ---

    const executeApprove = async (id: number) => {
        const toastId = toast.loading("Đang xử lý phê duyệt...");
        try {
            await adminReconciliationService.approveRequest(id);
            toast.success("Đã duyệt yêu cầu thành công!", {id: toastId});
            setProcessingId(null);
            fetchRequests();
        } catch (error) {
            toast.error("Lỗi khi duyệt yêu cầu", {id: toastId});
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
                        <div
                            className="rounded-circle bg-success bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0">
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
    const handleRejectSubmit = async (
        id: number,
        rejectionReason: string,
        adminNotes: string
    ) => {
        try {
            await adminReconciliationService.rejectRequest(id, {
                rejectionReason,
                adminNotes
            });
            toast.success("Đã từ chối yêu cầu");
            setProcessingId(null);
            fetchRequests();
        } catch {
            toast.error("Lỗi khi từ chối yêu cầu");
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
                    <h6 className="fw-bold mb-3">Từ chối đối soát?</h6>

                    <div className="mb-3">
                        <label className="fw-semibold">
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
                        <label>Ghi chú nội bộ</label>
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
                            onClick={() => {
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

                                toast.dismiss(t.id);
                                handleRejectSubmit(id, reasonRef.current, notesRef.current);
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

    // ===== ĐỀ XUẤT: Xem chi tiết + tải file báo cáo =====
    const handleViewClaimDetail = (req: AdminReconciliationRequestResponse) => {
        setSelectedClaim(req);
        setShowClaimDetailModal(true);
    };

    const handleDownloadClaimFile = async (requestId: number, merchantName: string, yearMonth: string) => {
        try {
            setDownloadingFile(true);
            // Gọi API để tải file
            const blob = await adminReconciliationService.downloadClaimFile(requestId);

            // Tạo link download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `BaoCao_SaiSot_${merchantName}_${yearMonth}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(' Đã tải file báo cáo thành công!');
        } catch (error) {
            toast.error('Lỗi khi tải file báo cáo');
        } finally {
            setDownloadingFile(false);
        }
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
                    <th className="text-end">Tổng đơn</th>
                    <th className="text-end">Thực nhận</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Ghi chú Merchant</th>
                    <th className="text-center">Báo cáo</th>
                    <th className="text-end">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="text-center py-4">Không có dữ liệu</td>
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
                            {/* ===== CỘT TẢI FILE BÁNG CÁO ===== */}
                            <td className="text-center">
                                {req.status === 'REPORTED' && (
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        title="Xem chi tiết báo cáo"
                                        onClick={() => handleViewClaimDetail(req)}
                                    >
                                        <Eye size={16} />
                                    </Button>
                                )}
                                {req.status !== 'REPORTED' && (
                                    <span className="text-muted">-</span>
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
                                            style={{opacity: processingId !== null ? 0.5 : 1}}
                                        >
                                            <CheckCircle size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => openRejectModal(req.id)}
                                            title="Từ chối"
                                            disabled={processingId !== null}
                                            style={{opacity: processingId !== null ? 0.5 : 1}}
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

            {/* ===== MODAL XEM CHI TIẾT BÁO CÁO SÃI SÓT ===== */}
            <Modal show={showClaimDetailModal} onHide={() => setShowClaimDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-warning-subtle">
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <AlertTriangle size={20} className="text-warning"/>
                        Chi tiết báo cáo sai sót
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedClaim && (
                        <div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <h6 className="text-muted small">Nhà hàng</h6>
                                    <p className="fw-bold">{selectedClaim.merchantName}</p>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted small">Kỳ báo cáo</h6>
                                    <p className="fw-bold">{selectedClaim.yearMonth}</p>
                                </div>
                            </div>

                            <div className="alert alert-warning small mb-3">
                                <strong>Lý do báo cáo:</strong>
                                <p className="mb-0 mt-2">{selectedClaim.merchantNotes}</p>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <h6 className="text-muted small">Tổng số đơn</h6>
                                    <p className="fw-bold">{selectedClaim.totalOrders}</p>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted small">Doanh thu thực nhận</h6>
                                    <p className="fw-bold text-success">{formatCurrency(selectedClaim.netRevenue)}</p>
                                </div>
                            </div>

                            <div className="bg-light p-3 rounded">
                                <h6 className="mb-2 fw-bold">📎 Tập tin báo cáo đính kèm</h6>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small">
                                        BaoCao_DoanhThu_{selectedClaim.yearMonth}.xlsx
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleDownloadClaimFile(
                                            selectedClaim.id,
                                            selectedClaim.merchantName,
                                            selectedClaim.yearMonth
                                        )}
                                        disabled={downloadingFile}
                                    >
                                        {downloadingFile ? (
                                            <>
                                                <Spinner size="sm" animation="border" className="me-2"/>
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <Download size={16} className="me-2"/>
                                                Tải xuống
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClaimDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminReconciliationPage;