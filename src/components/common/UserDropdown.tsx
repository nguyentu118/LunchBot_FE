import React from 'react';
import { Dropdown, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Briefcase, Settings, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export type UserRole = string | null;

interface UserDropdownProps {
    userRole: UserRole;
    handleLogout: () => void;
    fullName: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userRole, handleLogout, fullName }) => {
    const navigate = useNavigate();

    const normalizedRole = React.useMemo(() => {
        if (!userRole || typeof userRole !== 'string') {
            return null;
        }
        const normalized = userRole.trim().toUpperCase().replace(/^ROLE_/, '');
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

    const handleLogoutWithToast = () => {
        handleLogout();
        toast.success("Bạn đã đăng xuất thành công!");
    };

    // Lấy tên đầu tiên để hiển thị
    const displayName = fullName ? fullName.split(' ')[0] : 'User';

    return (
        <Dropdown as={Nav.Item} align="end">
            {/* ⭐ DROPDOWN TOGGLE - Icon bên trái, Tên bên phải, tách biệt rõ ràng */}
            <Dropdown.Toggle
                as={Nav.Link}
                className="py-2 px-3 ms-md-3 rounded-pill bg-white text-primary border border-primary"
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex align-items-center gap-2">
                    {/* ICON USER - Bên trái */}
                    <div className="d-flex align-items-center justify-content-center bg-primary rounded-circle"
                         style={{ width: '32px', height: '32px' }}>
                        <User size={18} className="text-white" />
                    </div>

                    {/* TÊN NGƯỜI DÙNG - Bên phải */}
                    <span className="fw-bold" style={{ fontSize: '14px' }}>
                        {displayName}
                    </span>
                </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg mt-2">
                {/* HEADER TRONG DROPDOWN */}
                <Dropdown.Header className="d-flex align-items-center fw-bold border-bottom">
                    <UserCircle size={20} className="me-2 text-primary" />
                    {fullName}
                </Dropdown.Header>

                {/* USER LOGIC */}
                {normalizedRole === 'USER' && (
                    <>
                        <Dropdown.Item
                            onClick={handleUpdateUserProfile}
                            className="d-flex align-items-center"
                        >
                            <Settings size={16} className="me-2 text-primary" />
                            Cập nhật Thông tin User
                        </Dropdown.Item>

                        <Dropdown.Item
                            onClick={handleUpgrade}
                            className="d-flex align-items-center"
                        >
                            <Briefcase size={16} className="me-2 text-warning" />
                            Đăng ký làm Đối tác/Nhà hàng
                        </Dropdown.Item>
                    </>
                )}

                {/* MERCHANT LOGIC */}
                {normalizedRole === 'MERCHANT' && (
                    <Dropdown.Item
                        onClick={handleManageMerchant}
                        className="d-flex align-items-center"
                    >
                        <Briefcase size={16} className="me-2 text-primary" />
                        Quản lý Thông tin Nhà hàng
                    </Dropdown.Item>
                )}

                <Dropdown.Divider />

                {/* Đăng xuất */}
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