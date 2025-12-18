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

            // Ép kiểu lỗi sang AxiosError để lấy data từ response
            const error = err as AxiosError<ErrorResponse>;

            // Lấy thông báo lỗi từ Backend (trường "error" mà ta đã map trong Controller)
            const serverErrorMessage = error.response?.data?.error;

            // Fallback: Nếu không có message từ server thì dùng message mặc định
            const displayMessage = serverErrorMessage || "Không thể xóa món ăn này. Vui lòng thử lại.";

            // Hiển thị Toast Lỗi
            toast.error(displayMessage, {
                duration: 5000, // Hiện lâu hơn chút để user kịp đọc
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
        }
    }, [dishId, dishName, onDeleteSuccess, navigate]);

    // 2. Hàm kích hoạt hộp thoại xác nhận (Sử dụng toast.custom)
    const handleConfirmOpen = () => {
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

                    {/* SỬA ĐỔI CHÍNH: Nút XÁC NHẬN XÓA được đặt trước nút HỦY BỎ */}

                    {/* 1. Nút XÁC NHẬN XÓA (Nằm bên trái Hủy bỏ, nhưng vẫn ở phía phải của popup) */}
                    <button
                        className="btn btn-danger px-4 d-flex align-items-center gap-2"
                        onClick={() => {
                            toast.dismiss(t.id); // Đóng toast xác nhận
                            executeDelete();      // Thực thi hàm xóa (API call)
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

                    {/* 2. Nút HỦY BỎ (Nằm ngoài cùng bên phải) */}
                    <button
                        className="btn btn-light border px-4"
                        onClick={() => toast.dismiss(t.id)}
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
            disabled={loading}
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