import React, { useState, useEffect } from 'react';
import { Save, X, Ticket, Calendar, DollarSign, Percent, Hash } from 'lucide-react';
import { Coupon } from '../hooks/useCouponList';
import axiosInstance from '../../../config/axiosConfig';
import toast from 'react-hot-toast';

interface EditCouponModalProps {
    show: boolean;
    onHide: () => void;
    coupon: Coupon;
    onSuccess: () => void;
    customStyles?: { primaryColor?: string };
}

const EditCouponModal: React.FC<EditCouponModalProps> = ({
                                                             show,
                                                             onHide,
                                                             coupon,
                                                             onSuccess,
                                                             customStyles = { primaryColor: '#dc3545' }
                                                         }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Hàm phụ trợ để định dạng ngày chuẩn theo local time (tránh lệch ngày)
    const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = `0${d.getMonth() + 1}`.slice(-2);
        const day = `0${d.getDate()}`.slice(-2);
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'FIXED_AMOUNT',
        discountValue: '',
        usageLimit: '',
        minOrderValue: '',
        validFrom: '',
        validTo: '',
    });

    // Hàm fetch dữ liệu coupon từ server
    const fetchCouponData = async () => {
        setFetching(true);
        try {
            const response = await axiosInstance.get(`/coupons/${coupon.id}`);
            const data = response.data;

            setFormData({
                code: data.code,
                discountType: data.discountType,
                discountValue: data.discountValue.toString(),
                usageLimit: data.usageLimit.toString(),
                minOrderValue: data.minOrderValue.toString(),
                validFrom: formatDateForInput(data.validFrom),
                validTo: formatDateForInput(data.validTo),
            });
        } catch (err: any) {
            console.error('Lỗi khi tải dữ liệu:', err);

            // Nếu lỗi 403 hoặc không fetch được, fallback về dữ liệu từ props
            if (err.response?.status === 403) {
                console.warn('Không có quyền truy cập API GET, sử dụng dữ liệu từ props');
            }

            // Load dữ liệu từ props thay thế
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                usageLimit: coupon.usageLimit.toString(),
                minOrderValue: coupon.minOrderValue.toString(),
                validFrom: formatDateForInput(coupon.validFrom),
                validTo: formatDateForInput(coupon.validTo),
            });
        } finally {
            setFetching(false);
        }
    };

    // Load dữ liệu khi modal mở hoặc coupon thay đổi
    useEffect(() => {
        if (show && coupon?.id) {
            fetchCouponData();
        }
    }, [show, coupon.id, coupon.code, coupon.discountType, coupon.discountValue, coupon.usageLimit, coupon.minOrderValue, coupon.validFrom, coupon.validTo]);

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
        if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
            toast.error("Giá trị giảm phải lớn hơn 0!");
            return;
        }

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
                code: formData.code,
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                usageLimit: parseInt(formData.usageLimit),
                minOrderValue: parseFloat(formData.minOrderValue),
                validFrom: formData.validFrom,
                validTo: formData.validTo,
            };

            await axiosInstance.put(`/coupons/${coupon.id}`, payload);

            toast.success('Cập nhật thành công!');

            // Gọi onSuccess để refresh danh sách
            onSuccess();
            onHide();

            // Fetch lại dữ liệu mới nhất từ server
            await fetchCouponData();

        } catch (err: any) {
            console.error('Lỗi khi cập nhật:', err);

            let errorMessage = "Lỗi khi cập nhật mã giảm giá!";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMessage = err.message;
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
            onClick={onHide}
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
                            Sửa Mã Khuyến Mãi: {coupon.code}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onHide}
                            disabled={loading || fetching}
                            aria-label="Close"
                        />
                    </div>

                    <div className="modal-body p-4 bg-light">
                        {fetching ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} id="editCouponForm">
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <div className="form-group">
                                            <label className="fw-bold text-dark mb-2">
                                                Mã Coupon
                                            </label>
                                            <div className="input-group input-group-lg">
                                                <span className="input-group-text bg-white text-primary border-end-0">
                                                    <Hash size={20} />
                                                </span>
                                                <input
                                                    type="text"
                                                    name="code"
                                                    className="form-control border-start-0 ps-0 fw-bold text-uppercase text-primary"
                                                    value={formData.code}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                />
                                            </div>
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
                                <div className="row g-3 mb-4">
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
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-top-0 bg-light px-4 pb-4">
                        <div className="d-flex w-100 gap-3">
                            <button
                                type="submit"
                                form="editCouponForm"
                                className="btn btn-danger btn-lg flex-fill fw-bolder text-white rounded-3 shadow-sm"
                                disabled={loading || fetching}
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
                                        <Save size={18} className="me-2" />
                                        Lưu Thay Đổi
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onHide}
                                className="btn btn-light btn-lg flex-fill fw-bolder border rounded-3 shadow-sm"
                                disabled={loading || fetching}
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

export default EditCouponModal;