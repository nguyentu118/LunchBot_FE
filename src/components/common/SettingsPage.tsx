import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Settings as SettingsIcon, Store, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h5 className="fw-bold mb-4">Cài đặt</h5>

            <Alert variant="info" className="mb-4">
                <SettingsIcon size={20} className="me-2" />
                Quản lý thông tin và cài đặt nhà hàng của bạn
            </Alert>

            {/* Settings Options */}
            <div className="d-flex flex-column gap-3">
                {/* Restaurant Info */}
                <div className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded">
                                <Store size={24} className="text-primary" />
                            </div>
                            <div>
                                <h6 className="mb-1">Thông tin nhà hàng</h6>
                                <p className="text-muted small mb-0">
                                    Cập nhật tên, địa chỉ, mô tả nhà hàng
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate('/merchant/update')}
                        >
                            Chỉnh sửa
                        </Button>
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 p-3 rounded">
                                <Clock size={24} className="text-success" />
                            </div>
                            <div>
                                <h6 className="mb-1">Giờ mở cửa</h6>
                                <p className="text-muted small mb-0">
                                    Thiết lập giờ hoạt động của nhà hàng
                                </p>
                            </div>
                        </div>
                        <Button variant="outline-secondary" size="sm" disabled>
                            Sắp ra mắt
                        </Button>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-warning bg-opacity-10 p-3 rounded">
                                <CreditCard size={24} className="text-warning" />
                            </div>
                            <div>
                                <h6 className="mb-1">Phương thức thanh toán</h6>
                                <p className="text-muted small mb-0">
                                    Quản lý các phương thức thanh toán
                                </p>
                            </div>
                        </div>
                        <Button variant="outline-secondary" size="sm" disabled>
                            Sắp ra mắt
                        </Button>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-2">Cần hỗ trợ?</h6>
                <p className="small text-muted mb-2">
                    Nếu bạn cần hỗ trợ hoặc có thắc mắc, vui lòng liên hệ với chúng tôi.
                </p>
                <Button variant="outline-primary" size="sm">
                    Liên hệ hỗ trợ
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;