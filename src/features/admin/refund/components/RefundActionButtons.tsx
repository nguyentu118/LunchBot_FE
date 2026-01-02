// src/features/admin/refund/components/RefundActionButtons.tsx

import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { CheckCircle, Clock, AlertCircle, X, RotateCcw } from 'lucide-react';
import { RefundResponse } from '../service/RefundApi.service';

interface RefundActionButtonsProps {
    refund: RefundResponse;
    onProcessing: (refund: RefundResponse) => void;
    onConfirm: (refund: RefundResponse) => void;
    onFail: (refund: RefundResponse) => void;
    onCancel: (refund: RefundResponse) => void;
    onRetry: (refund: RefundResponse) => void;
    loading?: boolean;
}

const RefundActionButtons: React.FC<RefundActionButtonsProps> = ({
                                                                     refund,
                                                                     onProcessing,
                                                                     onConfirm,
                                                                     onFail,
                                                                     onCancel,
                                                                     onRetry,
                                                                     loading = false,
                                                                 }) => {
    const getActionButtons = () => {
        const commonProps = {
            size: 'sm' as const,
            disabled: loading,
        };

        switch (refund.refundStatus) {
            case 'PENDING':
                return (
                    <ButtonGroup className="gap-2 d-flex flex-wrap">
                        <Button
                            {...commonProps}
                            variant="info"
                            onClick={() => onProcessing(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <Clock size={14} />
                            Đang xử lý
                        </Button>
                        <Button
                            {...commonProps}
                            variant="danger"
                            onClick={() => onCancel(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <X size={14} />
                            Hủy
                        </Button>
                    </ButtonGroup>
                );

            case 'PROCESSING':
                return (
                    <ButtonGroup className="gap-2 d-flex flex-wrap">
                        <Button
                            {...commonProps}
                            variant="success"
                            onClick={() => onConfirm(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <CheckCircle size={14} />
                            Xác nhận
                        </Button>
                        <Button
                            {...commonProps}
                            variant="danger"
                            onClick={() => onFail(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <AlertCircle size={14} />
                            Thất bại
                        </Button>
                        <Button
                            {...commonProps}
                            variant="warning"
                            onClick={() => onCancel(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <X size={14} />
                            Hủy
                        </Button>
                    </ButtonGroup>
                );

            case 'FAILED':
                return (
                    <ButtonGroup className="gap-2 d-flex flex-wrap">
                        <Button
                            {...commonProps}
                            variant="primary"
                            onClick={() => onRetry(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <RotateCcw size={14} />
                            Thử lại
                        </Button>
                        <Button
                            {...commonProps}
                            variant="danger"
                            onClick={() => onCancel(refund)}
                            className="d-flex align-items-center gap-1"
                        >
                            <X size={14} />
                            Hủy
                        </Button>
                    </ButtonGroup>
                );

            case 'COMPLETED':
            case 'CANCELLED':
                return (
                    <span className="badge bg-secondary">
                        {refund.refundStatus === 'COMPLETED' ? 'Đã hoàn' : 'Đã hủy'}
                    </span>
                );

            default:
                return null;
        }
    };

    return <div className="d-flex justify-content-center">{getActionButtons()}</div>;
};

export default RefundActionButtons;