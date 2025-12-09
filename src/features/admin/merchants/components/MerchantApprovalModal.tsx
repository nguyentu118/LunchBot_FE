import React from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import { useMerchantApproval } from '../hooks/useMerchantApproval';
import { AdminMerchantListResponse } from '../types/merchant.types';
import * as Yup from 'yup';

interface MerchantApprovalModalProps {
    show: boolean;
    merchant: AdminMerchantListResponse | null;
    isApprove: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

// ⭐ FIX: Đảm bảo lý do luôn BẮT BUỘC (required)
const getApprovalValidationSchema = (isApprove: boolean) => {
    const reasonMessage = isApprove ? 'Lý do duyệt không được để trống.' : 'Lý do từ chối không được để trống.';

    return Yup.object().shape({
        // Lý do luôn bắt buộc, bất kể Duyệt hay Từ chối
        reason: Yup.string().required(reasonMessage),
    });
};

export const MerchantApprovalModal: React.FC<MerchantApprovalModalProps> = ({
                                                                                show,
                                                                                merchant,
                                                                                isApprove,
                                                                                onHide,
                                                                                onSuccess
                                                                            }) => {
    const { isLoading, error, approveMerchant } = useMerchantApproval();

    if (!merchant) return null;

    const handleSubmit = async (values: { reason: string }, { resetForm }: { resetForm: () => void }) => {
        const result = await approveMerchant(merchant.id, {
            approved: isApprove,
            reason: values.reason
        });

        if (result) {
            onSuccess();
            onHide();
            resetForm();
        }
    };

    // Lấy schema tùy chỉnh dựa trên isApprove
    const validationSchema = getApprovalValidationSchema(isApprove);

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className={isApprove ? 'bg-success-subtle' : 'bg-danger-subtle'}>
                <Modal.Title>
                    <i className={`bi ${isApprove ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                    {isApprove ? 'Duyệt Merchant' : 'Từ chối Merchant'}
                </Modal.Title>
            </Modal.Header>

            <Formik
                initialValues={{ reason: '' }}
                validationSchema={validationSchema} // Dùng schema tùy chỉnh (luôn bắt buộc lý do)
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, isValid, resetForm }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            {error && (
                                <Alert variant="danger" dismissible>
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            <div className="mb-3">
                                <h6 className="text-muted">Thông tin Merchant:</h6>
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <p className="mb-1">
                                            <strong>Tên nhà hàng:</strong> {merchant.restaurantName}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Chủ sở hữu:</strong> {merchant.ownerName}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Email:</strong> {merchant.email}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Số điện thoại:</strong> {merchant.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Lý do {isApprove ? 'duyệt' : 'từ chối'}
                                    {/* Thêm dấu sao (bắt buộc) */}
                                    <span className="text-danger"> *</span>
                                </Form.Label>
                                <Field
                                    as="textarea"
                                    name="reason"
                                    className="form-control"
                                    rows={4}
                                    placeholder={
                                        isApprove
                                            ? 'Nhập lý do duyệt (Bắt buộc)...'
                                            : 'Nhập lý do từ chối (Bắt buộc)...'
                                    }
                                />
                                <ErrorMessage name="reason" component="div" className="text-danger small mt-1" />
                            </Form.Group>

                            <Alert variant={isApprove ? 'info' : 'warning'}>
                                <i className="bi bi-info-circle me-2"></i>
                                Email thông báo sẽ được gửi tự động đến <strong>{merchant.email}</strong>
                            </Alert>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => { onHide(); resetForm(); }} disabled={isLoading}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant={isApprove ? 'success' : 'danger'}
                                // 🛠️ FIX: Chỉ disabled khi form KHÔNG hợp lệ (!isValid) hoặc đang Loading
                                disabled={!isValid || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <i className={`bi ${isApprove ? 'bi-check-lg' : 'bi-x-lg'} me-2`}></i>
                                        {isApprove ? 'Duyệt' : 'Từ chối'}
                                    </>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};