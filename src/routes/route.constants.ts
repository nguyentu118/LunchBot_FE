// src/routes/route.constants.ts

export const ROUTES = {
    //  AUTH ROUTES (Public)
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
    },

    //  ADMIN ROUTES (Protected)
    ADMIN: {
        DASHBOARD: '/admin',
        MERCHANTS: '/admin/merchants',
        MERCHANT_DETAIL: (id: number | string) => `/admin/merchants/${id}`,
        USERS: '/admin/users',
        USER_DETAIL: (id: number | string) => `/admin/users/${id}`,
        DRIVERS: '/admin/drivers',
        DRIVER_DETAIL: (id: number | string) => `/admin/drivers/${id}`,
        ORDERS: '/admin/orders',
        ORDER_DETAIL: (id: number | string) => `/admin/orders/${id}`,
        REPORTS: '/admin/reports',
        SETTINGS: '/admin/settings',
    },

    //  PUBLIC ROUTES
    HOME: '/',
    NOT_FOUND: '*',
} as const;

// Helper function để check protected routes
export const isProtectedRoute = (pathname: string): boolean => {
    return pathname.startsWith('/admin');
};

// Helper function để check public routes
export const isPublicRoute = (pathname: string): boolean => {
    return pathname === ROUTES.AUTH.LOGIN ||
        pathname === ROUTES.AUTH.REGISTER ||
        pathname === ROUTES.AUTH.FORGOT_PASSWORD ||
        pathname === ROUTES.HOME;
};