import React from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { RefreshCw, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCouponList } from '../hooks/useCouponList';
import CouponCard from './CouponCard';

interface CouponListProps {
    merchantId?: number;
    onlyActive?: boolean;
    showMerchantView?: boolean;
    title?: string;
    brandColor?: string;
    emptyMessage?: string;
}

const CouponList: React.FC<CouponListProps> = ({
                                                   merchantId,
                                                   onlyActive = false,
                                                   showMerchantView = false,
                                                   title,
                                                   brandColor = '#FF5E62',
                                                   emptyMessage = 'Chưa có mã giảm giá nào'
                                               }) => {
    const { coupons, isLoading, error, refetch } = useCouponList({
        merchantId,
        onlyActive,
        autoFetch: true
    });

    const handleCopyCode = (code: string) => {
        toast.success(`Đã sao chép mã: ${code}`, {
            icon: '📋',
            duration: 2000
        });
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: brandColor }} />
                <p className="mt-3 text-muted">Đang tải danh sách mã giảm giá...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-4">
                <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" size="sm" onClick={refetch}>
                    <RefreshCw size={16} className="me-2" />
                    Thử lại
                </Button>
            </Alert>
        );
    }

    return (
        <div>
            {title && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold d-flex align-items-center gap-2">
                        <Ticket size={28} color={brandColor} />
                        {title}
                    </h3>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={refetch}
                        className="d-flex align-items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </Button>
                </div>
            )}

            {coupons.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                    <Ticket size={48} className="mb-3 opacity-50" />
                    <p className="mb-0">{emptyMessage}</p>
                </Alert>
            ) : (
                <Row className="g-3">
                    {coupons.map((coupon) => (
                        <Col key={coupon.id} xs={12} sm={6} lg={4}>
                            <CouponCard
                                coupon={coupon}
                                showMerchantView={showMerchantView}
                                brandColor={brandColor}
                                onCopy={handleCopyCode}
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default CouponList;