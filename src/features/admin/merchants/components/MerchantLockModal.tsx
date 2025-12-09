import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'; // Thêm Spinner để đồng bộ style
import { MerchantApiService } from '../services/merchantApi.service';
import type { AdminMerchantListResponse } from '../types/merchant.types';

// Giả định bạn đã cài đặt formik và yup
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface MerchantLockModalProps {
    show: boolean;
    merchant: AdminMerchantListResponse | null;
    isLock: boolean; // true: Khóa, false: Mở khóa
    onHide: () => void;
    onSuccess: () => void;
}

const validationSchema = Yup.object({
    reason: Yup.string().required('Lý do không được để trống'),
});

export const MerchantLockModal: React.FC<MerchantLockModalProps> = ({
                                                                        show,
                                                                        merchant,
                                                                        isLock,
                                                                        onHide,
                                                                        onSuccess,
                                                                    }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const actionText = isLock ? 'Khóa' : 'Mở khóa';

    const formik = useFormik({
        initialValues: {
            reason: '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!merchant) return;

            setLoading(true);
            setError(null);

            try {
                await MerchantApiService.lockUnlockMerchant(merchant.id, {
                    lock: isLock,
                    reason: values.reason,
                });

                onSuccess(); // Cập nhật lại danh sách Merchant
                formik.resetForm();

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi thực hiện hành động.');
            } finally {
                setLoading(false);
            }
        },
    });

    const handleModalClose = () => {
        formik.resetForm();
        setError(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered>
            <Modal.Header closeButton className={isLock ? 'bg-danger-subtle' : 'bg-success-subtle'}>
                <Modal.Title>
                    <i className={`bi ${isLock ? 'bi-lock-fill' : 'bi-unlock-fill'} me-2`}></i>
                    {actionText} Merchant: {merchant?.restaurantName}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <p>
                        Vui lòng nhập lý do để **{actionText.toLowerCase()}** Merchant
                        **{merchant?.restaurantName}**. Một email sẽ được gửi đến chủ nhà hàng.
                    </p>

                    <Form.Group controlId="reason">
                        <Form.Label>Lý do {actionText.toLowerCase()} <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={`Nhập lý do ${actionText.toLowerCase()}...`}
                            {...formik.getFieldProps('reason')}
                            isInvalid={formik.touched.reason && !!formik.errors.reason}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.reason}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        variant={isLock ? 'danger' : 'success'}
                        type="submit"
                        // 🛠️ SỬA LỖI disabled: Đã loại bỏ !formik.dirty
                        disabled={loading || !formik.isValid}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            actionText
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};