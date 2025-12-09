import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Định nghĩa Enum cho Role để tránh lỗi chính tả
enum UserRole {
    USER = 'USER',
    MERCHANT = 'MERCHANT',
    ADMIN = 'ADMIN', // Thêm nếu cần
}

// Định nghĩa kiểu dữ liệu cho User Info
interface IUserInfo {
    isLoggedIn: boolean;
    userEmail: string;
    userRole: UserRole | string; // Có thể là UserRole hoặc chuỗi rỗng
}

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Sử dụng useState để lưu trữ thông tin đăng nhập
    const [userInfo, setUserInfo] = useState<IUserInfo>({
        isLoggedIn: false,
        userEmail: '',
        userRole: '',
    });

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

    // 1. Logic kiểm tra trạng thái đăng nhập
    const checkLoginStatus = useCallback(() => {
        const token: string | null = localStorage.getItem('token');
        const email: string | null = localStorage.getItem('userEmail');
        const role: string | null = localStorage.getItem('userRole');

        setUserInfo({
            isLoggedIn: !!token,
            userEmail: email || '',
            // Ép kiểu Role
            userRole: (role as UserRole) || '',
        });
    }, []);

    // 2. useEffect: Kiểm tra trạng thái khi mount và lắng nghe sự kiện storage
    useEffect(() => {
        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus);
        return () => window.removeEventListener('storage', checkLoginStatus);
    }, [checkLoginStatus]);

    // 3. Logic Đăng xuất
    const handleLogout = (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');

        setUserInfo({
            isLoggedIn: false,
            userEmail: '',
            userRole: '',
        });

        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
        toast.success('Đã đăng xuất thành công!');
        navigate('/login');
    };

    // 4. Logic kiểm tra Active Path
    const isActive = (path: string): boolean => location.pathname === path;

    const { isLoggedIn, userEmail, userRole } = userInfo;
    const initialLetter = userEmail ? userEmail.charAt(0).toUpperCase() : '';

    return (
        // Đã thay đổi background: Dùng màu solid (như hình) và loại bỏ shadow
        <nav className="bg-[#E95A62] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Giảm chiều cao thanh điều hướng (h-16 -> h-20 để chứa được logo 2 dòng) */}
                <div className="flex justify-between items-center h-20">
                    {/* Logo & Brand - Chỉnh sửa để giống Logo 2 dòng trong hình */}
                    <div className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center space-x-2 group no-underline">
                            {/* Icon LunchBot (Túi xách) */}
                            <div className="bg-white p-2 rounded-md shadow-md">
                                <svg
                                    className="w-5 h-5 text-[#E95A62]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    {/* Icon Túi xách/Giỏ hàng */}
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                {/* LunchBot text */}
                                <h1 className="text-xl font-extrabold text-white tracking-tight">
                                    Lunch<span className="text-yellow-300">Bot</span>
                                </h1>
                                <p className="text-sm text-white -mt-1 opacity-90">Gợi ý món ngon mỗi ngày</p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Các Link Điều hướng (Dùng text-white hover mờ) */}
                        <Link
                            to="/"
                            className="px-2 py-1 rounded-sm text-sm font-medium text-white transition-colors duration-200 no-underline hover:opacity-80"
                        >
                            🏠 Trang chủ
                        </Link>
                        <Link
                            to="/promotions"
                            className="px-2 py-1 rounded-sm text-sm font-medium text-white transition-colors duration-200 no-underline hover:opacity-80"
                        >
                            🎁 Ưu đãi
                        </Link>
                        <Link
                            to="/stores"
                            className="px-2 py-1 rounded-sm text-sm font-medium text-white transition-colors duration-200 no-underline hover:opacity-80"
                        >
                            🛒 Nhà hàng
                        </Link>

                        {isLoggedIn ? (
                            <>
                                {/* Profile Dropdown (Giữ nguyên logic Dropdown nhưng làm style đơn giản hơn) */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-opacity-10 transition-all duration-200 border border-white hover:bg-white hover:text-[#E95A62]"
                                    >
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-[#E95A62] font-bold text-xs">
                                                {initialLetter}
                                            </span>
                                        </div>
                                        <span className="hidden lg:block">{userEmail.split('@')[0]}</span>
                                        <svg
                                            className={`w-3 h-3 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {userRole === UserRole.MERCHANT ? '👨‍🍳 Chủ nhà hàng' : '👤 Người dùng'}
                                                </p>
                                            </div>

                                            {/* Links phân quyền... (giữ nguyên logic) */}
                                            {userRole === UserRole.MERCHANT ? (
                                                <Link
                                                    to="/merchant/update"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-150 no-underline"
                                                >
                                                    ✏️ Cập nhật thông tin
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link
                                                        to="/profile/update"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-150 no-underline"
                                                    >
                                                        ✏️ Cập nhật hồ sơ
                                                    </Link>
                                                    <Link
                                                        to="/register-merchant"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-150 no-underline"
                                                    >
                                                        👨‍🍳 Đăng ký Merchant
                                                    </Link>
                                                </>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                            >
                                                🚪 Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Nút Đăng nhập/Đăng ký (chỉ hiển thị Nút Đăng nhập như hình)
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-white text-[#E95A62] rounded-lg text-base font-semibold transition-all duration-200 no-underline shadow-md hover:shadow-lg"
                                style={{ transform: 'scale(1.05)' }} // Hiệu ứng nhẹ
                            >
                                🚪 Đăng nhập
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white p-2 rounded-lg hover:bg-white hover:text-[#E95A62] transition-colors duration-200"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                            >
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#E95A62] border-t border-red-400">
                    <div className="px-4 py-3 space-y-2">
                        {/* Link Trang chủ */}
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline ${
                                isActive('/')
                                    ? 'bg-white text-[#E95A62]'
                                    : 'text-white hover:bg-red-500'
                            }`}
                        >
                            🏠 Trang chủ
                        </Link>
                        {/* Link Ưu đãi */}
                        <Link
                            to="/promotions"
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline text-white hover:bg-red-500`}
                        >
                            🎁 Ưu đãi
                        </Link>
                        {/* Link Nhà hàng */}
                        <Link
                            to="/stores"
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline text-white hover:bg-red-500`}
                        >
                            🛒 Nhà hàng
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <div className="px-4 py-2 border-t border-red-400 mt-2 pt-2">
                                    <p className="text-xs text-white opacity-80 mb-2">Tài khoản</p>
                                    <p className="text-sm font-medium text-white truncate mb-1">{userEmail}</p>
                                    <p className="text-xs text-white opacity-80 mb-3">
                                        {userRole === UserRole.MERCHANT ? '👨‍🍳 Chủ nhà hàng' : '👤 Người dùng'}
                                    </p>
                                </div>

                                {/* Links phân quyền... */}
                                {userRole === UserRole.MERCHANT ? (
                                    <Link
                                        to="/merchant/update"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-500 transition-all duration-200 no-underline"
                                    >
                                        ✏️ Cập nhật thông tin
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/profile/update"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-500 transition-all duration-200 no-underline"
                                        >
                                            ✏️ Cập nhật hồ sơ
                                        </Link>
                                        <Link
                                            to="/register-merchant"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-500 transition-all duration-200 no-underline"
                                        >
                                            👨‍🍳 Đăng ký Merchant
                                        </Link>
                                    </>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-500 transition-all duration-200"
                                >
                                    🚪 Đăng xuất
                                </button>
                            </>
                        ) : (
                            // Nút Đăng nhập cho Mobile
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-2 bg-white text-[#E95A62] rounded-lg text-sm font-medium transition-all duration-200 no-underline"
                            >
                                🚪 Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navigation;