// ==================== OrderStatisticsCard.tsx ====================
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Package, CheckCircle, Truck, XCircle } from 'lucide-react';
import axiosInstance from "../../config/axiosConfig.ts";

interface OrderStatistics {
    totalOrders: number;
    pendingCount: number;
    processingCount: number;
    readyCount: number;
    deliveringCount: number;
    completedCount: number;
    cancelledCount: number;
}

interface OrderStatItemProps {
    icon: React.ElementType;
    label: string;
    count: number;
    color: string;
    bgColor: string;
}

const OrderStatItem: React.FC<OrderStatItemProps> = ({
                                                         icon: Icon,
                                                         label,
                                                         count,
                                                         color,
                                                         bgColor
                                                     }) => (
    <div
        className="d-flex justify-content-between align-items-center py-2 px-3 rounded-2"
        style={{ backgroundColor: bgColor }}
    >
        <div className="d-flex align-items-center gap-2">
            <Icon size={16} style={{ color }} />
            <span className="small text-muted">{label}:</span>
        </div>
        <span className="fw-bold" style={{ color, fontSize: '1.1rem' }}>{count || 0}</span>
    </div>
);

const OrderStatisticsCard: React.FC = () => {
    const [orderStats, setOrderStats] = useState<OrderStatistics>({
        totalOrders: 0,
        pendingCount: 0,
        processingCount: 0,
        readyCount: 0,
        deliveringCount: 0,
        completedCount: 0,
        cancelledCount: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrderStats = async () => {
            setIsLoading(true);
            setHasError(false);
            try {
                const response = await axiosInstance.get('/merchants/orders/statistics');

                console.log('📊 API Response:', response.data);

                if (response.data) {
                    // ✅ Map đúng tên field từ backend
                    const stats: OrderStatistics = {
                        totalOrders: Number(response.data.totalOrders) || 0,
                        pendingCount: Number(response.data.pendingCount) || 0,
                        processingCount: Number(response.data.processingCount) || 0,
                        readyCount: Number(response.data.readyCount) || 0,
                        deliveringCount: Number(response.data.deliveringCount) || 0,
                        completedCount: Number(response.data.completedCount) || 0,
                        cancelledCount: Number(response.data.cancelledCount) || 0,
                    };

                    console.log('✅ Mapped Stats:', stats);
                    setOrderStats(stats);
                }
            } catch (error: any) {
                console.error("❌ Lỗi tải thống kê đơn hàng:", error);

                if (error.response) {
                    console.error("Status:", error.response.status);
                    console.error("Data:", error.response.data);
                }

                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderStats();

        // Auto-refresh mỗi 30 giây
        const interval = setInterval(fetchOrderStats, 30000);

        return () => clearInterval(interval);
    }, []);

    // Nếu có lỗi, hiển thị thông báo
    if (hasError) {
        return (
            <div className="bg-white rounded-3 p-3 shadow-sm mb-3">
                <h6 className="fw-bold mb-3">Thống kê đơn hàng</h6>
                <div className="text-center py-3">
                    <XCircle size={32} className="text-muted mb-2" />
                    <p className="small text-muted mb-0">
                        Không thể tải thống kê.<br/>
                        Vui lòng kiểm tra lại sau.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3 p-3 shadow-sm mb-3">
            <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
                <span>Thống kê đơn hàng</span>
                {isLoading && (
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                )}
            </h6>

            <div className="d-flex flex-column gap-2">
                {/* Tổng đơn */}
                <OrderStatItem
                    icon={ShoppingBag}
                    label="Tổng đơn"
                    count={orderStats.totalOrders}
                    color="#495057"
                    bgColor="#f8f9fa"
                />

                {/* Chờ xác nhận */}
                <OrderStatItem
                    icon={Clock}
                    label="Chờ xác nhận"
                    count={orderStats.pendingCount}
                    color="#fd7e14"
                    bgColor="#fff3cd"
                />

                {/* Đang chế biến */}
                <OrderStatItem
                    icon={Package}
                    label="Đang chế biến"
                    count={orderStats.processingCount}
                    color="#0dcaf0"
                    bgColor="#cff4fc"
                />

                {/* Đã xong món */}
                <OrderStatItem
                    icon={CheckCircle}
                    label="Đã xong món"
                    count={orderStats.readyCount}
                    color="#20c997"
                    bgColor="#d1e7dd"
                />

                {/* Đang giao */}
                <OrderStatItem
                    icon={Truck}
                    label="Đang giao"
                    count={orderStats.deliveringCount}
                    color="#0d6efd"
                    bgColor="#cfe2ff"
                />

                {/* Hoàn thành */}
                <OrderStatItem
                    icon={CheckCircle}
                    label="Hoàn thành"
                    count={orderStats.completedCount}
                    color="#198754"
                    bgColor="#d4edda"
                />

                {/* Đã hủy */}
                {orderStats.cancelledCount > 0 && (
                    <OrderStatItem
                        icon={XCircle}
                        label="Đã hủy"
                        count={orderStats.cancelledCount}
                        color="#dc3545"
                        bgColor="#f8d7da"
                    />
                )}
            </div>

            {/* Thống kê tổng quan */}
            <div className="mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Tỷ lệ hoàn thành:</span>
                    <span className="fw-bold text-success">
                        {orderStats.totalOrders > 0
                            ? Math.round((orderStats.completedCount / orderStats.totalOrders) * 100)
                            : 0}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderStatisticsCard;