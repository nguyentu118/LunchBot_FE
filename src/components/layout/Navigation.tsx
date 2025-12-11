import React, {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Badge, Button, Container, Dropdown, Nav, Navbar} from 'react-bootstrap';
import {
    Briefcase,
    Home,
    LogIn,
    LogOut,
    Settings,
    ShoppingCart,
    Sparkles,
    User,
    UserCircle,
    UtensilsCrossed
} from 'lucide-react';
import toast from 'react-hot-toast';

// IMPORT SERVICES
import {UserApiService} from '../../features/user/services/UserApi.service';
import {CartApiService} from '../../features/cart/services/CartApi.service';

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
    fullName: string;
    userRole: Role | string;
}

const Navigation: React.FC = () => {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState<IUserInfo>({
        isLoggedIn: false,
        userEmail: '',
        fullName: 'Tài khoản Khách hàng',
        userRole: '',
    });

    const [cartCount, setCartCount] = useState<number>(0);

    const checkLocalAuth = useCallback((): { isLoggedIn: boolean, userRole: string, userEmail: string } => {
        const token: string | null = localStorage.getItem('token');
        const email: string | null = localStorage.getItem('userEmail');
        const role: string | null = localStorage.getItem('userRole');

        let standardizedRole: string = '';
        let isLoggedIn = false;

        if (token) {
            isLoggedIn = true;
            if (role) {
                standardizedRole = role.toUpperCase().replace('ROLE_', '');
            }
        }

        return {
            isLoggedIn,
            userRole: standardizedRole,
            userEmail: email || '',
        };
    }, []);

    const fetchHeaderData = useCallback(async (isLoggedIn: boolean) => {
        if (!isLoggedIn) {
            setUserInfo(prev => ({...prev, fullName: 'Tài khoản Khách hàng'}));
            setCartCount(0);
            return;
        }

        try {
            const userMe = await UserApiService.getMeInfo();
            setUserInfo(prev => ({...prev, fullName: userMe.fullName}));

            const cartData = await CartApiService.getCartCount();
            setCartCount(cartData.count || 0);

        } catch (error) {
            console.error("Error fetching header data:", error);
        }
    }, []);

    useEffect(() => {
        const authData = checkLocalAuth();
        setUserInfo(prev => ({
            ...prev,
            ...authData,
        }));

        fetchHeaderData(authData.isLoggedIn);
    }, [checkLocalAuth, fetchHeaderData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        setUserInfo({isLoggedIn: false, userEmail: '', fullName: 'Tài khoản Khách hàng', userRole: ''});
        setCartCount(0);
        toast.success("Bạn đã đăng xuất thành công!");
        navigate('/');
    };

    const handleMerchantDashBoard = () => {
        navigate('/merchant/dashboard');
    };

    const handleUpdateUserProfile = () => {
        navigate('/user/update');
    };

    const handleManageMerchant = () => {
        navigate('/merchant/update');
    };

    // Normalize role để kiểm tra
    const normalizedRole = userInfo.userRole ? userInfo.userRole.toUpperCase().replace(/^ROLE_/, '') : null;

    // Tên hiển thị ngắn gọn (chỉ lấy tên đầu tiên)
    const displayName = userInfo.fullName ? userInfo.fullName.split(' ')[0] : 'User';


    return (
        <Navbar expand="lg" className="bg-lunchbot-primary" variant="dark">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex flex-column align-items-center me-4">
                    <div className="d-flex align-items-center">
                        {/* ... Logo */}
                        <div className="bg-white p-1 rounded shadow-sm me-2">
                            <svg className="text-danger" style={{width: '24px', height: '24px'}}
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="h5 fw-bold mb-0 text-white">Lunch<span
                                className="text-warning">Bot</span></h1>
                            <p className="text-sm mb-0 text-white-50">Bữa trưa ngon như mẹ nấu</p>
                        </div>
                    </div>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link as={Link} to="/" className="text-white mx-3 py-1 d-flex align-items-center">
                            <Home size={20} className="me-2"/>
                            <span>Trang chủ</span>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/deals" className="text-white mx-3 py-1 d-flex align-items-center">
                            <Sparkles size={20} className="me-2"/>
                            <span>Ưu đãi</span>
                        </Nav.Link>
                        <Nav.Link as={Link} to="/restaurants"
                                  className="text-white mx-3 py-1 d-flex align-items-center">
                            <UtensilsCrossed size={20} className="me-2"/>
                            <span>Nhà hàng</span>
                        </Nav.Link>
                        {/* ICON GIỎ HÀNG */}
                        <Nav.Link as={Link} to="/cart" className="text-white mx-3 py-1 position-relative">
                            <ShoppingCart size={24} color="#FFF"/>
                            {cartCount > 0 && (
                                <Badge pill bg="warning" className="position-absolute top-0 start-100 translate-middle">
                                    {cartCount}
                                </Badge>
                            )}
                        </Nav.Link>

                        {/* AUTH SECTION */}
                        {!userInfo.isLoggedIn ? (
                            <Button
                                variant="light"
                                className="ms-md-3 py-1 px-2 fw-bold d-flex align-items-center"
                                onClick={() => navigate('/login')}
                            >
                                <LogIn size={18} className="me-1 text-primary"/>
                                <span>Đăng nhập</span>
                            </Button>
                        ) : (
                            <Dropdown as={Nav.Item} align="end">
                                <Dropdown.Toggle
                                    as={Nav.Link}
                                    className="py-0 px-1 ms-md-3 d-flex align-items-center text-white "
                                >
                                    {/* ICON USER (Giữ nguyên kích thước 18 và me-1/me-2) */}
                                    <div>
                                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                                             style={{width: '32px', height: '32px'}}>
                                            <User size={20} className="text-white"/>
                                        </div>
                                    </div>
                                    {/* TÊN KHÁCH HÀNG (tay phải icon) */}
                                    <span className="fw-bold small">{displayName}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow-lg mt-2">
                                    <Dropdown.Header className="d-flex align-items-center fw-bold border-bottom">
                                        <UserCircle size={20} className="me-2 text-primary"/>
                                        {userInfo.fullName}
                                    </Dropdown.Header>

                                    {normalizedRole === 'USER' && (
                                        <>
                                            <Dropdown.Item
                                                onClick={handleUpdateUserProfile}
                                                className="d-flex align-items-center"
                                            >
                                                <Settings size={16} className="me-2 text-primary"/>
                                                Cập nhật Thông tin User
                                            </Dropdown.Item>

                                        </>
                                    )}

                                    {normalizedRole === 'MERCHANT' && (
                                        <>
                                            <Dropdown.Item
                                                onClick={handleMerchantDashBoard}
                                                className="d-flex align-items-center"
                                            >
                                                <Briefcase size={16} className="me-2 text-primary"/>
                                                Nhà hàng của tôi
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={handleManageMerchant}
                                                className="d-flex align-items-center"
                                            >
                                                <Briefcase size={16} className="me-2 text-primary"/>
                                                Quản lý Thông tin Nhà hàng
                                            </Dropdown.Item>


                                        </>
                                    )}

                                    <Dropdown.Divider/>

                                    <Dropdown.Item
                                        onClick={handleLogout}
                                        className="d-flex align-items-center text-danger"
                                    >
                                        <LogOut size={16} className="me-2"/>
                                        Đăng xuất
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;