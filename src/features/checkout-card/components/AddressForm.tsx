// src/features/address/components/AddressForm.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { MapPin, Save } from 'lucide-react';
import { Address, AddressFormData } from '../types/address.types';

interface AddressFormProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (data: AddressFormData) => Promise<void>;
    address?: Address | null; // Nếu có address thì là edit, không thì là create
    isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
                                                     show,
                                                     onHide,
                                                     onSubmit,
                                                     address,
                                                     isLoading = false
                                                 }) => {
    const [formData, setFormData] = useState<AddressFormData>({
        contactName: '',
        phone: '',
        province: 'Hà Nội',
        district: '',
        ward: '',
        street: '',
        building: '',
        isDefault: false
    });

    const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

    // Danh sách tỉnh/thành phố (có thể mở rộng)
    const provinces = [
        'Hà Nội',
        'Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Cần Thơ',
        'An Giang',
        'Bà Rịa - Vũng Tàu',
        'Bắc Giang',
        'Bắc Kạn',
        'Bạc Liêu',
        'Bắc Ninh',
        'Bến Tre',
        'Bình Định',
        'Bình Dương',
        'Bình Phước',
        'Bình Thuận',
        'Cà Mau',
        'Cao Bằng',
        'Đắk Lắk',
        'Đắk Nông',
        'Điện Biên',
        'Đồng Nai',
        'Đồng Tháp',
        'Gia Lai',
        'Hà Giang',
        'Hà Nam',
        'Hà Tĩnh',
        'Hải Dương',
        'Hậu Giang',
        'Hòa Bình',
        'Hưng Yên',
        'Khánh Hòa',
        'Kiên Giang',
        'Kon Tum',
        'Lai Châu',
        'Lâm Đồng',
        'Lạng Sơn',
        'Lào Cai',
        'Long An',
        'Nam Định',
        'Nghệ An',
        'Ninh Bình',
        'Ninh Thuận',
        'Phú Thọ',
        'Phú Yên',
        'Quảng Bình',
        'Quảng Nam',
        'Quảng Ngãi',
        'Quảng Ninh',
        'Quảng Trị',
        'Sóc Trăng',
        'Sơn La',
        'Tây Ninh',
        'Thái Bình',
        'Thái Nguyên',
        'Thanh Hóa',
        'Thừa Thiên Huế',
        'Tiền Giang',
        'Trà Vinh',
        'Tuyên Quang',
        'Vĩnh Long',
        'Vĩnh Phúc',
        'Yên Bái'
    ];

    // Load address data khi edit
    useEffect(() => {
        if (address) {
            setFormData({
                contactName: address.contactName,
                phone: address.phone,
                province: address.province,
                district: address.district,
                ward: address.ward,
                street: address.street,
                building: address.building || '',
                isDefault: address.isDefault
            });
        } else {
            // Reset form khi tạo mới
            setFormData({
                contactName: '',
                phone: '',
                province: 'Hà Nội',
                district: '',
                ward: '',
                street: '',
                building: '',
                isDefault: false
            });
        }
        setErrors({});
    }, [address, show]);

    const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error khi user nhập
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

        if (!formData.contactName.trim()) {
            newErrors.contactName = 'Vui lòng nhập tên người nhận';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
        }

        if (!formData.district.trim()) {
            newErrors.district = 'Vui lòng nhập quận/huyện';
        }

        if (!formData.ward.trim()) {
            newErrors.ward = 'Vui lòng nhập phường/xã';
        }

        if (!formData.street.trim()) {
            newErrors.street = 'Vui lòng nhập địa chỉ cụ thể';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
            onHide();
        } catch (error) {
            console.error('Error submitting address:', error);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <MapPin size={24} className="text-danger me-2" />
                    {address ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="g-3">
                        {/* Contact Name */}
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Tên người nhận <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.contactName}
                                    onChange={(e) => handleChange('contactName', e.target.value)}
                                    isInvalid={!!errors.contactName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.contactName}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Phone */}
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="0987654321"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    isInvalid={!!errors.phone}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.phone}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Province */}
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={formData.province}
                                    onChange={(e) => handleChange('province', e.target.value)}
                                >
                                    {provinces.map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* District */}
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Quận Cầu Giấy"
                                    value={formData.district}
                                    onChange={(e) => handleChange('district', e.target.value)}
                                    isInvalid={!!errors.district}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.district}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Ward */}
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Phường Dịch Vọng"
                                    value={formData.ward}
                                    onChange={(e) => handleChange('ward', e.target.value)}
                                    isInvalid={!!errors.ward}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.ward}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Street */}
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Địa chỉ cụ thể <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Số nhà, tên đường"
                                    value={formData.street}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                    isInvalid={!!errors.street}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.street}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Building */}
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Tòa nhà, số tầng (không bắt buộc)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="VD: Tòa A, Tầng 5"
                                    value={formData.building}
                                    onChange={(e) => handleChange('building', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        {/* Set Default */}
                        <Col xs={12}>
                            <Form.Check
                                type="checkbox"
                                id="isDefault"
                                label="Đặt làm địa chỉ mặc định"
                                checked={formData.isDefault}
                                onChange={(e) => handleChange('isDefault', e.target.checked)}
                            />
                        </Col>
                    </Row>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="danger" className="mt-3 mb-0">
                            Vui lòng kiểm tra lại thông tin đã nhập
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="light" onClick={onHide} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                        className="d-flex align-items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Lưu địa chỉ
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddressForm;