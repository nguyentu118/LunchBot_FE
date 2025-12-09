import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';

// Import components từ React-Bootstrap và Icons
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Store, Mail, Lock, Phone, MapPin } from 'lucide-react';

// 1. Định nghĩa kiểu dữ liệu cho dữ liệu đầu vào (FormData)
interface IMerchantFormData {
    restaurantName: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
}

// 2. Định nghĩa kiểu dữ liệu cho Errors (tất cả là optional)
interface IMerchantFormErrors {
    restaurantName?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
}

// Hàm helper để lấy email người dùng hiện tại
const getCurrentUserEmail = (): string | null => {
    const email: string | null = localStorage.getItem('userEmail');
    return email || null;
};

const MerchantRegistrationForm: React.FC = () => {
    const navigate = useNavigate();
    const userEmail: string | null = getCurrentUserEmail();
    const isUserLoggedIn: boolean = !!userEmail; // Kiểm tra trạng thái đăng nhập

    const [formData, setFormData] = useState<IMerchantFormData>({
        restaurantName: '',
        email: userEmail || '', // Sử dụng email đã đăng nhập nếu có
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<IMerchantFormErrors>({});
    const [apiError, setApiError] = useState<string | null>(null); // Thêm state cho lỗi API

    // Cập nhật email trong form data khi component mount hoặc userEmail thay đổi
    useEffect(() => {
        if (userEmail) {
            setFormData(prevData => ({ ...prevData, email: userEmail }));
        }
    }, [userEmail]);

    const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const PHONE_REGEX: RegExp = /^(0|\+84)\d{9,10}$/;

    // 3. Định nghĩa kiểu cho Event Handler
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
        setApiError(null); // Xóa lỗi API khi người dùng bắt đầu nhập
    };

    // 4. Logic Validate (Giữ nguyên)
    const validateForm = (): boolean => {
        let formErrors: IMerchantFormErrors = {};
        let isValid: boolean = true;
        const { email, password, confirmPassword, phone, address, restaurantName } = formData;

        if (!restaurantName) {
            formErrors.restaurantName = 'Tên nhà hàng không được để trống.';
            isValid = false;
        }

        if (!isUserLoggedIn) {
            if (!email) {
                formErrors.email = 'Email không được để trống.';
                isValid = false;
            } else if (!EMAIL_REGEX.test(email)) {
                formErrors.email = 'Email không hợp lệ.';
                isValid = false;
            }
        }

        if (!phone) {
            formErrors.phone = 'Số điện thoại không được để trống.';
            isValid = false;
        } else if (!PHONE_REGEX.test(phone)) {
            formErrors.phone = 'Số điện thoại không hợp lệ.';
            isValid = false;
        }

        if (!address) {
            formErrors.address = 'Địa chỉ không được để trống.';
            isValid = false;
        }

        if (!password) {
            formErrors.password = 'Mật khẩu không được để trống.';
            isValid = false;
        } else if (password.length < 6) {
            formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
            isValid = false;
        }

        if (!confirmPassword) {
            formErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống.';
            isValid = false;
        } else if (password !== confirmPassword) {
            formErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp.';
            isValid = false;
        }

        if (!isValid) {
            toast.error('Vui lòng điền đầy đủ và chính xác các trường bắt buộc.');
        }

        setErrors(formErrors);
        return isValid;
    };

    // 5. Logic Submit (Giữ nguyên và thêm xử lý lỗi API)
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setApiError(null);

        try {
            const requestBody: IMerchantFormData = {
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

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            let errorMsg: string = 'Đăng ký thất bại do lỗi hệ thống.';

            if (error.response) {
                errorMsg = error.response.data?.message || error.response.data || error.response.statusText || errorMsg;
            }
            setApiError(errorMsg);
            toast.error(errorMsg);

        } finally {
            setLoading(false);
        }
    };

    // 6. Kết xuất (Rendering) - Sử dụng React-Bootstrap
    return (
        <div
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{ background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }}
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
                        <h3 className="fw-bold mb-2">Đăng ký Merchant</h3>
                        <p className="text-muted mb-0">Hoàn tất để trở thành Chủ nhà hàng</p>
                    </div>

                    {/* Error Alert */}
                    {apiError && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    {/* Merchant Registration Form */}
                    <Form onSubmit={handleSubmit}>

                        {/* Tên Nhà hàng */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Store size={16} className="me-2" />
                                Tên Nhà hàng (*)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="restaurantName"
                                placeholder="Tên nhà hàng của bạn"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.restaurantName}
                            />
                            <Form.Control.Feedback type="invalid">
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
                                required={!isUserLoggedIn}
                                disabled={loading || isUserLoggedIn}
                                className={`py-2 ${isUserLoggedIn ? 'bg-light text-muted' : ''}`}
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                            {isUserLoggedIn && (
                                <Form.Text muted>
                                    Email tài khoản hiện tại được sử dụng để đăng ký Merchant.
                                </Form.Text>
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
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
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
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.address}
                            />
                            <Form.Control.Feedback type="invalid">
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
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
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
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
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

export default MerchantRegistrationForm;