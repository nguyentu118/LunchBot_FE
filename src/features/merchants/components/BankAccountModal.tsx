// src/features/merchants/components/BankAccountModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { CreditCard, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../config/axiosConfig';

interface BankAccountData {
    merchantId?: number;
    restaurantName?: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    hasLinkedBank: boolean;
}

interface BankAccountModalProps {
    show: boolean;
    onHide: () => void;
}

const VIETNAM_BANKS = [
    "Vietcombank",
    "VietinBank",
    "BIDV",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "VPBank",
    "TPBank",
    "HDBank",
    "Sacombank",
    "VIB",
    "SHB",
    "SeABank",
    "OCB",
    "LienVietPostBank",
    "MSB",
    "VietCapitalBank",
    "SCB",
    "Bac A Bank",
    "ABBANK",
    "NCB",
    "PVcomBank",
    "Viet A Bank",
    "GPBank",
    "BaoViet Bank"
];

const BankAccountModal: React.FC<BankAccountModalProps> = ({ show, onHide }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bankData, setBankData] = useState<BankAccountData | null>(null);

    const [formData, setFormData] = useState({
        bankName: '',
        bankAccountNumber: '',
        bankAccountHolder: ''
    });

    // Fetch dữ liệu khi mở modal
    useEffect(() => {
        if (show) {
            fetchBankAccount();
        }
    }, [show]);

    const fetchBankAccount = async () => {
        setFetching(true);
        setError(null);

        try {
            const response = await axiosInstance.get<BankAccountData>('/merchants/bank-account');
            setBankData(response.data);

            // Nếu đã có tài khoản, fill vào form
            if (response.data.hasLinkedBank) {
                setFormData({
                    bankName: response.data.bankName || '',
                    bankAccountNumber: response.data.bankAccountNumber || '',
                    bankAccountHolder: response.data.bankAccountHolder || ''
                });
            }
        } catch (err: any) {
            console.error('Lỗi khi tải thông tin ngân hàng:', err);
            const errorMsg = err.response?.data?.message || 'Không thể tải thông tin ngân hàng';
            setError(errorMsg);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Tự động viết hoa tên chủ tài khoản
        if (name === 'bankAccountHolder') {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.bankName) {
            setError('Vui lòng chọn ngân hàng');
            return false;
        }

        if (!formData.bankAccountNumber) {
            setError('Vui lòng nhập số tài khoản');
            return false;
        }

        // Validate số tài khoản (9-19 chữ số)
        if (!/^[0-9]{9,19}$/.test(formData.bankAccountNumber)) {
            setError('Số tài khoản phải từ 9-19 chữ số');
            return false;
        }

        if (!formData.bankAccountHolder) {
            setError('Vui lòng nhập tên chủ tài khoản');
            return false;
        }

        // Validate tên chủ tài khoản (chỉ chữ HOA và khoảng trắng)
        if (!/^[A-Z\s]+$/.test(formData.bankAccountHolder)) {
            setError('Tên chủ tài khoản phải viết HOA không dấu (VD: NGUYEN VAN A)');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.put('/merchants/bank-account', formData);

            toast.success('Cập nhật tài khoản ngân hàng thành công!');
            fetchBankAccount(); // Refresh data

        } catch (err: any) {
            console.error('Lỗi khi cập nhật:', err);
            const errorMsg = err.response?.data?.message || 'Không thể cập nhật tài khoản ngân hàng';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa thông tin tài khoản ngân hàng?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axiosInstance.delete('/merchants/bank-account');

            toast.success('Đã xóa thông tin tài khoản ngân hàng');

            // Reset form
            setFormData({
                bankName: '',
                bankAccountNumber: '',
                bankAccountHolder: ''
            });

            fetchBankAccount(); // Refresh data

        } catch (err: any) {
            console.error('Lỗi khi xóa:', err);
            const errorMsg = err.response?.data?.message || 'Không thể xóa tài khoản ngân hàng';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <CreditCard size={24} className="text-primary" />
                    Tài khoản thanh toán
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Error Alert */}
                {error && (
                    <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {fetching ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status" className="mb-3">
                            <span className="visually-hidden">Đang tải...</span>
                        </Spinner>
                        <p className="text-muted">Đang tải thông tin tài khoản...</p>
                    </div>
                ) : (
                    <>
                        {/* Success Badge nếu đã liên kết */}
                        {bankData?.hasLinkedBank && (
                            <Alert variant="success" className="mb-4 d-flex align-items-center gap-2">
                                <CheckCircle size={20} />
                                <span>Đã liên kết tài khoản ngân hàng</span>
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            {/* Chọn ngân hàng */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Ngân hàng <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="py-2"
                                    style={{ borderRadius: '0.5rem' }}
                                >
                                    <option value="">-- Chọn ngân hàng --</option>
                                    {VIETNAM_BANKS.map((bank) => (
                                        <option key={bank} value={bank}>
                                            {bank}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Số tài khoản */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Số tài khoản <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bankAccountNumber"
                                    value={formData.bankAccountNumber}
                                    onChange={handleChange}
                                    placeholder="VD: 1234567890123"
                                    required
                                    disabled={loading}
                                    className="py-2"
                                    style={{ borderRadius: '0.5rem' }}
                                    maxLength={19}
                                />
                                <Form.Text muted>
                                    Nhập 9-19 chữ số
                                </Form.Text>
                            </Form.Group>

                            {/* Tên chủ tài khoản */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">
                                    Tên chủ tài khoản <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bankAccountHolder"
                                    value={formData.bankAccountHolder}
                                    onChange={handleChange}
                                    placeholder="VD: NGUYEN VAN A"
                                    required
                                    disabled={loading}
                                    className="py-2"
                                    style={{ borderRadius: '0.5rem', textTransform: 'uppercase' }}
                                />
                                <Form.Text muted>
                                    Tên phải viết HOA, không có dấu. VD: NGUYEN VAN A (không: Nguyễn Văn A)
                                </Form.Text>
                            </Form.Group>

                            {/* Warning Note */}
                            <Alert variant="warning" className="mb-0">
                                <small>
                                    <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin trước khi lưu.
                                    Tài khoản này sẽ được sử dụng để nhận tiền rút về.
                                </small>
                            </Alert>
                        </Form>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">

                <div className="ms-auto d-flex gap-2">
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Đóng
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || fetching}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Đang lưu...
                            </>
                        ) : (
                            bankData?.hasLinkedBank ? 'Cập nhật' : 'Lưu tài khoản'
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default BankAccountModal;