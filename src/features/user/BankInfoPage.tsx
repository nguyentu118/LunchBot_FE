// src/features/user/pages/BankInfoPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Spinner} from 'react-bootstrap';
import { ArrowLeft, Banknote, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import {BankInfo, UpdateBankInfoRequest} from "./types/user.type.ts";
import {UserApiService} from "./services/UserApi.service.ts";


// Danh sách ngân hàng phổ biến ở Việt Nam
const VIETNAM_BANKS = [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'MBB', name: 'MB Bank' },
    { code: 'ACB', name: 'ACB (Á Châu)' },
    { code: 'BID', name: 'BIDV' },
    { code: 'STB', name: 'Sacombank' },
    { code: 'HDB', name: 'HDBank' },
    { code: 'LPB', name: 'LPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'OCB', name: 'OCB' },
    { code: 'VIB', name: 'VIB' },
    { code: 'EXB', name: 'Eximbank' },
    { code: 'SHB', name: 'SHB' },
    { code: 'PGB', name: 'PG Bank' },
    { code: 'CBB', name: 'CBB' },
    { code: 'IVB', name: 'IBVB' },
    { code: 'SCB', name: 'Southern Bank' },
    { code: 'MSB', name: 'MSB' },
    { code: 'BAB', name: 'BaoViet Bank' },
    { code: 'KLB', name: 'Kienlongbank' },
    { code: 'NHB', name: 'Nonghyup Bank' },
    { code: 'ABB', name: 'ABBank' },
    { code: 'NAB', name: 'Nam A Bank' },
    { code: 'UNB', name: 'United International Bank' },
    { code: 'EIB', name: 'VietABank' },
    { code: 'GPB', name: 'Geleximbank' },
    { code: 'SEC', name: 'SeABank' },
    { code: 'PVB', name: 'PVcomBank' },
    { code: 'WVB', name: 'Woori Bank' },
    { code: 'OTHER', name: 'Ngân hàng khác' },
];

const BankInfoPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [formData, setFormData] = useState<UpdateBankInfoRequest>({
        bankAccountNumber: '',
        bankName: '',
        bankAccountName: '',
        bankBranch: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [customBankName, setCustomBankName] = useState(''); // Cho ngân hàng khác

    // Lấy thông tin ngân hàng ban đầu
    useEffect(() => {
        fetchBankInfo();
    }, []);

    const fetchBankInfo = async () => {
        try {
            setFetching(true);
            const data = await UserApiService.getBankInfo();
            setBankInfo(data);

            // Populate form nếu đã có thông tin
            if (data.hasBankInfo) {
                setFormData({
                    bankAccountNumber: data.bankAccountNumber || '',
                    bankName: data.bankName || '',
                    bankAccountName: data.bankAccountName || '',
                    bankBranch: data.bankBranch || '',
                });
            }
        } catch (error) {
            console.error("Error fetching bank info:", error);
        } finally {
            setFetching(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Kiểm tra số tài khoản
        if (!formData.bankAccountNumber.trim()) {
            newErrors.bankAccountNumber = "Số tài khoản không được để trống";
        } else if (!/^\d{8,20}$/.test(formData.bankAccountNumber)) {
            newErrors.bankAccountNumber = "Số tài khoản phải từ 8-20 chữ số";
        }

        // Kiểm tra tên ngân hàng
        if (!formData.bankName.trim()) {
            newErrors.bankName = "Tên ngân hàng không được để trống";
        } else if (formData.bankName.length > 100) {
            newErrors.bankName = "Tên ngân hàng tối đa 100 ký tự";
        }

        // Kiểm tra tên chủ tài khoản
        if (!formData.bankAccountName.trim()) {
            newErrors.bankAccountName = "Tên chủ tài khoản không được để trống";
        } else if (formData.bankAccountName.length > 100) {
            newErrors.bankAccountName = "Tên chủ tài khoản tối đa 100 ký tự";
        } else if (!/^[A-Z\s]+$/.test(formData.bankAccountName)) {
            newErrors.bankAccountName = "Tên chủ tài khoản phải viết HOA, không dấu";
        }

        // Kiểm tra chi nhánh (nếu có)
        if (formData.bankBranch && formData.bankBranch.length > 100) {
            newErrors.bankBranch = "Tên chi nhánh tối đa 100 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        if (errors.bankName) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.bankName;
                return newErrors;
            });
        }

        if (selectedValue === 'OTHER') {
            // Nếu chọn "Ngân hàng khác", để trống và cho user nhập
            setFormData(prev => ({
                ...prev,
                bankName: ''
            }));
            setCustomBankName('');
        } else {
            // Chọn ngân hàng từ danh sách
            const selected = VIETNAM_BANKS.find(bank => bank.code === selectedValue);
            if (selected) {
                setFormData(prev => ({
                    ...prev,
                    bankName: selected.name
                }));
                setCustomBankName('');
            }
        }
    };

    const handleCustomBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomBankName(value);
        setFormData(prev => ({
            ...prev,
            bankName: value
        }));

        if (errors.bankName) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.bankName;
                return newErrors;
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Xóa lỗi khi user bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Tự động chuyển sang chữ HOA cho tên chủ tài khoản
        if (name === 'bankAccountName') {
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        try {
            setLoading(true);
            await UserApiService.updateBankInfo(formData);

            toast.success("Cập nhật thông tin ngân hàng thành công!");
            fetchBankInfo();
        } catch (error: any) {
            console.error("Error updating bank info:", error);
            const message = error.response?.data?.message || error.message || "Cập nhật thất bại";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa thông tin ngân hàng?")) {
            return;
        }

        try {
            setLoading(true);
            await UserApiService.deleteBankInfo();

            toast.success("Đã xóa thông tin ngân hàng");
            setFormData({
                bankAccountNumber: '',
                bankName: '',
                bankAccountName: '',
                bankBranch: '',
            });
            setCustomBankName('');
            setBankInfo(null);
        } catch (error: any) {
            console.error("Error deleting bank info:", error);
            const message = error.response?.data?.message || error.message || "Xóa thất bại";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Determine selected bank for dropdown
    const getSelectedBankCode = () => {
        const bankName = formData.bankName;
        const found = VIETNAM_BANKS.find(bank => bank.name === bankName);
        return found ? found.code : 'OTHER';
    };

    if (fetching) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ height: '60vh' }}>
                <Spinner animation="border" role="status" className="text-primary">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="light"
                    className="me-3 p-2"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                </Button>
                <div className="d-flex align-items-center">
                    <Banknote size={28} className="text-primary me-3" />
                    <div>
                        <h2 className="mb-0 fw-bold">Thông tin Ngân hàng</h2>
                        <p className="text-muted small mb-0">Quản lý thông tin tài khoản ngân hàng của bạn</p>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <Card className="border-0 shadow-sm mb-4 bg-light">
                <Card.Body>
                    <p className="text-muted small mb-0">
                        ℹ️ Thông tin ngân hàng được sử dụng để nhận hoàn tiền và chuyển tiền.
                        Vui lòng đảm bảo thông tin chính xác.
                    </p>
                </Card.Body>
            </Card>

            {/* Form */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        {/* Số tài khoản */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">
                                Số tài khoản <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="bankAccountNumber"
                                value={formData.bankAccountNumber}
                                onChange={handleInputChange}
                                placeholder="VD: 1234567890"
                                isInvalid={!!errors.bankAccountNumber}
                                disabled={loading}
                                className="form-control-lg"
                            />
                            {errors.bankAccountNumber && (
                                <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                    {errors.bankAccountNumber}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Tên ngân hàng - Dropdown */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">
                                Tên Ngân hàng <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                value={getSelectedBankCode()}
                                onChange={handleBankSelect}
                                disabled={loading}
                                className="form-control-lg"
                            >
                                <option value="">-- Chọn ngân hàng --</option>
                                {VIETNAM_BANKS.map(bank => (
                                    <option key={bank.code} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </Form.Select>
                            {errors.bankName && (
                                <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                    {errors.bankName}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Input ngân hàng khác (nếu chọn OTHER) */}
                        {getSelectedBankCode() === 'OTHER' && (
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">
                                    Nhập tên ngân hàng <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customBankName}
                                    onChange={handleCustomBankChange}
                                    placeholder="VD: Ngân hàng XYZ"
                                    isInvalid={!!errors.bankName}
                                    disabled={loading}
                                    className="form-control-lg"
                                />
                                {errors.bankName && (
                                    <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                        {errors.bankName}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        )}

                        {/* Tên chủ tài khoản */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">
                                Tên Chủ tài khoản <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="bankAccountName"
                                value={formData.bankAccountName}
                                onChange={handleInputChange}
                                placeholder="VD: NGUYEN VAN A (CHỮ HOA, KHÔNG DẤU)"
                                isInvalid={!!errors.bankAccountName}
                                disabled={loading}
                                className="form-control-lg text-uppercase"
                            />
                            <Form.Text className="text-muted d-block mt-2">
                                💡 Tên phải viết HOA, không có dấu. VD: NGUYEN VAN A (không: Nguyễn Văn A)
                            </Form.Text>
                            {errors.bankAccountName && (
                                <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                    {errors.bankAccountName}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Chi nhánh */}
                        <Form.Group className="mb-5">
                            <Form.Label className="fw-bold">
                                Chi nhánh (Tùy chọn)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="bankBranch"
                                value={formData.bankBranch}
                                onChange={handleInputChange}
                                placeholder="VD: CN Hà Nội, Chi nhánh TP.HCM"
                                isInvalid={!!errors.bankBranch}
                                disabled={loading}
                                className="form-control-lg"
                            />
                            {errors.bankBranch && (
                                <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                    {errors.bankBranch}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 justify-content-between">
                            <Button
                                variant="outline-danger"
                                className="px-4"
                                onClick={handleDelete}
                                disabled={loading || !bankInfo?.hasBankInfo}
                            >
                                <Trash2 size={18} className="me-2" />
                                Xóa thông tin
                            </Button>

                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    className="px-5"
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="px-5"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} className="me-2" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default BankInfoPage;