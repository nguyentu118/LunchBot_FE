import React from 'react';
import { Card } from 'react-bootstrap';
import { Ticket } from 'lucide-react';
import CouponList from './CouponList';

interface UserCouponSectionProps {
    merchantId: number;
    merchantName?: string;
    brandColor?: string;
}

const UserCouponSection: React.FC<UserCouponSectionProps> = ({
                                                                 merchantId,
                                                                 merchantName,
                                                                 brandColor = '#FF5E62'
                                                             }) => {
    return (
        <div className="my-4">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div
                            className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                            style={{
                                backgroundColor: `${brandColor}20`,
                                width: '60px',
                                height: '60px'
                            }}
                        >
                            <Ticket size={30} color={brandColor} />
                        </div>
                        <div>
                            <h3 className="mb-1 fw-bold">Mã giảm giá có sẵn</h3>
                            {merchantName && (
                                <p className="mb-0 text-muted">
                                    Từ cửa hàng: <strong>{merchantName}</strong>
                                </p>
                            )}
                        </div>
                    </div>

                    <CouponList
                        merchantId={merchantId}
                        onlyActive={true}
                        showMerchantView={false}
                        brandColor={brandColor}
                        emptyMessage="Cửa hàng chưa có mã giảm giá nào"
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default UserCouponSection;