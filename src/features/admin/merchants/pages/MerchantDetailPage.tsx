import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner, Alert, Table, Row, Col, Badge } from 'react-bootstrap';
import {
    Store, User, Mail, Phone, MapPin, Clock, Calendar,
    DollarSign, Package, TrendingUp, CheckCircle, XCircle,
    ArrowLeft, Eye, ShoppingCart, Utensils, Lock, Award
} from 'lucide-react';
import { MerchantApiService } from '../services/merchantApi.service';
import type { AdminMerchantResponse, DishSimpleResponse, MerchantStatus } from '../types/merchant.types';

// Hàm hỗ trợ: Định dạng tiền tệ
const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Hàm hỗ trợ: Định dạng ngày giờ
const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return dateString;
    }
}

// Hàm hỗ trợ: Lấy màu sắc cho trạng thái
const getStatusVariant = (status: MerchantStatus, isLocked: boolean): string => {
    if (isLocked) return "danger";
    switch (status) {
        case 'APPROVED': return 'success';
        case 'PENDING': return 'warning';
        case 'REJECTED': return 'danger';
        default: return 'secondary';
    }
}

const getStatusText = (status: MerchantStatus, isLocked: boolean): string => {
    if (isLocked) return 'Đã khóa';
    switch (status) {
        case 'APPROVED': return 'Đã duyệt';
        case 'PENDING': return 'Chờ duyệt';
        case 'REJECTED': return 'Từ chối';
        default: return status;
    }
}

// Component phụ trợ: Hiển thị danh sách món ăn
const DishList: React.FC<{ dishes: DishSimpleResponse[] }> = ({ dishes }) => (
    <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                    <Utensils size={20} className="text-primary" />
                    Danh sách Món ăn
                </h5>
                <Badge bg="primary" pill className="px-3 py-2">
                    {dishes.length} món
                </Badge>
            </div>
        </Card.Header>
        <Card.Body className="p-0">
            <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                    <tr>
                        <th className="text-muted small fw-semibold" style={{ width: '60px' }}>ID</th>
                        <th className="text-muted small fw-semibold" style={{ minWidth: '200px' }}>Tên Món</th>
                        <th className="text-muted small fw-semibold" style={{ minWidth: '250px' }}>Mô tả</th>
                        <th className="text-muted small fw-semibold text-end" style={{ width: '120px' }}>Giá Gốc</th>
                        <th className="text-muted small fw-semibold text-end" style={{ width: '120px' }}>Giá KM</th>
                        <th className="text-muted small fw-semibold text-center" style={{ width: '100px' }}>Trạng thái</th>
                        <th className="text-muted small fw-semibold text-center" style={{ width: '100px' }}>Lượt xem</th>
                        <th className="text-muted small fw-semibold text-center" style={{ width: '100px' }}>Đơn hàng</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dishes.map((dish) => (
                        <tr key={dish.id}>
                            <td className="fw-semibold">{dish.id}</td>
                            <td>
                                <div className="fw-semibold text-dark">{dish.name}</div>
                            </td>
                            <td>
                                <small className="text-muted">{dish.description.substring(0, 80)}...</small>
                            </td>
                            <td className="text-end fw-semibold text-dark">
                                {formatCurrency(dish.price)}
                            </td>
                            <td className="text-end fw-semibold text-success">
                                {dish.discountPrice ? formatCurrency(dish.discountPrice) : '-'}
                            </td>
                            <td className="text-center">
                                <Badge
                                    bg={dish.isActive ? 'success' : 'secondary'}
                                    className="px-2 py-1"
                                >
                                    {dish.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                </Badge>
                            </td>
                            <td className="text-center">
                                    <span className="d-flex align-items-center justify-content-center gap-1">
                                        <Eye size={14} className="text-muted" />
                                        <span className="fw-semibold">{dish.viewCount}</span>
                                    </span>
                            </td>
                            <td className="text-center">
                                    <span className="d-flex align-items-center justify-content-center gap-1">
                                        <ShoppingCart size={14} className="text-muted" />
                                        <span className="fw-semibold">{dish.orderCount}</span>
                                    </span>
                            </td>
                        </tr>
                    ))}
                    {dishes.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center py-5">
                                <Utensils size={48} className="text-muted mb-3" />
                                <p className="text-muted">Chưa có món ăn nào</p>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>
        </Card.Body>
    </Card>
);

export const MerchantDetailPage: React.FC = () => {
    const { merchantId } = useParams<{ merchantId: string }>();
    const [merchant, setMerchant] = useState<AdminMerchantResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const id = merchantId ? parseInt(merchantId) : undefined;

    const fetchMerchantDetails = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await MerchantApiService.getMerchantDetails(id);
            setMerchant(data);
        } catch (err) {
            setError('Không thể tải chi tiết Merchant. Vui lòng kiểm tra ID và thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchMerchantDetails(id);
        } else {
            setLoading(false);
            setError('ID Merchant không hợp lệ.');
        }
    }, [id, fetchMerchantDetails]);

    if (loading) {
        return (
            <div>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Đang tải chi tiết Merchant...</p>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="border-0 shadow-sm">
                <Alert.Heading>Lỗi!</Alert.Heading>
                {error}
            </Alert>
        );
    }

    if (!merchant) {
        return (
            <Alert variant="warning" className="border-0 shadow-sm">
                Không tìm thấy thông tin Merchant.
            </Alert>
        );
    }

    const {
        restaurantName,
        ownerName,
        email,
        phone,
        address,
        openTime,
        closeTime,
        status,
        isLocked,
        isPartner,
        rejectionReason,
        registrationDate,
        approvalDate,
        lockedAt,
        revenueTotal,
        currentBalance,
        monthlyRevenue,
    } = merchant;

    return (
        <div>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <Store size={28} className="text-primary" />
                        {restaurantName}
                    </h2>
                    <p className="text-muted mb-0">Chi tiết thông tin nhà hàng</p>
                </div>
                <Link to="/admin/merchants" className="btn btn-outline-secondary">
                    <ArrowLeft size={16} className="me-1" />
                    Quay lại
                </Link>
            </div>

            {/* Status & Partner Badges */}
            <div className="d-flex gap-2 mb-4">
                <Badge
                    bg={getStatusVariant(status, isLocked)}
                    className="px-3 py-2 d-flex align-items-center gap-2"
                    style={{ fontSize: '0.9rem' }}
                >
                    {isLocked ? <Lock size={16} /> : null}
                    {getStatusText(status, isLocked)}
                </Badge>
                <Badge
                    bg={isPartner ? 'primary' : 'secondary'}
                    className="px-3 py-2 d-flex align-items-center gap-2"
                    style={{ fontSize: '0.9rem' }}
                >
                    <Award size={16} />
                    {isPartner ? 'Đối tác' : 'Chưa là đối tác'}
                </Badge>
            </div>

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 bg-success bg-opacity-10 rounded">
                                    <TrendingUp size={24} className="text-success" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Doanh thu Tổng</div>
                            <h4 className="fw-bold mb-0 text-success">{formatCurrency(revenueTotal)}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 bg-primary bg-opacity-10 rounded">
                                    <DollarSign size={24} className="text-primary" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Số dư Hiện tại</div>
                            <h4 className="fw-bold mb-0 text-primary">{formatCurrency(currentBalance)}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 bg-warning bg-opacity-10 rounded">
                                    <Calendar size={24} className="text-warning" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Doanh thu Tháng</div>
                            <h4 className="fw-bold mb-0 text-warning">{formatCurrency(monthlyRevenue)}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="p-2 bg-info bg-opacity-10 rounded">
                                    <Utensils size={24} className="text-info" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Số lượng Món</div>
                            <h4 className="fw-bold mb-0 text-info">{merchant.dishCount}</h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Thông tin cơ bản */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-semibold">Thông tin cơ bản</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                                        <User size={20} className="text-primary mt-1" />
                                        <div>
                                            <div className="small text-muted">Chủ sở hữu</div>
                                            <div className="fw-semibold">{ownerName}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                                        <Mail size={20} className="text-primary mt-1" />
                                        <div>
                                            <div className="small text-muted">Email</div>
                                            <div className="fw-semibold">{email}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                                        <Phone size={20} className="text-primary mt-1" />
                                        <div>
                                            <div className="small text-muted">Điện thoại</div>
                                            <div className="fw-semibold">{phone}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                                        <Clock size={20} className="text-primary mt-1" />
                                        <div>
                                            <div className="small text-muted">Giờ hoạt động</div>
                                            <div className="fw-semibold">{openTime} - {closeTime}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                                        <MapPin size={20} className="text-primary mt-1" />
                                        <div>
                                            <div className="small text-muted">Địa chỉ</div>
                                            <div className="fw-semibold">{address}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-semibold">Thông tin hệ thống</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-3">
                                <div className="p-3 bg-light rounded">
                                    <div className="small text-muted mb-1">Ngày đăng ký</div>
                                    <div className="fw-semibold">{formatDateTime(registrationDate)}</div>
                                </div>
                                {approvalDate && (
                                    <div className="p-3 bg-light rounded">
                                        <div className="small text-muted mb-1">Ngày duyệt</div>
                                        <div className="fw-semibold">{formatDateTime(approvalDate)}</div>
                                    </div>
                                )}
                                {lockedAt && (
                                    <div className="p-3 bg-danger bg-opacity-10 rounded border border-danger">
                                        <div className="small text-danger mb-1">Ngày khóa</div>
                                        <div className="fw-semibold text-danger">{formatDateTime(lockedAt)}</div>
                                    </div>
                                )}
                                {rejectionReason && (
                                    <div className="p-3 bg-danger bg-opacity-10 rounded border border-danger">
                                        <div className="small text-danger mb-1 fw-semibold">Lý do từ chối/khóa</div>
                                        <div className="small text-danger">{rejectionReason}</div>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Thống kê Đơn hàng */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="p-2 bg-primary bg-opacity-10 rounded">
                                    <Package size={24} className="text-primary" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Tổng Đơn hàng</div>
                            <h4 className="fw-bold mb-0">{merchant.totalOrders || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="p-2 bg-success bg-opacity-10 rounded">
                                    <CheckCircle size={24} className="text-success" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Hoàn thành</div>
                            <h4 className="fw-bold mb-0 text-success">{merchant.completedOrders || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="p-2 bg-danger bg-opacity-10 rounded">
                                    <XCircle size={24} className="text-danger" />
                                </div>
                            </div>
                            <div className="text-muted small mb-1">Đã Hủy</div>
                            <h4 className="fw-bold mb-0 text-danger">{merchant.cancelledOrders || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Danh sách món ăn */}
            <DishList dishes={merchant.dishes} />
        </div>
    );
};