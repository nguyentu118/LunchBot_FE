import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


interface ITokenPayload {
    // Các trường khác như exp, iat...
    role: string; // Vai trò, ví dụ: "ADMIN", "MERCHANT", "USER"
    sub: string; // subject (thường là username/email)
}

interface IProtectedRouteProps {
    children: ReactNode;
    // Thêm prop tùy chọn: nếu có, sẽ kiểm tra vai trò
    requiredRole?: string;
}

// Sử dụng React.FC<IProtectedRouteProps> để định nghĩa kiểu component
const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children,requiredRole }) => {

    // Lấy token từ localStorage. Giá trị có thể là string hoặc null.
    const token: string | null = localStorage.getItem('token');

    // Nếu không có token, chuyển hướng về trang login
    if (!token) {
        // Sử dụng component Navigate để chuyển hướng
        return <Navigate to="/login" replace />;
    }
    if (requiredRole) {
        let userRole: string | null = null;
        try {
            // 2. Giải mã token để lấy payload
            const decodedToken = jwtDecode<ITokenPayload>(token);

            // Kiểm tra token hết hạn (tốt nhất nên làm ở đây)
            if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                // Nếu hết hạn, xóa token và chuyển hướng về login
                localStorage.removeItem('token');
                return <Navigate to="/login" state={{ from: location }} replace />;
            }

            userRole = decodedToken.role;

        } catch (error) {
            // Xảy ra lỗi khi giải mã (token không hợp lệ/đã bị thay đổi)
            console.error("Lỗi giải mã token:", error);
            localStorage.removeItem('token');
            return <Navigate to="/login" replace />;
        }

        // 3. So sánh vai trò
        if (userRole !== requiredRole) {
            // 4. Nếu vai trò không khớp, chuyển hướng đến trang 403 hoặc trang chủ
            console.warn(`Truy cập bị từ chối. Cần vai trò: ${requiredRole}, Vai trò hiện tại: ${userRole}`);

            // Gợi ý: Chuyển hướng đến trang báo lỗi 403 (Unauthorized)
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Nếu vượt qua cả hai bước kiểm tra
    return <>{children}</>;
};

export default ProtectedRoute;