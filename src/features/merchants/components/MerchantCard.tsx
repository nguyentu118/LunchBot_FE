// src/features/merchants/components/MerchantCard.tsx

import React from 'react';
import { Card } from 'react-bootstrap';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MerchantDTO } from '../services/MerchantApi.service';

interface MerchantCardProps {
    merchant: MerchantDTO;
}

const MerchantCard: React.FC<MerchantCardProps> = ({ merchant }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/merchants/profile/${merchant.id}`);
    };

    const defaultAvatar = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop';

    return (
        <Card
            className="h-100 shadow-sm border-0 merchant-card"
            style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '15px' // Thêm bo góc cho hiện đại
            }}
            onClick={handleClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
            }}
        >
            <Card.Img
                variant="top"
                src={merchant.avatarUrl || defaultAvatar}
                alt={merchant.restaurantName}
                style={{
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '15px 15px 0 0'
                }}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                }}
            />
            <Card.Body>
                {/* 1. Đổi text-primary sang màu Dark của Navigation (#212529) */}
                <Card.Title className="fw-bold mb-3" style={{ color: '#212529', fontSize: '1.2rem' }}>
                    {merchant.restaurantName}
                </Card.Title>

                {/* 2. Các thông tin chi tiết dùng màu xám đậm chuyên nghiệp */}
                <div className="mb-2 d-flex align-items-start style={{ color: '#495057' }} small">
                    <MapPin size={16} className="me-2 mt-1 flex-shrink-0" style={{ color: '#6c757d' }} />
                    <span className="text-muted">{merchant.address}</span>
                </div>

                <div className="mb-2 d-flex align-items-center small">
                    <Phone size={16} className="me-2" style={{ color: '#6c757d' }} />
                    <span className="text-muted">{merchant.phone}</span>
                </div>

                {merchant.email && (
                    <div className="mb-2 d-flex align-items-center small">
                        <Mail size={16} className="me-2" style={{ color: '#6c757d' }} />
                        <span className="text-muted text-truncate">{merchant.email}</span>
                    </div>
                )}

                {/* 3. Phần giờ mở cửa giữ màu xanh success hoặc chuyển trung tính */}
                <div className="mt-3 d-flex align-items-center small">
                    <Clock size={16} className="me-2 text-success" />
                    <span className="fw-medium text-dark">
                        {(merchant.openTime && merchant.closeTime)
                            ? `${merchant.openTime.substring(0, 5)} - ${merchant.closeTime.substring(0, 5)}`
                            : "Đang cập nhật"
                        }
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default MerchantCard;