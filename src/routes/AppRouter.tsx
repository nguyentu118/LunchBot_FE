import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {ROUTES} from './route.constants';
import {AdminLayout} from '../components/layout/AdminLayout';
import {MerchantListPage} from '../features/admin/merchants/pages/MerchantListPage';
import {MerchantDetailPage} from '../features/admin/merchants/pages/MerchantDetailPage';
import {DashboardPage} from '../features/admin/merchants/pages/DashboardPage';
import LoginForm from "../features/auth/LoginForm.tsx";
import RegistrationForm from "../features/auth/RegistrationForm.tsx";
import MerchantUpdateForm from "../features/merchants/MerchantUpdateForm.tsx";
import UserUpdateForm from "../features/user/UserUpdateForm.tsx";
import HomePage from "../components/common/Homepage.tsx";
import MerchantRegistrationForm from "../features/merchants/MerchantRegistrationForm.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import MerchantDashboard from "../components/layout/MerchantDashBoard.tsx";
import DishDetailPage from "../features/dish/DishDetailPage.tsx";
import CartPage from "../features/cart/CartPage.tsx";
import CheckoutPage from "../features/checkout-card/components/CheckoutPage.tsx";
import OrdersListPage from "../features/order/components/OrderListPage.tsx";
import OrderDetailPage from "../features/order/components/OrderDetailPage.tsx";


const router = createBrowserRouter([
    // ⭐ AUTH ROUTES (Public - không cần layout)

    {
        path: '/login',
        element: <LoginForm/>
    },
    {
        path: '/register',
        element: <RegistrationForm/>
    },
    {
        path: 'merchant/update',
        element: <MerchantUpdateForm/>,
    },
    {
        path: 'user/update',
        element: <UserUpdateForm/>,
    },
    {
        path: '/register-merchant',
        element: <MerchantRegistrationForm/>,
    },
    {
        path: 'merchant/dashboard',
        element: <MerchantDashboard/>,
    },
    {
        path: "/dishes/:dishId",
        element: <DishDetailPage/>,
    },
    {
        path: "/cart",
        element: <CartPage/>,
    },
    {
        path: "/checkout",
        element: <CheckoutPage/>,
    },
    {
        path: "/orders",
        element: <OrdersListPage/>,
    },
    {
        path: "/orders/:orderId",
        element: <OrderDetailPage/>,
    },


    // ⭐ ADMIN ROUTES (Protected - có AdminLayout)
    {
        path: ROUTES.ADMIN.DASHBOARD, // '/admin'
        element: <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
            </ProtectedRoute>,
        children: [
            {
                index: true, // Đường dẫn: /admin
                element: <DashboardPage/>,
            },
            {
                path: 'merchants', // Đường dẫn: /admin/merchants
                element: <MerchantListPage/>,
            },
            {
                path: 'merchants/:merchantId', // Đường dẫn: /admin/merchants/123
                element: <MerchantDetailPage/>,
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
        element: <HomePage/>,
    },

    // ⭐ 404 NOT FOUND
    {
        path: '/*',
        element: (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{height: '100vh'}}>
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <p className="fs-4 text-muted mb-4">Trang không tồn tại</p>
                <a href="/" className="btn btn-primary">Quay về Dashboard</a>
            </div>
        ),
    },
]);

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router}/>;
};