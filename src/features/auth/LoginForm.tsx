import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';

import {Form, Button, Card, Alert, Spinner, InputGroup} from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '../../routes/route.constants';

interface LoginFormData {
    email: string;
    password: string;
}

interface LoginErrors {
    email: string | null;
    password: string | null;
}

interface IRoleDetail {
    name?: string;
    authority?: string;
}

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
    const location = useLocation();

    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verificationMessage, setVerificationMessage] = useState<string>('');

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<LoginErrors>({ email: null, password: null });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // ✅ HOOK XỬ LÝ KÍCH HOẠT TÀI KHOẢN TỪ URL
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (token) {
            setVerificationStatus('loading');
            setApiError(null);

            const activateAccount = async () => {
                try {
                    const response = await axiosInstance.get(`/auth/activate?token=${token}`);

                    // ✅ FIX: Extract string từ response
                    let message = 'Tài khoản đã được kích hoạt thành công!';

                    if (typeof response.data === 'string') {
                        message = response.data;
                    } else if (response.data && typeof response.data.message === 'string') {
                        message = response.data.message;
                    }

                    setVerificationStatus('success');
                    setVerificationMessage(message);
                    toast.success(message);

                } catch (error: any) {
                    let errorMsg = 'Kích hoạt thất bại do lỗi hệ thống.';

                    if (error.response) {
                        // ✅ FIX: Extract string từ error response
                        if (typeof error.response.data === 'string') {
                            errorMsg = error.response.data;
                        } else if (error.response.data && typeof error.response.data.message === 'string') {
                            errorMsg = error.response.data.message;
                        } else if (error.response.statusText) {
                            errorMsg = error.response.statusText;
                        }
                    }

                    setVerificationStatus('error');
                    setVerificationMessage(errorMsg);
                    toast.error(errorMsg);

                } finally {
                    navigate(ROUTES.AUTH.LOGIN, { replace: true });
                }
            };

            activateAccount();
        }
    }, [location.search, navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
        setApiError(null);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        let newErrors: LoginErrors = { email: null, password: null };

        if (!formData.email) {
            newErrors.email = 'Email không được để trống.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ.';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post<LoginResponseData>('auth/login', formData);

            const token = response.data.token || response.data.jwt;
            const role = response.data.role;

            if (token && role) {
                localStorage.setItem('token', token);
                localStorage.setItem('userRole', role);

                toast.success('Đăng nhập thành công!');

                if (role === 'ADMIN') {
                    navigate(ROUTES.ADMIN.DASHBOARD);
                } else {
                    navigate(ROUTES.HOME);
                }
            } else {
                setApiError('Phản hồi đăng nhập không hợp lệ.');
            }

        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.';

            if (error.response && error.response.data) {
                // ✅ FIX: Extract string từ error response
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                    errorMessage = error.response.data.message;
                }

                // ✅ NEW: Xử lý lỗi tài khoản chưa được cấp quyền
                if (errorMessage.toLowerCase().includes('chưa được cấp quyền') ||
                    errorMessage.toLowerCase().includes('pending approval') ||
                    errorMessage.toLowerCase().includes('not approved')) {
                    errorMessage = '⚠️ Tài khoản của bạn đang chờ Admin phê duyệt. Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.';
                }
            }

            setApiError(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    const togglePassword = () => setShowPassword(!showPassword);

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
                    <div className="text-center mb-4">
                        <h2>Đăng Nhập</h2>
                        <p className="text-muted">Truy cập tài khoản của bạn</p>
                    </div>

                    {/* Trạng thái kích hoạt */}
                    {verificationStatus === 'loading' && (
                        <Alert variant="info" className="mb-4">
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Đang xử lý kích hoạt tài khoản... Vui lòng chờ.
                        </Alert>
                    )}

                    {verificationStatus === 'success' && (
                        <Alert variant="success" className="mb-4">
                            {verificationMessage}
                        </Alert>
                    )}

                    {verificationStatus === 'error' && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setVerificationStatus('idle')}>
                            {verificationMessage}
                        </Alert>
                    )}

                    {/* Lỗi đăng nhập */}
                    {apiError && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    {/* Login Form */}
                    {(verificationStatus === 'idle' || verificationStatus === 'success' || verificationStatus === 'error') && (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label className="fw-semibold">Email</Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text><Mail size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Nhập địa chỉ email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="password">
                                <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text><Lock size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                        isInvalid={!!errors.password}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={togglePassword}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 fw-bold py-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    'Đăng Nhập'
                                )}
                            </Button>
                        </Form>
                    )}

                    <div className="text-center mt-4 pt-4 border-top">
                        <span className="text-muted">Chưa có tài khoản? </span>
                        <Link
                            to={ROUTES.AUTH.REGISTER_USER}
                            className="text-primary text-decoration-none fw-semibold"
                        >
                            Đăng ký Người dùng
                        </Link>
                        <span className="text-muted mx-2">|</span>
                        <Link
                            to={ROUTES.AUTH.REGISTER_MERCHANT}
                            className="text-primary text-decoration-none fw-semibold"
                        >
                            Đăng ký Merchant
                        </Link>
                    </div>
                </Card.Body>

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