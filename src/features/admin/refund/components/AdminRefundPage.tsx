// src/features/admin/refund/pages/AdminRefundPage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { RefundApiService, RefundResponse } from '../service/RefundApi.service';
import { RefundStatus, ConfirmRefundPayload } from '../types/refund.type';
import RefundList from './RefundList';
import ConfirmRefundModal from './ConfirmRefundModal';
import RefundActionButtons from './RefundActionButtons';
import {
    ProcessingModal,
    FailModal,
    CancelModal,
    RetryModal
} from './RefundActionModals';

const AdminRefundPage: React.FC = () => {
    const [allRefunds, setAllRefunds] = useState<RefundResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Pagination & Filter
    const [currentTab, setCurrentTab] = useState<RefundStatus | 'ALL'>('PENDING');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [showFailModal, setShowFailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState<RefundResponse | null>(null);

    // Fetch data
    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const data = await RefundApiService.getAllRefunds();
            setAllRefunds(data);
        } catch (error) {
            console.error('Error fetching refunds:', error);
            toast.error('Lỗi tải danh sách hoàn tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchRefunds();
            toast.success('Đã làm mới dữ liệu');
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Lỗi làm mới dữ liệu');
        } finally {
            setRefreshing(false);
        }
    };

    // ✅ Handler: Chuyển sang PROCESSING
    const handleProcessing = (refund: RefundResponse) => {
        setSelectedRefund(refund);
        setShowProcessingModal(true);
    };

    const confirmProcessing = async (notes: string) => {
        if (!selectedRefund) return;

        try {
            setActionLoading(selectedRefund.id);
            await RefundApiService.markAsProcessing(selectedRefund.id, notes);

            // Update local state
            setAllRefunds(prev =>
                prev.map(r =>
                    r.id === selectedRefund.id
                        ? { ...r, refundStatus: 'PROCESSING' as RefundStatus, notes }
                        : r
                )
            );

            setShowProcessingModal(false);
            setSelectedRefund(null);
            toast.success('Đã chuyển sang trạng thái Đang xử lý');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    // ✅ Handler: Xác nhận COMPLETED
    const handleConfirm = (refund: RefundResponse) => {
        setSelectedRefund(refund);
        setShowConfirmModal(true);
    };

    const confirmRefund = async (payload: ConfirmRefundPayload) => {
        if (!selectedRefund) return;

        try {
            setActionLoading(selectedRefund.id);
            await RefundApiService.confirmRefund(selectedRefund.id, payload);

            setAllRefunds(prev =>
                prev.map(r =>
                    r.id === selectedRefund.id
                        ? {
                            ...r,
                            refundStatus: 'COMPLETED' as RefundStatus,
                            refundTransactionRef: payload.refundTransactionRef,
                            notes: payload.notes,
                            processedAt: new Date().toISOString(),
                            processedBy: localStorage.getItem('userEmail') || 'admin',
                        }
                        : r
                )
            );

            setShowConfirmModal(false);
            setSelectedRefund(null);
            toast.success('Xác nhận hoàn tiền thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xác nhận thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    // ✅ Handler: Đánh dấu FAILED
    const handleFail = (refund: RefundResponse) => {
        setSelectedRefund(refund);
        setShowFailModal(true);
    };

    const confirmFail = async (reason: string) => {
        if (!selectedRefund) return;

        try {
            setActionLoading(selectedRefund.id);
            await RefundApiService.markAsFailed(selectedRefund.id, reason);

            setAllRefunds(prev =>
                prev.map(r =>
                    r.id === selectedRefund.id
                        ? {
                            ...r,
                            refundStatus: 'FAILED' as RefundStatus,
                            notes: reason,
                            processedAt: new Date().toISOString(),
                            processedBy: localStorage.getItem('userEmail') || 'admin',
                        }
                        : r
                )
            );

            setShowFailModal(false);
            setSelectedRefund(null);
            toast.success('Đã đánh dấu thất bại');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    // ✅ Handler: Hủy refund
    const handleCancel = (refund: RefundResponse) => {
        setSelectedRefund(refund);
        setShowCancelModal(true);
    };

    const confirmCancel = async (reason: string) => {
        if (!selectedRefund) return;

        try {
            setActionLoading(selectedRefund.id);
            await RefundApiService.cancelRefund(selectedRefund.id, reason);

            setAllRefunds(prev =>
                prev.map(r =>
                    r.id === selectedRefund.id
                        ? {
                            ...r,
                            refundStatus: 'CANCELLED' as RefundStatus,
                            notes: reason,
                            processedAt: new Date().toISOString(),
                            processedBy: localStorage.getItem('userEmail') || 'admin',
                        }
                        : r
                )
            );

            setShowCancelModal(false);
            setSelectedRefund(null);
            toast.success('Đã hủy yêu cầu hoàn tiền');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Hủy thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    // ✅ Handler: RETRY refund
    const handleRetry = (refund: RefundResponse) => {
        setSelectedRefund(refund);
        setShowRetryModal(true);
    };

    const confirmRetry = async () => {
        if (!selectedRefund) return;

        try {
            setActionLoading(selectedRefund.id);
            await RefundApiService.retryRefund(selectedRefund.id);

            setAllRefunds(prev =>
                prev.map(r =>
                    r.id === selectedRefund.id
                        ? {
                            ...r,
                            refundStatus: 'PENDING' as RefundStatus,
                            processedAt: null,
                            notes: 'Retry refund request',
                        }
                        : r
                )
            );

            setShowRetryModal(false);
            setSelectedRefund(null);
            toast.success('Đã reset về PENDING để thử lại');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Retry thất bại');
        } finally {
            setActionLoading(null);
        }
    };

    // Filter & Pagination
    const getFilteredRefunds = (): RefundResponse[] => {
        if (currentTab === 'ALL') return allRefunds;
        return allRefunds.filter(r => r.refundStatus === currentTab);
    };

    const filteredRefunds = getFilteredRefunds();
    const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);
    const paginatedRefunds = filteredRefunds.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const countByStatus = (status: RefundStatus): number => {
        return allRefunds.filter(r => r.refundStatus === status).length;
    };

    const getStatusColor = (status: RefundStatus): string => {
        const colors: Record<RefundStatus, string> = {
            'PENDING': 'warning',
            'PROCESSING': 'info',
            'COMPLETED': 'success',
            'FAILED': 'danger',
            'CANCELLED': 'secondary',
        };
        return colors[status];
    };

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Quản lý hoàn tiền</h2>
                    <p className="text-muted small">Xử lý và theo dõi các yêu cầu hoàn tiền</p>
                </div>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="d-flex align-items-center gap-2"
                >
                    <RefreshCw size={18} />
                    {refreshing ? 'Đang làm mới...' : 'Làm mới'}
                </Button>
            </div>

            {/* Statistics */}
            <div className="row mb-4 g-3">
                {[
                    { status: 'PENDING', label: 'Chờ xử lý', color: 'warning' },
                    { status: 'PROCESSING', label: 'Đang xử lý', color: 'info' },
                    { status: 'COMPLETED', label: 'Đã hoàn', color: 'success' },
                    { status: 'FAILED', label: 'Thất bại', color: 'danger' },
                ].map(({ status, label, color }) => (
                    <div key={status} className="col-md-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <div className={`fs-2 fw-bold text-${color} mb-2`}>
                                    {countByStatus(status as RefundStatus)}
                                </div>
                                <div className="text-muted small">{label}</div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                    <Tabs
                        activeKey={currentTab}
                        onSelect={(k) => {
                            setCurrentTab((k as RefundStatus | 'ALL') || 'ALL');
                            setCurrentPage(1);
                        }}
                    >
                        {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'].map((status) => (
                            <Tab
                                key={status}
                                eventKey={status}
                                title={
                                    <span>
                                        {status === 'ALL' ? 'Tất cả' :
                                            status === 'PENDING' ? 'Chờ xử lý' :
                                                status === 'PROCESSING' ? 'Đang xử lý' :
                                                    status === 'COMPLETED' ? 'Đã hoàn' :
                                                        status === 'FAILED' ? 'Thất bại' : 'Đã hủy'}
                                        <Badge
                                            bg={status === 'ALL' ? 'secondary' : getStatusColor(status as RefundStatus)}
                                            className="ms-2"
                                        >
                                            {status === 'ALL' ? allRefunds.length : countByStatus(status as RefundStatus)}
                                        </Badge>
                                    </span>
                                }
                            />
                        ))}
                    </Tabs>
                </Card.Header>

                <Card.Body className="p-4">
                    {filteredRefunds.length === 0 && !loading ? (
                        <div className="text-center py-5">
                            <AlertCircle size={48} className="text-muted mb-3" />
                            <h6 className="text-muted">Không có yêu cầu hoàn tiền</h6>
                        </div>
                    ) : (
                        <RefundList
                            refunds={paginatedRefunds}
                            loading={loading}
                            onViewDetail={(r: RefundResponse) => {
                                setSelectedRefund(r);
                                setShowConfirmModal(true);
                            }}
                            onConfirm={handleConfirm}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            onFilterChange={() => {}}
                            renderActions={(refund: RefundResponse) => (
                                <RefundActionButtons
                                    refund={refund}
                                    onProcessing={handleProcessing}
                                    onConfirm={handleConfirm}
                                    onFail={handleFail}
                                    onCancel={handleCancel}
                                    onRetry={handleRetry}
                                    loading={actionLoading === refund.id}
                                />
                            )}
                        />
                    )}
                </Card.Body>
            </Card>

            {/* Modals */}
            <ConfirmRefundModal
                show={showConfirmModal}
                refund={selectedRefund}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedRefund(null);
                }}
                onConfirm={confirmRefund}
                loading={actionLoading === selectedRefund?.id}
            />

            <ProcessingModal
                show={showProcessingModal}
                refund={selectedRefund}
                onClose={() => {
                    setShowProcessingModal(false);
                    setSelectedRefund(null);
                }}
                onConfirm={confirmProcessing}
                loading={actionLoading === selectedRefund?.id}
            />

            <FailModal
                show={showFailModal}
                refund={selectedRefund}
                onClose={() => {
                    setShowFailModal(false);
                    setSelectedRefund(null);
                }}
                onConfirm={confirmFail}
                loading={actionLoading === selectedRefund?.id}
            />

            <CancelModal
                show={showCancelModal}
                refund={selectedRefund}
                onClose={() => {
                    setShowCancelModal(false);
                    setSelectedRefund(null);
                }}
                onConfirm={confirmCancel}
                loading={actionLoading === selectedRefund?.id}
            />

            <RetryModal
                show={showRetryModal}
                refund={selectedRefund}
                onClose={() => {
                    setShowRetryModal(false);
                    setSelectedRefund(null);
                }}
                onConfirm={confirmRetry}
                loading={actionLoading === selectedRefund?.id}
            />
        </Container>
    );
};

export default AdminRefundPage;