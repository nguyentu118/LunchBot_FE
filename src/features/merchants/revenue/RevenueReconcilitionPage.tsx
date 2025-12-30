import React, { useState, useEffect } from 'react';
import { Alert, Spinner, Button, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import {Send, CheckCircle, AlertCircle, AlertTriangle} from 'lucide-react';
import { MonthSelector } from './MonthSelector';
import { RevenueSummary } from './RevenueSummary';
import { OrderDetailsTable } from './OrderDetailsTable';
import { ReconciliationHistoryTable } from './ReconciliationHistoryTable';
import {MonthlyRevenueResponse, ReconciliationRequestResponse} from '../types/revenue.types';
import { revenueService } from '../services/revenueService';
import toast from 'react-hot-toast';


import { NotificationType } from '../../notification/types/notification.types';
import { useNotifications } from '../../notification/hooks/useNotifications';
import {ExportRevenueReport} from "./ExportRevenueReport.tsx";

const RevenueReconciliationPage: React.FC = () => {
    // --- STATE ---
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    });

    const [data, setData] = useState<MonthlyRevenueResponse | null>(null);
    const [history, setHistory] = useState<ReconciliationRequestResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);
    const [merchantNotes, setMerchantNotes] = useState('');
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimReason, setClaimReason] = useState('');
    const [submittingClaim, setSubmittingClaim] = useState(false);
    const [claimExcelFile, setClaimExcelFile] = useState<File | null>(null);

    // ✅ Subscribe to notifications
    const userEmail = localStorage.getItem('userEmail') || '';
    const { notifications } = useNotifications(userEmail);

    // ✅ Auto-refresh khi nhận notification từ Admin
    useEffect(() => {
        // Lọc các notification về reconciliation
        const reconciliationNotifications = notifications.filter(n =>
            n.type === NotificationType.RECONCILIATION_REQUEST_APPROVED ||
            n.type === NotificationType.RECONCILIATION_REQUEST_REJECTED
        );

        // Nếu có notification mới từ Admin → Auto refresh
        if (reconciliationNotifications.length > 0) {
            const latestNotification = reconciliationNotifications[0];

            // Refresh data
            fetchData();

            // Show toast notification
            if (latestNotification.type === NotificationType.RECONCILIATION_REQUEST_APPROVED) {
                toast.success('🎉 Yêu cầu đối soát đã được phê duyệt!');
            } else if (latestNotification.type === NotificationType.RECONCILIATION_REQUEST_REJECTED) {
                toast.error('⚠️ Yêu cầu đối soát đã bị từ chối. Vui lòng xem chi tiết.');
            }
        }
    }, [notifications]);

    // --- FETCH DATA ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const [revenueData, historyData] = await Promise.all([
                revenueService.getMonthReconciliation(selectedMonth),
                revenueService.getHistory()
            ]);

            setData(revenueData);
            setHistory(historyData);
        } catch (err: any) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    // --- LOGIC CHECK TRẠNG THÁI ---
    const currentMonthRequest = history.find(req => req.yearMonth === selectedMonth);
    const isSubmitted = !!currentMonthRequest;

    // --- HANDLERS ---
    const handleSubmitRequest = async () => {
        if (!data) return;

        try {
            setSubmitting(true);
            await revenueService.createReconciliationRequest({
                yearMonth: selectedMonth,
                merchantNotes: merchantNotes
            });

            toast.success(`Đã gửi yêu cầu đối soát tháng ${selectedMonth}`);
            setShowModal(false);
            setMerchantNotes('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitClaim = async () => {
        if (!claimReason.trim()) {
            toast.error("Vui lòng nhập lý do sai sót/khiếu nại!");
            return;
        }

        try {
            setSubmittingClaim(true);

            // Nếu chưa có file Excel, tự động download rồi gửi
            let fileToSend = claimExcelFile;

            if (!fileToSend) {
                // Auto download file Excel
                const blob = await revenueService.exportRevenueReportToExcel(selectedMonth);
                fileToSend = new File(
                    [blob],
                    `BaoCao_DoanhThu_${selectedMonth}.xlsx`,
                    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
                );
            }

            // Gửi claim kèm file
            const formData = new FormData();
            formData.append('yearMonth', selectedMonth);
            formData.append('reason', claimReason);
            if (fileToSend) {
                formData.append('excelFile', fileToSend);
            }

            await revenueService.submitClaimWithFile(formData);

            toast.success(`Đã gửi báo cáo sai sót tháng ${selectedMonth} kèm file Excel`);
            setShowClaimModal(false);
            setClaimReason('');
            setClaimExcelFile(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi báo cáo");
        } finally {
            setSubmittingClaim(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <h4 className="fw-bold mb-4 text-secondary">Đối Soát Doanh Thu</h4>

            <Tabs defaultActiveKey="overview" id="reconciliation-tabs" className="mb-4">
                <Tab eventKey="overview" title="Báo cáo tháng">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />

                        {!loading && data && (
                            <div className="d-flex flex-column gap-2">
                                {isSubmitted ? (
                                    <div className="mb-3">
                                        <Alert
                                            variant={
                                                currentMonthRequest?.status === 'APPROVED' ? 'success' :
                                                    currentMonthRequest?.status === 'REJECTED' ? 'danger' :
                                                        currentMonthRequest?.status === 'REPORTED' ? 'warning' : 'info'
                                            }
                                            className="mb-2 py-2 px-3"
                                        >
                                            <div className="d-flex justify-content-between align-items-center w-100">
                                                <div className="d-flex align-items-center gap-2">
                                                    {currentMonthRequest?.status === 'APPROVED' ? <CheckCircle size={18}/> :
                                                        currentMonthRequest?.status === 'REPORTED' ? <AlertTriangle size={18}/> :
                                                            <AlertCircle size={18}/>}

                                                    <strong>{currentMonthRequest?.statusDisplay}</strong>
                                                    <span className="text-muted mx-1">|</span>
                                                    <small className="text-muted">
                                                        Gửi lúc: {new Date(currentMonthRequest?.createdAt || '').toLocaleDateString('vi-VN')}
                                                    </small>
                                                </div>

                                                {currentMonthRequest?.status === 'REJECTED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        className="bg-white text-danger fw-bold border-danger ms-3"
                                                        style={{ whiteSpace: 'nowrap' }}
                                                        onClick={() => {
                                                            setClaimReason('');
                                                            setShowClaimModal(true);
                                                        }}
                                                    >
                                                        Xem lý do & Gửi lại
                                                    </Button>
                                                )}
                                            </div>
                                        </Alert>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2 flex-wrap">
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => setShowClaimModal(true)}
                                            disabled={data.totalOrders === 0}
                                        >
                                            <AlertTriangle size={18} className="me-2" />
                                            Báo cáo sai sót
                                        </Button>

                                        <Button
                                            variant="primary"
                                            onClick={() => setShowModal(true)}
                                            disabled={data.totalOrders === 0}
                                        >
                                            <Send size={18} className="me-2" />
                                            Xác nhận doanh thu
                                        </Button>
                                        <ExportRevenueReport
                                            yearMonth={selectedMonth}
                                            disabled={data.totalOrders === 0}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}

                    {!loading && data && (
                        <>
                            <RevenueSummary
                                totalOrders={data.totalOrders}
                                totalGrossRevenue={data.totalGrossRevenue}
                                platformCommissionRate={data.platformCommissionRate}
                                totalPlatformFee={data.totalPlatformFee}
                                netRevenue={data.netRevenue}
                            />
                            <OrderDetailsTable orders={data.orderDetails} />
                        </>
                    )}
                </Tab>

                <Tab eventKey="history" title="Lịch sử yêu cầu">
                    <ReconciliationHistoryTable history={history} />
                </Tab>
            </Tabs>

            {/* MODAL XÁC NHẬN */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận đối soát {selectedMonth}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn đang gửi yêu cầu đối soát doanh thu cho tháng <strong>{selectedMonth}</strong>.</p>
                    <div className="bg-light p-3 rounded mb-3">
                        <div className="d-flex justify-content-between mb-1">
                            <span>Tổng đơn:</span>
                            <strong>{data?.totalOrders}</strong>
                        </div>
                        <div className="d-flex justify-content-between text-success fw-bold">
                            <span>Thực nhận:</span>
                            <span>{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(data?.netRevenue || 0)}</span>
                        </div>
                    </div>

                    <Form.Group>
                        <Form.Label>Ghi chú cho Admin (nếu có):</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ví dụ: Đã kiểm tra đủ đơn, vui lòng duyệt..."
                            value={merchantNotes}
                            onChange={(e) => setMerchantNotes(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                    >
                        {submitting ? <Spinner size="sm" animation="border"/> : 'Xác nhận gửi'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL BÁO CÁO SAI SÓT */}
            <Modal show={showClaimModal} onHide={() => setShowClaimModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-danger-subtle text-danger">
                    <Modal.Title className="fs-5 fw-bold">
                        <AlertTriangle size={20} className="me-2" />
                        Báo cáo sai sót tháng {selectedMonth}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentMonthRequest?.status === 'REJECTED' && currentMonthRequest.rejectionReason && (
                        <Alert variant="danger" className="mb-3 border-danger">
                            <h6 className="fw-bold d-flex align-items-center gap-2">
                                <AlertCircle size={16}/>
                                Admin đã từ chối yêu cầu trước đó:
                            </h6>
                            <p className="mb-0 small fst-italic">
                                "{currentMonthRequest.rejectionReason}"
                            </p>
                        </Alert>
                    )}
                    <Alert variant="warning" className="small">
                        Lưu ý: Admin sẽ kiểm tra dựa trên thông tin báo cáo bạn cung cấp.
                        Vui lòng ghi rõ mã đơn hàng hoặc số tiền bị sai lệch.
                    </Alert>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Mô tả sai sót / Lý do <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Ví dụ: Tôi thấy tổng doanh thu thiếu 500k so với thực tế, đơn hàng #ORD-20241224-001 chưa được tính..."
                            value={claimReason}
                            onChange={(e) => setClaimReason(e.target.value)}
                            required
                            className="border-danger"
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-semibold">Tập tin báo cáo Excel (Tùy chọn)</Form.Label>
                        <div className="alert alert-info small p-2 mb-2">
                            💡 Nếu bạn không upload file, hệ thống sẽ tự động gửi kèm báo cáo Excel của tháng này.
                        </div>
                        <Form.Control
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                const input = e.target as HTMLInputElement;
                                const file = input.files?.[0];
                                if (file) {
                                    // Kiểm tra file size (tối đa 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                        toast.error('File quá lớn! Tối đa 5MB');
                                        return;
                                    }
                                    setClaimExcelFile(file);
                                    toast.success(`✅ Đã chọn file: ${file.name}`);
                                }
                            }}
                        />
                        {claimExcelFile && (
                            <small className="text-success d-block mt-2">
                                ✓ File đã chọn: <strong>{claimExcelFile.name}</strong> ({(claimExcelFile.size / 1024).toFixed(2)} KB)
                            </small>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowClaimModal(false);
                        setClaimExcelFile(null);
                    }}>
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleSubmitClaim}
                        disabled={submittingClaim || !claimReason.trim()}
                    >
                        {submittingClaim ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2"/>
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi báo cáo'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RevenueReconciliationPage;