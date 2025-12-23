import React from 'react';
import { Alert } from 'react-bootstrap';
import { Construction } from 'lucide-react';

const RevenueReconciliationPage: React.FC = () => {
    return (
        <div>
            <h5 className="fw-bold mb-4">Đối soát doanh thu</h5>

            <Alert variant="info" className="d-flex align-items-center">
                <Construction size={24} className="me-3" />
                <div>
                    <h6 className="mb-1">Tính năng đang phát triển</h6>
                    <p className="mb-0 small">
                        Trang đối soát doanh thu đang được xây dựng. Bạn sẽ có thể:
                    </p>
                    <ul className="small mt-2 mb-0">
                        <li>Xem chi tiết doanh thu theo tháng</li>
                        <li>Theo dõi phí chiết khấu sàn</li>
                        <li>Xuất báo cáo Excel/PDF</li>
                        <li>Đối chiếu số liệu</li>
                    </ul>
                </div>
            </Alert>

            {/* Placeholder Content */}
            <div className="text-center py-5">
                <Construction size={64} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                <h4 className="text-muted">Sắp ra mắt</h4>
                <p className="text-muted">Chúng tôi đang hoàn thiện tính năng này</p>
            </div>
        </div>
    );
};

export default RevenueReconciliationPage;