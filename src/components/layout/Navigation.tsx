import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';

// Import component UserDropdown
import UserDropdown from './../common/UserDropdown';

// Định nghĩa Enum cho Role
enum Role {
    USER = 'USER',
    MERCHANT = 'MERCHANT',
    ADMIN = 'ADMIN',
}

// Định nghĩa kiểu dữ liệu cho User Info
interface IUserInfo {
    isLoggedIn: boolean;
    userEmail: string;
    userRole: Role | string;
}

const Navigation: React.FC = () => {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState<IUserInfo>({
        isLoggedIn: false,
        userEmail: '',
        userRole: '',
    });

    // 1. Logic kiểm tra trạng thái đăng nhập
    const checkLoginStatus = useCallback(() => {
        const token: string | null = localStorage.getItem('token');
        const email: string | null = localStorage.getItem('userEmail');
        let role: string | null = localStorage.getItem('userRole');

        let standardizedRole: string = '';

        if (token) {
            if (role) {
                // CHUẨN HÓA ROLE: Viết hoa và loại bỏ tiền tố ROLE_
                standardizedRole = role.toUpperCase().replace('ROLE_', '');
                console.log('Role normalized:', standardizedRole);
            } else {
                // Mặc định là USER nếu có token nhưng không có role
                standardizedRole = Role.USER;
                localStorage.setItem('userRole', Role.USER);
            }
        }

        setUserInfo({
            isLoggedIn: !!token,
            userEmail: email || '',
            userRole: standardizedRole,
        });
    }, []);

    // 2. useEffect và Listener
    useEffect(() => {
        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, [checkLoginStatus]);

    // 3. Hàm Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');

        setUserInfo({ isLoggedIn: false, userEmail: '', userRole: '' });

        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    return (
        <Navbar
            expand="md"
            variant="dark"
            className="shadow sticky-top"
            style={{ backgroundColor: '#FF5E62' }}
        >
            <Container>
                {/* Logo */}
                <Navbar.Brand as={Link} to="/">
                    <div className="d-flex align-items-center">
                        <div className="bg-white p-1 rounded shadow-sm me-2">
                            <svg
                                className="text-danger"
                                style={{ width: '24px', height: '24px' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="h5 fw-bold mb-0 text-white">
                                Lunch<span className="text-warning">Bot</span>
                            </h1>
                            <p className="text-sm mb-0 text-white-50" style={{ fontSize: '0.75rem' }}>
                                Gợi ý món ngon mỗi ngày
                            </p>
                        </div>
                    </div>
                </Navbar.Brand>

                {/* Toggle cho Mobile */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                {/* Menu Items */}
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        {/* Navigation Links */}
                        <Nav.Link as={Link} to="/" className="text-white mx-2">
                            🏠 Trang chủ
                        </Nav.Link>
                        <Nav.Link as={Link} to="/deals" className="text-white mx-2">
                            🎁 Ưu đãi
                        </Nav.Link>
                        <Nav.Link as={Link} to="/restaurants" className="text-white mx-2">
                            🍽️ Nhà hàng
                        </Nav.Link>

                        {/* Auth Section */}
                        {!userInfo.isLoggedIn ? (
                            /* Not Logged In - Show Login Button */
                            <Button
                                variant="light"
                                className="ms-md-3 mt-2 mt-md-0 fw-bold"
                                onClick={() => navigate('/login')}
                            >
                                🔐 Đăng nhập
                            </Button>
                        ) : (
                            /* Logged In - Show UserDropdown */
                            <UserDropdown
                                userRole={userInfo.userRole}
                                handleLogout={handleLogout}
                            />
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;