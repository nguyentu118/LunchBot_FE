import React, { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Settings as SettingsIcon, Store, Clock,  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Import Component thẻ Loyalty

import {merchantService} from "../../features/merchants/services/merchantService.ts";
import {MerchantProfileResponse, PartnerStatus} from "../../features/merchants/types/merchant.ts";
import {LoyaltyPartnerCard} from "../../features/merchants/LoyaltyPartnerCard.tsx";

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<MerchantProfileResponse | null>(null);

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

    return (
        <div className="container-fluid p-0">
            <h5 className="fw-bold mb-4">Cài đặt & Hồ sơ</h5>

            <div className="row g-4">
                {/* CỘT TRÁI: CÁC MENU CÀI ĐẶT CŨ */}
                <div className="col-lg-8">
                    <Alert variant="info" className="mb-4">
                        <SettingsIcon size={20} className="me-2" />
                        Quản lý thông tin và cài đặt nhà hàng của bạn
                    </Alert>

                    <div className="d-flex flex-column gap-3">
                        {/* Thông tin nhà hàng */}
                        <div className="border rounded p-3 bg-white shadow-sm cursor-pointer" onClick={() => navigate('/merchant/update')}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <Store size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h6 className="mb-1">Thông tin nhà hàng</h6>
                                        <p className="text-muted small mb-0">Cập nhật tên, địa chỉ, mô tả</p>
                                    </div>
                                </div>
                                <Button variant="outline-primary" size="sm">Cập nhật</Button>
                            </div>
                        </div>

                        {/* Giờ mở cửa */}
                        <div className="border rounded p-3 bg-white shadow-sm">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <Clock size={24} className="text-success" />
                                    </div>
                                    <div>
                                        <h6 className="mb-1">Giờ mở cửa</h6>
                                        <p className="text-muted small mb-0">Cấu hình thời gian hoạt động</p>
                                    </div>
                                </div>
                                <Button variant="outline-secondary" size="sm" disabled>Sắp ra mắt</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: THẺ LOYALTY (MỚI) */}
                <div className="col-lg-4">
                    {profile && (
                        <LoyaltyPartnerCard
                            partnerStatus={profile.partnerStatus || PartnerStatus.NONE}
                            currentMonthRevenue={profile.currentMonthRevenue || 0}
                            onStatusChange={fetchProfile} // Reload sau khi đăng ký
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;