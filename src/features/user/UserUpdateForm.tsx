import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
// Imports: sử dụng React-Bootstrap
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// 1. Định nghĩa Enum cho Giới tính (Giữ nguyên)
enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

interface IGenderOption {
    value: Gender;
    label: string;
}

const GENDER_OPTIONS: IGenderOption[] = [
    { value: Gender.MALE, label: 'Nam' },
    { value: Gender.FEMALE, label: 'Nữ' },
    { value: Gender.OTHER, label: 'Khác' },
];

// 2. Định nghĩa Interface cho Form State (Giữ nguyên)
interface IUserUpdateFormData {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string | null;
    gender: Gender | '';
    shippingAddress: string;
}

// 3. Định nghĩa Interface cho Request Body (Giữ nguyên)
interface IUserUpdateRequestBody {
    fullName: string;
    dateOfBirth: string | null;
    gender: Gender | null;
    shippingAddress: string;
}

const UserUpdateForm: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<IUserUpdateFormData>({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: null,
        gender: '',
        shippingAddress: '',
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    // --- LOGIC TẢI DỮ LIỆU BAN ĐẦU (Giữ nguyên) ---
    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get<IUserUpdateFormData>('/users/profile');
            const data = response.data;

            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                dateOfBirth: data.dateOfBirth || null,
                gender: (data.gender as Gender) || '',
                shippingAddress: data.shippingAddress || '',
            });
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error('Lỗi khi tải thông tin User:', err);

            // Xử lý lỗi 401/403
            if (axiosError.response && (axiosError.response.status === 401 || axiosError.response.status === 403)) {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else {
                toast.error('Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.');
            }
        } finally {
            if (localStorage.getItem('token') !== null) {
                setLoading(false);
            }
        }
    };

    // --- LOGIC CẬP NHẬT (Giữ nguyên) ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let newValue: string | Gender | null = value;
        if (name === 'gender' && value) {
            newValue = value as Gender;
        } else if (name === 'dateOfBirth' && value === '') {
            newValue = null;
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.fullName || formData.fullName.trim().length < 2) {
            toast.error('Tên không được để trống và phải có ít nhất 2 ký tự.');
            return false;
        }
        if (!formData.shippingAddress || formData.shippingAddress.trim().length < 5) {
            toast.error('Địa chỉ giao hàng không được để trống và phải có ít nhất 5 ký tự.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitLoading(true);
        try {
            const requestBody: IUserUpdateRequestBody = {
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth || null,
                gender: formData.gender === '' ? null : formData.gender as Gender,
                shippingAddress: formData.shippingAddress,
            };
            await axiosInstance.put('/users/profile', requestBody);
            toast.success('Cập nhật hồ sơ cá nhân thành công!');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err) {
            console.error('Lỗi khi cập nhật:', (err as AxiosError)?.response || err);
            const axiosError = err as AxiosError;
            let errorMsg: string = 'Cập nhật thất bại do lỗi hệ thống.';
            if (axiosError.response) {
                errorMsg = (axiosError.response.data as { message?: string })?.message || axiosError.response.statusText || errorMsg;
            }
            toast.error(errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    // --- STYLE ĐÃ TỐI ƯU HÓA CHIỀU CAO ---
    const backgroundStyle: React.CSSProperties = {
        // Giữ nguyên full height
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FF9966, #FF5E62)',
        padding: '1rem',
        overflowY: 'hidden' // Ngăn cuộn trang nền
    };

    const cardStyle: React.CSSProperties = {
        maxWidth: '450px',
        borderRadius: '15px',
        // Thiết lập chiều cao tối đa cho Card. Đảm bảo Card có thể cuộn nếu nội dung vẫn quá dài
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto', // Cho phép cuộn bên trong Card nếu cần
        padding: '1rem' // Giảm padding tổng thể của Card
    };

    const gradientButtonStyle: React.CSSProperties = {
        background: 'linear-gradient(to right, #FF8C00, #FF4500)',
        border: 'none',
        fontWeight: '600',
        padding: '0.5rem 1rem', // Giảm padding nút
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    if (loading) {
        return (
            <div style={backgroundStyle}>
                <Alert variant="light" className="p-4 rounded-3 text-center">
                    <Spinner animation="border" variant="warning" className="me-2" />
                    Đang tải thông tin...
                </Alert>
            </div>
        );
    }

    // --- GIAO DIỆN FORM DÙNG REACT-BOOTSTRAP (Tối ưu hóa) ---
    return (
        <div style={backgroundStyle}>
            {/* Sử dụng style tối ưu hóa cho Card */}
            <Card className="w-100 shadow-lg" style={cardStyle}>
                <Card.Body className="p-3">

                    {/* Logo / Icon App */}
                    <div className="d-flex justify-content-center mb-3 mt-1">
                        <div className="p-2 rounded-3" style={{ background: 'linear-gradient(135deg, #FF9966, #FF5E62)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M2 7l10-5 10 5-10 5-10-5z"></path>
                                <path d="M12 22l-10-5 10-5 10 5-10 5z"></path>
                                <path d="M2 17l10-5 10 5"></path>
                            </svg>
                        </div>
                    </div>

                    <h1 className="h5 text-center text-dark mb-1 fw-bold">
                        Food Delivery System
                    </h1>
                    <p className="text-center text-secondary mb-3 small">
                        Cập nhật Hồ sơ Cá nhân
                    </p>

                    <Form onSubmit={handleSubmit} className="mt-2">

                        {/* Tên đầy đủ - mb-2 để giảm khoảng cách */}
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-medium text-secondary mb-0">Tên đầy đủ *</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                required
                                size="sm" // Giảm kích thước input
                            />
                        </Form.Group>

                        {/* Email (Disabled) */}
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-medium text-secondary mb-0">Email *</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                disabled
                                size="sm" // Giảm kích thước input
                                className="bg-light"
                            />
                        </Form.Group>

                        {/* Số điện thoại (Disabled) */}
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-medium text-secondary mb-0">Số điện thoại *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.phone}
                                disabled
                                size="sm" // Giảm kích thước input
                                className="bg-light"
                            />
                        </Form.Group>

                        {/* Ngày sinh */}
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-medium text-secondary mb-0">Ngày sinh</Form.Label>
                            <Form.Control
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth || ''}
                                onChange={handleChange}
                                size="sm" // Giảm kích thước input
                            />
                        </Form.Group>

                        {/* Giới tính */}
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-medium text-secondary mb-0">Giới tính</Form.Label>
                            <Form.Select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleChange}
                                size="sm" // Giảm kích thước input
                            >
                                <option value="" disabled>-- Chọn --</option>
                                {GENDER_OPTIONS.map(e => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Địa chỉ giao hàng */}
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-medium text-secondary mb-0">Địa chỉ giao hàng *</Form.Label>
                            <Form.Control
                                type="text"
                                name="shippingAddress"
                                value={formData.shippingAddress}
                                onChange={handleChange}
                                placeholder="123 Đường ABC..."
                                required
                                size="sm" // Giảm kích thước input
                            />
                        </Form.Group>

                        {/* Nút Submit */}
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={submitLoading}
                            className="w-100"
                            style={gradientButtonStyle}
                        >
                            {submitLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang lưu...
                                </>
                            ) : "Lưu thay đổi"}
                        </Button>

                    </Form>

                    <p className="text-center text-muted smaller mt-3 mb-0">
                        © 2024 Food Delivery.
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
}

export default UserUpdateForm;