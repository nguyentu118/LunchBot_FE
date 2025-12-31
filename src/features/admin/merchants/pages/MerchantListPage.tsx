import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert, Form, Row, Col, Pagination } from 'react-bootstrap';
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

// Hàm sắp xếp merchant - PENDING lên đầu tiên
const sortMerchantsByStatus = (merchants: AdminMerchantListResponse[]): AdminMerchantListResponse[] => {
    return [...merchants].sort((a, b) => {
        // PENDING lên đầu tiên
        if (a.status === MerchantStatusEnum.PENDING && b.status !== MerchantStatusEnum.PENDING) {
            return -1;
        }
        if (a.status !== MerchantStatusEnum.PENDING && b.status === MerchantStatusEnum.PENDING) {
            return 1;
        }

        // Nếu cả hai cùng trạng thái, sắp xếp theo ID giảm dần (mới nhất trước)
        return b.id - a.id;
    });
};

export const MerchantListPage: React.FC = () => {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [isApprove, setIsApprove] = useState(true);
    const [showLockModal, setShowLockModal] = useState(false);
    const [isLock, setIsLock] = useState(true);
    const [showReProcessModal, setShowReProcessModal] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<AdminMerchantListResponse | null>(null);

    const [allMerchants, setAllMerchants] = useState<AdminMerchantListResponse[]>([]); // Lưu tất cả merchants
    const [displayMerchants, setDisplayMerchants] = useState<AdminMerchantListResponse[]>([]); // Merchants hiển thị
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);

    const [statusFilter, setStatusFilter] = useState<MerchantStatusEnum | 'ALL'>('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Fetch tất cả merchants và sắp xếp
    const fetchAllMerchants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let allData: AdminMerchantListResponse[] = [];
            let page = 0;
            let hasMore = true;
            const fetchSize = 100; // Fetch nhiều records mỗi lần

            // Fetch tất cả pages
            while (hasMore) {
                let data: PageResponse<AdminMerchantListResponse>;

                if (searchKeyword) {
                    data = await MerchantApiService.searchMerchants(searchKeyword, page, fetchSize);
                } else if (statusFilter !== 'ALL') {
                    data = await MerchantApiService.getMerchantsByStatus(statusFilter, page, fetchSize);
                } else {
                    data = await MerchantApiService.getAllMerchants(page, fetchSize);
                }

                allData = [...allData, ...data.content];

                // Kiểm tra còn trang tiếp theo không
                hasMore = page < data.totalPages - 1;
                page++;
            }

            // Sắp xếp: PENDING lên đầu
            const sortedData = sortMerchantsByStatus(allData);
            setAllMerchants(sortedData);
            setTotalElements(sortedData.length);
            setTotalPages(Math.ceil(sortedData.length / pageSize));

        } catch (err) {
            setError('Không thể tải dữ liệu Merchant. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchKeyword, pageSize]);

    // Cập nhật displayMerchants khi thay đổi page hoặc allMerchants
    useEffect(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        setDisplayMerchants(allMerchants.slice(startIndex, endIndex));
    }, [currentPage, allMerchants, pageSize]);

    // Fetch khi filter thay đổi
    useEffect(() => {
        fetchAllMerchants();
        setCurrentPage(0); // Reset về trang đầu
    }, [fetchAllMerchants]);

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
        fetchAllMerchants();
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        if (startPage > 0) {
            items.push(
                <Pagination.First key="first" onClick={() => handlePageChange(0)} />
            );
        }

        items.push(
            <Pagination.Prev
                key="prev"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
            />
        );

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page + 1}
                </Pagination.Item>
            );
        }

        items.push(
            <Pagination.Next
                key="next"
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
            />
        );

        if (endPage < totalPages - 1) {
            items.push(
                <Pagination.Last key="last" onClick={() => handlePageChange(totalPages - 1)} />
            );
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
                <div className="text-muted small">
                    Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng {totalElements} kết quả
                </div>
                <Pagination className="mb-0">{items}</Pagination>
            </div>
        );
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
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value as MerchantStatusEnum | 'ALL');
                                    }}
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
                                                fetchAllMerchants();
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={() => fetchAllMerchants()}
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
                                {displayMerchants.length} kết quả
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
                                {displayMerchants.length > 0 ? (
                                    displayMerchants.map(renderMerchantRow)
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
                        {renderPagination()}
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