import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Save, Truck, Info } from 'lucide-react';
import { getShippingPartnerById, updateShippingPartner } from '../api/driverApi';
import { ShippingPartnerRequest } from '../types/driver';
import toast from 'react-hot-toast';

const DriverUpdateForm: React.FC = () => {
    const { driverId } = useParams<{ driverId: string }>();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ShippingPartnerRequest>();

    useEffect(() => {
        const loadData = async () => {
            if (!driverId) return;
            try {
                const data = await getShippingPartnerById(Number(driverId));
                reset(data);
            } catch (error) {
                toast.error("Không thể tải dữ liệu đối tác!");
                navigate('/admin/drivers');
            }
        };
        loadData();
    }, [driverId, reset, navigate]);

    const onSubmit = async (data: ShippingPartnerRequest) => {
        try {
            // ✅ Đảm bảo isDefault luôn là boolean, không phải undefined
            const payload = {
                ...data,
                isDefault: data.isDefault || false
            };
            await updateShippingPartner(Number(driverId), payload);
            toast.success("Cập nhật thông tin thành công!");
            navigate(`/admin/drivers/${driverId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật!");
        }
    };

    return (
        <div className="p-4 w-100">
            {/* Thanh điều hướng quay lại */}
            <div className="mb-4">
                <Button
                    variant="link"
                    className="p-0 text-decoration-none d-flex align-items-center text-muted"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} className="me-2" /> Hủy và quay lại
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-4 px-4">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                            <Truck className="text-primary" size={24} />
                        </div>
                        <h4 className="fw-bold mb-0">Chỉnh sửa đối tác vận chuyển</h4>
                    </div>
                    <p className="text-muted small mt-2 mb-0">
                        Cập nhật thông tin chi tiết và thiết lập chiết khấu cho đơn vị vận chuyển.
                    </p>
                </Card.Header>

                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row className="g-4">
                            {/* Phần thông tin cơ bản */}
                            <Col lg={8}>
                                <div className="p-4 border rounded-3 bg-light bg-opacity-10">
                                    <h5 className="mb-4 d-flex align-items-center gap-2">
                                        <Info size={18} className="text-primary" /> Thông tin chung
                                    </h5>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">Tên đối tác <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            size="lg"
                                            placeholder="Giao hàng tiết kiệm, Viettel Post..."
                                            {...register("name", {
                                                required: "Tên không được để trống",
                                                maxLength: { value: 255, message: "Tên không được vượt quá 255 ký tự" }
                                            })}
                                            isInvalid={!!errors.name}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">Email <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="contact@shipping-partner.com"
                                            {...register("email", {
                                                required: "Email không được để trống",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Email không hợp lệ"
                                                }
                                            })}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-0">
                                        <Form.Label className="fw-semibold">Địa chỉ chi tiết <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Nhập địa chỉ trụ sở chính..."
                                            {...register("address", {
                                                required: "Địa chỉ không được để trống",
                                                maxLength: { value: 500, message: "Địa chỉ không được vượt quá 500 ký tự" }
                                            })}
                                            isInvalid={!!errors.address}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.address?.message}</Form.Control.Feedback>
                                        <Form.Text className="text-muted">Tối đa 500 ký tự.</Form.Text>
                                    </Form.Group>
                                </div>
                            </Col>

                            {/* Phần thông số liên lạc và tài chính */}
                            <Col lg={4}>
                                <div className="p-4 border rounded-3 h-100">
                                    <h5 className="mb-4">Liên lạc & Chiết khấu</h5>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Số điện thoại <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("phone", {
                                                required: "Số điện thoại là bắt buộc",
                                                pattern: { value: /^[0-9]{10}$/, message: "Số điện thoại phải có 10 chữ số" }
                                            })}
                                            isInvalid={!!errors.phone}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Mức chiết khấu đơn hàng <span className="text-danger">*</span></Form.Label>
                                        <InputGroup size="lg">
                                            <Form.Control
                                                type="number" step="0.1"
                                                {...register("commissionRate", {
                                                    required: "Vui lòng nhập chiết khấu",
                                                    min: { value: 0, message: "Không được nhỏ hơn 0" },
                                                    max: { value: 100, message: "Không được vượt quá 100" }
                                                })}
                                                isInvalid={!!errors.commissionRate}
                                            />
                                            <InputGroup.Text className="bg-primary text-white">%</InputGroup.Text>
                                            <Form.Control.Feedback type="invalid">{errors.commissionRate?.message}</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>

                                    <div className="alert alert-info border-0 small mb-0">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Lưu ý: Chiết khấu này sẽ được áp dụng trực tiếp cho mọi đơn hàng mà đối tác đảm nhận.
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Nút tác vụ */}
                        <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                            <Button variant="light" className="px-4 py-2" onClick={() => navigate(-1)}>
                                Hủy bỏ
                            </Button>
                            <Button variant="primary" type="submit" className="px-5 py-2 fw-bold" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Spinner size="sm" className="me-2"/> Đang lưu...</>
                                ) : (
                                    <><Save size={18} className="me-2"/> Lưu thay đổi</>
                                ) }
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DriverUpdateForm;