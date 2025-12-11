import React from 'react';
import { Dropdown, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {LogOut, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '../../routes/route.constants';

interface AdminProfileDropdownProps {
    adminName: string;
    handleLogout: () => void;
}

const AdminProfileDropdown: React.FC<AdminProfileDropdownProps> = ({ adminName, handleLogout }) => {
    const navigate = useNavigate();

    // Hàm bao bọc handleLogout để thêm thông báo toast
    const handleLogoutWithToast = () => {
        handleLogout();
        toast.success('Đã đăng xuất thành công.');
        navigate(ROUTES.AUTH.LOGIN, { replace: true });
    };

    // Hàm chuyển đổi tên thành Avatar viết tắt (ví dụ: 'Admin' -> 'AD')
    const getInitials = (name: string): string => {
        if (!name) return 'U';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Tên hiển thị (Bạn có thể lấy từ Context/State nếu có)
    const displayAdminName = adminName || "Admin";

    return (
        <Dropdown as={Nav.Item} align="end">
            <Dropdown.Toggle as={Nav.Link} className="p-0 d-flex align-items-center gap-2">
                <div className="d-flex align-items-center gap-2 ps-3 border-start">

                    {/* AVATAR: Thay thế khối AD tĩnh */}
                    <div className="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                         style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                        {getInitials(displayAdminName)}
                    </div>

                    {/* TÊN VÀ VAI TRÒ */}
                    <div className="text-dark"> {/* Dùng text-dark mặc định hoặc dùng prop darkMode */}
                        <div className="fw-semibold small">{displayAdminName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Administrator</div>
                    </div>
                </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm">
                {/* Tiêu đề hoặc thông tin Profile (Optional) */}
                <Dropdown.Header className="text-muted small border-bottom mb-2">
                    {displayAdminName} ({'Admin'})
                </Dropdown.Header>

                {/* Ví dụ: Link quản lý chung (nếu có) */}
                <Dropdown.Item
                    onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)} // Giả sử đây là trang chính
                    className="d-flex align-items-center"
                >
                    <Briefcase size={16} className="me-2 text-info" />
                    Bảng điều khiển
                </Dropdown.Item>

                <Dropdown.Divider />

                {/* ĐĂNG XUẤT */}
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

export default AdminProfileDropdown;