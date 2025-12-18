import React, { useState } from 'react';
import { Plus, Tag, Clock, Upload, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
    handleNewDishChange: (e: InputChangeEvent | FileChangeEvent | { target: { name: string; files: FileList | File[] | null } }) => void;
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
                                                       MOCK_CATEGORIES,
                                                   }) => {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const CLOUDINARY_CLOUD_NAME = 'dxoln0uq3';
    const CLOUDINARY_UPLOAD_PRESET = 'lunchbot_dishes';
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    React.useEffect(() => {
        if (!show) {
            setSelectedFiles([]);
            setPreviewUrls([]);
        }
    }, [show]);

    const updateParentAndInput = (filesArray: File[]) => {
        const dataTransfer = new DataTransfer();
        filesArray.forEach(file => dataTransfer.items.add(file));
        const newFileList = dataTransfer.files;

        const fileInput = document.getElementById('dish-images-upload') as HTMLInputElement ||
            document.getElementById('dish-images-upload-update') as HTMLInputElement;

        if (fileInput) {
            fileInput.files = newFileList;
            const mockEvent = {
                target: {
                    name: 'imagesFiles',
                    files: newFileList,
                }
            } as unknown as FileChangeEvent;
            handleNewDishChange(mockEvent);
        }
    };

    const handleFileChange = (e: FileChangeEvent) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const newFileArray = Array.from(files);
            const combinedFiles = [...selectedFiles, ...newFileArray];

            setSelectedFiles(combinedFiles);

            const urls: string[] = [];
            let filesProcessed = 0;

            combinedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        urls.push(reader.result);
                        filesProcessed++;
                        if (filesProcessed === combinedFiles.length) {
                            setPreviewUrls(urls);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });

            updateParentAndInput(combinedFiles);
        } else if (selectedFiles.length === 0) {
            setSelectedFiles([]);
            setPreviewUrls([]);
            handleNewDishChange(e);
        }

        const targetInput = e.target as HTMLInputElement;
        if(targetInput) targetInput.value = '';
    };

    const handleRemoveSingleImage = (indexToRemove: number) => {
        const newSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setSelectedFiles(newSelectedFiles);

        const newPreviewUrls = previewUrls.filter((_, index) => index !== indexToRemove);
        setPreviewUrls(newPreviewUrls);

        updateParentAndInput(newSelectedFiles);
    };

    const handleRemoveAllImages = () => {
        setSelectedFiles([]);
        setPreviewUrls([]);

        const fileInputPrimary = document.getElementById('dish-images-upload') as HTMLInputElement;
        if (fileInputPrimary) {
            fileInputPrimary.value = '';
        }

        const mockEvent = {
            target: {
                name: 'imagesFiles',
                files: null,
            }
        } as unknown as FileChangeEvent;
        handleNewDishChange(mockEvent);
    };

    const handleSaveClick = async () => {
        const errors: string[] = [];

        if (!newDishData.name.trim()) {
            errors.push("Tên món ăn");
        } else if (newDishData.name.length > 255) {
            errors.push("Tên món ăn (tối đa 255 ký tự)");
        }

        if (newDishData.description.length >= 5000) {
            errors.push("Mô tả (tối đa 5000 ký tự)");
        }

        if (selectedFiles.length === 0 && (!newDishData.imagesFiles || newDishData.imagesFiles.length === 0)) {
            errors.push("Ảnh món ăn");
        }

        if (!newDishData.price.trim()) {
            errors.push("Giá tiền");
        }

        if (!newDishData.discountPrice.trim()) {
            errors.push("Giá khuyến mãi");
        }

        if (newDishData.categoryIds.size === 0) {
            errors.push("Danh mục (Tag)");
        }

        if (errors.length > 0) {
            toast.error(`Vui lòng điền đầy đủ các trường bắt buộc: ${errors.join(', ')}`, {
                duration: 4000,
                style: {
                    minWidth: '400px'
                }
            });
            return;
        }

        setLoading(true);

        try {
            const filesToUpload = selectedFiles.length > 0 ? selectedFiles : Array.from(newDishData.imagesFiles || []);

            const oversizedFiles = filesToUpload.filter(file => file.size > MAX_FILE_SIZE);

            if (oversizedFiles.length > 0) {
                const fileNames = oversizedFiles.map(f => f.name).join(', ');
                toast.error(`${oversizedFiles.length} ảnh vượt quá 10MB: ${fileNames}`);
                setLoading(false);
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const invalidFiles = filesToUpload.filter(file => !allowedTypes.includes(file.type));

            if (invalidFiles.length > 0) {
                const fileNames = invalidFiles.map(f => f.name).join(', ');
                toast.error(`Định dạng không hợp lệ: ${fileNames}. Chỉ chấp nhận JPG, PNG, GIF, WEBP.`);
                setLoading(false);
                return;
            }

            const uploadedUrls: string[] = [];
            const failedFiles: { name: string; reason: string }[] = [];

            for (let i = 0; i < filesToUpload.length; i++) {
                const file = filesToUpload[i];

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                    const response = await fetch(
                        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                        {
                            method: 'POST',
                            body: formData
                        }
                    );

                    const data = await response.json();

                    if (data.secure_url) {
                        uploadedUrls.push(data.secure_url);
                    } else {
                        const errorMsg = data.error?.message || 'Unknown error';
                        failedFiles.push({ name: file.name, reason: errorMsg });
                        toast.error(`Lỗi: ${file.name} - ${errorMsg}`);
                    }

                } catch (error) {
                    console.error(`❌ Network error uploading ${file.name}:`, error);
                    failedFiles.push({ name: file.name, reason: 'Lỗi mạng' });
                    toast.error(`Lỗi mạng: ${file.name}`);
                }

                if (i < filesToUpload.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (uploadedUrls.length === 0) {
                toast.error("❌ Không upload được ảnh nào. Vui lòng thử lại hoặc kiểm tra cấu hình Cloudinary.");
                console.error("Failed files:", failedFiles);
                setLoading(false);
                return;
            }

            if (failedFiles.length > 0) {
                const failedList = failedFiles.map(f => `${f.name} (${f.reason})`).join(', ');
                toast.warning(`⚠️ Upload thành công ${uploadedUrls.length}/${filesToUpload.length}. Thất bại: ${failedList}`,
                    { duration: 5000 }
                );
            }

            await onSave({
                ...newDishData,
                uploadedUrls,
            });

            toast.success(`🎉 Đã thêm món "${newDishData.name}" với ${uploadedUrls.length} ảnh!`, {
                duration: 3000
            });

        } catch (error) {
            toast.error("❌ Có lỗi xảy ra khi thêm món.");
            console.error("Save error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-4">
                    {/* Header */}
                    <div className="modal-header p-4" style={{ backgroundColor: customStyles.primaryPink, borderBottom: 'none' }}>
                        <h4 className="modal-title fw-bolder text-white mb-0">Thêm Món Ăn Mới</h4>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-5">
                        {/* HÀNG 1: THÔNG TIN CƠ BẢN */}
                        <div className="row g-5 mb-5">
                            {/* Cột Trái */}
                            <div className="col-lg-6 d-flex flex-column gap-3">
                                <h5 className="mb-2 fw-bold text-secondary border-bottom pb-2">Thông tin cơ bản</h5>

                                {/* ✅ TÊN MÓN ĂN (*) - MAX 255 */}
                                <div className="mb-2">
                                    <label htmlFor="dishName" className="form-label fw-bold">
                                        Tên Món Ăn <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="dishName"
                                        name="name"
                                        value={newDishData.name}
                                        onChange={handleNewDishChange}
                                        placeholder="VD: Phở bò đặc biệt"
                                        maxLength={255}
                                    />
                                    <small className="text-muted">
                                        {newDishData.name.length}/255 ký tự
                                    </small>
                                </div>


                                {/* ✅ GHI CHÚ (MÔ TẢ) - MAX 5000 */}
                                <div className="mb-2">
                                    <label htmlFor="dishDescription" className="form-label fw-bold">Ghi Chú (Mô Tả)</label>
                                    <textarea
                                        className="form-control"
                                        id="dishDescription"
                                        name="description"
                                        rows={3}
                                        value={newDishData.description}
                                        onChange={handleNewDishChange}
                                        placeholder="Mô tả về món ăn..."
                                        maxLength={5000}
                                    ></textarea>
                                    <small className="text-muted">
                                        {newDishData.description.length}/5000 ký tự
                                    </small>
                                </div>

                                {/* ✅ THỜI GIAN CHUẨN BỊ */}
                                <div className="mb-2">
                                    <label htmlFor="prepTime" className="form-label fw-bold d-flex align-items-center">
                                        <Clock size={16} className="me-1" /> Thời Gian Chuẩn Bị (phút)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="prepTime"
                                        name="preparationTime"
                                        value={newDishData.preparationTime ?? ''}
                                        onChange={handleNewDishChange}
                                        placeholder="VD: 15"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Cột Phải */}
                            <div className="col-lg-6 d-flex flex-column gap-3">
                                <h5 className="mb-2 fw-bold text-secondary border-bottom pb-2">Giá & Chi phí</h5>

                                {/* ✅ GIÁ TIỀN (*) */}
                                <div className="mb-2">
                                    <label htmlFor="dishPrice" className="form-label fw-bold">
                                        Giá Tiền (VND) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="dishPrice"
                                        name="price"
                                        value={newDishData.price}
                                        onChange={handleNewDishChange}
                                        placeholder="VD: 50000"
                                        min="0"
                                    />
                                </div>

                                {/* ✅ GIÁ KHUYẾN MÃI (*) */}
                                <div className="mb-2">
                                    <label htmlFor="discountPrice" className="form-label fw-bold">
                                        Giá Khuyến Mãi (VND) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="discountPrice"
                                        name="discountPrice"
                                        value={newDishData.discountPrice}
                                        onChange={handleNewDishChange}
                                        placeholder="VD: 45000 (Nếu không KM thì điền = Giá tiền)"
                                        min="0"
                                    />
                                </div>

                                {/* ✅ PHÍ DỊCH VỤ (MẶC ĐỊNH 0) */}
                                <div className="mb-2">
                                    <label htmlFor="serviceFee" className="form-label fw-bold">
                                        Phí Dịch Vụ (%) - Mặc định: 0
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="serviceFee"
                                        name="serviceFee"
                                        value={newDishData.serviceFee || '0'}
                                        onChange={handleNewDishChange}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>

                                {/* ✅ ĐỀ CỬ (HIỂN THỊ ƯU TIÊN) */}
                                <div className="form-check form-switch pt-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="isRecommended"
                                        name="isRecommended"
                                        checked={newDishData.isRecommended}
                                        onChange={(e) => handleNewDishChange({
                                            target: {
                                                name: 'isRecommended',
                                                value: e.target.checked
                                            }
                                        } as unknown as InputChangeEvent)}
                                    />
                                    <label className="form-check-label fw-bold text-primary" htmlFor="isRecommended">
                                        ⭐ Đề xuất (Hiển thị ưu tiên trong tìm kiếm)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* HÀNG 2: ẢNH VÀ DANH MỤC */}
                        <div className="row g-5">
                            {/* ✅ ẢNH MÓN ĂN (*) */}
                            <div className="col-12">
                                <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">
                                    Ảnh Món Ăn <span className="text-danger">*</span>
                                </h5>

                                {previewUrls.length > 0 ? (
                                    <div className="d-flex flex-column gap-3 p-3 border rounded-3 bg-light">
                                        <div className="d-flex flex-wrap gap-3 overflow-auto p-2" style={{ maxHeight: '250px' }}>
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
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <input
                                                type="file"
                                                id="dish-images-upload-update"
                                                multiple
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                key={selectedFiles.length}
                                            />
                                            <label
                                                htmlFor="dish-images-upload-update"
                                                className="btn btn-link p-0 fw-bold text-decoration-none"
                                                style={{
                                                    color: customStyles.primaryColor || '#007bff',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Upload size={16} className="me-1" /> Tải thêm ảnh
                                            </label>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-bold"
                                                onClick={handleRemoveAllImages}
                                            >
                                                <Trash2 size={16} /> Xóa tất cả ({previewUrls.length})
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                                        <input
                                            type="file"
                                            id="dish-images-upload"
                                            name="imagesFiles"
                                            multiple
                                            className="form-control"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        <label className="input-group-text btn btn-outline-secondary fw-bold" htmlFor="dish-images-upload">
                                            <Upload size={18} className="me-2" /> Chọn File
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* ✅ TAG (DANH MỤC) (*) - HOVER #FF5E62 */}
                            <div className="col-12 mt-4">
                                <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">
                                    Tag (Danh Mục) <span className="text-danger">*</span>
                                </h5>

                                <div className="p-3 border rounded-3 bg-light" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    <div className="d-flex flex-wrap gap-2">
                                        {MOCK_CATEGORIES.map(category => {
                                            const isSelected = newDishData.categoryIds.has(category.id);
                                            return (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    className={`btn btn-sm fw-bold rounded-pill shadow-sm d-flex align-items-center ${
                                                        isSelected ? '' : 'btn-outline-secondary'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isSelected ? customStyles.primaryPink : 'transparent',
                                                        borderColor: isSelected ? customStyles.primaryPink : '#6c757d',
                                                        color: isSelected ? '#fff' : '#495057',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = '#FF5E62';
                                                            e.currentTarget.style.borderColor = '#FF5E62';
                                                            e.currentTarget.style.color = '#fff';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSelected) {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.borderColor = '#6c757d';
                                                            e.currentTarget.style.color = '#495057';
                                                        }
                                                    }}
                                                    onClick={() => handleCategoryToggle(category.id)}
                                                >
                                                    <Tag size={14} className="me-1" />
                                                    {category.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <small className="text-muted mt-2 d-block">
                                    💡 Có thể chọn nhiều danh mục cho 1 món ăn
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-end p-4 border-top bg-light">
                        <div className="d-flex gap-3 w-100">
                            <button
                                type="button"
                                onClick={handleSaveClick}
                                className="btn btn-danger btn-lg flex-fill fw-bolder text-white rounded-3 shadow-sm"
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
                                        Thêm Món
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
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDishModal;