// src/features/admin/refund/components/RefundActionModals.tsx

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { AlertCircle, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import { RefundResponse } from '../service/RefundApi.service';

interface BaseModalProps {
    show: boolean;
    refund: RefundResponse | null;
    onClose: () => void;
    onConfirm: (data: any) => Promise<void>;
    loading?: boolean;
}

// ===== PROCESSING MODAL =====
export const ProcessingModal: React.FC<BaseModalProps> = ({
                                                              show,
                                                              refund,
                                                              onClose,
                                                              onConfirm,
                                                              loading = false,
                                                          }) => {
    const [notes, setNotes] = useState('');

    const handleConfirm = async () => {
        await onConfirm(notes);
        setNotes('');
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <Clock size={20} className="text-info" />
                    Chuyển sang Đang xử lý
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {refund && (
                    <div className="mb-3">
                        <p className="text-muted small mb-2">
                            Yêu cầu hoàn tiền: <strong>{refund.orderNumber}</strong>
                        </p>
                        <p className="text-muted small mb-3">
                            Số tiền: <strong className="text-dark">{refund.refundAmount.toLocaleString('vi-VN')} VNĐ</strong>
                        </p>
                    </div>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Ghi chú xử lý</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Nhập ghi chú về quá trình xử lý..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={loading}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    variant="info"
                    onClick={handleConfirm}
                    disabled={loading || !notes.trim()}
                >
                    {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===== FAIL MODAL =====
export const FailModal: React.FC<BaseModalProps> = ({
                                                        show,
                                                        refund,
                                                        onClose,
                                                        onConfirm,
                                                        loading = false,
                                                    }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = async () => {
        await onConfirm(reason);
        setReason('');
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="border-bottom bg-danger-light">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <AlertCircle size={20} className="text-danger" />
                    Đánh dấu thất bại
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {refund && (
                    <div className="mb-3">
                        <p className="text-muted small mb-2">
                            Yêu cầu hoàn tiền: <strong>{refund.orderNumber}</strong>
                        </p>
                        <p className="text-muted small mb-3">
                            Số tiền: <strong className="text-dark">{refund.refundAmount.toLocaleString('vi-VN')} VNĐ</strong>
                        </p>
                    </div>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Lý do thất bại</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Nhập lý do hoàn tiền thất bại..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading}
                    />
                </Form.Group>
                <div className="alert alert-warning d-flex gap-2 align-items-start">
                    <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                    <div>
                        <small>
                            Khi đánh dấu thất bại, yêu cầu này sẽ cần được xử lý lại hoặc hủy.
                        </small>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={loading || !reason.trim()}
                >
                    {loading ? 'Đang xử lý...' : 'Đánh dấu thất bại'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===== CANCEL MODAL =====
export const CancelModal: React.FC<BaseModalProps> = ({
                                                          show,
                                                          refund,
                                                          onClose,
                                                          onConfirm,
                                                          loading = false,
                                                      }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = async () => {
        await onConfirm(reason);
        setReason('');
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <AlertCircle size={20} className="text-warning" />
                    Hủy yêu cầu hoàn tiền
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {refund && (
                    <div className="mb-3">
                        <p className="text-muted small mb-2">
                            Yêu cầu hoàn tiền: <strong>{refund.orderNumber}</strong>
                        </p>
                        <p className="text-muted small mb-3">
                            Số tiền: <strong className="text-dark">{refund.refundAmount.toLocaleString('vi-VN')} VNĐ</strong>
                        </p>
                    </div>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Lý do hủy</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Nhập lý do hủy yêu cầu hoàn tiền..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading}
                    />
                </Form.Group>
                <div className="alert alert-info d-flex gap-2 align-items-start">
                    <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                    <div>
                        <small>
                            Hủy yêu cầu sẽ không thể khôi phục. Khách hàng sẽ được thông báo.
                        </small>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Đóng
                </Button>
                <Button
                    variant="warning"
                    onClick={handleConfirm}
                    disabled={loading || !reason.trim()}
                >
                    {loading ? 'Đang xử lý...' : 'Hủy yêu cầu'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===== RETRY MODAL =====
export const RetryModal: React.FC<BaseModalProps> = ({
                                                         show,
                                                         refund,
                                                         onClose,
                                                         onConfirm,
                                                         loading = false,
                                                     }) => {
    const handleConfirm = async () => {
        await onConfirm(null);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="border-bottom bg-info-light">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <RotateCcw size={20} className="text-primary" />
                    Thử lại hoàn tiền
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {refund && (
                    <div className="mb-3">
                        <p className="text-muted small mb-2">
                            Yêu cầu hoàn tiền: <strong>{refund.orderNumber}</strong>
                        </p>
                        <p className="text-muted small mb-3">
                            Số tiền: <strong className="text-dark">{refund.refundAmount.toLocaleString('vi-VN')} VNĐ</strong>
                        </p>
                    </div>
                )}
                <div className="alert alert-info d-flex gap-2 align-items-start">
                    <CheckCircle size={18} className="flex-shrink-0 mt-1" />
                    <div>
                        <small>
                            Yêu cầu này sẽ được reset về trạng thái <strong>Chờ xử lý</strong> để xử lý lại.
                        </small>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Thử lại'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};