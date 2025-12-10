import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './route.constants';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MerchantListPage } from '../features/admin/merchants/pages/MerchantListPage';
import { MerchantDetailPage } from '../features/admin/merchants/pages/MerchantDetailPage';
import { DashboardPage } from '../features/admin/merchants/pages/DashboardPage';
import Homepage from "../components/common/Homepage.tsx";

// ⭐ IMPORT LOGIN FORM - Thêm đường dẫn đúng của bạn
// import { LoginForm } from '../features/auth/LoginForm';
// hoặc
// import { LoginForm } from '../components/auth/LoginForm';

const router = createBrowserRouter([
    // ⭐ AUTH ROUTES (Public - không cần layout)
    {
        path: '/login',
        element: <div>Login Page - Chờ import LoginForm</div>, // Thay bằng <LoginForm />
    },
    // Có thể thêm các auth routes khác
    {
        path: '/register',
        element: <div>Register Page</div>,
    },
    {
        path: '/forgot-password',
        element: <div>Forgot Password Page</div>,
    },


    // ⭐ ADMIN ROUTES (Protected - có AdminLayout)
    {
        path: ROUTES.ADMIN.DASHBOARD, // '/admin'
        element: <AdminLayout />,
        children: [
            {
                index: true, // Đường dẫn: /admin
                element: <DashboardPage />,
            },
            {
                path: 'merchants', // Đường dẫn: /admin/merchants
                element: <MerchantListPage />,
            },
            {
                path: 'merchants/:merchantId', // Đường dẫn: /admin/merchants/123
                element: <MerchantDetailPage />,
            },
            // Các route admin khác
            {
                path: 'users',
                element: <div>User Management Page</div>,
            },
            {
                path: 'drivers',
                element: <div>Driver Management Page</div>,
            },
            {
                path: 'orders',
                element: <div>Order Management Page</div>,
            },
            {
                path: 'reports',
                element: <div>Reports Page</div>,
            },
            {
                path: 'settings',
                element: <div>Settings Page</div>,
            },
        ],
    },

    // ⭐ ROOT ROUTE - Redirect hoặc Landing Page
    {
        path: '/',
        element: <Homepage/>,
    },

    // ⭐ 404 NOT FOUND
    {
        path: '*',
        element: (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <p className="fs-4 text-muted mb-4">Trang không tồn tại</p>
                <a href="/admin" className="btn btn-primary">Quay về Dashboard</a>
            </div>
        ),
    },
]);

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};