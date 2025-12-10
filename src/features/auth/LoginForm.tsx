import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Giữ lại import cho API và thông báo
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast'; // ĐẢM BẢO IMPORT ĐÚNG

// Import components từ React-Bootstrap và Icons
import {Form, Button, Card, Alert, Spinner, InputGroup} from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// Đảm bảo ROUTES có các path cần thiết
import { ROUTES } from '../../routes/route.constants';

// 1. Định nghĩa kiểu dữ liệu (Interfaces/Types)
interface LoginFormData {
    email: string;
    password: string;
}

interface LoginErrors {
    email: string | null;
    password: string | null;
}

// Interface chi tiết cho đối tượng Role
interface IRoleDetail {
    name?: string;
    authority?: string;
}

// Kiểu dữ liệu cho phản hồi thành công từ API
interface LoginResponseData {
    token?: string;
    jwt?: string;
    email?: string;
    userEmail?: string;
    role?: string;
    roles?: (string | IRoleDetail)[];
}

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    // Thay thế error message bằng state lỗi API để hiển thị trong Alert
    const [apiError, setApiError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<LoginErrors>({ email: null, password: null });
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name as keyof LoginErrors]: null });
        setApiError(null); // Xóa lỗi API khi người dùng bắt đầu nhập
    };

    const validateForm = (): boolean => {
        let errors: LoginErrors = { email: null, password: null };
        let isValid: boolean = true;
        const { email, password } = formData;

        if (!email) {
            errors.email = 'Email không được để trống.';
            isValid = false;
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = 'Email không hợp lệ.';
            isValid = false;
        }

        if (!password) {
            errors.password = 'Mật khẩu không được để trống.';
            isValid = false;
        }

        setFormErrors(errors);

        // ⭐ SỬ DỤNG TOAST CHO LỖI VALIDATION ⭐
        if (!isValid) {
            toast.error('Vui lòng kiểm tra lại thông tin đăng nhập.');
        }

        return isValid;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setApiError(null);

        try {
            const response = await axiosInstance.post<LoginResponseData>('/auth/login', formData);
            const data = response.data;
            const token = data.token || data.jwt; // Lấy token
            const email = data.email || data.userEmail; // Lấy email
            let role = data.role; // Lấy role dạng string

            // Xử lý trường hợp role là mảng (thường gặp trong Spring Security)
            if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
                // Lấy role đầu tiên, xử lý nếu đó là object
                const firstRole = data.roles[0];
                if (typeof firstRole === 'object' && firstRole !== null && 'authority' in firstRole) {
                    role = firstRole.authority; // Ví dụ: 'ROLE_USER'
                } else if (typeof firstRole === 'string') {
                    role = firstRole;
                }
            }

            // ⭐ LƯU THÔNG TIN ĐĂNG NHẬP VÀO LOCAL STORAGE ⭐
            if (token && email && role) {
                localStorage.setItem('token', token);
                localStorage.setItem('userEmail', email);
                // Loại bỏ tiền tố ROLE_ nếu có (ví dụ: 'ROLE_USER' -> 'USER')
                localStorage.setItem('userRole', role.replace('ROLE_', ''));

                // ⭐ SỬ DỤNG TOAST CHO THÀNH CÔNG ⭐
                toast.success(`Chào mừng ${email}! Đăng nhập thành công.`);

                // Chuyển hướng
                navigate(ROUTES.HOME); // Chuyển về trang chủ
            } else {
                throw new Error('Thiếu thông tin đăng nhập.');
            }

        } catch (error: any) {
            let errorMsg: string = 'Đăng nhập thất bại do lỗi hệ thống.';

            if (error.response) {
                // Lấy thông báo lỗi cụ thể từ server
                errorMsg = error.response.data?.message || error.response.data?.error || error.response.data || error.response.statusText || errorMsg;
            }

            setApiError(errorMsg);
            // ⭐ SỬ DỤNG TOAST CHO LỖI API ⭐
            toast.error(errorMsg);

        } finally {
            setLoading(false);
        }
    };

    // Rendering
    return (
        <div
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{ background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }}
        >
            <Card
                className="border-0 shadow-lg"
                style={{ width: '100%', maxWidth: '400px', borderRadius: '1rem' }}
            >
                <Card.Body className="p-5">
                    {/* Title */}
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                borderRadius: '1rem'
                            }}
                        >
                            <Lock size={30} className="text-white" />
                        </div>
                        <h3 className="fw-bold mb-2">Đăng Nhập</h3>
                        <p className="text-muted mb-0">Sử dụng tài khoản của bạn</p>
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
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!formErrors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Mật khẩu */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                <Lock size={16} className="me-2" />
                                Mật khẩu
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="py-2"
                                    style={{ borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
                                    isInvalid={!!formErrors.password}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    style={{ borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                                >
                                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.password}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

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
                                'Đăng Nhập'
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