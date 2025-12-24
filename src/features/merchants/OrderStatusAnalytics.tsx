// ==================== OrderStatusAnalytics.tsx ====================
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Package, CheckCircle, Truck, XCircle, TrendingUp, Activity } from 'lucide-react';
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

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    count: number;
    color: string;
    bgColor: string;
    percentage?: number;
}

const StatCard: React.FC<StatCardProps> = ({
                                               icon: Icon,
                                               label,
                                               count,
                                               color,
                                               bgColor,
                                               percentage
                                           }) => (
    <div className="col-md-6 col-lg-4 mb-3">
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                        className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: bgColor, width: '60px', height: '60px' }}
                    >
                        <Icon size={28} style={{ color }} />
                    </div>
                    {percentage !== undefined && (
                        <span className="badge" style={{ backgroundColor: bgColor, color }}>
                            {percentage}%
                        </span>
                    )}
                </div>
                <h3 className="fw-bold mb-1" style={{ color }}>{count || 0}</h3>
                <p className="text-muted mb-0 small">{label}</p>
            </div>
        </div>
    </div>
);

const OrderStatusAnalytics: React.FC = () => {
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

                if (response.data) {
                    const stats: OrderStatistics = {
                        totalOrders: Number(response.data.totalOrders) || 0,
                        pendingCount: Number(response.data.pendingCount) || 0,
                        processingCount: Number(response.data.processingCount) || 0,
                        readyCount: Number(response.data.readyCount) || 0,
                        deliveringCount: Number(response.data.deliveringCount) || 0,
                        completedCount: Number(response.data.completedCount) || 0,
                        cancelledCount: Number(response.data.cancelledCount) || 0,
                    };

                    setOrderStats(stats);
                }
            } catch (error: any) {
                console.error("Lỗi tải thống kê đơn hàng:", error);
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

    const calculatePercentage = (count: number): number => {
        if (orderStats.totalOrders === 0) return 0;
        return Math.round((count / orderStats.totalOrders) * 100);
    };

    const activeOrdersCount = orderStats.pendingCount + orderStats.processingCount + orderStats.readyCount + orderStats.deliveringCount;
    const completionRate = orderStats.totalOrders > 0
        ? Math.round((orderStats.completedCount / orderStats.totalOrders) * 100)
        : 0;
    const cancellationRate = orderStats.totalOrders > 0
        ? Math.round((orderStats.cancelledCount / orderStats.totalOrders) * 100)
        : 0;

    if (hasError) {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <XCircle className="me-2" size={24} />
                    <div>
                        <strong>Không thể tải thống kê</strong>
                        <p className="mb-0">Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Thống kê theo trạng thái đơn hàng</h5>
                    <p className="text-muted mb-0 small">
                        Cập nhật tự động mỗi 30 giây
                    </p>
                </div>
                {isLoading && (
                    <div className="spinner-border spinner-border-sm text-danger" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="card-body text-white">
                            <div className="d-flex align-items-center mb-2">
                                <ShoppingBag size={24} className="me-2" />
                                <h6 className="mb-0">Tổng đơn hàng</h6>
                            </div>
                            <h2 className="fw-bold mb-0">{orderStats.totalOrders}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <div className="card-body text-white">
                            <div className="d-flex align-items-center mb-2">
                                <Activity size={24} className="me-2" />
                                <h6 className="mb-0">Đơn đang xử lý</h6>
                            </div>
                            <h2 className="fw-bold mb-0">{activeOrdersCount}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <div className="card-body text-white">
                            <div className="d-flex align-items-center mb-2">
                                <TrendingUp size={24} className="me-2" />
                                <h6 className="mb-0">Tỷ lệ hoàn thành</h6>
                            </div>
                            <h2 className="fw-bold mb-0">{completionRate}%</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Status Cards */}
            <div className="row">
                <StatCard
                    icon={Clock}
                    label="Chờ xác nhận"
                    count={orderStats.pendingCount}
                    color="#fd7e14"
                    bgColor="#fff3cd"
                    percentage={calculatePercentage(orderStats.pendingCount)}
                />

                <StatCard
                    icon={Package}
                    label="Đang chế biến"
                    count={orderStats.processingCount}
                    color="#0dcaf0"
                    bgColor="#cff4fc"
                    percentage={calculatePercentage(orderStats.processingCount)}
                />

                <StatCard
                    icon={CheckCircle}
                    label="Đã xong món"
                    count={orderStats.readyCount}
                    color="#20c997"
                    bgColor="#d1e7dd"
                    percentage={calculatePercentage(orderStats.readyCount)}
                />

                <StatCard
                    icon={Truck}
                    label="Đang giao"
                    count={orderStats.deliveringCount}
                    color="#0d6efd"
                    bgColor="#cfe2ff"
                    percentage={calculatePercentage(orderStats.deliveringCount)}
                />

                <StatCard
                    icon={CheckCircle}
                    label="Hoàn thành"
                    count={orderStats.completedCount}
                    color="#198754"
                    bgColor="#d4edda"
                    percentage={calculatePercentage(orderStats.completedCount)}
                />

                <StatCard
                    icon={XCircle}
                    label="Đã hủy"
                    count={orderStats.cancelledCount}
                    color="#dc3545"
                    bgColor="#f8d7da"
                    percentage={calculatePercentage(orderStats.cancelledCount)}
                />
            </div>

            {/* Analysis Section */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h5 className="fw-bold mb-3">Phân tích chi tiết</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                        <span className="text-muted">Tỷ lệ hủy đơn:</span>
                                        <span className={`fw-bold ${cancellationRate > 10 ? 'text-danger' : 'text-success'}`}>
                                            {cancellationRate}%
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                        <span className="text-muted">Đơn cần xử lý:</span>
                                        <span className="fw-bold text-primary">
                                            {orderStats.pendingCount + orderStats.processingCount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cancellationRate > 10 && (
                                <div className="alert alert-warning mt-3 mb-0" role="alert">
                                    <strong>⚠️ Lưu ý:</strong> Tỷ lệ hủy đơn cao ({cancellationRate}%).
                                    Hãy kiểm tra chất lượng món ăn và thời gian xử lý đơn hàng.
                                </div>
                            )}

                            {orderStats.pendingCount > 5 && (
                                <div className="alert alert-info mt-3 mb-0" role="alert">
                                    <strong>ℹ️ Thông báo:</strong> Có {orderStats.pendingCount} đơn hàng đang chờ xác nhận.
                                    Hãy xử lý sớm để tránh khách hủy đơn.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusAnalytics;