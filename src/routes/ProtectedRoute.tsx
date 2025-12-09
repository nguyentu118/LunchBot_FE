import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface IProtectedRouteProps {
    children: ReactNode;
}

// Sử dụng React.FC<IProtectedRouteProps> để định nghĩa kiểu component
const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {

    // Lấy token từ localStorage. Giá trị có thể là string hoặc null.
    const token: string | null = localStorage.getItem('token');

    // Nếu không có token, chuyển hướng về trang login
    if (!token) {
        // Sử dụng component Navigate để chuyển hướng
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;