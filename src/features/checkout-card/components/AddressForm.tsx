// src/features/address/components/AddressForm.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { MapPin, Save } from 'lucide-react';
import { Address, AddressFormData, GHNProvince, GHNDistrict, GHNWard } from '../types/address.types';
import { ghnService } from '../services/ghnService';

interface AddressFormProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (data: AddressFormData) => Promise<void>;
    address?: Address | null;
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
        province: '',
        district: '',
        ward: '',
        street: '',
        building: '',
        isDefault: false,
        provinceId: undefined,
        districtId: undefined,
        wardCode: undefined
    });

    const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

    // ✅ GHN API states
    const [provinces, setProvinces] = useState<GHNProvince[]>([]);
    const [districts, setDistricts] = useState<GHNDistrict[]>([]);
    const [wards, setWards] = useState<GHNWard[]>([]);

    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    // Load provinces khi modal open
    useEffect(() => {
        if (show) {
            loadProvinces();

            // Load address data khi edit
            if (address) {
                setFormData({
                    contactName: address.contactName,
                    phone: address.phone,
                    province: address.province,
                    district: address.district,
                    ward: address.ward,
                    street: address.street,
                    building: address.building || '',
                    isDefault: address.isDefault,
                    provinceId: address.provinceId,
                    districtId: address.districtId,
                    wardCode: address.wardCode
                });

                // Load districts & wards nếu edit
                if (address.provinceId) {
                    loadDistricts(address.provinceId);
                    if (address.districtId) {
                        loadWards(address.districtId);
                    }
                }
            } else {
                // Reset form
                setFormData({
                    contactName: '',
                    phone: '',
                    province: '',
                    district: '',
                    ward: '',
                    street: '',
                    building: '',
                    isDefault: false,
                    provinceId: undefined,
                    districtId: undefined,
                    wardCode: undefined
                });
                setDistricts([]);
                setWards([]);
            }
            setErrors({});
        }
    }, [address, show]);

    // ✅ Load provinces từ GHN
    const loadProvinces = async () => {
        try {
            setIsLoadingProvinces(true);
            const data = await ghnService.getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Error loading provinces:', error);
            alert('Không thể tải danh sách tỉnh/thành phố');
        } finally {
            setIsLoadingProvinces(false);
        }
    };

    // ✅ Load districts khi chọn province
    const loadDistricts = async (provinceId: number) => {
        try {
            setIsLoadingDistricts(true);
            setDistricts([]);
            setWards([]);

            const data = await ghnService.getDistrictsByProvince(provinceId);
            setDistricts(data);
        } catch (error) {
            console.error('Error loading districts:', error);
            alert('Không thể tải danh sách quận/huyện');
        } finally {
            setIsLoadingDistricts(false);
        }
    };

    // ✅ Load wards khi chọn district
    const loadWards = async (districtId: number) => {
        try {
            setIsLoadingWards(true);
            setWards([]);

            const data = await ghnService.getWardsByDistrict(districtId);
            setWards(data);
        } catch (error) {
            console.error('Error loading wards:', error);
            alert('Không thể tải danh sách phường/xã');
        } finally {
            setIsLoadingWards(false);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = parseInt(e.target.value);
        const selectedProvince = provinces.find(p => p.ProvinceID === provinceId);

        setFormData(prev => ({
            ...prev,
            province: selectedProvince?.ProvinceName || '',
            provinceId: provinceId,
            district: '',
            districtId: undefined,
            ward: '',
            wardCode: undefined
        }));

        if (selectedProvince) {
            loadDistricts(provinceId);
        }

        if (errors.province) {
            setErrors(prev => ({ ...prev, province: undefined }));
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = parseInt(e.target.value);
        const selectedDistrict = districts.find(d => d.DistrictID === districtId);

        setFormData(prev => ({
            ...prev,
            district: selectedDistrict?.DistrictName || '',
            districtId: districtId,
            ward: '',
            wardCode: undefined
        }));

        if (selectedDistrict) {
            loadWards(districtId);
        }

        if (errors.district) {
            setErrors(prev => ({ ...prev, district: undefined }));
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const wardCode = e.target.value;
        const selectedWard = wards.find(w => w.WardCode === wardCode);

        setFormData(prev => ({
            ...prev,
            ward: selectedWard?.WardName || '',
            wardCode: wardCode
        }));

        if (errors.ward) {
            setErrors(prev => ({ ...prev, ward: undefined }));
        }
    };

    const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

        if (!formData.provinceId) {
            newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
        }

        if (!formData.districtId) {
            newErrors.district = 'Vui lòng chọn quận/huyện';
        }

        if (!formData.wardCode) {
            newErrors.ward = 'Vui lòng chọn phường/xã';
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
                    {/* ✅ GHN API thông báo */}
                    {isLoadingProvinces && (
                        <Alert variant="info" className="mb-3">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang tải danh sách tỉnh/thành phố...
                        </Alert>
                    )}

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

                        {/* Province - ✅ GHN Select */}
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={formData.provinceId || ''}
                                    onChange={handleProvinceChange}
                                    disabled={isLoadingProvinces || provinces.length === 0}
                                    isInvalid={!!errors.province}
                                >
                                    <option value="">-- Chọn tỉnh/thành phố --</option>
                                    {provinces.map(province => (
                                        <option key={province.ProvinceID} value={province.ProvinceID}>
                                            {province.ProvinceName}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.province}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* District - ✅ GHN Select */}
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={formData.districtId || ''}
                                    onChange={handleDistrictChange}
                                    disabled={isLoadingDistricts || districts.length === 0 || !formData.provinceId}
                                    isInvalid={!!errors.district}
                                >
                                    <option value="">-- Chọn quận/huyện --</option>
                                    {districts.map(district => (
                                        <option key={district.DistrictID} value={district.DistrictID}>
                                            {district.DistrictName}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.district}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Ward - ✅ GHN Select */}
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={formData.wardCode || ''}
                                    onChange={handleWardChange}
                                    disabled={isLoadingWards || wards.length === 0 || !formData.districtId}
                                    isInvalid={!!errors.ward}
                                >
                                    <option value="">-- Chọn phường/xã --</option>
                                    {wards.map(ward => (
                                        <option key={ward.WardCode} value={ward.WardCode}>
                                            {ward.WardName}
                                        </option>
                                    ))}
                                </Form.Select>
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
                        disabled={isLoading || isLoadingProvinces || isLoadingDistricts || isLoadingWards}
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