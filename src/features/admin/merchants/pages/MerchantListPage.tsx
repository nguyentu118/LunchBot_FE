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
    const [pageSize] = useState(10);

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
        <tr key={merchant.id}>
            <td className="col-restaurant">
                <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-primary bg-opacity-10 rounded">
                        <Store size={20} className="text-primary" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{merchant.restaurantName}</div>
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>{merchant.ownerName}</small>
                    </div>
                </div>
            </td>
            <td className="col-status">
                <Badge
                    bg={getStatusVariant(merchant.status, merchant.isLocked)}
                    className="px-3 py-2"
                    style={{ fontSize: '0.8rem' }}
                >
                    {getStatusText(merchant.status, merchant.isLocked)}
                </Badge>
            </td>
            <td className="col-phone">
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {merchant.phone || 'N/A'}
                </span>
            </td>
            <td className="col-hours">
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {merchant.openTime || 'N/A'} - {merchant.closeTime || 'N/A'}
                </span>
            </td>
            <td className="col-revenue">
                <span className="fw-semibold text-success" style={{ fontSize: '0.9rem' }}>
                    {formatCurrency(merchant.revenueTotal)}
                </span>
            </td>
            <td className="col-actions">
                <div className="d-flex gap-2 flex-wrap">
                    <Link
                        to={`/admin/merchants/${merchant.id}`}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                        style={{ minWidth: '50px', fontSize: '0.8rem' }}
                    >
                        <Eye size={15}  />
                    </Link>

                    {merchant.status === MerchantStatusEnum.PENDING && !merchant.isLocked && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprovalClick(merchant, true)}
                                className="d-inline-flex align-items-center"
                                style={{ minWidth: '75px', fontSize: '0.8rem' }}
                            >
                                <Check size={14} className="me-1" />
                                Duyệt
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleApprovalClick(merchant, false)}
                                className="d-inline-flex align-items-center"
                                style={{ minWidth: '90px', fontSize: '0.8rem' }}
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
                            className="d-inline-flex align-items-center"
                            style={{ minWidth: '75px', fontSize: '0.8rem' }}
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
                            className="d-inline-flex align-items-center"
                            style={{ minWidth: '95px', fontSize: '0.8rem' }}
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
                            className="d-inline-flex align-items-center"
                            style={{ minWidth: '105px', fontSize: '0.8rem' }}
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
            {/* CSS Styles for Table */}
            <style>{`
                .merchant-table thead th {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 1rem 0.75rem;
                    white-space: nowrap;
                    vertical-align: middle;
                }
                
                .merchant-table tbody td {
                    padding: 1rem 0.75rem;
                    font-size: 0.875rem;
                    vertical-align: middle;
                }
                
                .merchant-table tbody tr {
                    transition: background-color 0.2s ease;
                }
                
                /* Column widths - Cân đối tỷ lệ */
                .col-restaurant { 
                    width: 25%; 
                    min-width: 220px; 
                }
                
                .col-status { 
                    width: 10%; 
                    min-width: 110px; 
                    text-align: center; 
                }
                
                .col-phone { 
                    width: 12%; 
                    min-width: 120px; 
                    text-align: center; 
                }
                
                .col-hours { 
                    width: 15%; 
                    min-width: 150px; 
                    text-align: center; 
                }
                
                .col-revenue { 
                    width: 13%; 
                    min-width: 130px; 
                    text-align: right; 
                }
                
                .col-actions { 
                    width: 25%; 
                    min-width: 280px; 
                }
                
                /* Responsive */
                @media (max-width: 1200px) {
                    .merchant-table {
                        font-size: 0.85rem;
                    }
                    
                    .merchant-table thead th {
                        padding: 0.75rem 0.5rem;
                        font-size: 0.75rem;
                    }
                    
                    .merchant-table tbody td {
                        padding: 0.75rem 0.5rem;
                    }
                }
            `}</style>

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
                            <table className="table table-hover align-middle mb-0 merchant-table">
                                <thead className="bg-light">
                                <tr>
                                    <th className="text-muted small fw-semibold col-restaurant">Tên Nhà hàng</th>
                                    <th className="text-muted small fw-semibold col-status">Trạng thái</th>
                                    <th className="text-muted small fw-semibold col-phone">Số điện thoại</th>
                                    <th className="text-muted small fw-semibold col-hours">Giờ đóng - mở cửa</th>
                                    <th className="text-muted small fw-semibold col-revenue">Doanh thu</th>
                                    <th className="text-muted small fw-semibold col-actions">Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {merchants.length > 0 ? (
                                    merchants.map(renderMerchantRow)
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
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

            {/* Modals */}
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