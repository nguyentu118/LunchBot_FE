import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';

// Import components từ React-Bootstrap và Icons
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Store, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';

// --- 1. INTERFACE DEFINITION ---

interface IMerchantFormData {
    restaurantName: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
}

interface IMerchantFormErrors {
    restaurantName?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
}

// --- 2. HELPER FUNCTION ---

const getCurrentUserEmail = (): string | null => {
    const email: string | null = ('');
    return email || null;
};

// --- 3. COMPONENT ---

const MerchantRegistrationForm: React.FC = () => {
    const navigate = useNavigate();
    const userEmail: string | null = getCurrentUserEmail();
    const isUserLoggedIn: boolean = !!userEmail;

    const [formData, setFormData] = useState<IMerchantFormData>(() => ({
        restaurantName: '',
        email: userEmail || '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
    }));

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<IMerchantFormErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);

    // Constants cho Regex
    const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const PHONE_REGEX: RegExp = /^(0|\+84)\d{9,10}$/;

    useEffect(() => {
        if (userEmail) {
            setFormData(prevData => ({ ...prevData, email: userEmail }));
        }
    }, [userEmail]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
        setApiError(null);
    };

    const validateForm = (): boolean => {
        const { email, password, confirmPassword, phone, address } = formData;
        let formErrors: IMerchantFormErrors = {};
        let isValid: boolean = true;

        // Validate Email (chỉ khi chưa đăng nhập)
        if (!isUserLoggedIn) {
            if (!email) {
                formErrors.email = 'Email không được để trống.';
                isValid = false;
            } else if (!EMAIL_REGEX.test(email)) {
                formErrors.email = 'Email không hợp lệ.';
                isValid = false;
            }
        }

        // Validate Phone
        if (!phone.trim()) {
            formErrors.phone = 'Số điện thoại không được để trống.';
            isValid = false;
        } else if (!PHONE_REGEX.test(phone)) {
            formErrors.phone = 'Số điện thoại không hợp lệ (ví dụ: 0901234567).';
            isValid = false;
        }

        // Validate Address
        if (!address.trim()) {
            formErrors.address = 'Địa chỉ không được để trống.';
            isValid = false;
        }

        // Validate Password
        if (!password) {
            formErrors.password = 'Mật khẩu không được để trống.';
            isValid = false;
        } else if (password.length < 6) {
            formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
            isValid = false;
        }

        // Validate Confirm Password
        if (!confirmPassword) {
            formErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống.';
            isValid = false;
        } else if (password !== confirmPassword) {
            formErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp.';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast('Vui lòng kiểm tra lại các trường bị lỗi.', { icon: '⚠️' });
            return;
        }

        setLoading(true);
        setApiError(null);

        try {
            const requestBody = {
                restaurantName: formData.restaurantName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            };

            const response = await axiosInstance.post<{ message: string }>('/auth/register/merchant', requestBody);

            const successMessage: string = response.data.message || 'Đăng ký Merchant thành công! Vui lòng chờ duyệt.';
            toast.success(successMessage);

            // Reset form
            setFormData({
                email: isUserLoggedIn ? (userEmail || '') : '',
                password: '',
                confirmPassword: '',
                phone: '',
                address: '',
                restaurantName: ''
            });

            // Chuyển hướng sau khi thành công
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            let errorMsg: string = 'Đăng ký thất bại do lỗi hệ thống.';
            let fieldError: keyof IMerchantFormErrors | null = null;

            if (error.response) {
                const responseData = error.response.data;
                const message = responseData?.message || responseData;

                // ✅ XỬ LÝ CÁC LỖI CỤ THỂ
                if (typeof message === 'string') {
                    const lowerMsg = message.toLowerCase();

                    // Kiểm tra lỗi phone trùng
                    if (lowerMsg.includes('phone') ||
                        lowerMsg.includes('số điện thoại') ||
                        lowerMsg.includes('điện thoại') ||
                        lowerMsg.includes('sdt') ||
                        lowerMsg.includes('duplicate') && lowerMsg.includes('phone')) {
                        errorMsg = 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số khác.';
                        fieldError = 'phone';
                    }
                    // Kiểm tra lỗi email trùng
                    else if (lowerMsg.includes('email') ||
                        lowerMsg.includes('e-mail') ||
                        lowerMsg.includes('duplicate') && lowerMsg.includes('email')) {
                        errorMsg = 'Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.';
                        fieldError = 'email';
                    }
                    else {
                        errorMsg = message;
                    }
                } else {
                    errorMsg = `Lỗi ${error.response.status}: Không thể đăng ký.`;
                }

                // ✅ SET LỖI VÀO ĐÚNG FIELD
                if (fieldError) {
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        [fieldError]: errorMsg
                    }));
                }
            }

            setApiError(errorMsg);
            toast.error(errorMsg);

        } finally {
            setLoading(false);
        }
    };

    // --- 4. RENDERING ---

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center min-vh-100 py-5 overflow-y-auto"
            style={{
                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
            }}
        >
            <Card
                className="border-0 shadow-lg"
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    borderRadius: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <Card.Body className="p-5">

                    {/* Title Section */}
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-2"
                            style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                borderRadius: '0.75rem'
                            }}
                        >
                            <Store size={26} className="text-white" />
                        </div>
                        <h3 className="fw-bold mb-1 fs-5">Đăng ký Merchant</h3>
                        <p className="text-muted small mb-0">Hoàn tất để trở thành Chủ nhà hàng</p>
                    </div>

                    {/* API Error Alert - Chỉ hiển thị khi KHÔNG có field error */}
                    {apiError && !Object.values(errors).some(Boolean) && (
                        <Alert
                            variant="danger"
                            className="mb-4 d-flex align-items-start"
                            dismissible
                            onClose={() => setApiError(null)}
                        >
                            <AlertCircle size={20} className="me-2 mt-1 flex-shrink-0" />
                            <div className="flex-grow-1">{apiError}</div>
                        </Alert>
                    )}

                    {/* Merchant Registration Form */}
                    <Form onSubmit={handleSubmit}>

                        {/* Tên Nhà hàng */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Store size={16} className="me-2" />
                                Tên Nhà hàng
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="restaurantName"
                                placeholder="Tên nhà hàng của bạn"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                disabled={loading}
                                isInvalid={!!errors.restaurantName}
                            />
                            <Form.Control.Feedback type="invalid">
                                <AlertCircle size={14} className="me-1" />
                                {errors.restaurantName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Mail size={16} className="me-2" />
                                Email {isUserLoggedIn ? '' : '(*)'}
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="email@nhahang.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading || isUserLoggedIn}
                                className={isUserLoggedIn ? 'bg-light text-muted' : ''}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                <AlertCircle size={14} className="me-1" />
                                {errors.email}
                            </Form.Control.Feedback>
                            {isUserLoggedIn && (
                                <Form.Text muted>Email tài khoản hiện tại được sử dụng.</Form.Text>
                            )}
                        </Form.Group>

                        {/* Số điện thoại */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Phone size={16} className="me-2" />
                                Số điện thoại (*)
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                placeholder="0901234567"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={loading}
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                                <AlertCircle size={14} className="me-1" />
                                {errors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Địa chỉ */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <MapPin size={16} className="me-2" />
                                Địa chỉ (*)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={loading}
                                isInvalid={!!errors.address}
                            />
                            <Form.Control.Feedback type="invalid">
                                <AlertCircle size={14} className="me-1" />
                                {errors.address}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Mật khẩu */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Lock size={16} className="me-2" />
                                Mật khẩu (*)
                            </Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                isInvalid={!!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                <AlertCircle size={14} className="me-1" />
                                {errors.password}
                            </Form.Control.Feedback>
                            <Form.Text muted>Tối thiểu 6 ký tự.</Form.Text>
                        </Form.Group>

                        {/* Xác nhận Mật khẩu */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">
                                <Lock size={16} className="me-2" />
                                Xác nhận Mật khẩu (*)
                            </Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                <AlertCircle size={14} className="me-1" />
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
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
                                    Đang đăng ký Merchant...
                                </>
                            ) : (
                                'Đăng ký Merchant'
                            )}
                        </Button>
                    </Form>

                    {/* Link Đăng nhập */}
                    <div className="text-center mt-4 pt-4 border-top">
                        <span className="text-muted">Đã có tài khoản? </span>
                        <Link
                            to="/login"
                            className="text-primary text-decoration-none fw-semibold"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>

                </Card.Body>
            </Card>
        </div>
    );
};

export default MerchantRegistrationForm;