export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',

    ADMIN: {
        DASHBOARD: '/admin',
        MERCHANTS: '/admin/merchants',
        USERS: '/admin/users',
        DRIVERS: '/admin/drivers',
        ORDERS: '/admin/orders',
        REPORTS: '/admin/reports',
        SETTINGS: '/admin/settings',
        RECONCILIATION: '/admin/reconciliation',
        PARTNER_REQUESTS: '/admin/merchants/partner-requests',
        WITHDRAWALS: '/admin/withdrawals',
    },

    AUTH: {
        LOGIN: '/login',
        REGISTER_USER: '/register',
        REGISTER_MERCHANT: '/register-merchant',
    },

    MERCHANTS: {
        PROFILE_UPDATE: 'merchant/update',
        DASHBOARD: 'merchant/dashboard',
        WALLET: 'merchant/wallet',
    },

    USER: {
        PROFILE: 'user/update',
        DISH_DETAILS: 'dish/detail/{dishId}'
    }
};