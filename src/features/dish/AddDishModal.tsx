import React, { useState } from 'react';
import { Plus, Tag, Clock, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

// --- ĐỊNH NGHĨA TYPESCRIPT INTERFACE ---

interface DishCreateRequestState {
    name: string;
    merchantId: number;
    imagesFiles: FileList | null;
    preparationTime: number | undefined;
    description: string;
    price: string;
    discountPrice: string;
    serviceFee: string;
    categoryIds: Set<number>;
    isRecommended: boolean;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type FileChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface AddDishModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: Omit<DishCreateRequestState, 'imagesFiles'> & { uploadedUrls: string[] }) => Promise<void>;
    newDishData: DishCreateRequestState;
    handleNewDishChange: (e: InputChangeEvent | FileChangeEvent) => void;
    handleCategoryToggle: (categoryId: number) => void;
    customStyles: { primaryPink: string; primaryColor: string; };
    MOCK_CATEGORIES: { id: number; name: string }[];
}

const AddDishModal: React.FC<AddDishModalProps> = ({
                                                       show,
                                                       onClose,
                                                       onSave,
                                                       newDishData,
                                                       handleNewDishChange,
                                                       handleCategoryToggle,
                                                       MOCK_CATEGORIES
                                                   }) => {

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    if (!show) {
        return null;
    }

    const selectedFiles = newDishData.imagesFiles ? Array.from(newDishData.imagesFiles) : [];

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'lunchbot_dishes');
        formData.append('cloud_name', 'dxoln0uq3');
        formData.append('quality', 'auto:best');
        formData.append('fetch_format', 'auto');
        formData.append('folder', 'lunchbot/dishes');

        try {
            const response = await fetch(
                'https://api.cloudinary.com/v1_1/dxoln0uq3/image/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.secure_url;

        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
        }
    };

    const handleSaveClick = async () => {
        if (loading) return;

        if (!newDishData.name || !newDishData.price || newDishData.categoryIds.size === 0) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc (Tên, Giá, Tag).');
            return;
        }

        if (!newDishData.imagesFiles || newDishData.imagesFiles.length === 0) {
            toast.error('Vui lòng chọn ít nhất một file ảnh.');
            return;
        }

        setLoading(true);

        try {
            setUploadProgress('Đang tải ảnh lên...');
            const uploadPromises = selectedFiles.map((file, index) => {
                setUploadProgress(`Đang tải ảnh ${index + 1}/${selectedFiles.length}...`);
                return uploadToCloudinary(file);
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setUploadProgress('Upload hoàn tất!');

            const dataToSave = {
                name: newDishData.name,
                merchantId: newDishData.merchantId,
                preparationTime: newDishData.preparationTime,
                description: newDishData.description,
                price: newDishData.price,
                discountPrice: newDishData.discountPrice,
                serviceFee: newDishData.serviceFee,
                categoryIds: newDishData.categoryIds,
                isRecommended: newDishData.isRecommended,
                uploadedUrls: uploadedUrls
            };

            await onSave(dataToSave);
            onClose();

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tải ảnh.');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    }

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Thêm món ăn mới</h5>
                        <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
                    </div>
                    <div className="modal-body pt-3">
                        {uploadProgress && (
                            <div className="alert alert-info d-flex align-items-center mb-3">
                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                <span>{uploadProgress}</span>
                            </div>
                        )}

                        <form className="row g-4" onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                            {/* Cột 1: Thông tin cơ bản */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tên món ăn <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newDishData.name}
                                        onChange={handleNewDishChange}
                                        className="form-control"
                                        placeholder="Ví dụ: Phở bò tái"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold d-flex align-items-center gap-1">
                                        <Upload size={16}/> Tải ảnh lên <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        name="imagesFiles"
                                        onChange={handleNewDishChange}
                                        className="form-control"
                                        accept="image/*"
                                        multiple
                                        required={selectedFiles.length === 0}
                                        disabled={loading}
                                    />
                                    {selectedFiles.length > 0 && (
                                        <small className="text-success d-block mt-2">
                                            ✓ Đã chọn {selectedFiles.length} file
                                        </small>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Mô tả/Ghi chú</label>
                                    <textarea
                                        name="description"
                                        value={newDishData.description}
                                        onChange={handleNewDishChange}
                                        className="form-control"
                                        rows={4}
                                        placeholder="Mô tả chi tiết món ăn (tùy chọn)"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Cột 2: Giá & Thuộc tính */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Giá tiền <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text">VND</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newDishData.price}
                                            onChange={handleNewDishChange}
                                            className="form-control"
                                            min="0"
                                            step="1000"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Giá khuyến mãi (VND)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">VND</span>
                                        <input
                                            type="number"
                                            name="discountPrice"
                                            value={newDishData.discountPrice}
                                            onChange={handleNewDishChange}
                                            className="form-control"
                                            min="0"
                                            step="1000"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Phí dịch vụ (VND)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">VND</span>
                                        <input
                                            type="number"
                                            name="serviceFee"
                                            value={newDishData.serviceFee}
                                            onChange={handleNewDishChange}
                                            className="form-control"
                                            min="0"
                                            step="100"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold d-flex align-items-center gap-1">
                                        <Clock size={16}/> Thời gian chuẩn bị (phút)
                                    </label>
                                    <input
                                        type="number"
                                        name="preparationTime"
                                        value={newDishData.preparationTime === undefined ? '' : newDishData.preparationTime}
                                        onChange={handleNewDishChange}
                                        className="form-control"
                                        min="0"
                                        placeholder="Ví dụ: 20"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Tags và Đề cử */}
                            <div className="col-12">
                                <label className="form-label fw-bold d-flex align-items-center gap-1">
                                    <Tag size={16}/> Tags / Danh mục <span className="text-danger">*</span>
                                </label>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {MOCK_CATEGORIES.map(category => {
                                        const isSelected = newDishData.categoryIds.has(category.id);
                                        return (
                                            <div key={category.id} className="form-check form-check-inline p-0">
                                                <input
                                                    className="btn-check"
                                                    type="checkbox"
                                                    id={`cat-add-${category.id}`}
                                                    checked={isSelected}
                                                    onChange={() => handleCategoryToggle(category.id)}
                                                    disabled={loading}
                                                />
                                                <label
                                                    className="btn btn-sm"
                                                    htmlFor={`cat-add-${category.id}`}
                                                    style={{
                                                        backgroundColor: isSelected ? '#ff5e62' : '#f8f9fa',
                                                        color: isSelected ? 'white' : '#6c757d',
                                                        border: isSelected ? '1px solid #ff5e62' : '1px solid #ced4da'
                                                    }}
                                                >
                                                    {category.name}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="isRecommended"
                                        checked={newDishData.isRecommended}
                                        onChange={handleNewDishChange}
                                        id="isRecommendedCheck"
                                        disabled={loading}
                                    />
                                    <label className="form-check-label fw-bold" htmlFor="isRecommendedCheck">
                                        Đề cử món ăn này (Hiển thị nổi bật)
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer với nút căn đều */}
                    <div className="modal-footer border-0 pt-0">
                        <div className="d-flex gap-3 w-100">
                            <button
                                type="button"
                                onClick={handleSaveClick}
                                className="btn btn-danger btn-lg flex-fill fw-bold text-white"
                                disabled={loading}
                                style={{ minWidth: '150px' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} className="me-2" />
                                        Thêm món
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-light btn-lg flex-fill fw-bold border"
                                disabled={loading}
                                style={{ minWidth: '150px' }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDishModal;