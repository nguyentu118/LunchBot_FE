import React, { useState } from 'react';
// Thêm icon X
import { Plus, Tag, Clock, Upload, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface DishCreateRequestState {
    name: string;
    merchantId: number;
    // Giữ nguyên: imagesFiles vẫn là FileList | null để tương thích với component cha
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

    // Cleanup state khi đóng modal
    React.useEffect(() => {
        if (!show) {
            setSelectedFiles([]);
            setPreviewUrls([]);
        }
    }, [show]);

    // --- LOGIC FILE HANDLERS (ĐÃ SỬA ĐỂ TỰ ĐỘNG THÊM FILE MỚI VÀO DANH SÁCH CŨ) ---
    const updateParentAndInput = (filesArray: File[]) => {
        const dataTransfer = new DataTransfer();
        filesArray.forEach(file => dataTransfer.items.add(file));
        const newFileList = dataTransfer.files;

        // Cập nhật input file thực tế
        const fileInput = document.getElementById('dish-images-upload') as HTMLInputElement ||
            document.getElementById('dish-images-upload-update') as HTMLInputElement;

        if (fileInput) {
            // Đảm bảo cập nhật files vào input element được chọn
            fileInput.files = newFileList;

            // Kích hoạt handleNewDishChange với FileList mới
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
            // TẠO MỘT MẢNG KẾT HỢP: file mới + file cũ
            const newFileArray = Array.from(files);
            const combinedFiles = [...selectedFiles, ...newFileArray]; // **LOGIC APPEND QUAN TRỌNG**

            setSelectedFiles(combinedFiles);

            const urls: string[] = [];
            let filesProcessed = 0;

            combinedFiles.forEach(file => { // **DÙNG combinedFiles**
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        urls.push(reader.result);
                        filesProcessed++;
                        if (filesProcessed === combinedFiles.length) { // **DÙNG combinedFiles.length**
                            setPreviewUrls(urls);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });

            // Cập nhật component cha và input file
            updateParentAndInput(combinedFiles);

        } else if (selectedFiles.length === 0) {
            // Nếu không có file nào được chọn và selectedFiles rỗng (chỉ xảy ra khi người dùng hủy dialog lần đầu)
            setSelectedFiles([]);
            setPreviewUrls([]);
            handleNewDishChange(e);
        }
        // Sau khi đã thêm file, cần xóa value của input để có thể chọn lại file mới
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
    }

    const handleSaveClick = async () => {
        if (!newDishData.name || !newDishData.price) {
            toast.error("Vui lòng điền đủ Tên và Giá.");
            return;
        }

        if (selectedFiles.length === 0 && (!newDishData.imagesFiles || newDishData.imagesFiles.length === 0)) {
            toast.error("Vui lòng chọn ít nhất một ảnh cho món ăn.");
            return;
        }

        setLoading(true);
        try {
            const filesToUpload = selectedFiles.length > 0 ? selectedFiles : Array.from(newDishData.imagesFiles || []);
            const mockUploadedUrls = filesToUpload.map((_, index) => `mock-url-${index + 1}`);

            await onSave({
                ...newDishData,
                uploadedUrls: mockUploadedUrls,
            });

        } catch (error) {
            toast.error("Có lỗi xảy ra khi thêm món.");
            console.error(error);
        } finally {
            setLoading(false);
        }

    };

    if (!show) return null;

    return (
        // Modal Container
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
                        {/* HÀNG 1: THÔNG TIN CƠ BẢN (Tên, Mô tả, Thời gian) */}
                        <div className="row g-5 mb-5"> {/* Thêm g-5 để tạo khoảng cách giữa 2 cột */}

                            {/* Cột Trái (Tên, Mô tả, Thời gian) */}
                            <div className="col-lg-6 d-flex flex-column gap-3">
                                <h5 className="mb-2 fw-bold text-secondary border-bottom pb-2">Thông tin cơ bản</h5>

                                {/* Tên Món Ăn */}
                                <div className="mb-2">
                                    <label htmlFor="dishName" className="form-label fw-bold">Tên Món Ăn <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        id="dishName"
                                        name="name"
                                        value={newDishData.name}
                                        onChange={handleNewDishChange}
                                    />
                                </div>

                                {/* Mô Tả */}
                                <div className="mb-2">
                                    <label htmlFor="dishDescription" className="form-label fw-bold">Mô Tả</label>
                                    <textarea
                                        className="form-control"
                                        id="dishDescription"
                                        name="description"
                                        rows={3}
                                        value={newDishData.description}
                                        onChange={handleNewDishChange}
                                    ></textarea>
                                </div>

                                {/* Thời gian chuẩn bị */}
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
                                    />
                                </div>
                            </div>

                            {/* Cột Phải (Giá, Chiết khấu, Phí, Đề xuất) */}
                            <div className="col-lg-6 d-flex flex-column gap-3">
                                <h5 className="mb-2 fw-bold text-secondary border-bottom pb-2">Giá & Chi phí</h5>

                                {/* Giá Bán */}
                                <div className="mb-2">
                                    <label htmlFor="dishPrice" className="form-label fw-bold">Giá Bán (VND) <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="dishPrice"
                                        name="price"
                                        value={newDishData.price}
                                        onChange={handleNewDishChange}
                                    />
                                </div>

                                {/* Giá chiết khấu */}
                                <div className="mb-2">
                                    <label htmlFor="discountPrice" className="form-label fw-bold">Giá Chiết Khấu (VND)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="discountPrice"
                                        name="discountPrice"
                                        value={newDishData.discountPrice}
                                        onChange={handleNewDishChange}
                                    />
                                </div>

                                {/* Phí dịch vụ */}
                                <div className="mb-2">
                                    <label htmlFor="serviceFee" className="form-label fw-bold">Phí Dịch Vụ (%)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="serviceFee"
                                        name="serviceFee"
                                        value={newDishData.serviceFee}
                                        onChange={handleNewDishChange}
                                    />
                                </div>

                                {/* Món ăn đề xuất */}
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
                                        ⭐ Đề xuất (Hiển thị nổi bật)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* HÀNG 2: ẢNH VÀ DANH MỤC (FULL WIDTH) */}
                        <div className="row g-5">
                            {/* Khối Ảnh Món Ăn (FULL WIDTH) */}
                            <div className="col-12">
                                <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Ảnh Món Ăn <span className="text-danger">*</span></h5>

                                {/* 3.1 KHỐI XEM TRƯỚC ẢNH */}
                                {previewUrls.length > 0 ? (
                                    <div
                                        className="d-flex flex-column gap-3 p-3 border rounded-3 bg-light"
                                        style={{ position: 'relative' }}>

                                        {/* Khối chứa các ảnh có cuộn */}
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
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Nút XÓA tất cả ảnh đã chọn & TẢI THÊM ẢNH (ĐÃ FIX) */}
                                        <div className="d-flex justify-content-between align-items-center">
                                            {/* **INPUT ẨN DÙNG ĐỂ TẢI THÊM ẢNH** */}
                                            <input
                                                type="file"
                                                id="dish-images-upload-update" // ID cho input ẩn
                                                multiple
                                                style={{ display: 'none' }} // Ẩn input gốc
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                key={selectedFiles.length} // Thêm key để reset input file
                                            />
                                            <label
                                                htmlFor="dish-images-upload-update" // Kích hoạt input ẩn
                                                className="btn btn-link p-0 fw-bold text-decoration-none"
                                                style={{
                                                    color: customStyles.primaryColor || '#007bff', // Màu xanh dương
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
                                    /* 3.2 NÚT TẢI LÊN (GIỮ NGUYÊN FORM CỦA BẠN) */
                                    <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                                        <input
                                            type="file"
                                            id="dish-images-upload" // ID cho input hiển thị
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

                            {/* Khối Danh mục Món Ăn (FULL WIDTH) */}
                            <div className="col-12 mt-4"> {/* Dùng mt-4 để tạo khoảng cách với khối Ảnh */}
                                <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">Danh Mục</h5>

                                {/* KHỐI CHỌN DANH MỤC: Dạng Tag Button */}
                                <div className="p-3 border rounded-3 bg-light" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    <div className="d-flex flex-wrap gap-2">
                                        {MOCK_CATEGORIES.map(category => {
                                            const isSelected = newDishData.categoryIds.has(category.id);
                                            return (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    className={`btn btn-sm fw-bold rounded-pill shadow-sm d-flex align-items-center ${
                                                        isSelected
                                                            ? 'text-white'
                                                            : 'btn-outline-secondary'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isSelected ? customStyles.primaryPink : 'transparent',
                                                        borderColor: isSelected ? customStyles.primaryPink : '',
                                                        transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
                                                        cursor: 'pointer',
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