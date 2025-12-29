import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import axiosInstance from "../../config/axiosConfig";
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface DishDeleteButtonProps {
    dishId: number;
    dishName: string;
    onDeleteSuccess?: () => void;
    className?: string;
}

interface ErrorResponse {
    error?: string;
    message?: string;
}

const DishDeleteButton: React.FC<DishDeleteButtonProps> = ({
                                                               dishId,
                                                               dishName,
                                                               onDeleteSuccess,
                                                               className = ""
                                                           }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false); // THÊM STATE ĐỂ TRACK POPUP
    const navigate = useNavigate();

    // 1. Logic Xóa món ăn (Thực thi API)
    const executeDelete = useCallback(async () => {
        setLoading(true);

        try {
            await axiosInstance.delete(`/dishes/${dishId}`);
            toast.success(`Món ăn "${dishName}" đã được xóa thành công!`, {
                duration: 3000,
                icon: '✅'
            });

            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                navigate('/dishes/list');
            }

        } catch (err) {
            console.error("Lỗi khi xóa món ăn:", err);

            const error = err as AxiosError<ErrorResponse>;
            const serverErrorMessage = error.response?.data?.error;
            const displayMessage = serverErrorMessage || "Không thể xóa món ăn này. Vui lòng thử lại.";

            toast.error(displayMessage, {
                duration: 5000,
                style: {
                    border: '1px solid #ff4b4b',
                    padding: '16px',
                    color: '#333',
                    minWidth: '300px'
                },
                iconTheme: {
                    primary: '#ff4b4b',
                    secondary: '#FFFAEE',
                },
            });

        } finally {
            setLoading(false);
            setIsPopupOpen(false); // RESET STATE KHI HOÀN THÀNH
        }
    }, [dishId, dishName, onDeleteSuccess, navigate]);

    // 2. Hàm kích hoạt hộp thoại xác nhận
    const handleConfirmOpen = () => {
        // NGĂN MỞ POPUP NẾU ĐÃ CÓ POPUP ĐANG MỞ
        if (isPopupOpen) return;

        setIsPopupOpen(true); // ĐÁNH DẤU POPUP ĐANG MỞ

        toast((t) => (
            <div
                className="bg-white rounded-3 shadow-lg p-4 border border-danger"
                style={{
                    minWidth: '340px',
                    maxWidth: '500px',
                    animation: 'slideIn 0.3s ease-out'
                }}
            >
                <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                        className="rounded-circle bg-danger bg-opacity-10 p-2 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <Trash2 size={22} className="text-danger"/>
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-2 fw-bold text-danger">Xác nhận Xóa</h5>
                        <p className="mb-0 text-danger">
                            Bạn có chắc chắn muốn xóa món ăn <strong>"{dishName}"</strong> không?
                            <br/>
                            <span className="small text-danger">Thao tác này không thể hoàn tác.</span>
                        </p>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    {/* Nút XÁC NHẬN XÓA */}
                    <button
                        className="btn btn-danger px-4 d-flex align-items-center gap-2"
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDelete();
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Xác nhận Xóa
                            </>
                        )}
                    </button>

                    {/* Nút HỦY BỎ */}
                    <button
                        className="btn btn-light border px-4"
                        onClick={() => {
                            toast.dismiss(t.id);
                            setIsPopupOpen(false); // RESET STATE KHI HỦY
                        }}
                        disabled={loading}
                    >
                        Hủy bỏ
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                background: 'transparent',
                boxShadow: 'none'
            }
        });
    };

    return (
        <button
            onClick={handleConfirmOpen}
            disabled={loading || isPopupOpen} // DISABLE NẾU ĐANG LOADING HOẶC POPUP ĐANG MỞ
            className={`btn btn-outline-danger d-flex align-items-center gap-2 ${className}`}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Đang xóa...
                </>
            ) : (
                <>
                    <Trash2 size={18} />
                    Xóa
                </>
            )}
        </button>
    );
};

export default DishDeleteButton;