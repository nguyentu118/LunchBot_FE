import React from 'react';
import { Dropdown, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Briefcase, Settings } from 'lucide-react';
// 💡 BƯỚC 1: Import toast từ thư viện react-hot-toast
import toast from 'react-hot-toast';

export type UserRole = string | null;

interface UserDropdownProps {
    // 💡 Đổi tên prop handleLogout thành onLogout để rõ ràng hơn (tùy chọn)
    userRole: UserRole;
    handleLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userRole, handleLogout }) => {
    const navigate = useNavigate();

    const normalizedRole = React.useMemo(() => {
        if (!userRole || typeof userRole !== 'string') {
            console.warn('Invalid role received:', userRole);
            return null;
        }

        const normalized = userRole.trim().toUpperCase().replace(/^ROLE_/, '');
        console.log('Original role:', userRole, '=> Normalized:', normalized);
        return normalized;
    }, [userRole]);

    const handleUpgrade = () => {
        navigate('/register-merchant');
    };

    const handleUpdateUserProfile = () => {
        navigate('/user/update');
    };

    const handleManageMerchant = () => {
        navigate('/merchant/update');
    };

    // 💡 BƯỚC 2: Tạo hàm xử lý đăng xuất MỚI để gọi Toast
    const handleLogoutWithToast = () => {
        // Hiển thị thông báo Toast trước hoặc sau khi gọi hàm đăng xuất chính
        toast.success('Bạn đã đăng xuất thành công!', {
            // Tùy chọn cấu hình Toast (ví dụ: thời gian hiển thị)
            duration: 3000,
            position: 'top-center',
        });

        // Gọi hàm đăng xuất gốc (thường chứa logic xóa token, chuyển hướng)
        handleLogout();
    };

    if (!normalizedRole) {
        console.error('No valid role found');
        return null;
    }

    const isValidRole = ['USER', 'MERCHANT'].includes(normalizedRole);
    if (!isValidRole) {
        console.error('Unknown role:', normalizedRole);
        return null;
    }

    // ✅ CUSTOM TOGGLE - Không có mũi tên
    const CustomToggle = React.forwardRef<HTMLDivElement, any>(({ onClick }, ref) => (
        <div
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            style={{ cursor: 'pointer' }}
            className="d-inline-block"
        >
            <div className="rounded-circle p-2 shadow-sm bg-light d-flex align-items-center justify-content-center"
                 style={{ width: '40px', height: '40px' }}>
                <User size={20} className="text-primary" />
            </div>
        </div>
    ));

    return (
        <Dropdown as={Nav.Item} align="end" className="ms-md-3 mt-2 mt-md-0">
            {/* ✅ Sử dụng Custom Toggle */}
            <Dropdown.Toggle as={CustomToggle} id="user-dropdown" />

            <Dropdown.Menu className="shadow-lg rounded-3 p-2">
                <Dropdown.Header className="fw-bold text-dark">
                    {normalizedRole === 'MERCHANT' ? 'Tài khoản Đối tác' : 'Tài khoản Khách hàng'}
                </Dropdown.Header>
                <Dropdown.Divider />

                {/* ... Các Dropdown.Item khác ... */}
                {normalizedRole === 'USER' && (
                    <>
                        <Dropdown.Item
                            onClick={handleUpdateUserProfile}
                            className="d-flex align-items-center"
                        >
                            <Settings size={16} className="me-2 text-primary" />
                            Cập nhật Thông tin User
                        </Dropdown.Item>

                    </>
                )}

                {normalizedRole === 'MERCHANT' && (
                    <>
                        <Dropdown.Item
                            onClick={handleManageMerchant}
                            className="d-flex align-items-center"
                        >
                            <Briefcase size={16} className="me-2 text-primary" />
                            Quản lý Thông tin Nhà hàng
                        </Dropdown.Item>
                    </>
                )}

                <Dropdown.Divider />
                {/* 💡 BƯỚC 3: Thay đổi onClick sang hàm MỚI */}
                <Dropdown.Item
                    onClick={handleLogoutWithToast}
                    className="d-flex align-items-center text-danger"
                >
                    <LogOut size={16} className="me-2" />
                    Đăng xuất
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default UserDropdown;