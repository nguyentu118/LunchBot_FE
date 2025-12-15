import React, { useState } from 'react';
import { Plus, X, Ticket, Calendar, DollarSign, Percent, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from "../../../config/axiosConfig.ts";

interface AddCouponModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customStyles?: { primaryColor?: string };
}

interface CouponFormData {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: string;
    usageLimit: string;
    minOrderValue: string;
    validFrom: string;
    validTo: string;
}

const AddCouponModal: React.FC<AddCouponModalProps> = ({
                                                           show,
                                                           onClose,
                                                           onSuccess,
                                                           customStyles = { primaryColor: '#dc3545' }
                                                       }) => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CouponFormData>({
        code: '',
        discountType: 'FIXED_AMOUNT',
        discountValue: '',
        usageLimit: '100',
        minOrderValue: '0',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: ''
    });

    if (!show) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'code' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.code.trim()) {
            toast.error("Vui lòng nhập mã coupon!");
            return;
        }

        if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
            toast.error("Giá trị giảm phải lớn hơn 0!");
            return;
        }

        // Kiểm tra phần trăm không vượt quá 100
        if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
            toast.error("Giá trị phần trăm không được vượt quá 100%!");
            return;
        }

        if (!formData.validTo) {
            toast.error("Vui lòng chọn ngày kết thúc!");
            return;
        }

        if (new Date(formData.validTo) <= new Date(formData.validFrom)) {
            toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
            return;
        }

        if (parseInt(formData.usageLimit) <= 0) {
            toast.error("Số lượng sử dụng phải lớn hơn 0!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                usageLimit: parseInt(formData.usageLimit),
                minOrderValue: parseFloat(formData.minOrderValue),
                validFrom: formData.validFrom,
                validTo: formData.validTo
            };

            const response = await axiosInstance.post("merchants/create-coupon",payload);

            // Reset form
            setFormData({
                code: '',
                discountType: 'FIXED_AMOUNT',
                discountValue: '',
                usageLimit: '100',
                minOrderValue: '0',
                validFrom: new Date().toISOString().split('T')[0],
                validTo: ''
            });

            onSuccess();
            onClose();

        } catch (error: any) {
            console.error('Error creating coupon:', error);

            let errorMessage = "Lỗi khi tạo mã giảm giá!";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data) {
                errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal show d-block"
            style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1050,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflowY: 'auto'
            }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-lg overflow-hidden">
                    {/* HEADER */}
                    <div
                        className="modal-header text-white px-4 py-3"
                        style={{ backgroundColor: customStyles.primaryColor }}
                    >
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <Ticket className="me-2" size={24} />
                            Tạo Mã Khuyến Mãi Mới
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close"
                        />
                    </div>

                    <div className="modal-body p-4 bg-light">
                        <form onSubmit={handleSubmit} id="couponForm">
                            {/* Row 1: Mã Coupon */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <div className="form-group">
                                        <label className="fw-bold text-dark mb-2">
                                            Mã Coupon <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text bg-white text-primary border-end-0">
                                                <Hash size={20} />
                                            </span>
                                            <input
                                                type="text"
                                                name="code"
                                                className="form-control border-start-0 ps-0 fw-bold text-uppercase text-primary"
                                                placeholder="VD: KHAI-TRUONG, SALE50..."
                                                value={formData.code}
                                                onChange={handleChange}
                                                disabled={loading}
                                                required
                                                maxLength={50}
                                            />
                                        </div>
                                        <small className="text-muted mt-1 d-block">
                                            Mã sẽ tự động được viết hoa. Khách hàng sẽ nhập mã này để được giảm giá.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Giá trị giảm giá */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body">
                                            <label className="fw-bold text-dark mb-2">Loại giảm giá</label>
                                            <select
                                                className="form-select form-select-lg"
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleChange}
                                                disabled={loading}
                                            >
                                                <option value="FIXED_AMOUNT">Trừ tiền trực tiếp (VNĐ)</option>
                                                <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body">
                                            <label className="fw-bold text-dark mb-2">
                                                Giá trị giảm <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group input-group-lg">
                                                <span className="input-group-text bg-white text-muted border-end-0">
                                                    {formData.discountType === 'FIXED_AMOUNT'
                                                        ? <DollarSign size={18}/>
                                                        : <Percent size={18}/>
                                                    }
                                                </span>
                                                <input
                                                    type="number"
                                                    name="discountValue"
                                                    className="form-control border-start-0 ps-0"
                                                    placeholder={formData.discountType === 'FIXED_AMOUNT' ? "VD: 20000" : "VD: 10"}
                                                    value={formData.discountValue}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    min={formData.discountType === 'FIXED_AMOUNT' ? "1" : "0.01"}
                                                    step={formData.discountType === 'FIXED_AMOUNT' ? "1" : "0.01"}
                                                    max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                                                    required
                                                />
                                                <span className="input-group-text bg-light">
                                                    {formData.discountType === 'FIXED_AMOUNT' ? 'VNĐ' : '%'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Điều kiện & Giới hạn */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body">
                                            <label className="fw-bold text-dark mb-2">Đơn tối thiểu</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    name="minOrderValue"
                                                    className="form-control"
                                                    value={formData.minOrderValue}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    min="0"
                                                    step="1000"
                                                />
                                                <span className="input-group-text">VNĐ</span>
                                            </div>
                                            <small className="text-muted">Nhập 0 nếu áp dụng cho mọi đơn.</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body">
                                            <label className="fw-bold text-dark mb-2">Giới hạn số lượng</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    name="usageLimit"
                                                    className="form-control"
                                                    value={formData.usageLimit}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    min="1"
                                                    step="1"
                                                />
                                                <span className="input-group-text">Lượt</span>
                                            </div>
                                            <small className="text-muted">Tổng số mã được phát hành.</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Thời gian hiệu lực */}
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <label className="fw-bold text-dark mb-2">Ngày bắt đầu</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">
                                                    <Calendar size={18}/>
                                                </span>
                                                <input
                                                    type="date"
                                                    name="validFrom"
                                                    className="form-control"
                                                    value={formData.validFrom}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <label className="fw-bold text-dark mb-2">
                                                Ngày kết thúc <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">
                                                    <Calendar size={18}/>
                                                </span>
                                                <input
                                                    type="date"
                                                    name="validTo"
                                                    className="form-control"
                                                    value={formData.validTo}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    min={formData.validFrom}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-top-0 bg-light px-4 pb-4">
                        <div className="d-flex w-100 gap-3">
                            <button
                                type="submit"
                                form="couponForm"
                                className="btn btn-danger btn-lg flex-fill fw-bolder text-white rounded-3 shadow-sm"
                                disabled={loading}
                                style={{
                                    minWidth: '150px',
                                    backgroundColor: customStyles.primaryColor,
                                    borderColor: customStyles.primaryColor
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} className="me-2" />
                                        Tạo Mã Ngay
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-light btn-lg flex-fill fw-bolder border rounded-3 shadow-sm"
                                disabled={loading}
                                style={{ minWidth: '150px' }}
                            >
                                <X size={18} className="me-2" />
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCouponModal;