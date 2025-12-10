import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';

// Import components từ React-Bootstrap và Icons
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { UserPlus } from 'lucide-react';
// Lưu ý: Nếu bạn có file route.constants.ts, hãy import ROUTES ở đây

// 1. Định nghĩa kiểu dữ liệu cho State
interface IFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// 2. Định nghĩa kiểu dữ liệu cho Errors
interface IFormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const RegistrationForm: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<IFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [errors, setErrors] = useState<IFormErrors>({});

    const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // 3. Định nghĩa kiểu cho Event Handler
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
        setApiError(null);
    };

    // 4. Logic Validate (Giữ nguyên)
    const validateForm = (): boolean => {
        let formErrors: IFormErrors = {};
        let isValid: boolean = true;
        const { name, email, password, confirmPassword } = formData;

        if (!name) {
            formErrors.name = 'Tên không được để trống.';
            isValid = false;
        }

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

    // 5. Logic Submit (Đã cập nhật chi tiết xử lý lỗi)
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng điền đầy đủ và chính xác các trường bắt buộc.');
            return;
        }

        setLoading(true);
        setApiError(null);

        try {
            const requestBody = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            };

            const response = await axiosInstance.post('/auth/register', requestBody);

            const successMessage: string = response.data?.message || 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email.';
            toast.success(successMessage);

            setFormData({ name: '', email: '', password: '', confirmPassword: '' });

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            let errorMsg: string = 'Đăng ký thất bại do lỗi hệ thống.';

            if (error.response) {
                // ⭐ LOG CHI TIẾT LỖI 400 TẠI ĐÂY ⭐
                console.error("Lỗi API:", error.response);

                const data = error.response.data;

                // Xử lý lỗi chi tiết từ server
                if (typeof data === 'string') {
                    errorMsg = data;
                } else if (data?.message) {
                    errorMsg = data.message;
                } else if (data?.error) {
                    errorMsg = data.error;
                } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
                    // Trường hợp server trả về danh sách lỗi validation
                    errorMsg = 'Lỗi Validation: ' + data.errors.map((e: any) => e.defaultMessage || e.message).join(' | ');
                } else {
                    errorMsg = error.response.statusText || 'Lỗi không xác định từ server.';
                }
            }

            setApiError(errorMsg);
            const toastMessage = errorMsg.length > 100 ? 'Đăng ký thất bại. Xem chi tiết lỗi.' : errorMsg;
            toast.error(toastMessage);

        } finally {
            setLoading(false);
        }
    };

    // --- STYLE ĐÃ TỐI ƯU HÓA CHIỀU CAO ---
    const gradientButtonStyle: React.CSSProperties = {
        borderRadius: '0.5rem',
        background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
        border: 'none',
    };

    // 6. Kết xuất (Rendering) - Tối ưu hóa
    return (
        <div
            className="d-flex align-items-center justify-content-center"
            // Đảm bảo container chính lấy toàn bộ chiều cao viewport
            style={{
                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                minHeight: '100vh',
                padding: '1rem',
                overflowY: 'hidden' // Ngăn cuộn trang nền
            }}
        >
            <Card
                className="border-0 shadow-lg w-100"
                style={{
                    maxWidth: '450px',
                    borderRadius: '1rem',
                    // Thiết lập chiều cao tối đa cho Card
                    maxHeight: 'calc(100vh - 2rem)',
                    overflowY: 'auto' // Cho phép cuộn bên trong Card nếu nội dung vẫn quá dài
                }}
            >
                {/* Giảm padding Card.Body từ p-5 xuống p-4 */}
                <Card.Body className="p-4">
                    {/* Logo & Title */}
                    <div className="text-center mb-3">
                        <div
                            className="d-inline-flex align-items-center justify-content-center mb-2" // Giảm mb
                            style={{
                                width: '60px', // Giảm kích thước icon
                                height: '60px', // Giảm kích thước icon
                                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                borderRadius: '1rem'
                            }}
                        >
                            <UserPlus size={30} className="text-white" />
                        </div>
                        <h4 className="fw-bold mb-1">Đăng ký Tài khoản</h4> {/* Giảm h3 xuống h4 */}
                        <p className="text-muted small mb-0">Tham gia hệ thống Food Delivery</p> {/* Sử dụng small */}
                    </div>

                    {/* Error Alert (Hiện lỗi chi tiết nếu có) */}
                    {apiError && (
                        <Alert variant="danger" className="mb-3 p-2 small" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    {/* Registration Form */}
                    <Form onSubmit={handleSubmit}>
                        {/* Tên - mb-2 để giảm khoảng cách */}
                        <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold small mb-0">Tên (*)</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                size="sm" // Quan trọng: Giảm chiều cao input
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid" className='small'>
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Email */}
                        <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold small mb-0">Email (*)</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                size="sm" // Quan trọng: Giảm chiều cao input
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid" className='small'>
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Mật khẩu */}
                        <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold small mb-0">Mật khẩu (*)</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                size="sm" // Quan trọng: Giảm chiều cao input
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.password}
                            />
                            <Form.Control.Feedback type="invalid" className='small'>
                                {errors.password}
                            </Form.Control.Feedback>
                            <Form.Text muted className='smaller mt-1'>Tối thiểu 6 ký tự.</Form.Text>
                        </Form.Group>

                        {/* Xác nhận Mật khẩu */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small mb-0">Xác nhận Mật khẩu (*)</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                size="sm" // Quan trọng: Giảm chiều cao input
                                style={{ borderRadius: '0.5rem' }}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid" className='small'>
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Nút Đăng ký */}
                        <Button
                            type="submit"
                            className="w-100 py-2 fw-semibold"
                            style={gradientButtonStyle}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Đang đăng ký...
                                </>
                            ) : (
                                'Đăng ký'
                            )}
                        </Button>
                    </Form>

                    {/* Link Đăng nhập */}
                    {/* Giảm pt-4 xuống pt-3 */}
                    <div className="text-center mt-3 pt-3 border-top">
                        <span className="text-muted small">Đã có tài khoản? </span>
                        <Link
                            to="/login"
                            className="text-primary text-decoration-none fw-semibold small"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegistrationForm;