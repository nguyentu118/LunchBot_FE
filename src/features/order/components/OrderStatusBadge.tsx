// src/features/orders/components/OrderStatusBadge.tsx

import React from 'react';
import { Badge } from 'react-bootstrap';
import { OrderStatus, ORDER_STATUS_CONFIG } from '../types/order.types';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    size?: 'sm' | 'md' | 'lg';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
    const config = ORDER_STATUS_CONFIG[status];

    const sizeClass = {
        sm: 'px-2 py-1',
        md: 'px-3 py-2',
        lg: 'px-4 py-2'
    }[size];

    const fontSize = {
        sm: '0.75rem',
        md: '0.875rem',
        lg: '1rem'
    }[size];

    return (
        <Badge
            bg={config.variant}
            className={`${sizeClass} fw-semibold`}
            style={{ fontSize }}
        >
            {config.label}
        </Badge>
    );
};

export default OrderStatusBadge;