import React, { useState } from 'react';
import { Plus, Tag, Clock, DollarSign, Percent, Upload } from 'lucide-react';
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
                                                       customStyles,
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

        // ✅ THÊM CÁC TRANSFORMATION ĐỂ GIỮ CHẤT LƯỢNG ẢNH
        formData.append('quality', 'auto:best'); // Tự động chọn quality tốt nhất
        formData.append('fetch_format', 'auto'); // Tự động chọn format tốt nhất (WebP, AVIF...)
        formData.append('folder', 'lunchbot/dishes'); // Tổ chức thư mục

        // Giữ kích thước gốc hoặc resize hợp lý
        // formData.append('transformation', 'w_1920,h_1920,c_limit'); // Giới hạn max 1920px

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

            // ✅ TẠO URL VỚI TRANSFORMATION TỐT HƠN
            // Thay vì dùng secure_url trực tiếp, ta tạo URL với parameters chất lượng cao
            const baseUrl = data.secure_url;

            // Option 1: Dùng URL gốc (chất lượng tốt nhất)
            return baseUrl;

            // Option 2: Hoặc customize URL với transformation
            // const publicId = data.public_id;
            // return `https://res.cloudinary.com/dxoln0uq3/image/upload/q_auto:best,f_auto/${publicId}`;

        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
        }
    };

    const handleSaveClick = async () => {
        if (loading) return;

        // Validation cơ bản
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
            // ✅ UPLOAD THẬT TẤT CẢ ẢNH
            setUploadProgress('Đang tải ảnh lên...');
            const uploadPromises = selectedFiles.map((file, index) => {
                setUploadProgress(`Đang tải ảnh ${index + 1}/${selectedFiles.length}...`);
                return uploadToCloudinary(file);
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setUploadProgress('Upload hoàn tất!');

            console.log('✅ Uploaded URLs:', uploadedUrls);

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
                uploadedUrls: uploadedUrls // ✅ URL thật từ Cloudinary
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
                    <div className="modal-body pt-0">
                        {/* HIỂN THỊ PROGRESS KHI UPLOAD */}
                        {uploadProgress && (
                            <div className="alert alert-info d-flex align-items-center mb-3">
                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                <span>{uploadProgress}</span>
                            </div>
                        )}

                        <form className="row g-3" onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                            {/* Cột 1: Thông tin cơ bản */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label small fw-medium text-muted">Tên món ăn <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newDishData.name}
                                        onChange={handleNewDishChange}
                                        className="form-control rounded-3"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* TRƯỜNG UPLOAD FILE */}
                                <div className="mb-3">
                                    <label className="form-label small fw-medium text-muted">Tải ảnh lên <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <input
                                            type="file"
                                            name="imagesFiles"
                                            onChange={handleNewDishChange}
                                            className="form-control rounded-3"
                                            accept="image/*"
                                            multiple
                                            required={selectedFiles.length === 0}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mt-2 small text-muted">
                                        {selectedFiles.length > 0 ? (
                                            <p className="mb-0 fw-medium text-success">
                                                <Upload size={14} className="me-1"/> Đã chọn {selectedFiles.length} file.
                                            </p>
                                        ) : (
                                            <p className="mb-0">Chọn một hoặc nhiều ảnh món ăn chất lượng cao.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-medium text-muted">Mô tả/Ghi chú</label>
                                    <textarea
                                        name="description"
                                        value={newDishData.description}
                                        onChange={handleNewDishChange}
                                        className="form-control rounded-3"
                                        rows={3}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Cột 2: Giá & Thuộc tính */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label small fw-medium text-muted">Giá tiền (VNĐ) <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text"><DollarSign size={16} /></span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newDishData.price}
                                            onChange={handleNewDishChange}
                                            className="form-control rounded-3"
                                            min="0"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium text-muted">Giá khuyến mãi (VNĐ)</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><DollarSign size={16} /></span>
                                        <input
                                            type="number"
                                            name="discountPrice"
                                            value={newDishData.discountPrice}
                                            onChange={handleNewDishChange}
                                            className="form-control rounded-3"
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium text-muted">Phí dịch vụ (VNĐ)</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><Percent size={16} /></span>
                                        <input
                                            type="number"
                                            name="serviceFee"
                                            value={newDishData.serviceFee}
                                            onChange={handleNewDishChange}
                                            className="form-control rounded-3"
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-medium text-muted">Thời gian chuẩn bị (phút)</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><Clock size={16} /></span>
                                        <input
                                            type="number"
                                            name="preparationTime"
                                            value={newDishData.preparationTime === undefined ? '' : newDishData.preparationTime}
                                            onChange={handleNewDishChange}
                                            className="form-control rounded-3"
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tags và Đề cử */}
                            <div className="col-12">
                                <label className="form-label small fw-medium text-muted d-block">Tags / Danh mục <span className="text-danger">*</span></label>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {MOCK_CATEGORIES.map(category => (
                                        <span
                                            key={category.id}
                                            className={`badge cursor-pointer p-2 fw-medium ${
                                                newDishData.categoryIds.has(category.id)
                                                    ? 'text-white'
                                                    : 'text-secondary border border-secondary bg-light'
                                            }`}
                                            style={{
                                                backgroundColor: newDishData.categoryIds.has(category.id) ? customStyles.primaryPink : 'transparent',
                                                transition: 'all 0.2s',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                opacity: loading ? 0.6 : 1
                                            }}
                                            onClick={() => !loading && handleCategoryToggle(category.id)}
                                        >
                                            <Tag size={14} style={{ marginRight: '4px' }} />
                                            {category.name}
                                        </span>
                                    ))}
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
                                    <label className="form-check-label small fw-medium text-dark" htmlFor="isRecommendedCheck">
                                        Đề cử món ăn này (Hiển thị nổi bật)
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer border-0 pt-0 d-flex gap-2">
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            className="btn btn-lg flex-grow-1 fw-bold text-white"
                            style={{ backgroundColor: customStyles.primaryPink, border: 'none' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} style={{ marginRight: '8px' }} />
                                    Thêm món
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-light btn-lg flex-grow-1 fw-bold text-secondary"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDishModal;