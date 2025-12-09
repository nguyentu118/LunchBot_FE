import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Giữ lại import cho API và thông báo
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';

// Import components từ React-Bootstrap và Icons
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '../../routes/route.constants'; // Đảm bảo ROUTES có các path cần thiết

// 1. Định nghĩa kiểu dữ liệu (Interfaces/Types)
interface LoginFormData {
    email: string;
    password: string;
}

interface LoginErrors {
    email: string | null;
    password: string | null;
}

// Kiểu dữ liệu cho phản hồi thành công từ API
interface LoginResponseData {
    token?: string;
    jwt?: string;
    email?: string;
    userEmail?: string;
    role?: string;
    roles?: (string | { name?: string; authority?: string })[];
}

const LoginForm: React.FC = () => {
    const navigate = useNavigate();

    // 1. Giữ state object và validation/loading state
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<LoginErrors>({
        email: null,
        password: null
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null); // State riêng cho lỗi API/Server

    const [showPassword, setShowPassword] = useState(false); // State cho ẩn/hiện mật khẩu

    const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // 2. Event Handler sử dụng Form.Control và state object
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setErrors(prevErrors => ({ ...prevErrors, [name as keyof LoginErrors]: null }));
        setApiError(null);
    };

    // 3. Logic Validation
    const validateForm = (): boolean => {
        let formErrors: LoginErrors = { email: null, password: null };
        let isValid = true;
        const { email, password } = formData;

        if (!email) {
            formErrors.email = 'Email không được để trống.';
            isValid = false;
        } else if (!EMAIL_REGEX.test(email)) {
            formErrors.email = 'Email không hợp lệ.';
            isValid = false;
        }

        if (!password) {
            formErrors.password = 'Mật khẩu không được để trống.';
            isValid = false;
        } else if (password.length < 6) {
            formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    // 4. Logic Submit (giữ nguyên API call và xử lý token)
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setApiError(null);

        try {
            // Sửa đường dẫn API: đảm bảo chỉ có một /api (hoặc không, tùy thuộc vào axiosConfig)
            const response = await axiosInstance.post<LoginResponseData>('/auth/login', formData);
            const responseData: LoginResponseData = response.data;

            const token = responseData.token || responseData.token || responseData.jwt;
            const email = responseData.email || responseData.userEmail || formData.email;

            if (!token) {
                toast.error('Lỗi: Không nhận được token từ server');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);

            let userRole = 'USER';
            if (responseData.role) {
                userRole = responseData.role;
            } else if (responseData.roles && Array.isArray(responseData.roles)) {
                const firstRole = responseData.roles[0];
                if (typeof firstRole === 'object' && firstRole !== null) {
                    userRole = firstRole.name || firstRole.authority || 'USER';
                } else if (typeof firstRole === 'string') {
                    userRole = firstRole;
                }
            }

            localStorage.setItem('userRole', userRole);

            toast.success('Đăng nhập thành công!');
            window.dispatchEvent(new Event('storage'));

            setTimeout(() => {
                // Chuyển hướng theo Role
                if (userRole === 'ADMIN' && ROUTES.ADMIN && ROUTES.ADMIN.DASHBOARD) {
                    navigate(ROUTES.ADMIN.DASHBOARD);
                } else {
                    navigate(ROUTES.MERCHANTS.PROFILE_UPDATE);
                }
            }, 1000);

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // 5. Kết xuất (Rendering) - Tinh chỉnh bố cục
    return (
        <div
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{ background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }} // Màu cam/đỏ đẹp mắt
        >
            <Card
                className="border-0 shadow-lg"
                style={{ width: '100%', maxWidth: '450px', borderRadius: '1rem' }}
            >
                <Card.Body className="p-5">
                    {/* Logo & Title */}
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                                width: '70px',
                                height: '70px',
                                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                borderRadius: '1rem'
                            }}
                        >
                            <Store size={36} className="text-white" />
                        </div>
                        <h3 className="fw-bold mb-2">Food Delivery System</h3>
                        <p className="text-muted mb-0">Đăng nhập vào hệ thống</p>
                    </div>

                    {/* Error Alert */}
                    {apiError && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Form onSubmit={handleSubmit}>
                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Mail size={16} className="me-2" />
                                Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Mật khẩu */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Lock size={16} className="me-2" />
                                Mật khẩu
                            </Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="py-2 pe-5"
                                    style={{ borderRadius: '0.5rem' }}
                                    isInvalid={!!errors.password}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                                <Button
                                    variant="link"
                                    className="position-absolute end-0 top-50 translate-middle-y text-muted"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ textDecoration: 'none' }}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Button>
                            </div>
                        </Form.Group>

                        {/* Tùy chọn & Quên mật khẩu */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Form.Check
                                type="checkbox"
                                label="Ghi nhớ đăng nhập"
                                className="text-muted small"
                                disabled={loading}
                            />
                            {/* KHÔI PHỤC: Link Quên mật khẩu */}
                        </div>

                        {/* Nút Submit */}
                        <Button
                            type="submit"
                            className="w-100 py-2 fw-semibold"
                            style={{
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                border: 'none'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </Button>
                    </Form>

                    {/* Link Đăng ký (Hợp nhất các link) */}
                    <div className="text-center mt-4 pt-4 border-top">
                        <span className="text-muted">Chưa có tài khoản? </span>

                        {/* Đăng ký Người dùng */}
                        <Link
                            to={ROUTES.AUTH.REGISTER_USER}
                            className="text-primary text-decoration-none fw-semibold"
                        >
                            Đăng ký Người dùng
                        </Link>

                        <span className="text-muted mx-2">|</span>

                        {/* Đăng ký Merchant */}
                        <Link
                            to={ROUTES.AUTH.REGISTER_MERCHANT}
                            className="text-primary text-decoration-none fw-semibold"
                        >
                            Đăng ký Merchant
                        </Link>
                    </div>

                </Card.Body>
                {/* Footer */}
                <div className="text-center py-3 border-top">
                    <small className="text-muted">
                        © 2024 Food Delivery. All rights reserved.
                    </small>
                </div>
            </Card>
        </div>
    );
};

export default LoginForm;