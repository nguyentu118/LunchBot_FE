import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Clock, Tag, X, Upload, Trash2, MapPin } from 'lucide-react';
import { AxiosError } from 'axios';
import axiosInstance from "../../config/axiosConfig.ts";
import useCategories from "../../features/category/useCategories.ts";
import toast from "react-hot-toast";

// ----------------------------------------------------------------------
// PROPS INTERFACE
// ----------------------------------------------------------------------
interface DishUpdateFormProps {
    dishId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

// ----------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------
interface DishFormData {
    name: string;
    merchantId: number;
    address: string; // ✅ THÊM TRƯỜNG ĐỊA CHỈ
    imagesUrls: string;
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
    merchantAddress: string;
}

const initialFormData: DishFormData = {
    name: '',
    merchantId: 0,
    address: '', // ✅ THÊM DEFAULT
    imagesUrls: '',
    preparationTime: 15,
    description: '',
    price: '0',
    discountPrice: '0',
    serviceFee: '0',
    categoryIds: new Set(),
    isRecommended: false
};

// ⚙️ CẤU HÌNH CLOUDINARY
const CLOUDINARY_CLOUD_NAME = 'dxoln0uq3';
const CLOUDINARY_UPLOAD_PRESET = 'lunchbot_dishes';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DishUpdateForm: React.FC<DishUpdateFormProps> = ({ dishId, onSuccess, onCancel }) => {
    const id = dishId;
    const { categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();

    const [formData, setFormData] = useState<DishFormData>(initialFormData);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // States for image handling
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // --- BƯỚC 1: GET (Lấy thông tin cũ) ---
    useEffect(() => {
        const fetchDishData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<DishDetailResponse>(`/dishes/info/${id}`);
                const dishData = response.data;

                // Xử lý Image URLs
                let initialUrls: string[] = [];
                if (dishData.imagesUrls) {
                    try {
                        initialUrls = JSON.parse(dishData.imagesUrls);
                        if (!Array.isArray(initialUrls)) initialUrls = [dishData.imagesUrls];
                    } catch {
                        initialUrls = [dishData.imagesUrls];
                    }
                }
                setExistingImageUrls(initialUrls);
                setPreviewUrls(initialUrls);

                setFormData({
                    name: dishData.name,
                    merchantId: dishData.merchant.id,
                    address: dishData.address || '', // ✅ LẤY ĐỊA CHỈ TỪ API
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

        return () => {
            newFiles.forEach(file => {
                const url = URL.createObjectURL(file);
                URL.revokeObjectURL(url);
            });
        };
    }, [id]);

    // Xử lý thay đổi input
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value
        }));
    };

    // Xử lý thay đổi Category IDs (Tags)
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

    // ✅ HÀM XỬ LÝ TẢI FILE MỚI - CÓ UPLOAD CLOUDINARY THẬT
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        // ✅ VALIDATE KÍCH THƯỚC
        const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            toast.error(`${oversizedFiles.length} ảnh vượt quá 10MB`);
            e.target.value = '';
            return;
        }

        // ✅ VALIDATE ĐỊNH DẠNG
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = fileArray.filter(file => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            toast.error('Chỉ chấp nhận JPG, PNG, GIF, WEBP');
            e.target.value = '';
            return;
        }

        // ✅ UPLOAD LÊN CLOUDINARY
        const uploadedUrls: string[] = [];
        setLoading(true);

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];

            try {
                const formDataUpload = new FormData();
                formDataUpload.append('file', file);
                formDataUpload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                console.log(`📤 Đang upload ${i + 1}/${fileArray.length}: ${file.name}`);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formDataUpload
                    }
                );

                const data = await response.json();

                if (data.secure_url) {
                    uploadedUrls.push(data.secure_url);
                    console.log(`✅ Upload thành công: ${data.secure_url}`);
                    toast.success(`Upload ${i + 1}/${fileArray.length}`, { duration: 1000 });
                } else {
                    console.error(`❌ Upload failed:`, data);
                    toast.error(`Lỗi upload: ${file.name}`);
                }

            } catch (error) {
                console.error('❌ Upload error:', error);
                toast.error(`Lỗi mạng: ${file.name}`);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setLoading(false);

        if (uploadedUrls.length > 0) {
            setExistingImageUrls(prev => [...prev, ...uploadedUrls]);
            setPreviewUrls(prev => [...prev, ...uploadedUrls]);
        }

        e.target.value = '';
    };

    // HÀM XÓA TỪNG ẢNH
    const handleRemoveSingleImage = (indexToRemove: number) => {
        setPreviewUrls(prevUrls => {
            const urlToRemove = prevUrls[indexToRemove];
            const updatedUrls = prevUrls.filter((_, index) => index !== indexToRemove);

            if (existingImageUrls.includes(urlToRemove)) {
                setExistingImageUrls(prevExisting => prevExisting.filter(url => url !== urlToRemove));
            }

            return updatedUrls;
        });
    };

    // HÀM XÓA TẤT CẢ ẢNH
    const handleRemoveAllImages = () => {
        setExistingImageUrls([]);
        setNewFiles([]);
        setPreviewUrls([]);

        const fileInput = document.getElementById('dish-images-upload-update') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // --- BƯỚC 2: PUT (Gửi dữ liệu cập nhật) ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // ✅ VALIDATION ĐẦY ĐỦ THEO MÔ TẢ
        const errors: string[] = [];

        if (!formData.name.trim()) {
            errors.push("Tên món ăn");
        }

        if (!formData.address.trim()) {
            errors.push("Địa chỉ");
        }

        if (previewUrls.length === 0) {
            errors.push("Ảnh món ăn");
        }

        if (!formData.price.trim()) {
            errors.push("Giá tiền");
        }

        if (!formData.discountPrice.trim()) {
            errors.push("Giá khuyến mãi");
        }

        if (formData.categoryIds.size === 0) {
            errors.push("Danh mục (Tag)");
        }

        if (errors.length > 0) {
            toast.error(`Vui lòng điền đầy đủ: ${errors.join(', ')}`, {
                duration: 4000
            });
            setLoading(false);
            return;
        }

        // Chuẩn bị dữ liệu gửi đi
        const dataToSend = {
            name: formData.name,
            merchantId: formData.merchantId,
            address: formData.address, // ✅ GỬI ĐỊA CHỈ
            imagesUrls: JSON.stringify(existingImageUrls),
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
            toast.success("Cập nhật thành công!")
            onSuccess();

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

    if (generalLoading && !error && !formData.name) {
        return <div className="loading text-center p-5">Đang tải thông tin món ăn...</div>;
    }

    if (error && !formData.name) {
        return <div className="error alert alert-danger p-3">Lỗi tải dữ liệu: {error}</div>;
    }

    return (
        <div className="p-5" style={{
            width: "95%",
            maxWidth: "1400px",
            margin: "0 auto"
        }}>
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="row g-5">
                {/* HÀNG 1: THÔNG TIN CƠ BẢN VÀ GIÁ (2 CỘT) */}

                {/* Cột Trái: THÔNG TIN CƠ BẢN */}
                <div className="col-lg-6 d-flex flex-column gap-3">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Thông tin cơ bản</h5>

                    {/* ✅ TÊN MÓN ĂN (*) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">
                            Tên món ăn <span className="text-danger">*</span>
                        </label>
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

                    {/* ✅ ĐỊA CHỈ (*) - TRƯỜNG MỚI */}
                    <div className="mb-2">
                        <label className="form-label fw-bold d-flex align-items-center">
                            <MapPin size={16} className="me-1" /> Địa Chỉ <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            disabled={generalLoading}
                            placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                        />
                    </div>

                    {/* ✅ GHI CHÚ (MÔ TẢ) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">Ghi chú (Mô tả)</label>
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

                    {/* ✅ THỜI GIAN CHUẨN BỊ */}
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

                    {/* ✅ GIÁ TIỀN (*) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">
                            Giá Tiền (VND) <span className="text-danger">*</span>
                        </label>
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

                    {/* ✅ GIÁ KHUYẾN MÃI (*) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">
                            Giá Khuyến Mãi (VND) <span className="text-danger">*</span>
                        </label>
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
                                required
                                disabled={generalLoading}
                                placeholder="45000 (Nếu không KM thì điền = Giá tiền)"
                            />
                        </div>
                    </div>

                    {/* ✅ PHÍ DỊCH VỤ (MẶC ĐỊNH 0) */}
                    <div className="mb-2">
                        <label className="form-label fw-bold">Phí Dịch Vụ (%) - Mặc định: 0</label>
                        <div className="input-group">
                            <span className="input-group-text">%</span>
                            <input
                                type="number"
                                className="form-control"
                                name="serviceFee"
                                value={formData.serviceFee}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.1"
                                disabled={generalLoading}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* ✅ ĐỀ CỬ */}
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
                            ⭐ Đề cử món ăn này (Hiển thị ưu tiên trong tìm kiếm)
                        </label>
                    </div>
                </div>

                {/* HÀNG 2: ẢNH VÀ DANH MỤC (FULL WIDTH) */}

                {/* ✅ ẢNH MÓN ĂN (*) */}
                <div className="col-12 mt-4">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">
                        Ảnh Món Ăn <span className="text-danger">*</span>
                    </h5>

                    {previewUrls.length > 0 ? (
                        <div className="d-flex flex-column gap-3 p-3 border rounded-3 bg-light">
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
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        <button
                                            type="button"
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
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleRemoveSingleImage(index)}
                                            disabled={generalLoading}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <input
                                    type="file"
                                    id="dish-images-upload-update"
                                    multiple
                                    className="d-none"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    disabled={generalLoading}
                                />
                                <label
                                    htmlFor="dish-images-upload-update"
                                    className="fw-bold d-flex align-items-center gap-1 text-danger text-decoration-none"
                                    style={{
                                        cursor: generalLoading ? 'not-allowed' : 'pointer',
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

                {/* ✅ TAG (DANH MỤC) (*) */}
                <div className="col-12 mt-4">
                    <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">
                        Tag (Danh Mục) <span className="text-danger">*</span>
                    </h5>

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
                                                isSelected ? 'text-white' : 'btn-outline-secondary'
                                            }`}
                                            style={{
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
                    <small className="text-muted mt-2 d-block">
                        💡 Có thể chọn nhiều danh mục cho 1 món ăn
                    </small>
                </div>

                {/* Footer */}
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
                            Đóng
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DishUpdateForm;