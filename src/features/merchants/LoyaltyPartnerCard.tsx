import React, { useState } from 'react';
import { Card, ProgressBar, Button, Badge, Alert } from 'react-bootstrap';
import { Crown, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PartnerStatus } from './types/merchant'; // Chú ý đường dẫn import
import { merchantService } from './services/merchantService';
import toast from 'react-hot-toast';

interface Props {
    partnerStatus: PartnerStatus;
    currentMonthRevenue: number;
    onStatusChange: () => void;
}

export const LoyaltyPartnerCard: React.FC<Props> = ({ partnerStatus, currentMonthRevenue, onStatusChange }) => {
    const [loading, setLoading] = useState(false);

    const TARGET_REVENUE = 100000000; // 100 triệu
    const progressPercentage = Math.min((currentMonthRevenue / TARGET_REVENUE) * 100, 100);
    const isEligible = currentMonthRevenue >= TARGET_REVENUE;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const handleRegister = async () => {
        try {
            setLoading(true);
            await merchantService.registerPartner();
            toast.success("Đăng ký thành công! Vui lòng chờ Admin duyệt.");
            onStatusChange();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (partnerStatus) {
            case PartnerStatus.APPROVED:
                return (
                    <div className="text-center py-3">
                        <div className="mb-3"><Crown size={48} className="text-warning" fill="#ffc107" /></div>
                        <h4 className="fw-bold text-warning">ĐỐI TÁC THÂN THIẾT</h4>
                        <p className="text-muted small">Đang hưởng mức chiết khấu ưu đãi.</p>
                        <Badge bg="warning" text="dark"><CheckCircle size={14} className="me-1"/>Đã xác thực</Badge>
                    </div>
                );
            case PartnerStatus.PENDING:
                return (
                    <div className="text-center py-4">
                        <Clock size={40} className="text-info mb-3" />
                        <h5>Đang chờ xét duyệt</h5>
                        <p className="text-muted small">Admin sẽ phản hồi sớm nhất.</p>
                        <Alert variant="info" className="py-2 mb-0 small">
                            Doanh thu: <strong>{formatCurrency(currentMonthRevenue)}</strong>
                        </Alert>
                    </div>
                );
            default: // NONE hoặc REJECTED
                return (
                    <div>
                        <div className="d-flex justify-content-between align-items-end mb-2">
                            <div>
                                <h6 className="fw-bold mb-1">Tiến độ doanh thu</h6>
                                <small className="text-muted">Mục tiêu: {formatCurrency(TARGET_REVENUE)}</small>
                            </div>
                            <h5 className={`mb-0 fw-bold ${isEligible ? 'text-success' : 'text-primary'}`}>
                                {progressPercentage.toFixed(1)}%
                            </h5>
                        </div>
                        <ProgressBar now={progressPercentage} variant={isEligible ? "success" : "primary"} className="mb-3" style={{ height: '10px' }} animated={isEligible}/>

                        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                            <span className="small text-muted"><TrendingUp size={16}/> Hiện tại:</span>
                            <span className="fw-bold">{formatCurrency(currentMonthRevenue)}</span>
                        </div>

                        {isEligible ? (
                            <Button variant="warning" className="w-100 fw-bold text-dark" onClick={handleRegister} disabled={loading}>
                                <Crown size={18} className="me-2"/>
                                {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                            </Button>
                        ) : (
                            <div className="text-center small text-muted">
                                <AlertCircle size={14} className="me-1"/>
                                Còn thiếu <strong>{formatCurrency(TARGET_REVENUE - currentMonthRevenue)}</strong>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <Card className="border-0 shadow-sm h-100"><Card.Body>{renderContent()}</Card.Body></Card>
    );
};