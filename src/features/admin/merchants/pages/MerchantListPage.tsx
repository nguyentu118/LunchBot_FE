import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { Store, Search, Filter, Eye, Check, X, Lock, Unlock, RefreshCw } from 'lucide-react';
import { MerchantApprovalModal } from '../components/MerchantApprovalModal';
import { MerchantLockModal } from '../components/MerchantLockModal';
import { ReProcessModal } from '../components/ReProcessModal';
import type { AdminMerchantListResponse, PageResponse } from '../types/merchant.types';
import { MerchantStatus as MerchantStatusEnum } from '../types/merchant.types';
import { MerchantApiService } from '../services/merchantApi.service';

// --- Hàm hỗ trợ ---
const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getStatusVariant = (status: MerchantStatusEnum, isLocked: boolean): string => {
    if (isLocked) return "danger";
    switch (status) {
        case MerchantStatusEnum.APPROVED: return 'success';
        case MerchantStatusEnum.PENDING: return 'warning';
        case MerchantStatusEnum.REJECTED: return 'danger';
        default: return 'secondary';
    }
};

const getStatusText = (status: MerchantStatusEnum, isLocked: boolean): string => {
    if (isLocked) return 'Đã khóa';
    switch (status) {
        case MerchantStatusEnum.APPROVED: return 'Đã duyệt';
        case MerchantStatusEnum.PENDING: return 'Chờ duyệt';
        case MerchantStatusEnum.REJECTED: return 'Từ chối';
        default: return status;
    }
};

export const MerchantListPage: React.FC = () => {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [isApprove, setIsApprove] = useState(true);
    const [showLockModal, setShowLockModal] = useState(false);
    const [isLock, setIsLock] = useState(true);
    const [showReProcessModal, setShowReProcessModal] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<AdminMerchantListResponse | null>(null);

    const [merchants, setMerchants] = useState<AdminMerchantListResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(5);

    const [statusFilter, setStatusFilter] = useState<MerchantStatusEnum | 'ALL'>('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchMerchants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data: PageResponse<AdminMerchantListResponse>;
            if (searchKeyword) {
                data = await MerchantApiService.searchMerchants(searchKeyword, currentPage, pageSize);
            } else if (statusFilter !== 'ALL') {
                data = await MerchantApiService.getMerchantsByStatus(statusFilter, currentPage, pageSize);
            } else {
                data = await MerchantApiService.getAllMerchants(currentPage, pageSize);
            }
            setMerchants(data.content);
            setTotalElements(data.totalElements);
        } catch (err) {
            setError('Không thể tải dữ liệu Merchant. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter, searchKeyword]);

    useEffect(() => {
        fetchMerchants();
    }, [fetchMerchants]);

    const handleApprovalClick = (merchant: AdminMerchantListResponse, approve: boolean) => {
        setSelectedMerchant(merchant);
        setIsApprove(approve);
        setShowApprovalModal(true);
    };

    const handleLockClick = (merchant: AdminMerchantListResponse, lock: boolean) => {
        setSelectedMerchant(merchant);
        setIsLock(lock);
        setShowLockModal(true);
    };

    const handleReProcessClick = (merchant: AdminMerchantListResponse) => {
        setSelectedMerchant(merchant);
        setShowReProcessModal(true);
    };

    const handleSuccess = () => {
        setShowApprovalModal(false);
        setShowLockModal(false);
        setShowReProcessModal(false);
        fetchMerchants();
    };

    const renderMerchantRow = (merchant: AdminMerchantListResponse) => (
        <tr key={merchant.id} style={{ transition: 'background-color 0.2s' }}>
            <td className="fw-semibold">{merchant.id}</td>
            <td>
                <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-primary bg-opacity-10 rounded">
                        <Store size={20} className="text-primary" />
                    </div>
                    <div>
                        <div className="fw-semibold text-dark">{merchant.restaurantName}</div>
                        <small className="text-muted">{merchant.ownerName}</small>
                    </div>
                </div>
            </td>
            <td>
                <Badge
                    bg={getStatusVariant(merchant.status, merchant.isLocked)}
                    className="px-3 py-2"
                    style={{ fontSize: '0.8rem' }}
                >
                    {getStatusText(merchant.status, merchant.isLocked)}
                </Badge>
            </td>
            <td className="text-center">
                <span className="badge bg-light text-dark border">{merchant.dishCount}</span>
            </td>
            <td className="text-center">
                <span className="badge bg-light text-dark border">{merchant.orderCount}</span>
            </td>
            <td className="fw-semibold text-success">{formatCurrency(merchant.revenueTotal)}</td>
            <td className="fw-semibold text-primary">{formatCurrency(merchant.currentBalance)}</td>
            <td>
                <div className="d-flex gap-2 flex-wrap">
                    <Link
                        to={`/admin/merchants/${merchant.id}`}
                        className="btn btn-sm btn-outline-primary"
                        style={{ minWidth: '90px' }}
                    >
                        <Eye size={14} className="me-1" />
                        Chi tiết
                    </Link>

                    {merchant.status === MerchantStatusEnum.PENDING && !merchant.isLocked && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprovalClick(merchant, true)}
                                style={{ minWidth: '70px' }}
                            >
                                <Check size={14} className="me-1" />
                                Duyệt
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleApprovalClick(merchant, false)}
                                style={{ minWidth: '80px' }}
                            >
                                <X size={14} className="me-1" />
                                Từ chối
                            </Button>
                        </>
                    )}

                    {merchant.status === MerchantStatusEnum.APPROVED && !merchant.isLocked && (
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleLockClick(merchant, true)}
                            style={{ minWidth: '70px' }}
                        >
                            <Lock size={14} className="me-1" />
                            Khóa
                        </Button>
                    )}

                    {merchant.isLocked && (
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleLockClick(merchant, false)}
                            style={{ minWidth: '90px' }}
                        >
                            <Unlock size={14} className="me-1" />
                            Mở khóa
                        </Button>
                    )}

                    {merchant.status === MerchantStatusEnum.REJECTED && !merchant.isLocked && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReProcessClick(merchant)}
                            style={{ minWidth: '100px' }}
                        >
                            <RefreshCw size={14} className="me-1" />
                            Duyệt lại
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Quản lý Merchant</h2>
                    <p className="text-muted mb-0">Quản lý tất cả nhà hàng trên hệ thống</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="px-3 py-2 bg-primary bg-opacity-10 rounded">
                        <Store size={24} className="text-primary" />
                    </div>
                    <div>
                        <div className="small text-muted">Tổng cộng</div>
                        <div className="fw-bold fs-5 text-dark">{totalElements}</div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted mb-2">
                                    <Filter size={14} className="me-1" />
                                    Lọc theo trạng thái
                                </Form.Label>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as MerchantStatusEnum | 'ALL')}
                                    className="border-0 bg-light"
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value={MerchantStatusEnum.PENDING}>Đang chờ duyệt</option>
                                    <option value={MerchantStatusEnum.APPROVED}>Đã duyệt</option>
                                    <option value={MerchantStatusEnum.REJECTED}>Đã từ chối</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={9}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted mb-2">
                                    <Search size={14} className="me-1" />
                                    Tìm kiếm
                                </Form.Label>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm theo tên nhà hàng, chủ quán..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="border-0 bg-light"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                fetchMerchants();
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={() => fetchMerchants()}
                                        style={{ minWidth: '100px' }}
                                    >
                                        <Search size={16} className="me-1" />
                                        Tìm
                                    </Button>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Table Section */}
            {loading ? (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                    </Card.Body>
                </Card>
            ) : error ? (
                <Alert variant="danger" className="border-0 shadow-sm">
                    <Alert.Heading>Lỗi!</Alert.Heading>
                    {error}
                </Alert>
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-semibold">Danh sách Merchant</h5>
                            <Badge bg="primary" pill className="px-3 py-2">
                                {merchants.length} kết quả
                            </Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                <tr>
                                    <th className="text-muted small fw-semibold" style={{ width: '60px' }}>ID</th>
                                    <th className="text-muted small fw-semibold" style={{ minWidth: '200px' }}>Tên Nhà hàng</th>
                                    <th className="text-muted small fw-semibold" style={{ width: '120px' }}>Trạng thái</th>
                                    <th className="text-muted small fw-semibold text-center" style={{ width: '80px' }}>Món ăn</th>
                                    <th className="text-muted small fw-semibold text-center" style={{ width: '90px' }}>Đơn hàng</th>
                                    <th className="text-muted small fw-semibold" style={{ width: '130px' }}>Doanh thu</th>
                                    <th className="text-muted small fw-semibold" style={{ width: '130px' }}>Số dư</th>
                                    <th className="text-muted small fw-semibold" style={{ minWidth: '300px' }}>Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {merchants.length > 0 ? (
                                    merchants.map(renderMerchantRow)
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5">
                                            <Store size={48} className="text-muted mb-3" />
                                            <p className="text-muted">Không tìm thấy merchant nào</p>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            )}

            <MerchantApprovalModal
                show={showApprovalModal}
                merchant={selectedMerchant}
                isApprove={isApprove}
                onHide={() => setShowApprovalModal(false)}
                onSuccess={handleSuccess}
            />
            <MerchantLockModal
                show={showLockModal}
                merchant={selectedMerchant}
                isLock={isLock}
                onHide={() => setShowLockModal(false)}
                onSuccess={handleSuccess}
            />
            <ReProcessModal
                show={showReProcessModal}
                merchant={selectedMerchant}
                onHide={() => setShowReProcessModal(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};