import React from 'react';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom';
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
import DriverListPage from "../features/admin/driver/DriverListPage.tsx";
import DriverList from "../features/admin/driver/components/DriverList.tsx";
import DriverUpdateForm from "../features/admin/driver/components/DriverUpdateForm.tsx";
import MerchantProfilePage from "../features/merchants/MerchantProfilePage.tsx";
import OrderByDish from '../features/order/components/OrderByDish.tsx';
import OrderByCustomer from '../features/order/components/OrderByCustomer.tsx';
import OrderByCoupons from '../features/order/components/OrderByCoupon.tsx';
import MerchantLayout from "../components/layout/MerchantLayout.tsx";
import DashboardOverview from "../components/common/DashboardOverview.tsx";
import OrdersPage from "../features/merchants/OrdersPage.tsx";
import MenuPage from '../features/dish/MenuPage.tsx';
import CouponsPage from "../features/coupon/components/CouponsPage.tsx";
import AnalyticsPage from "../components/common/AnalyticsPage.tsx";
import RevenueAnalyticsWrapper from "../features/merchants/RevenueAnalyticsWrapper.tsx";
import SettingsPage from "../components/common/SettingsPage.tsx";
import RevenueReconciliationPage from "../features/merchants/RevenueReconcilitionPage.tsx";
import OrderStatusAnalytics from "../features/merchants/OrderStatusAnalytics.tsx";
import DishSearchPage from "../features/dish/DishSearchPage.tsx";
import AddressManagementPage from "../features/checkout-card/components/AddressManagementPage.tsx";
import FavoriteDishesPage from "../features/favorite/FavoriteDishesPage.tsx";


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
        path: 'merchant/dashboard-old',
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
    {
        path: "/merchants/profile/:merchantId",
        element: <MerchantProfilePage/>,
    },
    {
        path: "/dishes/search",
        element: <DishSearchPage  />,
    },
    {
        path: "/address",
        element: <AddressManagementPage  />,
    },
    {
        path: "/favorites",
        element: <FavoriteDishesPage  />,
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
                path: 'drivers',
                element: <DriverListPage/>,
            },
            {
                path: 'drivers/:driverId',
                element: <DriverList/>,
            },
            {
                path: 'orders',
                element: <div>Order Management Page</div>,
            },
            {
                path: 'drivers/update/:driverId',
                element: <DriverUpdateForm/>,
            },
            {
                path: 'settings',
                element: <div>Settings Page</div>,
            },
        ],
    },
    // AppRouter.tsx - Thêm routes mới cho merchant
    {
        path: '/merchant',
        element: <ProtectedRoute requiredRole="MERCHANT">
            <MerchantLayout />
        </ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="/merchant/dashboard" replace />
            },
            {
                path: 'dashboard',
                element: <DashboardOverview />
            },
            {
                path: 'orders',
                element: <OrdersPage />
            },
            {
                path: 'menu',
                element: <MenuPage />
            },
            {
                path: 'coupons',
                element: <CouponsPage />
            },
            {
                path: 'analytics',
                element: <AnalyticsPage />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/merchant/analytics/revenue" replace />
                    },
                    {
                        path: 'revenue',
                        element: <RevenueAnalyticsWrapper />
                    },
                    {
                        path: 'dishes',
                        element: <OrderByDish />
                    },
                    {
                        path: 'customers',
                        element: <OrderByCustomer />
                    },
                    {
                        path: 'coupons',
                        element: <OrderByCoupons />
                    },
                    {
                        path: 'order-status',  // ← Route mới
                        element: <OrderStatusAnalytics />
                    }
                ]
            },
            {
                path: 'revenue-reconciliation',
                element: <RevenueReconciliationPage />
            },
            {
                path: 'settings',
                element: <SettingsPage />
            }
        ]
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