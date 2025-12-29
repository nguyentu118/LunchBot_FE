import React from 'react';
import { Table, Card, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReconciliationRequestResponse } from '../types/revenue.types.ts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {Info, AlertCircle, CheckCircle, Clock} from 'lucide-react';

interface Props {
    history: ReconciliationRequestResponse[];
}

export const ReconciliationHistoryTable: React.FC<Props> = ({ history }) => {

    // Helper: Format tiền tệ
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Helper: Format ngày giờ
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    };

    // Helper: Render Badge trạng thái đẹp mắt
    const renderStatus = (item: ReconciliationRequestResponse) => {
        switch (item.status) {
            case 'APPROVED':
                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        <Badge bg="success" className="d-flex align-items-center gap-1">
                            <CheckCircle size={12} /> Đã duyệt
                        </Badge>
                        {item.reviewedByName && (
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                bởi {item.reviewedByName}
                            </small>
                        )}
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        <Badge bg="danger" className="d-flex align-items-center gap-1">
                            <AlertCircle size={12} /> Từ chối
                        </Badge>
                        {item.reviewedByName && (
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                bởi {item.reviewedByName}
                            </small>
                        )}
                    </div>
                );
            case 'REPORTED':
                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                            <Clock size={12} /> Đang khiếu nại
                        </Badge>
                    </div>
                );
            default:
                return (
                    <div className="d-flex flex-column align-items-center gap-1">
                        <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                            <Clock size={12} /> Đang chờ
                        </Badge>
                    </div>
                );
        }
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                    <Clock size={32} className="text-muted" />
                </div>
                <p className="text-muted">Chưa có lịch sử đối soát nào.</p>
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-sm mt-3">
            <Card.Header className="bg-white py-3 border-bottom border-light">
                <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                    <Clock size={18} className="me-2" />
                    Lịch sử yêu cầu đối soát
                </h6>
            </Card.Header>
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                    <thead className="bg-light">
                    <tr>
                        {/* 1. THÁNG/NGÀY (18%) */}
                        <th className="py-3 ps-4 fw-bold" style={{ width: '18%', minWidth: '140px' }}>
                            Tháng / Ngày gửi
                        </th>

                        {/* 2. TỔNG ĐƠN (12%) */}
                        <th className="py-3 fw-bold text-center" style={{ width: '12%', minWidth: '80px' }}>
                            Tổng đơn
                        </th>

                        {/* 3. DOANH THU (22%) */}
                        <th className="py-3 fw-bold text-end pe-4" style={{ width: '22%', minWidth: '140px' }}>
                            Doanh thu
                        </th>

                        {/* 4. TRẠNG THÁI (18%) */}
                        <th className="py-3 fw-bold text-center" style={{ width: '18%', minWidth: '120px' }}>
                            Trạng thái
                        </th>

                        {/* 5. GHI CHÚ (30%) */}
                        <th className="py-3 fw-bold ps-3" style={{ width: '30%', minWidth: '180px' }}>
                            Phản hồi / Ghi chú
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item) => (
                        <tr key={item.id} className="border-bottom">
                            {/* Cột 1: Tháng / Ngày */}
                            <td className="ps-4 py-3">
                                <div className="fw-bold text-dark">{item.yearMonth}</div>
                                <div className="small text-muted">{formatDate(item.createdAt)}</div>
                            </td>

                            {/* Cột 2: Tổng đơn */}
                            <td className="text-center py-3">
                                <div className="fw-semibold">{item.totalOrders}</div>
                            </td>

                            {/* Cột 3: Doanh thu */}
                            <td className="text-end pe-4 py-3">
                                <div className="fw-bold text-success">{formatCurrency(item.netRevenue)}</div>
                                <div className="small text-muted">
                                    Gộp: {formatCurrency(item.totalGrossRevenue)}
                                </div>
                            </td>

                            {/* Cột 4: Trạng thái */}
                            <td className="text-center py-3">
                                {renderStatus(item)}
                            </td>

                            {/* Cột 5: Ghi chú / Phản hồi */}
                            <td className="ps-3 py-3">
                                {item.status === 'REJECTED' && item.rejectionReason ? (
                                    <div className="text-danger small">
                                        <strong>Lý do: </strong>
                                        <span className="d-block mt-1">{item.rejectionReason}</span>
                                    </div>
                                ) : (item.adminNotes || item.merchantNotes) ? (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`tooltip-${item.id}`}>
                                                <div style={{ maxWidth: '300px', textAlign: 'left' }}>
                                                    {item.adminNotes || item.merchantNotes}
                                                </div>
                                            </Tooltip>
                                        }
                                    >
                                        <div className="d-flex align-items-start gap-2 text-secondary" style={{ cursor: 'help' }}>
                                            <Info size={16} className="flex-shrink-0 mt-0.5" />
                                            <span className="small text-truncate" style={{ wordBreak: 'break-word' }}>
                                                {item.adminNotes || item.merchantNotes}
                                            </span>
                                        </div>
                                    </OverlayTrigger>
                                ) : (
                                    <span className="text-muted small">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </Card>
    );
};