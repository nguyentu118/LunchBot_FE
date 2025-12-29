import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import {
    Home,
    ShoppingBag,
    UtensilsCrossed,
    Ticket,
    BarChart3,
    DollarSign,
    Settings,
    Camera,
    User, Loader, Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../config/axiosConfig';
import Navigation from '../../components/layout/Navigation';

interface MerchantInfo {
    restaurantName: string;
    avatarUrl?: string;
}

const customStyles = {
    primaryPink: '#ff5e62',
    sidebarBg: {
        background: 'linear-gradient(to bottom right, #dc3545, #ff5e62)'
    },
};

interface SidebarLinkProps {
    to: string;
    icon: React.ElementType;
    text: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, text }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `btn w-100 py-2 mb-2 fw-semibold d-flex justify-content-start align-items-center gap-2 text-decoration-none ${
                isActive ? 'active-link' : ''
            }`
        }
        style={({ isActive }) => ({
            borderRadius: '0.5rem',
            backgroundColor: isActive ? 'white' : 'transparent',
            color: isActive ? customStyles.primaryPink : 'white',
            border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.9rem'
        })}
    >
        <Icon size={18} />
        {text}
    </NavLink>
);

const MerchantLayout: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [merchantInfo, setMerchantInfo] = useState<MerchantInfo>({ restaurantName: 'Đang tải...' });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchMerchantProfile = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get('/merchants/my-profile');
                setMerchantInfo({
                    restaurantName: response.data.restaurantName || 'Cửa hàng của tôi',
                    avatarUrl: response.data.avatarUrl
                });
            } catch (error) {
                console.error('❌ Lỗi tải thông tin Merchant:', error);
                toast.error('Không thể tải thông tin Merchant');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMerchantProfile();
    }, []);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const CLOUD_NAME = 'dxoln0uq3';
        const UPLOAD_PRESET = 'lunchbot_dishes';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const loadingToast = toast.loading('Đang tải ảnh lên...');

        try {
            setIsUploading(true);

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );

            if (!cloudinaryRes.ok) {
                throw new Error('Upload Cloudinary thất bại');
            }

            const imageData = await cloudinaryRes.json();
            const secureUrl = imageData.secure_url;

            await axiosInstance.patch('/merchants/my-profile/avatar', {
                avatarUrl: secureUrl
            });

            setMerchantInfo(prev => ({
                ...prev,
                avatarUrl: secureUrl
            }));

            toast.dismiss(loadingToast);
            toast.success('Cập nhật ảnh đại diện thành công!');
        } catch (error: any) {
            console.error('❌ Upload error:', error);
            toast.dismiss(loadingToast);
            toast.error('Lỗi khi cập nhật ảnh: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" variant="danger" />
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            {/* Header */}
            <header className="shadow-sm" style={{ backgroundColor: customStyles.primaryPink }}>
                <Navigation />
            </header>

            <div className="container-fluid px-3 py-3">
                {/* Merchant Info Card */}
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center bg-white rounded-3 p-3 shadow-sm">
                            <div className="d-flex align-items-start gap-3">
                                <div className="position-relative">
                                    <div
                                        className="rounded-circle border border-4 border-white shadow-sm overflow-hidden bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {merchantInfo?.avatarUrl ? (
                                            <img
                                                src={merchantInfo.avatarUrl}
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                                alt="Merchant Avatar"
                                            />
                                        ) : (
                                            <User size={40} className="text-secondary" />
                                        )}

                                        {isUploading && (
                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                            >
                                                <Spinner animation="border" size="sm" variant="light" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle border-0 p-2 shadow"
                                        style={{ width: '36px', height: '36px' }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera size={16} />
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                <div className="pt-2">
                                    <h4 className="mb-1 fw-bold" style={{ color: customStyles.primaryPink }}>
                                        {merchantInfo.restaurantName}
                                    </h4>
                                    <p className="text-muted mb-0 small">Quản lý nhà hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Sidebar */}
                    <div className="col-lg-3">
                        <div className="rounded-3 p-3 shadow-sm sticky-top" style={{ ...customStyles.sidebarBg, top: '20px' }}>
                            <h6 className="fw-bold text-white mb-3">Menu</h6>
                            <div className="d-grid">
                                <SidebarLink to="/merchant/dashboard" icon={Home} text="Tổng quan" />

                                <SidebarLink to="/merchant/orders" icon={ShoppingBag} text="Đơn hàng" />

                                <SidebarLink to="/merchant/menu" icon={UtensilsCrossed} text="Món ăn" />

                                <SidebarLink to="/merchant/coupons" icon={Ticket} text="Mã giảm giá" />

                                <SidebarLink to="/merchant/wallet" icon={Wallet} text="Ví tiền & Tài chính" />

                                {/* Thống kê - Dropdown style */}
                                <div className="mt-2 mb-1">
                                    <div className="text-white small fw-semibold mb-2 ps-2" style={{ opacity: 0.8 }}>
                                        THỐNG KÊ & BÁO CÁO
                                    </div>
                                    <SidebarLink to="/merchant/analytics/revenue" icon={DollarSign} text="Doanh số" />
                                    <SidebarLink to="/merchant/analytics/dishes" icon={UtensilsCrossed} text="Theo món" />
                                    <SidebarLink to="/merchant/analytics/customers" icon={User} text="Theo khách" />
                                    <SidebarLink to="/merchant/analytics/coupons" icon={Ticket} text="Theo mã giảm" />
                                    <SidebarLink to="/merchant/analytics/order-status" icon={Loader} text="Theo trạng thái " />
                                </div>

                                <div className="border-top border-white border-opacity-25 my-2"></div>

                                <SidebarLink to="/merchant/revenue-reconciliation" icon={BarChart3} text="Đối soát" />

                                <SidebarLink to="/merchant/settings" icon={Settings} text="Cài đặt" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        <div className="bg-white rounded-3 shadow-sm p-3" style={{ minHeight: '500px' }}>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantLayout;