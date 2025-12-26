import React, {useCallback, useEffect, useState} from 'react';
import {Link, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Badge, Button, Container, Form, InputGroup, Nav, Navbar} from 'react-bootstrap';
import {
    BarChart3,
    Bell,
    ClipboardCheck, Crown,
    Home,
    Menu,
    Moon,
    Package,
    Search,
    Settings,
    Shield,
    Store,
    Sun,
    Truck,
    Users
} from 'lucide-react';
import {ROUTES} from '../../routes/route.constants';
import './AdminLayout.css';
import AdminProfileDropdown from "./AdminProfileDropdown.tsx";

export const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [adminName, setAdminName] = useState('Admin');
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {id: 'dashboard', label: 'Dashboard', icon: Home, path: ROUTES.ADMIN.DASHBOARD},
        {id: 'users', label: 'Quản lý User', icon: Users, path: '/admin/users'},
        {id: 'merchants', label: 'Quản lý Merchant', icon: Store, path: ROUTES.ADMIN.MERCHANTS},
        {
            id: 'reconciliation',
            label: 'Đối soát doanh thu',
            icon: ClipboardCheck,
            path: ROUTES.ADMIN.RECONCILIATION
        },
        {
            id: 'partner-requests',
            label: 'Duyệt Đối tác',
            icon: Crown,
            path: ROUTES.ADMIN.PARTNER_REQUESTS
        },
        {id: 'drivers', label: 'Quản lý Tài xế', icon: Truck, path: '/admin/drivers'},
        {id: 'orders', label: 'Đơn hàng', icon: Package, path: '/admin/orders'},
        {id: 'reports', label: 'Báo cáo', icon: BarChart3, path: '/admin/reports'},
        {id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings'},
    ];

    const handleLogout = useCallback(() => {
        // Xóa tất cả token/role
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        // Logic để lấy tên thật của Admin khi component mount
        const fullName = localStorage.getItem('userFullName') || 'Admin';
        setAdminName(fullName);
    }, []);

    const isActiveRoute = (path: string) => location.pathname === path;

    return (
        <div className={`admin-layout ${darkMode ? 'dark-mode' : ''}`}>
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${darkMode ? 'bg-dark' : 'bg-white'} border-end`}>
                {/* Logo */}
                <div className="sidebar-header p-3 border-bottom">
                    <Link to={ROUTES.ADMIN.DASHBOARD} className="text-decoration-none d-flex align-items-center gap-2">
                        <div className="logo-icon bg-primary rounded d-flex align-items-center justify-content-center">
                            <Store className="text-white" size={24}/>
                        </div>
                        {sidebarOpen && <span className={`fw-bold fs-5 ${darkMode ? 'text-white' : 'text-dark'}`}>LunchBot</span>}
                    </Link>
                </div>

                {/* Menu */}
                <div className="sidebar-menu p-3">
                    <div className={`text-uppercase small fw-semibold mb-3 ${darkMode ? 'text-secondary' : 'text-muted'}`}>
                        {sidebarOpen ? 'MENU' : '...'}
                    </div>
                    <Nav className="flex-column gap-1">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <Nav.Link
                                    key={item.id}
                                    as={Link}
                                    to={item.path}
                                    className={`menu-item d-flex align-items-center gap-3 px-3 py-2 rounded ${
                                        isActiveRoute(item.path) ? 'active bg-primary bg-opacity-10 text-primary' : ''
                                    } ${!sidebarOpen ? 'justify-content-center' : ''}`}
                                >
                                    <Icon size={20}/>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Nav.Link>
                            );
                        })}
                    </Nav>
                </div>

                {/* Upgrade Card */}
                <div className="sidebar-footer p-3 border-top mt-auto">
                    <div className={`upgrade-card ${darkMode ? 'bg-dark' : 'bg-primary'} bg-opacity-10 rounded p-3`}>
                        {sidebarOpen ? (
                            <>
                                <div className="small fw-semibold text-primary mb-2">Nâng cấp Pro</div>
                                <div className="small text-muted mb-3">Truy cập thêm 400+ tính năng</div>
                                <Button variant="primary" size="sm" className="w-100">
                                    Nâng cấp
                                </Button>
                            </>
                        ) : (
                            <Shield className="text-primary mx-auto d-block" size={24}/>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <Navbar className={`${darkMode ? 'bg-dark' : 'bg-white'} border-bottom px-4`}>
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <Button
                            variant="link"
                            className={darkMode ? 'text-white' : 'text-dark'}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24}/>
                        </Button>

                        <InputGroup className="search-input" style={{maxWidth: '400px'}}>
                            <InputGroup.Text className={darkMode ? 'bg-dark text-white' : 'bg-light'}>
                                <Search size={18}/>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Tìm kiếm hoặc gõ lệnh..."
                                className={darkMode ? 'bg-dark text-white' : ''}
                            />
                            <InputGroup.Text className={darkMode ? 'bg-dark text-white' : 'bg-light'}>
                                <small className="text-muted">⌘K</small>
                            </InputGroup.Text>
                        </InputGroup>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <Button
                            variant={darkMode ? 'dark' : 'light'}
                            onClick={() => setDarkMode(!darkMode)}
                            className="rounded"
                        >
                            {darkMode ? <Sun size={20} className="text-warning"/> : <Moon size={20}/>}
                        </Button>

                        <Button variant={darkMode ? 'dark' : 'light'} className="position-relative rounded">
                            <Bell size={20}/>
                            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle p-1">
                                <span className="visually-hidden">notifications</span>
                            </Badge>
                        </Button>

                        <div className="d-flex align-items-center gap-2 ps-3 border-start">
                            <AdminProfileDropdown
                                adminName={adminName}
                                handleLogout={handleLogout}
                            />
                        </div>
                    </div>
                </Navbar>

                {/* Content Area */}
                <Container fluid className="content-area p-4" style={{maxWidth: '100%'}}>
                    <Outlet/>
                </Container>
            </div>
        </div>
    );
};