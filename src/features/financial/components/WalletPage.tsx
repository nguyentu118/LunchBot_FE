import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import {  CreditCard, History, AlertTriangle, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { financialService } from '../services/financialService';

import { WithdrawalCreateDTO, WithdrawalRequest } from '../types/financial.types';
import {merchantService} from "../../merchants/services/merchantService.ts";

const WalletPage: React.FC = () => {
    // Data State
    const [balance, setBalance] = useState<number>(0);
    const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number>(0);
    const [revenueTotal, setRevenueTotal] = useState<number>(0); // Để check điều kiện thanh lý
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showLiquidateModal, setShowLiquidateModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState<WithdrawalCreateDTO>({
        amount: 0,
        bankName: '',
        bankAccountNumber: '',
        bankAccountHolder: ''
    });

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profile, historyData] = await Promise.all([
                merchantService.getMyProfile(),
                financialService.getHistory()
            ]);
            setBalance(profile.currentBalance || 0);
            setCurrentMonthRevenue(profile.currentMonthRevenue || 0);
            setRevenueTotal((profile as any).revenueTotal || 0); // Ép kiểu tạm nếu chưa update type
            setHistory(historyData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit Rút tiền
    const handleWithdraw = async () => {
        if (formData.amount < 50000) {
            toast.error("Số tiền rút tối thiểu là 50.000đ");
            return;
        }
        if (formData.amount > balance) {
            toast.error("Số dư không đủ!");
            return;
        }

        try {
            await financialService.requestWithdrawal(formData);
            toast.success("Yêu cầu rút tiền thành công!");
            setShowWithdrawModal(false);
            fetchData(); // Reload balance & history
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi rút tiền");
        }
    };

    // Submit Thanh lý
    const handleLiquidate = async () => {
        try {
            // Thanh lý thì amount trong DTO chỉ là dummy, BE sẽ lấy hết balance
            await financialService.liquidateContract({ ...formData, amount: balance });
            toast.success("Đã gửi yêu cầu thanh lý. Tài khoản đang được xử lý khóa.");
            setShowLiquidateModal(false);
            window.location.reload(); // Reload để logout hoặc hiện trạng thái locked
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi thanh lý");
        }
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge bg="success">Thành công</Badge>;
            case 'REJECTED': return <Badge bg="danger">Từ chối</Badge>;
            default: return <Badge bg="warning" text="dark">Đang xử lý</Badge>;
        }
    };
    return (
        <div className="container-fluid p-0">
            <style>{`
                .btn-glass-hover {
                    color: white !important;
                    border: 1px solid rgba(255, 255, 255, 0.8) !important;
                    background: transparent !important;
                    transition: all 0.2s ease;
                }
                .btn-glass-hover:hover {
                    background: rgba(255, 255, 255, 0.15) !important; /* Màu trắng mờ 15% */
                    border-color: white !important;
                    color: white !important; /* Giữ chữ màu trắng */
                }
            `}</style>
            <h4 className="fw-bold mb-4 text-secondary">Ví Tiền & Tài Chính</h4>

            {/* 1. Card Số dư */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card className="border-0 shadow-sm bg-primary text-white h-100" style={{ background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)' }}>
                        <Card.Body className="p-4 d-flex flex-column justify-content-between">
                            <div>
                                <h6 className="opacity-75 mb-2">Số dư khả dụng</h6>
                                <h2 className="display-4 fw-bold mb-0">{formatCurrency(balance)}</h2>
                            </div>
                            <div className="mt-4 d-flex gap-3">
                                <Button variant="light" className="text-primary fw-bold px-4" onClick={() => setShowWithdrawModal(true)}>
                                    <CreditCard size={18} className="me-2"/> Rút tiền
                                </Button>
                                <Button
                                    // Bỏ variant="outline-light" đi để tránh style mặc định của Bootstrap
                                    className="btn-glass-hover fw-bold px-4"
                                    onClick={() => setShowLiquidateModal(true)}
                                >
                                    <Ban size={18} className="me-2"/> Thanh lý hợp đồng
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="fw-bold mb-3 text-muted">Thông tin nhanh</h6>
                            <ul className="list-unstyled small text-muted">
                                <li className="mb-2">✓ Rút tối thiểu: 50.000đ</li>
                                <li className="mb-2">✓ Thời gian xử lý: 24h làm việc</li>
                                <li className="mb-2">✓ Phí giao dịch: Miễn phí</li>
                            </ul>
                            <hr/>
                            <Alert variant="warning" className="small mb-0">
                                <AlertTriangle size={14} className="me-1"/>
                                Điều kiện thanh lý: Doanh thu tổng {'>'} 100tr
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 2. Lịch sử giao dịch */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3">
                    <h6 className="mb-0 fw-bold"><History size={18} className="me-2"/> Lịch sử giao dịch</h6>
                </Card.Header>
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                    <tr>
                        <th>Mã GD</th>
                        <th>Ngày yêu cầu</th>
                        <th>Số tiền</th>
                        <th>Thông tin nhận tiền</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú Admin</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? <tr><td colSpan={5} className="text-center py-4"><Spinner size="sm" animation="border"/></td></tr> :
                        history.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-muted">Chưa có giao dịch nào</td></tr> :
                            history.map((item) => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>{new Date(item.requestedAt).toLocaleString('vi-VN')}</td>
                                    <td className="fw-bold">{formatCurrency(item.amount)}</td>
                                    <td>
                                        <div className="small fw-bold">{item.merchant?.bankName}</div>
                                        <div className="small text-muted">{item.merchant?.bankAccountNumber}</div>
                                        <div className="small text-muted" style={{fontSize: '0.75rem'}}>
                                            {item.merchant?.bankAccountHolder}
                                        </div>
                                    </td>
                                    <td>{renderStatusBadge(item.status)}</td>
                                    <td className="small text-muted">{item.adminNotes || '-'}</td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Card>

            {/* MODAL RÚT TIỀN */}
            <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Yêu cầu Rút tiền</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Số tiền muốn rút (VNĐ)</Form.Label>
                            <Form.Control type="number" name="amount" value={formData.amount} onChange={handleInputChange} />
                            <Form.Text className="text-muted">Tối đa: {formatCurrency(balance)}</Form.Text>
                        </Form.Group>
                        <h6 className="mt-4 mb-3">Thông tin nhận tiền</h6>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngân hàng</Form.Label>
                            <Form.Control type="text" name="bankName" placeholder="VD: Vietcombank" value={formData.bankName} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số tài khoản</Form.Label>
                            <Form.Control type="text" name="bankAccountNumber" placeholder="VD: 123456789" value={formData.bankAccountNumber} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Chủ tài khoản (In hoa không dấu)</Form.Label>
                            <Form.Control type="text" name="bankAccountHolder" placeholder="VD: NGUYEN VAN A" value={formData.bankAccountHolder} onChange={handleInputChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleWithdraw}>Xác nhận rút</Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL THANH LÝ */}
            <Modal show={showLiquidateModal} onHide={() => setShowLiquidateModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>⚠️ Thanh lý Hợp đồng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger">
                        Hành động này sẽ <strong>KHÓA VĨNH VIỄN</strong> tài khoản của bạn và rút toàn bộ số dư còn lại ({formatCurrency(balance)}).
                    </Alert>

                    {currentMonthRevenue < 100000000 ? (
                        <Alert variant="warning">
                            Bạn chưa đủ điều kiện thanh lý (Doanh thu <strong>tháng này</strong> phải {'>'} 100tr).
                            <br/>Hiện tại: <strong>{formatCurrency(currentMonthRevenue)}</strong>
                            <br/><small className="text-muted">(Tổng tích lũy: {formatCurrency(revenueTotal)})</small>
                        </Alert>
                    ) : (
                        <p>Vui lòng nhập thông tin tài khoản...</p>
                    )}

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngân hàng</Form.Label>
                            <Form.Control type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} disabled={revenueTotal < 100000000} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số tài khoản</Form.Label>
                            <Form.Control type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} disabled={revenueTotal < 100000000} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Chủ tài khoản</Form.Label>
                            <Form.Control type="text" name="bankAccountHolder" value={formData.bankAccountHolder} onChange={handleInputChange} disabled={revenueTotal < 100000000} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLiquidateModal(false)}>Đóng</Button>
                    <Button variant="danger" onClick={handleLiquidate} disabled={revenueTotal < 100000000}>
                        Xác nhận Thanh lý
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WalletPage;