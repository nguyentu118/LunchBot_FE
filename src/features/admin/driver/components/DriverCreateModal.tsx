import React from 'react';
import {useForm} from 'react-hook-form';
import {Button, Form, InputGroup, Modal} from 'react-bootstrap';
import {ShippingPartnerRequest} from '../types/driver';
import {createShippingPartner} from '../api/driverApi';
import toast from "react-hot-toast";

interface Props {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
}

const DriverCreateModal: React.FC<Props> = ({show, handleClose, onSuccess}) => {
    const {register, handleSubmit, formState: {errors}, reset} = useForm<ShippingPartnerRequest>();

    const onSubmit = async (data: ShippingPartnerRequest) => {
        try {
            // ✅ Đảm bảo isDefault luôn là boolean, không phải undefined
            const payload = {
                ...data,
                isDefault: data.isDefault || false
            };
            await createShippingPartner(payload);
            toast.success("Thêm đối tác vận chuyển thành công!");
            reset();
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu!");
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            size="lg"
        >
            <Modal.Header closeButton className="border-0 pb-2">
                <Modal.Title className="fw-bold fs-4">
                    <i className="bi bi-truck me-2 text-primary"></i>
                    Thêm đối tác vận chuyển mới
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-3">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row g-3">
                        {/* Tên đối tác */}
                        <div className="col-12">
                            <Form.Group>
                                <Form.Label className="fw-semibold text-secondary mb-2">
                                    <i className="bi bi-person-badge me-1"></i>
                                    Tên đối tác <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên đối tác vận chuyển..."
                                    isInvalid={!!errors.name}
                                    className="py-2"
                                    {...register("name", {
                                        required: "Tên không được để trống",
                                        maxLength: {value: 255, message: "Tên không được quá 255 ký tự"}
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Email đối tác */}
                        <div className="col-12">
                            <Form.Group>
                                <Form.Label className="fw-semibold text-secondary mb-2">
                                    <i className="bi bi-envelope me-1"></i>
                                    Email đối tác <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Nhập Email đối tác vận chuyển..."
                                    isInvalid={!!errors.email}
                                    className="py-2"
                                    {...register("email", {
                                        required: "Email không được để trống",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email không hợp lệ"
                                        }
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Số điện thoại và Chiết khấu */}
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label className="fw-semibold text-secondary mb-2">
                                    <i className="bi bi-telephone me-1"></i>
                                    Số điện thoại <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light">
                                        <i className="bi bi-phone"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="0987654321"
                                        isInvalid={!!errors.phone}
                                        {...register("phone", {
                                            required: "Số điện thoại là bắt buộc",
                                            pattern: {value: /^[0-9]{10}$/, message: "Phải đúng 10 chữ số"}
                                        })}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone?.message}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </div>

                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label className="fw-semibold text-secondary mb-2">
                                    <i className="bi bi-percent me-1"></i>
                                    Chiết khấu (%) <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        placeholder="0 - 100"
                                        isInvalid={!!errors.commissionRate}
                                        {...register("commissionRate", {
                                            required: "Chiết khấu là bắt buộc",
                                            min: {value: 0, message: "Không được âm"},
                                            max: {value: 100, message: "Tối đa 100%"}
                                        })}
                                    />
                                    <InputGroup.Text className="bg-light">%</InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.commissionRate?.message}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </div>

                        {/* Địa chỉ */}
                        <div className="col-12">
                            <Form.Group>
                                <Form.Label className="fw-semibold text-secondary mb-2">
                                    <i className="bi bi-geo-alt me-1"></i>
                                    Địa chỉ <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Nhập địa chỉ chi tiết..."
                                    isInvalid={!!errors.address}
                                    {...register("address", {
                                        required: "Địa chỉ không được để trống",
                                        maxLength: {value: 500, message: "Địa chỉ không được quá 500 ký tự"}
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.address?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Đặt làm mặc định */}
                        <div className="col-12">
                            <Form.Group>
                                <Form.Check
                                    type="checkbox"
                                    id="isDefault"
                                    label={
                                        <span>
                                            <i className="bi bi-star me-1 text-warning"></i>
                                            Đặt làm đối tác vận chuyển mặc định
                                        </span>
                                    }
                                    {...register("isDefault")}
                                />
                                <Form.Text className="text-muted ms-4">
                                    Nếu chọn, đối tác này sẽ tự động được ưu tiên cho các đơn hàng mới
                                </Form.Text>
                            </Form.Group>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button
                            variant="outline-secondary"
                            onClick={handleClose}
                            className="px-4"
                        >
                            <i className="bi bi-x-lg me-2"></i>
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4"
                        >
                            <i className="bi bi-check-lg me-2"></i>
                            Lưu đối tác
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default DriverCreateModal;