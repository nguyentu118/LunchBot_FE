import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Camera, Clock, Tag } from 'lucide-react';
import { AxiosError } from 'axios';
import axiosInstance from "../../config/axiosConfig.ts";
import useCategories from "../../features/category/useCategories.ts";
import toast from "react-hot-toast"; // <-- Sử dụng react-hot-toast

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
    // ...
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

    // --- BƯỚC 1: GET (Lấy thông tin cũ) ---
    useEffect(() => {
        const fetchDishData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<DishDetailResponse>(`/dishes/${id}`);
                const dishData = response.data;

                // Ánh xạ dữ liệu và chuyển về string cho input
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


    // --- BƯỚC 2: PUT (Gửi dữ liệu cập nhật) ---
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

        const dataToSend = {
            name: formData.name,
            merchantId: formData.merchantId,
            imagesUrls: formData.imagesUrls,
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
        <div className="dish-update-form p-3">

            {/* Hiển thị lỗi validation/API */}
            {error && <div className="alert alert-danger mb-4">❌ {error}</div>}

            <form onSubmit={handleSubmit} className="row g-4">

                {/* CỘT TRÁI (Tên, Ảnh, Mô tả, Tags, Đề cử) */}
                <div className="col-md-6 order-md-1 order-2">
                    {/* 1. Tên món ăn (*) */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Tên món ăn <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="name"
                               value={formData.name} onChange={handleChange} required disabled={generalLoading}
                               placeholder="Ví dụ: Phở bò tái" maxLength={255}
                        />
                    </div>

                    {/* 2. Tải ảnh lên (Placeholder UI) */}
                    <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center gap-1">
                            <Camera size={16}/> Tải ảnh lên <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex align-items-center gap-2">
                            <button type="button" className="btn btn-secondary d-flex align-items-center gap-1" disabled={generalLoading}>
                                Chọn tệp
                            </button>
                            <span className="text-muted small">
                                {formData.imagesUrls ? 'Đã có URL ảnh (JSON string)' : 'Chưa có tệp nào được chọn'}
                            </span>
                        </div>
                        <small className="text-muted mt-1 d-block">Chọn hoặc thay đổi ảnh món ăn chất lượng cao.</small>
                    </div>

                    {/* 3. Mô tả / Ghi chú */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Mô tả/Ghi chú</label>
                        <textarea className="form-control" name="description"
                                  value={formData.description} onChange={handleChange} rows={4} disabled={generalLoading}
                                  placeholder="Mô tả chi tiết món ăn (tùy chọn)"
                        />
                    </div>

                    {/* 4. Tag (Danh mục) (*) */}
                    <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center gap-1">
                            <Tag size={16}/> Tags / Danh mục <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                            {(isLoadingCategories || categoriesError) ? (
                                <div className="text-muted small">{categoriesError ? 'Lỗi tải danh mục' : 'Đang tải...'}</div>
                            ) : (
                                categories.map((cat: {id: number, name: string}) => (
                                    <div key={cat.id} className="form-check form-check-inline p-0">
                                        <input
                                            className="btn-check"
                                            type="checkbox"
                                            id={`cat-edit-${cat.id}`}
                                            checked={formData.categoryIds.has(cat.id)}
                                            onChange={() => handleCategoryToggle(cat.id)}
                                            disabled={generalLoading}
                                        />
                                        <label className="btn btn-sm" htmlFor={`cat-edit-${cat.id}`}
                                               style={{
                                                   backgroundColor: formData.categoryIds.has(cat.id) ? '#ff5e62' : '#f8f9fa',
                                                   color: formData.categoryIds.has(cat.id) ? 'white' : '#6c757d',
                                                   border: formData.categoryIds.has(cat.id) ? '1px solid #ff5e62' : '1px solid #ced4da'
                                               }}>
                                            {cat.name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 5. Đề cử */}
                    <div className="form-check pt-3">
                        <input className="form-check-input" type="checkbox" id="isRecommended" name="isRecommended"
                               checked={formData.isRecommended} onChange={handleChange} disabled={generalLoading}
                        />
                        <label className="form-check-label fw-bold" htmlFor="isRecommended">
                            Đề cử món ăn này (Hiển thị nổi bật)
                        </label>
                    </div>
                </div>

                {/* CỘT PHẢI (Giá tiền, Phí dịch vụ, Thời gian chuẩn bị) */}
                <div className="col-md-6 order-md-2 order-1">
                    {/* 6. Giá tiền (*) */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Giá tiền <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text">VND</span>
                            <input type="number" className="form-control" name="price"
                                   value={formData.price} onChange={handleChange} min="0" step="1000" required disabled={generalLoading}
                            />
                        </div>
                    </div>

                    {/* 7. Giá khuyến mãi */}
                    <div className="mb-4">
                        <label className="form-label">Giá khuyến mãi (VND)</label>
                        <div className="input-group">
                            <span className="input-group-text">VND</span>
                            <input type="number" className="form-control" name="discountPrice"
                                   value={formData.discountPrice} onChange={handleChange} min="0" step="1000" disabled={generalLoading}
                            />
                        </div>
                    </div>

                    {/* 8. Phí dịch vụ */}
                    <div className="mb-4">
                        <label className="form-label">Phí dịch vụ (VND)</label>
                        <div className="input-group">
                            <span className="input-group-text">VND</span>
                            <input type="number" className="form-control" name="serviceFee"
                                   value={formData.serviceFee} onChange={handleChange} min="0" step="100" disabled={generalLoading}
                            />
                        </div>
                    </div>

                    {/* 9. Thời gian chuẩn bị */}
                    <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center gap-1">
                            <Clock size={16}/> Thời gian chuẩn bị (phút)
                        </label>
                        <input type="number" className="form-control" name="preparationTime"
                               value={formData.preparationTime || ''} onChange={handleChange} min="0" disabled={generalLoading}
                               placeholder="Ví dụ: 20"
                        />
                    </div>

                </div>

                <div className="col-12 d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                    <button type="submit" className="btn btn-danger btn-lg text-white" disabled={generalLoading} style={{ minWidth: '150px' }}>
                        {generalLoading ? 'Đang cập nhật...' : 'Cập nhật Món ăn'}
                    </button>
                    <button type="button" className="btn btn-light btn-lg border" onClick={onCancel} disabled={generalLoading} style={{ minWidth: '150px' }}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DishUpdateForm;