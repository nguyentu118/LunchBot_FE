import React from 'react';
import {Dropdown, Nav} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {Briefcase, LogOut, Settings, User, UserCircle} from 'lucide-react';
import toast from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

export type UserRole = string | null;

interface UserDropdownProps {
    userRole: UserRole;
    handleLogout: () => void;
    fullName: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({userRole, handleLogout, fullName}) => {
    const navigate = useNavigate();

    const normalizedRole = React.useMemo(() => {
        if (!userRole || typeof userRole !== 'string') {
            return null;
        }
        const normalized = userRole.trim().toUpperCase().replace(/^ROLE_/, '');
        return normalized;
    }, [userRole]);

    const handleMerchantDashboard = () => {
        navigate('/merchant/dashboard');
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

    return (
        <Dropdown as={Nav.Item} align="end">
            {/* DROPDOWN TOGGLE - Chỉ icon và tên */}
            <Dropdown.Toggle
                as={Nav.Link}
                className="d-flex align-items-center gap-2 text-white"
                style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {/* ICON USER */}
                <div
                    className="d-flex align-items-center justify-content-center bg-white rounded-circle"
                    style={{width: '32px', height: '32px', minWidth: '32px'}}
                >
                    <User size={18} className="text-primary"/>
                </div>

                {/* TÊN NGƯỜI DÙNG - Hiển thị tên đầy đủ */}
                <span className="fw-semibold" style={{fontSize: '15px'}}>
                    {fullName || 'User'}
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg mt-2" style={{minWidth: '220px'}}>
                {/* HEADER TRONG DROPDOWN */}
                <Dropdown.Header className="d-flex align-items-center fw-bold border-bottom pb-2">
                    <UserCircle size={18} className="me-2 text-primary"/>
                    <span className="text-truncate">{fullName}</span>
                </Dropdown.Header>

                {/* USER LOGIC */}
                {normalizedRole === 'USER' && (
                    <>
                        <Dropdown.Item
                            onClick={handleUpdateUserProfile}
                            className="d-flex align-items-center py-2"
                        >
                            <Settings size={16} className="me-2 text-primary"/>
                            Cập nhật Thông tin User
                        </Dropdown.Item>
                    </>
                )}

                {/* MERCHANT LOGIC */}
                {normalizedRole === 'MERCHANT' && (
                    <>
                        <Dropdown.Item
                            onClick={handleManageMerchant}
                            className="d-flex align-items-center py-2"
                        >
                            <Briefcase size={16} className="me-2 text-primary"/>
                            Quản lý Thông tin Nhà hàng
                        </Dropdown.Item>

                        <Dropdown.Item
                            onClick={handleMerchantDashboard}
                            className="d-flex align-items-center py-2"
                        >
                            <Briefcase size={16} className="me-2 text-primary"/>
                            Nhà hàng của tôi
                        </Dropdown.Item>
                    </>
                )}

                <Dropdown.Divider/>

                {/* Đăng xuất */}
                <Dropdown.Item
                    onClick={handleLogoutWithToast}
                    className="d-flex align-items-center text-danger py-2"
                >
                    <LogOut size={16} className="me-2"/>
                    Đăng xuất
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default UserDropdown;