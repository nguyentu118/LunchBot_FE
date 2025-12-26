import React, { useState, useEffect } from 'react';
import { Alert, Spinner, Button, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import {Send, CheckCircle, AlertCircle, AlertTriangle} from 'lucide-react'; // Import thêm icon
import { MonthSelector } from './MonthSelector';
import { RevenueSummary } from './RevenueSummary';
import { OrderDetailsTable } from './OrderDetailsTable';
import { ReconciliationHistoryTable } from './ReconciliationHistoryTable'; // Import Component mới
import {MonthlyRevenueResponse, ReconciliationRequestResponse} from '../types/revenue.types.ts';
import { revenueService, } from '../services/revenueService.ts';
import toast from 'react-hot-toast'; // Giả sử bạn có dùng toast, nếu không dùng alert thường

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

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [merchantNotes, setMerchantNotes] = useState('');

    // --- STATE MỚI CHO CLAIM ---
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimReason, setClaimReason] = useState('');
    const [submittingClaim, setSubmittingClaim] = useState(false);

    // --- FETCH DATA ---
    const fetchData = async () => {
        try {
            setLoading(true);
            // Gọi song song cả lấy số liệu tháng và lịch sử để check trạng thái
            const [revenueData, historyData] = await Promise.all([
                revenueService.getMonthReconciliation(selectedMonth),
                revenueService.getHistory()
            ]);

            setData(revenueData);
            setHistory(historyData);
        } catch (err: any) {
            console.error('Error:', err);
            // Handle error logic here
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    // --- LOGIC CHECK TRẠNG THÁI ---
    // Kiểm tra xem tháng đang chọn đã được gửi yêu cầu chưa
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

            // Refresh lại dữ liệu để cập nhật trạng thái
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };
    // --- HANDLER MỚI: Gửi Claim ---
    const handleSubmitClaim = async () => {
        // Validate bắt buộc nhập lý do
        if (!claimReason.trim()) {
            toast.error("Vui lòng nhập lý do sai sót/khiếu nại!");
            return;
        }

        try {
            setSubmittingClaim(true);
            await revenueService.submitClaim({
                yearMonth: selectedMonth,
                reason: claimReason
            });

            toast.success(`Đã gửi báo cáo sai sót tháng ${selectedMonth}`);
            setShowClaimModal(false);
            setClaimReason('');
            fetchData(); // Refresh lại dữ liệu
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

                {/* TAB 1: TỔNG QUAN & GỬI YÊU CẦU */}
                <Tab eventKey="overview" title="Báo cáo tháng">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />

                        {/* Logic hiển thị nút bấm hoặc trạng thái */}
                        {!loading && data && (
                            <div>
                                {isSubmitted ? (
                                        <div className="mb-3">
                                            <Alert variant={
                                                currentMonthRequest?.status === 'APPROVED' ? 'success' :
                                                    currentMonthRequest?.status === 'REJECTED' ? 'danger' :
                                                        currentMonthRequest?.status === 'REPORTED' ? 'warning' : 'info'
                                            } className="mb-0 py-2 px-3 d-flex align-items-center gap-2">
                                                {currentMonthRequest?.status === 'APPROVED' ? <CheckCircle size={18}/> :
                                                    currentMonthRequest?.status === 'REPORTED' ? <AlertTriangle size={18}/> :
                                                        <AlertCircle size={18}/>}
                                                <strong>{currentMonthRequest?.statusDisplay}</strong>
                                                <small>(Ngày gửi: {new Date(currentMonthRequest?.createdAt || '').toLocaleDateString('vi-VN')})</small>
                                            </Alert>
                                            {currentMonthRequest?.status === 'REJECTED' && (
                                                <div className="bg-danger bg-opacity-10 border border-danger rounded p-3 text-danger">
                                                    <h6 className="fw-bold mb-1">❌ Phản hồi từ Admin:</h6>
                                                    <p className="mb-0">
                                                        "{currentMonthRequest.rejectionReason || 'Không có lý do cụ thể.'}"
                                                    </p>
                                                    <div className="mt-2 small text-muted">
                                                        Vui lòng kiểm tra lại số liệu. Nếu bạn vẫn không đồng ý, hãy liên hệ trực tiếp tổng đài.
                                                    </div>

                                                    {/* Tùy chọn: Cho phép gửi lại yêu cầu (Nếu nghiệp vụ cho phép) */}
                                                    <div className="mt-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => setShowClaimModal(true)} // Cho phép khiếu nại lại
                                                        >
                                                            Gửi khiếu nại khác
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {currentMonthRequest?.status === 'REPORTED' && (
                                                <div className="bg-warning bg-opacity-10 border border-warning rounded p-2 text-dark small mt-2">
                                                    <strong>Bạn đã báo cáo: </strong> "{currentMonthRequest.merchantNotes}"
                                                </div>
                                            )}
                                        </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        {/* Nút Báo cáo sai sót (Mới) */}
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => setShowClaimModal(true)}
                                            disabled={data.totalOrders === 0}
                                        >
                                            <AlertTriangle size={18} className="me-2" />
                                            Báo cáo sai sót
                                        </Button>

                                        {/* Nút Xác nhận (Cũ) */}
                                        <Button
                                            variant="primary"
                                            onClick={() => setShowModal(true)} // showModal là của Confirm
                                            disabled={data.totalOrders === 0}
                                        >
                                            <Send size={18} className="me-2" />
                                            Xác nhận doanh thu
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Loading & Error Display (Giữ nguyên logic cũ của bạn) */}
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

                {/* TAB 2: LỊCH SỬ */}
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
            <Modal show={showClaimModal} onHide={() => setShowClaimModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-danger-subtle text-danger">
                    <Modal.Title className="fs-5 fw-bold">
                        <AlertTriangle size={20} className="me-2" />
                        Báo cáo sai sót tháng {selectedMonth}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning" className="small">
                        Lưu ý: Bạn đang khiếu nại về số liệu doanh thu. Admin sẽ kiểm tra và phản hồi lại.
                        Vui lòng cung cấp chi tiết lỗi sai (Ví dụ: Thiếu đơn hàng #123...).
                    </Alert>

                    <Form.Group>
                        <Form.Label className="fw-semibold">Mô tả sai sót / Lý do <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Ví dụ: Tôi thấy tổng doanh thu thiếu 500k so với thực tế, đơn hàng #DH001 chưa được tính..."
                            value={claimReason}
                            onChange={(e) => setClaimReason(e.target.value)}
                            required
                            className="border-danger" // Viền đỏ để nhấn mạnh
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClaimModal(false)}>Hủy bỏ</Button>
                    <Button
                        variant="danger"
                        onClick={handleSubmitClaim}
                        disabled={submittingClaim || !claimReason.trim()} // Disable nếu chưa nhập lý do
                    >
                        {submittingClaim ? <Spinner size="sm" animation="border"/> : 'Gửi báo cáo'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RevenueReconciliationPage;