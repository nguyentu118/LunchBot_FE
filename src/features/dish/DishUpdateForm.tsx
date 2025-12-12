import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Clock, Tag, X, Upload, Trash2 } from 'lucide-react';
import { AxiosError } from 'axios';
import axiosInstance from "../../config/axiosConfig.ts";
import useCategories from "../../features/category/useCategories.ts";
import toast from "react-hot-toast";

// ----------------------------------------------------------------------
// 💡 PROPS INTERFACE (Dùng trong Modal)
// ----------------------------------------------------------------------
interface DishUpdateFormProps {
    dishId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

// ----------------------------------------------------------------------
// 💡 TYPE DEFINITIONS
// ----------------------------------------------------------------------
interface DishFormData {
    name: string;
    merchantId: number;
    imagesUrls: string; // Vẫn là string cho data to send
    preparationTime: number | undefined;
    description: string;
    price: string;
    discountPrice: string;
    serviceFee: string;
    categoryIds: Set<number>;
    isRecommended: boolean;
}

interface CategoryResponse { id: number; name: string; }
interface DishDetailResponse extends Omit<DishFormData, 'categoryIds' | 'price' | 'discountPrice' | 'serviceFee' | 'preparationTime'> {
    id: number;
    merchant: { id: number; name: string; };
    price: number;
    discountPrice: number;
    serviceFee: number;
    preparationTime: number;
    categories: CategoryResponse[];
}

const initialFormData: DishFormData = {
    name: '',
    merchantId: 0,
    imagesUrls: '',
    preparationTime: 15,
    description: '',
    price: '0',
    discountPrice: '0',
    serviceFee: '0',
    categoryIds: new Set(),
    isRecommended: false
};


const DishUpdateForm: React.FC<DishUpdateFormProps> = ({ dishId, onSuccess, onCancel }) => {
    const id = dishId;
    const { categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();

    const [formData, setFormData] = useState<DishFormData>(initialFormData);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // NEW STATES for image handling
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // URLs from API (string[])
    const [newFiles, setNewFiles] = useState<File[]>([]); // Newly uploaded files (File[])
    const [previewUrls, setPreviewUrls] = useState<string[]>([]); // All URLs (existing + new file previews)

    // --- BƯỚC 1: GET (Lấy thông tin cũ) ---
    useEffect(() => {
        const fetchDishData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<DishDetailResponse>(`/dishes/${id}`);
                const dishData = response.data;

                // Xử lý Image URLs
                let initialUrls: string[] = [];
                if (dishData.imagesUrls) {
                    try {
                        // Giả định imagesUrls là một chuỗi JSON của mảng URLs
                        initialUrls = JSON.parse(dishData.imagesUrls);
                        if (!Array.isArray(initialUrls)) initialUrls = [dishData.imagesUrls]; // Fallback cho URL đơn
                    } catch {
                        initialUrls = [dishData.imagesUrls]; // Xử lý nếu không phải JSON
                    }
                }
                setExistingImageUrls(initialUrls);
                setPreviewUrls(initialUrls); // Thiết lập URL xem trước ban đầu

                setFormData({
                    name: dishData.name,
                    merchantId: dishData.merchant.id,
                    imagesUrls: dishData.imagesUrls || '',
                    preparationTime: dishData.preparationTime,
                    description: dishData.description || '',
                    price: dishData.price.toFixed(0),
                    discountPrice: dishData.discountPrice?.toFixed(0) || '0',
                    serviceFee: dishData.serviceFee?.toFixed(0) || '0',
                    categoryIds: new Set(dishData.categories.map(cat => cat.id)),
                    isRecommended: dishData.isRecommended
                });

                toast.success('Đã tải thông tin món ăn thành công!', { duration: 1500 });

            } catch (err) {
                const axiosError = err as AxiosError;
                const message = (axiosError.response?.data as string) || (axiosError.response?.statusText) || axiosError.message;
                console.error("Lỗi khi tải thông tin món ăn:", message);
                setError(`Không thể tải thông tin món ăn. Lỗi: ${message}`);
                toast.error('Lỗi tải dữ liệu món ăn.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDishData();
        }

        // Cleanup: Revoke Object URLs khi component unmount
        // Lỗi logic cleanup: cần revoke URL của newFiles hiện tại.
        return () => {
            // Chỉ revoke URLs của các file mới đã được tạo trong phiên hiện tại
            newFiles.forEach(file => {
                const url = URL.createObjectURL(file); // Tái tạo URL để revoke
                URL.revokeObjectURL(url);
            });
        };
    }, [id]);


    // Xử lý thay đổi input (GIỮ NGUYÊN)
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value
        }));
    };

    // Xử lý thay đổi Category IDs (Tags) (GIỮ NGUYÊN)
    const handleCategoryToggle = (categoryId: number) => {
        setFormData(prevData => {
            const newCategoryIds = new Set(prevData.categoryIds);
            if (newCategoryIds.has(categoryId)) {
                newCategoryIds.delete(categoryId);
            } else {
                newCategoryIds.add(categoryId);
            }
            return { ...prevData, categoryIds: newCategoryIds };
        });
    };

    // HÀM XỬ LÝ TẢI LÊN FILE MỚI (GIỮ NGUYÊN)
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setNewFiles(prev => [...prev, ...fileArray]); // Thêm files mới

            const newUrls: string[] = fileArray.map(file => URL.createObjectURL(file));

            setPreviewUrls(prev => [...prev, ...newUrls]); // Thêm previews mới

            // Đặt lại giá trị input để có thể chọn lại file sau
            e.target.value = '';
        }
    };

    // HÀM XÓA TỪNG ẢNH (GIỮ NGUYÊN)
    const handleRemoveSingleImage = (indexToRemove: number) => {
        setPreviewUrls(prevUrls => {
            const urlToRemove = prevUrls[indexToRemove];
            const updatedUrls = prevUrls.filter((_, index) => index !== indexToRemove);

            // 1. Kiểm tra xem đó là ảnh cũ (URL từ API)
            if (existingImageUrls.includes(urlToRemove)) {
                // Là ảnh cũ -> Xóa khỏi danh sách existing
                setExistingImageUrls(prevExisting => prevExisting.filter(url => url !== urlToRemove));
            } else {
                // Là ảnh mới (Object URL) -> Xóa khỏi danh sách newFiles và revoke Object URL
                setNewFiles(prevNewFiles => {
                    const updatedNewFiles = prevNewFiles.filter(file => URL.createObjectURL(file) !== urlToRemove);
                    // Revoke Object URL để giải phóng bộ nhớ (Chỉ revoke cái đang bị xóa)
                    URL.revokeObjectURL(urlToRemove);
                    return updatedNewFiles;
                });
            }

            return updatedUrls;
        });
    };

    // HÀM XÓA TẤT CẢ ẢNH (GIỮ NGUYÊN)
    const handleRemoveAllImages = () => {
        // Revoke tất cả Object URLs của files mới
        newFiles.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));

        setExistingImageUrls([]);
        setNewFiles([]);
        setPreviewUrls([]);

        const fileInput = document.getElementById('dish-images-upload-update') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };


    // --- BƯỚC 2: PUT (Gửi dữ liệu cập nhật) --- (GIỮ NGUYÊN)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.name || !formData.price || formData.categoryIds.size === 0) {
            setError("Vui lòng điền đủ các trường bắt buộc (*).");
            setLoading(false);
            toast.error("Vui lòng điền đủ Tên, Giá và Tags.");
            return;
        }

        // Xử lý URL ảnh: Mock quá trình upload các file mới (newFiles)
        let finalImageUrls = existingImageUrls; // Ảnh cũ còn lại

        if (newFiles.length > 0) {
            // MOCK UPLOAD: Tạo mock URLs cho các file mới (GIẢ LẬP)
            const mockNewUrls = newFiles.map((_, index) => `mock-uploaded-url-${Date.now()}-${index}`);
            finalImageUrls = [...finalImageUrls, ...mockNewUrls];

            // Sau khi "upload" xong, ta giải phóng Object URLs của files mới
            // LƯU Ý: Việc này có thể cần được xử lý cẩn thận hơn trong môi trường thực tế
            // newFiles.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file))); // Comment dòng này để tránh bug double revoke
        }

        if (finalImageUrls.length === 0) {
            setError("Món ăn phải có ít nhất một ảnh.");
            setLoading(false);
            toast.error("Món ăn phải có ít nhất một ảnh.");
            return;
        }

        const dataToSend = {
            name: formData.name,
            merchantId: formData.merchantId,
            // Chuyển mảng URL cuối cùng thành chuỗi JSON
            imagesUrls: JSON.stringify(finalImageUrls),
            preparationTime: formData.preparationTime || 0,
            description: formData.description,
            price: parseFloat(formData.price),
            discountPrice: parseFloat(formData.discountPrice || '0'),
            serviceFee: parseFloat(formData.serviceFee || '0'),
            categoryIds: Array.from(formData.categoryIds),
            isRecommended: formData.isRecommended
        };

        try {
            await axiosInstance.put(`/dishes/${id}`, dataToSend);
            toast.success('Cập nhật món ăn thành công!');

            setTimeout(() => {
                onSuccess();
            }, 500);

        } catch (err) {
            const axiosError = err as AxiosError;
            const message = (axiosError.response?.data as any)?.message || (axiosError.response?.data as string) || "Lỗi hệ thống.";

            console.error("Lỗi khi cập nhật:", message);
            setError(`Cập nhật thất bại: ${message}`);
            toast.error(`Cập nhật thất bại: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    const generalLoading = loading || isLoadingCategories;

    if (generalLoading && !error && !formData.name) return <div className="loading text-center p-5">Đang tải thông tin món ăn...</div>;
    if (error && !formData.name) return <div className="error alert alert-danger p-3">Lỗi tải dữ liệu: {error}</div>;

    return (
        <div className="p-5" style={{
            width: "95%",
            maxWidth: "1400px",
            margin: "0 auto"
        }}>

            {/* Hiển thị lỗi validation/API */}
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {/* BỐ CỤC THEO MẪU 2 CỘT/FULL-WIDTH */}
            <form onSubmit={handleSubmit} className="row g-5">

                {/* HÀNG 1: THÔNG TIN CƠ BẢN VÀ GIÁ (CHIA 2 CỘT) */}

                {/* Cột Trái: THÔNG TIN CƠ BẢN */}
                <div className="col-lg-6 d-flex flex-column gap-3">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Thông tin cơ bản</h5>

                    {/* 1. Tên món ăn (*) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">Tên món ăn <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={generalLoading}
                            placeholder="VD: Phở bò tái"
                            maxLength={255}
                        />
                    </div>

                    {/* 2. Mô tả / Ghi chú */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">Mô tả/Ghi chú</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            disabled={generalLoading}
                            placeholder="Mô tả chi tiết món ăn (tùy chọn)"
                        />
                    </div>

                    {/* 3. Thời gian chuẩn bị */}
                    <div className="mb-2">
                        <label className="form-label fw-bold d-flex align-items-center gap-1">
                            <Clock size={16}/> Thời gian chuẩn bị (phút)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            name="preparationTime"
                            value={formData.preparationTime || ''}
                            onChange={handleChange}
                            min="0"
                            disabled={generalLoading}
                            placeholder="VD: 15"
                        />
                    </div>
                </div>

                {/* Cột Phải: GIÁ & CHI PHÍ */}
                <div className="col-lg-6 d-flex flex-column gap-3">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Giá & Chi phí</h5>

                    {/* 4. Giá tiền (*) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">Giá bán <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text">VND</span>
                            <input
                                type="number"
                                className="form-control"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="1000"
                                required
                                disabled={generalLoading}
                                placeholder="50000"
                            />
                        </div>
                    </div>

                    {/* 5. Giá khuyến mãi */}
                    <div className="mb-2">
                        <label className="form-label">Giá khuyến mãi (VND)</label>
                        <div className="input-group">
                            <span className="input-group-text">VND</span>
                            <input
                                type="number"
                                className="form-control"
                                name="discountPrice"
                                value={formData.discountPrice}
                                onChange={handleChange}
                                min="0"
                                step="1000"
                                disabled={generalLoading}
                                placeholder="Giá sau giảm (nếu có)"
                            />
                        </div>
                    </div>

                    {/* 6. Phí dịch vụ */}
                    <div className="mb-2">
                        <label className="form-label">Phí dịch vụ (VND)</label>
                        <div className="input-group">
                            <span className="input-group-text">VND</span>
                            <input
                                type="number"
                                className="form-control"
                                name="serviceFee"
                                value={formData.serviceFee}
                                onChange={handleChange}
                                min="0"
                                step="100"
                                disabled={generalLoading}
                                placeholder="5"
                            />
                        </div>
                    </div>

                    {/* 7. Đề cử */}
                    <div className="form-check form-switch pt-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="isRecommended"
                            name="isRecommended"
                            checked={formData.isRecommended}
                            onChange={handleChange}
                            disabled={generalLoading}
                        />
                        <label className="form-check-label fw-bold text-primary" htmlFor="isRecommended">
                            ⭐ Đề cử món ăn này (Hiển thị nổi bật)
                        </label>
                    </div>
                </div>

                {/* HÀNG 2: ẢNH VÀ DANH MỤC (FULL WIDTH BLOCKS) */}

                {/* 8. Tải ảnh lên (FULL WIDTH) */}
                <div className="col-12 mt-4">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Ảnh Món Ăn <span className="text-danger">*</span></h5>

                    {/* UI TẢI ẢNH: Đã tối ưu cho cả trường hợp có và không có ảnh */}
                    {previewUrls.length > 0 ? (
                        <div
                            className="d-flex flex-column gap-3 p-3 border rounded-3 bg-light"
                            style={{ position: 'relative' }}>

                            {/* Khối chứa các ảnh có cuộn */}
                            <div className="d-flex flex-wrap gap-3 overflow-auto p-2" style={{ maxHeight: '300px' }}>
                                {previewUrls.map((url, index) => (
                                    <div key={index}
                                         style={{
                                             position: 'relative',
                                             width: '100px',
                                             height: '100px',
                                             borderRadius: '6px',
                                             overflow: 'hidden',
                                             boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                         }}>
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="img-fluid"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {/* Nút XÓA TỪNG ẢNH */}
                                        <button
                                            type="button"
                                            className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                            style={{
                                                position: 'absolute',
                                                top: '0px',
                                                right: '0px',
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                                color: 'white',
                                                borderRadius: '0 6px 0 6px',
                                                border: 'none',
                                                zIndex: 10,
                                            }}
                                            onClick={() => handleRemoveSingleImage(index)}
                                            disabled={generalLoading}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Nút Tải thêm ảnh & Xóa tất cả */}
                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <input
                                    type="file"
                                    id="dish-images-upload-update"
                                    multiple
                                    className="d-none" // Ẩn input gốc
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    disabled={generalLoading}
                                />
                                <label
                                    htmlFor="dish-images-upload-update"
                                    // Đã cập nhật: Xóa các class btn/outline và thêm text-danger/text-decoration-none
                                    className="fw-bold d-flex align-items-center gap-1 text-danger text-decoration-none"
                                    style={{
                                        cursor: generalLoading ? 'not-allowed' : 'pointer',
                                        // Thêm style để loại bỏ khung bao quanh/outline
                                        outline: 'none',
                                        boxShadow: 'none',
                                        border: 'none',
                                        background: 'none',
                                        padding: '0'
                                    }}
                                >
                                    <Upload size={16} /> Tải thêm ảnh
                                </label>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-bold"
                                    onClick={handleRemoveAllImages}
                                    disabled={generalLoading}
                                >
                                    <Trash2 size={16} /> Xóa tất cả {previewUrls.length} ảnh
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Khối khi chưa có ảnh nào (giống như ảnh bạn gửi)
                        <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                            <input
                                type="file"
                                id="dish-images-upload-update"
                                name="imagesFiles"
                                multiple
                                className="form-control"
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={generalLoading}
                            />
                            <label className="input-group-text btn btn-outline-secondary fw-bold" htmlFor="dish-images-upload-update">
                                <Upload size={18} className="me-2" /> Chọn File
                            </label>
                        </div>
                    )}
                </div>

                {/* 9. Tag (Danh mục) (FULL WIDTH) */}
                <div className="col-12 mt-4">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Danh Mục <span className="text-danger">*</span></h5>

                    <div className="p-3 border rounded-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {(isLoadingCategories || categoriesError) ? (
                            <div className="text-muted small">{categoriesError ? 'Lỗi tải danh mục' : 'Đang tải...'}</div>
                        ) : (
                            <div className="d-flex flex-wrap gap-2">
                                {categories.map((cat: {id: number, name: string}) => {
                                    const isSelected = formData.categoryIds.has(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`btn btn-sm fw-bold rounded-pill shadow-sm d-flex align-items-center ${
                                                isSelected
                                                    ? 'text-white'
                                                    : 'btn-outline-secondary'
                                            }`}
                                            style={{
                                                // Dùng màu danger #dc3545 cho tag được chọn
                                                backgroundColor: isSelected ? '#dc3545' : 'transparent',
                                                borderColor: isSelected ? '#dc3545' : '',
                                                transition: 'background-color 0.2s',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleCategoryToggle(cat.id)}
                                            disabled={generalLoading}
                                        >
                                            <Tag size={14} className="me-1" />
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer với nút full width */}
                <div className="col-12 mt-4 pt-3 border-top">
                    <div className="d-flex gap-3 w-100">
                        <button
                            type="submit"
                            className="btn btn-danger btn-lg text-white flex-fill fw-bold shadow-sm"
                            disabled={generalLoading}
                        >
                            {generalLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Đang cập nhật...
                                </>
                            ) : 'Cập nhật Món Ăn'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-light btn-lg border flex-fill fw-bold shadow-sm"
                            onClick={onCancel}
                            disabled={generalLoading}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DishUpdateForm;