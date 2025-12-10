import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

// Import components từ React-Bootstrap và Icons
import { Form, Button, Card, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { Store, Mail, Phone, MapPin, Clock, Settings } from 'lucide-react';

// 1. Định nghĩa kiểu dữ liệu cho Dữ liệu Form
interface IMerchantUpdateFormData {
    restaurantName: string;
    address: string;
    email: string;
    phone: string;
    openTime: string; // HH:MM
    closeTime: string; // HH:MM
}

// 2. Định nghĩa kiểu dữ liệu cho Dữ liệu Fetch từ Backend
interface IMerchantBackendData {
    restaurantName: string;
    address: string;
    email: string;
    phone: string;
    openTime: string; // HH:MM:SS
    closeTime: string; // HH:MM:SS
}

/**
 * Hàm Helper: Tạo mảng các giờ chẵn (HH:00)
 */
const generateHourOptions = (): string[] => {
    const options: string[] = [];
    for (let i = 0; i < 24; i++) {
        const hour = String(i).padStart(2, '0');
        const time = `${hour}:00`;
        options.push(time);
    }
    return options;
};

const HOUR_OPTIONS: string[] = generateHourOptions();

const MerchantUpdateForm: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<IMerchantUpdateFormData>({
        restaurantName: '',
        address: '',
        email: '',
        phone: '',
        openTime: '08:00',
        closeTime: '22:00'
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        fetchMerchantInfo();
    }, []);

    /**
     * Fetch Dữ liệu Merchant từ API hoặc Mock Data
     */
    const fetchMerchantInfo = async () => {
        setApiError(null);
        try {
            const response = await axiosInstance.get<IMerchantBackendData>('/merchants/profile');
            const responseData = response.data;


            // Map dữ liệu từ Backend (HH:MM:SS) về Form (HH:MM)
            setFormData({
                restaurantName: responseData.restaurantName || '',
                address: responseData.address || '',
                email: responseData.email || '',
                phone: responseData.phone || '',
                // Cắt chuỗi để chỉ lấy HH:MM
                openTime: responseData.openTime?.substring(0, 5) || '08:00',
                closeTime: responseData.closeTime?.substring(0, 5) || '22:00'
            });
            setInitialDataLoaded(true);
        } catch (err) {
            console.error('Lỗi khi tải thông tin:', err);
            const axiosError = err as AxiosError;
            let errorMsg = 'Không thể tải thông tin merchant.';

            if (axiosError.response?.status === 403) {
                errorMsg = 'Bạn không có quyền truy cập thông tin Merchant.';
                setApiError(errorMsg);
                toast.error(errorMsg);
                setTimeout(() => navigate('/unauthorized'), 1500);
            } else {
                setApiError(errorMsg);
                toast.error(errorMsg);
            }
            setInitialDataLoaded(true);
        }
    };

    // 3. Định nghĩa kiểu cho Event Handler
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setApiError(null);
    };

    // 4. Định nghĩa kiểu cho Form Submit Handler
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setApiError(null);

        const token: string | null = localStorage.getItem('token');
        const role: string | null = localStorage.getItem('userRole');

        if (!token || role !== 'MERCHANT') {
            const errorMsg = 'Phiên đăng nhập không hợp lệ hoặc không có quyền Merchant. Vui lòng đăng nhập lại.';
            toast.error(errorMsg);
            setLoading(false);
            if (!token) setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // Validate cơ bản
        if (!formData.restaurantName || !formData.address || !formData.openTime || !formData.closeTime) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            setLoading(false);
            return;
        }

        try {
            // Chuẩn bị dữ liệu gửi lên Backend (thêm :00 vào giờ)
            const requestData = {
                restaurantName: formData.restaurantName,
                address: formData.address,
                openTime: formData.openTime + ':00', // Gửi lên định dạng HH:MM:SS
                closeTime: formData.closeTime + ':00' // Gửi lên định dạng HH:MM:SS
            };

            // Sử dụng PUT để cập nhật thông tin
            // TODO: Cập nhật URL API thực tế
            await axiosInstance.put('/merchants/profile', requestData);

            toast.success('Cập nhật thông tin thành công!');

            setTimeout(() => {
                navigate('/'); // Chuyển hướng về trang chủ
            }, 1500);
        } catch (err) {
            console.error('Lỗi khi cập nhật:', err);
            let errorMsg: string = 'Có lỗi xảy ra khi cập nhật thông tin';
            const axiosError = err as AxiosError;

            if (axiosError.response) {
                // Lấy thông báo lỗi từ body response nếu có
                const dataMessage = (axiosError.response.data as { message?: string })?.message;
                errorMsg = dataMessage || axiosError.response.statusText || errorMsg;

                if (axiosError.response.status === 401 || axiosError.response.status === 403) {
                    errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    setTimeout(() => navigate('/login'), 2000);
                }
            } else if (axiosError.request) {
                errorMsg = 'Không nhận được phản hồi từ máy chủ.';
            }

            setApiError(errorMsg);
            toast.error(errorMsg);

        } finally {
            setLoading(false);
        }
    };

    const handleCancel = (): void => {
        navigate('/');
    };

    // Hiển thị trạng thái Loading khi dữ liệu chưa được tải (Styled with React-Bootstrap)
    if (!initialDataLoaded) {
        return (
            <div
                className="d-flex align-items-center justify-content-center min-vh-100"
                style={{ background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }}
            >
                <Spinner animation="border" variant="light" role="status">
                    <span className="visually-hidden">Đang tải thông tin...</span>
                </Spinner>
            </div>
        );
    }

    // Giao diện Form (Sử dụng React-Bootstrap)
    return (
        <div
            className="d-flex align-items-center justify-content-center min-vh-100 py-5"
            style={{ background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }}
        >
            <Card
                className="border-0 shadow-lg my-4"
                style={{ width: '100%', maxWidth: '600px', borderRadius: '1rem' }}
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
                            <Settings size={36} className="text-white" />
                        </div>
                        <h3 className="fw-bold mb-2">Cập nhật thông tin Merchant</h3>
                        <p className="text-muted mb-0">
                            Cập nhật thông tin nhà hàng của bạn.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {apiError && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>

                        {/* Email (Disabled) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Mail size={16} className="me-2" />
                                Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                readOnly
                                className="py-2 bg-light text-muted"
                                style={{ borderRadius: '0.5rem' }}
                            />
                            <Form.Text muted>Email không thể thay đổi.</Form.Text>
                        </Form.Group>

                        {/* Số điện thoại (Disabled) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Phone size={16} className="me-2" />
                                Số điện thoại
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                disabled
                                readOnly
                                className="py-2 bg-light text-muted"
                                style={{ borderRadius: '0.5rem' }}
                            />
                            <Form.Text muted>Số điện thoại không thể thay đổi.</Form.Text>
                        </Form.Group>

                        {/* Tên nhà hàng */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                <Store size={16} className="me-2" />
                                Tên nhà hàng (*)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="restaurantName"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                placeholder="Nhà hàng Hải sản Vũng Tàu"
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                            />
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
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Đường Trần Phú, Vũng Tàu"
                                required
                                disabled={loading}
                                className="py-2"
                                style={{ borderRadius: '0.5rem' }}
                            />
                        </Form.Group>

                        {/* Giờ mở cửa / Giờ đóng cửa */}
                        <Row className="mb-4">
                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        <Clock size={16} className="me-2" />
                                        Giờ mở cửa (*)
                                    </Form.Label>
                                    <Form.Select
                                        name="openTime"
                                        value={formData.openTime}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="py-2"
                                        style={{ borderRadius: '0.5rem' }}
                                    >
                                        {HOUR_OPTIONS.map((hour: string) => (
                                            <option key={hour} value={hour}>
                                                {hour}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text muted>Chọn giờ chẵn (HH:00)</Form.Text>
                                </Form.Group>
                            </Col>

                            <Col xs={12} md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        <Clock size={16} className="me-2" />
                                        Giờ đóng cửa (*)
                                    </Form.Label>
                                    <Form.Select
                                        name="closeTime"
                                        value={formData.closeTime}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="py-2"
                                        style={{ borderRadius: '0.5rem' }}
                                    >
                                        {HOUR_OPTIONS.map((hour: string) => (
                                            <option key={hour} value={hour}>
                                                {hour}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text muted>Chọn giờ chẵn (HH:00)</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Buttons */}
                        <div className="d-flex justify-content-between pt-3">
                            <Button
                                type="submit"
                                className="flex-grow-1 py-2 fw-semibold me-2"
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
                                        Đang cập nhật...
                                    </>
                                ) : (
                                    'Cập nhật'
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="light"
                                className="py-2 fw-semibold border text-dark"
                                style={{ borderRadius: '0.5rem' }}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                        </div>
                    </Form>
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
}

export default MerchantUpdateForm;