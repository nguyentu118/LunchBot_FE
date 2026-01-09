import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Alert, Button, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { Settings as SettingsIcon, Store, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { merchantService } from "../../features/merchants/services/merchantService.ts";
import { MerchantProfileResponse, PartnerStatus } from "../../features/merchants/types/merchant.ts";
import { LoyaltyPartnerCard } from "../../features/merchants/LoyaltyPartnerCard.tsx";
import BankAccountModal from "../../features/merchants/components/BankAccountModal.tsx";

// Kiểu dữ liệu cho Form
interface IMerchantUpdateFormData {
    restaurantName: string;
    address: string;
    email: string;
    phone: string;
    openTime: string;
    closeTime: string;
}

interface IMerchantBackendData {
    restaurantName: string;
    address: string;
    email: string;
    phone: string;
    openTime: string;
    closeTime: string;
}

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

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<MerchantProfileResponse | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showBankAccountModal, setShowBankAccountModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [formData, setFormData] = useState<IMerchantUpdateFormData>({
        restaurantName: '',
        address: '',
        email: '',
        phone: '',
        openTime: '08:00',
        closeTime: '22:00'
    });

    // Hàm lấy dữ liệu profile
    const fetchProfile = async () => {
        try {
            const data = await merchantService.getMyProfile();
            setProfile(data);
        } catch (error) {
            console.error("Lỗi tải profile:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Mở modal và load dữ liệu
    const handleOpenUpdateModal = async () => {
        setShowUpdateModal(true);
        setModalLoading(true);
        setApiError(null);

        try {
            const response = await axiosInstance.get<IMerchantBackendData>('/merchants/profile');
            const responseData = response.data;

            setFormData({
                restaurantName: responseData.restaurantName || '',
                address: responseData.address || '',
                email: responseData.email || '',
                phone: responseData.phone || '',
                openTime: responseData.openTime?.substring(0, 5) || '08:00',
                closeTime: responseData.closeTime?.substring(0, 5) || '22:00'
            });
        } catch (err) {
            console.error('Lỗi khi tải thông tin:', err);
            const axiosError = err as AxiosError;
            let errorMsg = 'Không thể tải thông tin merchant.';

            if (axiosError.response?.status === 403) {
                errorMsg = 'Bạn không có quyền truy cập thông tin Merchant.';
            }

            setApiError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setModalLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setApiError(null);
    };

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
            return;
        }

        if (!formData.restaurantName || !formData.address || !formData.openTime || !formData.closeTime) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            setLoading(false);
            return;
        }

        try {
            const requestData = {
                restaurantName: formData.restaurantName,
                address: formData.address,
                openTime: formData.openTime + ':00',
                closeTime: formData.closeTime + ':00'
            };

            await axiosInstance.put('/merchants/profile', requestData);
            toast.success('Cập nhật thông tin thành công!');
            setShowUpdateModal(false);
            fetchProfile();

        } catch (err) {
            console.error('Lỗi khi cập nhật:', err);
            let errorMsg: string = 'Có lỗi xảy ra khi cập nhật thông tin';
            const axiosError = err as AxiosError;

            if (axiosError.response) {
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

    const handleCloseModal = () => {
        setShowUpdateModal(false);
        setApiError(null);
    };

    return (
        <div className="container-fluid p-0">
            <h5 className="fw-bold mb-4">Cài đặt & Hồ sơ</h5>

            <div className="row g-4">
                {/* CỘT TRÁI: CÁC MENU CÀI ĐẶT CƠ BẢN */}
                <div className="col-lg-8">
                    <Alert variant="info" className="mb-4">
                        <SettingsIcon size={20} className="me-2" />
                        Quản lý thông tin và cài đặt nhà hàng của bạn
                    </Alert>

                    <div className="d-flex flex-column gap-3">
                        {/* Thông tin nhà hàng */}
                        <div className="border rounded p-3 bg-white shadow-sm" style={{ cursor: 'pointer' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <Store size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h6 className="mb-1">Thông tin nhà hàng</h6>
                                        <p className="text-muted small mb-0">Cập nhật tên, địa chỉ, mở tắng</p>
                                    </div>
                                </div>
                                <Button variant="outline-primary" size="sm" onClick={handleOpenUpdateModal}>
                                    Cập nhật
                                </Button>
                            </div>
                        </div>

                        {/* Tài khoản thanh toán */}
                        <div className="border rounded p-3 bg-white shadow-sm" style={{ cursor: 'pointer' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <CreditCard size={24} className="text-success" />
                                    </div>
                                    <div>
                                        <h6 className="mb-1">Tài khoản thanh toán</h6>
                                        <p className="text-muted small mb-0">Cập nhật tài khoản ngân hàng để nhận tiền</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => setShowBankAccountModal(true)}
                                >
                                    Quản lý
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: THẺ TÀO LOYALTY */}
                <div className="col-lg-4">
                    {profile && (
                        <LoyaltyPartnerCard
                            partnerStatus={profile.partnerStatus || PartnerStatus.NONE}
                            currentMonthRevenue={profile.currentMonthRevenue || 0}
                            onStatusChange={fetchProfile}
                        />
                    )}
                </div>
            </div>

            {/* MODAL CẬP NHẬT THÔNG TIN */}
            <Modal show={showUpdateModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Cập nhật thông tin nhà hàng</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Error Alert */}
                    {apiError && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    {/* Loading State */}
                    {modalLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                            <p className="text-muted">Đang tải thông tin...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            {/* Email (Disabled) */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Email</Form.Label>
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
                                <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
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
                                    Tên nhà hàng <span className="text-danger">*</span>
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
                                    Địa chỉ <span className="text-danger">*</span>
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
                                            Giờ mở cửa <span className="text-danger">*</span>
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
                                            Giờ đóng cửa <span className="text-danger">*</span>
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
                        </Form>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={(e) => {
                            const form = document.querySelector('form') as HTMLFormElement;
                            if (form) {
                                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                form.dispatchEvent(submitEvent);
                            }
                        }}
                        disabled={loading || modalLoading}
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
                </Modal.Footer>
            </Modal>

            {/* MODAL TÀI KHOẢN NGÂN HÀNG */}
            <BankAccountModal
                show={showBankAccountModal}
                onHide={() => setShowBankAccountModal(false)}
            />
        </div>
    );
};

export default SettingsPage;