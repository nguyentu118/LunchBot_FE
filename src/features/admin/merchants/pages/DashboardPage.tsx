import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Users, Store, Truck, Package, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

// Mock data
const statsData = {
    users: { value: 3782, change: 11.01, trend: 'up' },
    merchants: { value: 234, change: 8.5, trend: 'up' },
    drivers: { value: 156, change: -2.3, trend: 'down' },
    orders: { value: 5359, change: 9.05, trend: 'up' }
};

const monthlySalesData = [
    { month: 'T1', value: 180 },
    { month: 'T2', value: 420 },
    { month: 'T3', value: 210 },
    { month: 'T4', value: 320 },
    { month: 'T5', value: 190 },
    { month: 'T6', value: 220 },
    { month: 'T7', value: 300 },
    { month: 'T8', value: 120 },
    { month: 'T9', value: 230 },
    { month: 'T10', value: 380 },
    { month: 'T11', value: 340 },
    { month: 'T12', value: 140 }
];

const recentActivities = [
    { icon: Package, color: 'success', title: 'Đơn hàng mới #12345', desc: 'Nguyễn Văn A đặt từ Phở Hà Nội', time: '2 phút trước' },
    { icon: Store, color: 'primary', title: 'Merchant mới đăng ký', desc: 'Bánh Mì Sài Gòn chờ duyệt', time: '15 phút trước' },
    { icon: Truck, color: 'warning', title: 'Tài xế hoàn thành giao hàng', desc: 'Trần Văn B đã giao đơn #12344', time: '1 giờ trước' }
];

export const DashboardPage: React.FC = () => {
    const maxSales = Math.max(...monthlySalesData.map(d => d.value));

    return (
        <div>
            {/* Page Header */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Dashboard</h2>
                <p className="text-muted mb-0">Tổng quan hệ thống đặt đồ ăn online</p>
            </div>

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div className="p-2 bg-primary bg-opacity-10 rounded">
                                    <Users size={28} className="text-primary" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Người dùng</div>
                            <h3 className="fw-bold mb-2">{statsData.users.value.toLocaleString()}</h3>
                            <div className="d-flex align-items-center gap-1 text-success small">
                                <TrendingUp size={16} />
                                <span>{statsData.users.change}%</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div className="p-2 bg-info bg-opacity-10 rounded">
                                    <Store size={28} className="text-info" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Merchant</div>
                            <h3 className="fw-bold mb-2">{statsData.merchants.value}</h3>
                            <div className="d-flex align-items-center gap-1 text-success small">
                                <TrendingUp size={16} />
                                <span>{statsData.merchants.change}%</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div className="p-2 bg-warning bg-opacity-10 rounded">
                                    <Truck size={28} className="text-warning" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Tài xế</div>
                            <h3 className="fw-bold mb-2">{statsData.drivers.value}</h3>
                            <div className="d-flex align-items-center gap-1 text-danger small">
                                <TrendingDown size={16} />
                                <span>{Math.abs(statsData.drivers.change)}%</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div className="p-2 bg-success bg-opacity-10 rounded">
                                    <Package size={28} className="text-success" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Đơn hàng</div>
                            <h3 className="fw-bold mb-2">{statsData.orders.value.toLocaleString()}</h3>
                            <div className="d-flex align-items-center gap-1 text-success small">
                                <TrendingUp size={16} />
                                <span>{statsData.orders.change}%</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row className="g-4 mb-4">
                {/* Monthly Sales Chart */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h5 className="fw-bold mb-0">Doanh thu theo tháng</h5>
                                <MoreVertical size={20} className="text-muted" style={{ cursor: 'pointer' }} />
                            </div>
                            <div className="d-flex align-items-end justify-content-between" style={{ height: '280px' }}>
                                {monthlySalesData.map((item, idx) => {
                                    const barHeight = (item.value / maxSales) * 100;
                                    return (
                                        <div key={idx} className="d-flex flex-column align-items-center gap-2 flex-grow-1">
                                            <div
                                                className="w-100 bg-primary rounded-top position-relative"
                                                style={{
                                                    height: `${barHeight}%`,
                                                    minHeight: '20px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title={`${item.month}: ${item.value}k`}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                            />
                                            <small className="text-muted">{item.month}</small>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Monthly Target */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h5 className="fw-bold mb-0">Mục tiêu tháng</h5>
                                <MoreVertical size={20} className="text-muted" style={{ cursor: 'pointer' }} />
                            </div>
                            <div className="d-flex flex-column align-items-center">
                                {/* Progress Circle */}
                                <div className="position-relative mb-3" style={{ width: '180px', height: '180px' }}>
                                    <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            fill="none"
                                            stroke="#e9ecef"
                                            strokeWidth="12"
                                        />
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r="70"
                                            fill="none"
                                            stroke="#0d6efd"
                                            strokeWidth="12"
                                            strokeDasharray="440"
                                            strokeDashoffset="110"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                        <h2 className="fw-bold mb-0">75.55%</h2>
                                        <small className="text-success">+10%</small>
                                    </div>
                                </div>

                                <p className="text-center text-muted small mb-4">
                                    Bạn đạt $3287 hôm nay, cao hơn tháng trước. Giữ vững nhé!
                                </p>

                                {/* Stats Row */}
                                <Row className="g-3 w-100">
                                    <Col xs={4} className="text-center">
                                        <div className="text-muted small">Mục tiêu</div>
                                        <div className="fw-semibold d-flex align-items-center justify-content-center gap-1">
                                            $20K <TrendingDown size={14} className="text-danger" />
                                        </div>
                                    </Col>
                                    <Col xs={4} className="text-center">
                                        <div className="text-muted small">Doanh thu</div>
                                        <div className="fw-semibold d-flex align-items-center justify-content-center gap-1">
                                            $20K <TrendingUp size={14} className="text-success" />
                                        </div>
                                    </Col>
                                    <Col xs={4} className="text-center">
                                        <div className="text-muted small">Hôm nay</div>
                                        <div className="fw-semibold d-flex align-items-center justify-content-center gap-1">
                                            $20K <TrendingUp size={14} className="text-success" />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <h5 className="fw-bold mb-4">Hoạt động gần đây</h5>
                    <div className="d-flex flex-column gap-3">
                        {recentActivities.map((activity, idx) => {
                            const Icon = activity.icon;
                            return (
                                <div
                                    key={idx}
                                    className="d-flex align-items-center gap-3 p-3 rounded"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div className={`p-2 bg-${activity.color} bg-opacity-10 rounded`}>
                                        <Icon size={24} className={`text-${activity.color}`} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">{activity.title}</div>
                                        <div className="text-muted small">{activity.desc}</div>
                                    </div>
                                    <small className="text-muted">{activity.time}</small>
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};