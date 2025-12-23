import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';
import axiosInstance from '../../config/axiosConfig';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalDishes: number;
}

const DashboardOverview: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalDishes: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setIsLoading(true);
            try {
                // Fetch order statistics
                const orderStatsRes = await axiosInstance.get('/merchants/orders/statistics');

                // Fetch dishes count
                const dishesRes = await axiosInstance.get('/dishes/list');
                const dishesData = Array.isArray(dishesRes.data) ? dishesRes.data : [];

                setStats({
                    totalOrders: orderStatsRes.data.totalOrders || 0,
                    pendingOrders: orderStatsRes.data.pendingCount || 0,
                    totalRevenue: 0, // TODO: Add revenue endpoint
                    totalDishes: dishesData.length
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="danger" />
                <p className="text-muted mt-2">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div>
            <h5 className="fw-bold mb-4">Tổng quan kinh doanh</h5>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1">Tổng đơn hàng</p>
                                    <h3 className="fw-bold mb-0">{stats.totalOrders}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 p-3 rounded">
                                    <ShoppingBag size={24} className="text-primary" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1">Chờ xác nhận</p>
                                    <h3 className="fw-bold mb-0 text-warning">{stats.pendingOrders}</h3>
                                </div>
                                <div className="bg-warning bg-opacity-10 p-3 rounded">
                                    <TrendingUp size={24} className="text-warning" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1">Doanh thu</p>
                                    <h3 className="fw-bold mb-0 text-success">
                                        {stats.totalRevenue.toLocaleString()} ₫
                                    </h3>
                                </div>
                                <div className="bg-success bg-opacity-10 p-3 rounded">
                                    <DollarSign size={24} className="text-success" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1">Tổng món ăn</p>
                                    <h3 className="fw-bold mb-0">{stats.totalDishes}</h3>
                                </div>
                                <div className="bg-info bg-opacity-10 p-3 rounded">
                                    <Package size={24} className="text-info" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="g-3">
                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Truy cập nhanh</h6>
                            <div className="d-flex flex-column gap-2">
                                <Link to="/merchant/orders" className="btn btn-outline-primary text-start">
                                    <ShoppingBag size={16} className="me-2" />
                                    Quản lý đơn hàng
                                </Link>
                                <Link to="/merchant/menu" className="btn btn-outline-primary text-start">
                                    <Package size={16} className="me-2" />
                                    Quản lý món ăn
                                </Link>
                                <Link to="/merchant/analytics/revenue" className="btn btn-outline-primary text-start">
                                    <TrendingUp size={16} className="me-2" />
                                    Xem thống kê doanh số
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Hướng dẫn</h6>
                            <ul className="small text-muted mb-0">
                                <li className="mb-2">Cập nhật thông tin món ăn thường xuyên để thu hút khách hàng</li>
                                <li className="mb-2">Kiểm tra đơn hàng chờ xác nhận để xử lý kịp thời</li>
                                <li className="mb-2">Sử dụng mã giảm giá để tăng doanh số</li>
                                <li>Theo dõi thống kê để hiểu rõ xu hướng kinh doanh</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardOverview;