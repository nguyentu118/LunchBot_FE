// src/features/admin/refund/components/ConfirmRefundModal.tsx

import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { CheckCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { RefundRequest, ConfirmRefundPayload } from '../types/refund.type';
import { formatCurrency, formatDateTime } from './formatters';

interface ConfirmRefundModalProps {
    show: boolean;
    refund: RefundRequest | null;
    onClose: () => void;
    onConfirm: (payload: ConfirmRefundPayload) => Promise<void>;
    loading?: boolean;
}

const ConfirmRefundModal: React.FC<ConfirmRefundModalProps> = ({
                                                                   show,
                                                                   refund,
                                                                   onClose,
                                                                   onConfirm,
                                                                   loading = false,
                                                               }) => {
    const [transactionRef, setTransactionRef] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!transactionRef.trim()) {
            newErrors.transactionRef = 'Mã giao dịch không được để trống';
        }

        if (!notes.trim()) {
            newErrors.notes = 'Ghi chú không được để trống';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: string
    ) => {
        const value = e.target.value;

        if (field === 'transactionRef') {
            setTransactionRef(value);
        } else if (field === 'notes') {
            setNotes(value);
        }

        // Xóa lỗi khi user bắt đầu nhập
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm() || !refund) {
            return;
        }

        try {
            await onConfirm({
                refundTransactionRef: transactionRef,
                notes: notes,
            });

            // Reset form
            setTransactionRef('');
            setNotes('');
            setErrors({});
            onClose();
            toast.success('Xác nhận hoàn tiền thành công!');
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Xác nhận thất bại';
            toast.error(message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Đã sao chép!');
    };

    if (!refund) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <CheckCircle size={24} className="text-success" />
                    Xác nhận Hoàn tiền
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
                {/* Thông tin đơn hàng */}
                <div className="card border-0 bg-light mb-4">
                    <div className="card-body">
                        <h6 className="card-title fw-bold text-primary">📋 Thông tin Đơn hàng</h6>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <div className="small mb-3">
                                    <span className="text-muted">Mã đơn:</span>
                                    <div className="fw-bold">{refund.orderNumber}</div>
                                </div>
                                <div className="small mb-3">
                                    <span className="text-muted">Khách hàng:</span>
                                    <div className="fw-bold">{refund.customerName}</div>
                                </div>
                                <div className="small">
                                    <span className="text-muted">Email:</span>
                                    <div className="fw-bold text-break">{refund.customerEmail}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="small mb-3">
                                    <span className="text-muted">Số tiền:</span>
                                    <div className="fw-bold text-danger fs-5">
                                        {formatCurrency(refund.refundAmount)}
                                    </div>
                                </div>
                                <div className="small mb-3">
                                    <span className="text-muted">Ngày tạo:</span>
                                    <div className="fw-bold">{formatDateTime(refund.createdAt)}</div>
                                </div>
                                <div className="small">
                                    <span className="text-muted">Lý do:</span>
                                    <div className="fw-bold text-truncate">{refund.refundReason}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin Ngân hàng */}
                <div className="card border-0 bg-light mb-4">
                    <div className="card-body">
                        <h6 className="card-title fw-bold text-primary">🏦 Thông tin Ngân hàng</h6>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <div className="small mb-3">
                                    <span className="text-muted">Ngân hàng:</span>
                                    <div className="fw-bold">{refund.customerBankName}</div>
                                </div>
                                <div className="small">
                                    <span className="text-muted">Chủ tài khoản:</span>
                                    <div className="fw-bold">{refund.customerAccountName}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="small">
                                    <span className="text-muted">Số tài khoản:</span>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="fw-bold">
                                            {refund.customerBankAccount}
                                        </div>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-0"
                                            onClick={() => copyToClipboard(refund.customerBankAccount)}
                                            title="Sao chép"
                                        >
                                            <Copy size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form xác nhận */}
                <Alert variant="info" className="mb-4">
                    ℹ️ Vui lòng nhập mã giao dịch hoàn tiền sau khi đã chuyển tiền về tài khoản khách hàng.
                </Alert>

                <Form>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                            Mã giao dịch hoàn tiền <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="VD: REF123456, SPY789..."
                            value={transactionRef}
                            onChange={(e) => handleInputChange(e, 'transactionRef')}
                            isInvalid={!!errors.transactionRef}
                            disabled={loading}
                            className="form-control-lg"
                        />
                        {errors.transactionRef && (
                            <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                {errors.transactionRef}
                            </Form.Control.Feedback>
                        )}
                        <Form.Text className="text-muted d-block mt-2">
                            💡 Mã giao dịch từ hệ thống ngân hàng hoặc ứng dụng chuyển tiền
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                            Ghi chú <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="VD: Đã chuyển khoản lúc 14:30 ngày 20/12/2024..."
                            value={notes}
                            onChange={(e) => handleInputChange(e, 'notes')}
                            isInvalid={!!errors.notes}
                            disabled={loading}
                            className="form-control-lg"
                        />
                        {errors.notes && (
                            <Form.Control.Feedback type="invalid" className="d-block mt-2">
                                {errors.notes}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer className="border-top">
                <Button
                    variant="outline-secondary"
                    onClick={onClose}
                    disabled={loading}
                >
                    Hủy
                </Button>
                <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Đang xác nhận...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={18} className="me-2" />
                            Xác nhận Hoàn tiền
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmRefundModal;