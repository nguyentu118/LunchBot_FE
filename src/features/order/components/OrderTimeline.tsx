// src/features/orders/components/OrderTimeline.tsx

import React from 'react';
import { Check, X, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { OrderStatus } from '../types/order.types';
import { formatDateTime } from '../utils/dateUtils';

interface OrderTimelineProps {
    status: OrderStatus;
    orderDate: string;
    expectedDeliveryTime?: string;
    completedAt?: string;
    cancelledAt?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
                                                         status,
                                                         orderDate,
                                                         expectedDeliveryTime,
                                                         completedAt,
                                                         cancelledAt
                                                     }) => {
    const steps = [
        {
            key: OrderStatus.PENDING,
            label: 'Chờ xác nhận',
            icon: Clock,
            time: orderDate
        },
        {
            key: OrderStatus.CONFIRMED,
            label: 'Đã xác nhận',
            icon: Check
        },
        {
            key: OrderStatus.PROCESSING,
            label: 'Đang chuẩn bị',
            icon: Package
        },
        {
            key: OrderStatus.READY,
            label: 'Đã sẵn sàng',
            icon: Package
        },
        {
            key: OrderStatus.DELIVERING,
            label: 'Đang giao hàng',
            icon: Truck,
            time: expectedDeliveryTime
        },
        {
            key: OrderStatus.COMPLETED,
            label: 'Hoàn thành',
            icon: CheckCircle,
            time: completedAt
        }
    ];

    // If cancelled, show cancel step
    if (status === OrderStatus.CANCELLED) {
        return (
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <h6 className="mb-4">Trạng thái đơn hàng</h6>
                    <div className="d-flex align-items-center text-danger">
                        <div
                            className="rounded-circle bg-danger d-flex align-items-center justify-content-center me-3"
                            style={{ width: '48px', height: '48px' }}
                        >
                            <X size={24} color="white" />
                        </div>
                        <div>
                            <div className="fw-semibold">Đơn hàng đã bị hủy</div>
                            {cancelledAt && (
                                <small className="text-muted">
                                    {formatDateTime(cancelledAt)}
                                </small>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Get current step index
    const statusOrder = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.READY,
        OrderStatus.DELIVERING,
        OrderStatus.COMPLETED
    ];
    const currentStepIndex = statusOrder.indexOf(status);

    return (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
                <h6 className="mb-4">Trạng thái đơn hàng</h6>

                <div className="position-relative">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.key} className="d-flex mb-4 position-relative">
                                {/* Vertical line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className="position-absolute"
                                        style={{
                                            left: '23px',
                                            top: '48px',
                                            width: '2px',
                                            height: '100%',
                                            backgroundColor: isActive ? '#28a745' : '#e0e0e0'
                                        }}
                                    />
                                )}

                                {/* Icon */}
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                        isActive ? 'bg-success' : 'bg-light'
                                    }`}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        minWidth: '48px',
                                        zIndex: 1
                                    }}
                                >
                                    <Icon
                                        size={24}
                                        color={isActive ? 'white' : '#999'}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-grow-1">
                                    <div
                                        className={`fw-semibold ${
                                            isCurrent ? 'text-success' : isActive ? 'text-dark' : 'text-muted'
                                        }`}
                                    >
                                        {step.label}
                                    </div>
                                    {step.time && isActive && (
                                        <small className="text-muted">
                                            {formatDateTime(step.time)}
                                        </small>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderTimeline;