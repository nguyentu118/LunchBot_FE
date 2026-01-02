// src/features/admin/refund/components/RefundList.tsx

import React, { useState } from 'react';
import { Badge, Table, Button, Spinner, Pagination, Form } from 'react-bootstrap';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { RefundRequest, RefundStatus } from '../types/refund.type';
import { formatCurrency, formatDateTime } from './formatters.ts';

interface RefundListProps {
    refunds: RefundRequest[];
    loading: boolean;
    onViewDetail: (refund: RefundRequest) => void;
    onConfirm: (refund: RefundRequest) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onFilterChange: (status: RefundStatus | '') => void;
    renderActions?: (refund: RefundRequest) => React.ReactNode;
}

const RefundList: React.FC<RefundListProps> = ({
                                                   refunds,
                                                   loading,
                                                   onViewDetail,
                                                   onConfirm,
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   onFilterChange,
                                                   renderActions, // ✅ Đã được khai báo và sẽ sử dụng bên dưới
                                               }) => {
    const [selectedStatus, setSelectedStatus] = useState<RefundStatus | ''>('');

    const getStatusBadge = (status: RefundStatus) => {
        const statusConfig: Record<RefundStatus, { variant: string; label: string; icon: React.ReactNode }> = {
            'PENDING': { variant: 'warning', label: 'Chờ xử lý', icon: <Clock size={14} className="me-1" /> },
            'PROCESSING': { variant: 'info', label: 'Đang xử lý', icon: <Spinner animation="border" size="sm" className="me-1" /> },
            'COMPLETED': { variant: 'success', label: 'Hoàn tiền', icon: <CheckCircle size={14} className="me-1" /> },
            'FAILED': { variant: 'danger', label: 'Thất bại', icon: <XCircle size={14} className="me-1" /> },
            'CANCELLED': { variant: 'secondary', label: 'Đã hủy', icon: <XCircle size={14} className="me-1" /> },
        };

        const config = statusConfig[status];
        return (
            <Badge bg={config.variant} className="d-flex align-items-center w-fit">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as RefundStatus | '';
        setSelectedStatus(value);
        onFilterChange(value);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="refund-list-container">
            {/* Filter Bar */}
            <div className="mb-4 d-flex gap-3 align-items-center">
                <Form.Group style={{ minWidth: '200px' }}>
                    <Form.Label className="small fw-bold text-muted">Lọc theo trạng thái</Form.Label>
                    <Form.Select
                        size="sm"
                        value={selectedStatus}
                        onChange={handleStatusFilter}
                        className="form-control-sm"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="COMPLETED">Hoàn tiền</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </Form.Select>
                </Form.Group>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <Table hover className="align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Số tiền</th>
                        <th>Ngân hàng</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {refunds.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                                Không có yêu cầu hoàn tiền
                            </td>
                        </tr>
                    ) : (
                        // ✅ FIX 1: Xóa 'index' khỏi tham số map vì không sử dụng
                        refunds.map((refund) => (
                            <tr key={refund.id} className="border-bottom">
                                <td className="fw-bold text-primary">#{refund.id}</td>
                                <td>
                                    <div className="small">
                                        <div className="fw-bold">{refund.orderNumber}</div>
                                        <div className="text-muted text-truncate">{refund.orderId}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="small">
                                        <div className="fw-bold">{refund.customerName}</div>
                                        <div className="text-muted text-truncate">{refund.customerEmail}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-bold text-danger">
                                        {formatCurrency(refund.refundAmount)}
                                    </div>
                                    <div className="small text-muted">
                                        {refund.transactionRef && `Ref: ${refund.transactionRef}`}
                                    </div>
                                </td>
                                <td>
                                    <div className="small">
                                        <div className="fw-bold">{refund.customerBankName}</div>
                                        <div className="text-muted">
                                            {refund.customerBankAccount?.slice(-4) && `...${refund.customerBankAccount.slice(-4)}`}
                                        </div>
                                    </div>
                                </td>
                                <td>{getStatusBadge(refund.refundStatus)}</td>
                                <td className="small text-muted">
                                    {formatDateTime(refund.createdAt)}
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            title="Xem chi tiết"
                                            onClick={() => onViewDetail(refund)}
                                        >
                                            <Eye size={16} />
                                        </Button>

                                        {/* ✅ FIX 2: Sử dụng renderActions để hiển thị các nút chức năng từ Parent */}
                                        {renderActions ? (
                                            renderActions(refund)
                                        ) : (
                                            // Fallback nếu không truyền renderActions (Logic cũ)
                                            refund.refundStatus === 'PENDING' && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    title="Xác nhận hoàn tiền"
                                                    onClick={() => onConfirm(refund)}
                                                >
                                                    <CheckCircle size={16} />
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination size="sm">
                        <Pagination.First
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                const distance = Math.abs(page - currentPage);
                                return distance <= 2 || page === 1 || page === totalPages;
                            })
                            .map((page, index, arr) => {
                                if (index > 0 && arr[index - 1] !== page - 1) {
                                    return (
                                        <Pagination.Ellipsis key={`ellipsis-${page}`} disabled />
                                    );
                                }
                                return (
                                    <Pagination.Item
                                        key={page}
                                        active={page === currentPage}
                                        onClick={() => onPageChange(page)}
                                    >
                                        {page}
                                    </Pagination.Item>
                                );
                            })}

                        <Pagination.Next
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default RefundList;