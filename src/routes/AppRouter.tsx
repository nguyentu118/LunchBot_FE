import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './route.constants';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MerchantListPage } from '../features/admin/merchants/pages/MerchantListPage';
import { MerchantDetailPage } from '../features/admin/merchants/pages/MerchantDetailPage';
import { DashboardPage } from '../features/admin/merchants/pages/DashboardPage.tsx';

const router = createBrowserRouter([
    {
        path: ROUTES.ADMIN.DASHBOARD, // '/admin'
        element: <AdminLayout />,
        children: [
            // ⭐ THÊM INDEX ROUTE CHO DASHBOARD
            {
                index: true, // Đường dẫn: /admin (trang mặc định)
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
            // ⭐ TÙY CHỌN: Thêm các route khác nếu cần
            // {
            //     path: 'users',
            //     element: <UserListPage />,
            // },
            // {
            //     path: 'drivers',
            //     element: <DriverListPage />,
            // },
            // {
            //     path: 'orders',
            //     element: <OrderListPage />,
            // },
        ],
    },
]);

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};