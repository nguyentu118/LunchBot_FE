import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { MerchantApiService } from '../services/merchantApi.service';
import type { AdminMerchantListResponse } from '../types/merchant.types';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface ReProcessModalProps {
    show: boolean;
    merchant: AdminMerchantListResponse | null;
    onHide: () => void;
    onSuccess: () => void;
}

const validationSchema = Yup.object({
    reason: Yup.string().required('Vui lòng nhập lý do xét duyệt lại'),
});

export const ReProcessModal: React.FC<ReProcessModalProps> = ({
                                                                  show,
                                                                  merchant,
                                                                  onHide,
                                                                  onSuccess,
                                                              }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: { reason: '' },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!merchant) return;
            setLoading(true);
            setError(null);

            try {
                // Gọi method mới thêm vào MerchantApiService
                await MerchantApiService.reProcessMerchant(merchant.id, {
                    reason: values.reason,
                });
                onSuccess();
                formik.resetForm();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-primary-subtle">
                <Modal.Title>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Xét duyệt lại: {merchant?.restaurantName}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <p>Hành động này sẽ chuyển trạng thái Merchant về <strong>PENDING</strong> (Chờ duyệt).</p>

                    <Form.Group controlId="reProcessReason">
                        <Form.Label>Lý do xét duyệt lại <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Nhập ghi chú hoặc lý do tại sao xét duyệt lại merchant này..."
                            {...formik.getFieldProps('reason')}
                            isInvalid={formik.touched.reason && !!formik.errors.reason}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.reason}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={loading || !formik.isValid}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Xác nhận duyệt lại'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};