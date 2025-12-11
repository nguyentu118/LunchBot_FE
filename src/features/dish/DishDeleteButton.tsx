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

const DishDeleteButton: React.FC<DishDeleteButtonProps> = ({ dishId, dishName, onDeleteSuccess, className = "" }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // 1. Logic Xóa món ăn (Thực thi API)
    const executeDelete = useCallback(async () => {
        setLoading(true);

        try {
            // GỌI API DELETE (KHÔNG DÙNG ALERT/CONFIRM Ở ĐÂY)
            await axiosInstance.delete(`/dishes/${dishId}`);

            // THÔNG BÁO THÀNH CÔNG bằng TOAST
            toast.success(`Món ăn "${dishName}" đã được xóa thành công!`, {
                duration: 3000 // Tăng thời gian hiển thị success toast
            });

            if (onDeleteSuccess) {
                // Gọi callback để Component cha xử lý (refresh data)
                onDeleteSuccess();
            } else {
                // Điều hướng nếu component này được dùng độc lập
                navigate('/dishes/list');
            }

        } catch (err) {
            const axiosError = err as AxiosError;
            // Tránh lỗi khi response.data là null hoặc không phải object
            const message = (axiosError.response?.data as any)?.message || (axiosError.response?.data as string) || axiosError.message;

            // THÔNG BÁO LỖI bằng TOAST
            toast.error(`Xóa thất bại: ${message}`, { duration: 5000 });

        } finally {
            setLoading(false);
        }
    }, [dishId, dishName, onDeleteSuccess, navigate]);

    // 2. Hàm kích hoạt hộp thoại xác nhận (Sử dụng toast.custom)
    const handleConfirmOpen = () => {
        // TẠO HỘP THOẠI XÁC NHẬN CUSTOM
        toast((t) => (
            <div className="card p-3 shadow-lg" style={{ minWidth: '320px', borderRadius: '8px' }}>
                <h5 className="mb-3 text-danger d-flex align-items-center gap-2">
                    <Trash2 size={20}/> Xác nhận Xóa món ăn
                </h5>
                <p className="mb-4">Bạn có chắc chắn muốn xóa món ăn **{dishName}** không? Thao tác này không thể hoàn tác.</p>
                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                            toast.dismiss(t.id); // Đóng toast xác nhận
                            executeDelete();      // Thực thi hàm xóa (API call)
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Đang xóa...' : 'Xác nhận Xóa'}
                    </button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };

    return (
        <button
            onClick={handleConfirmOpen}
            disabled={loading}
            // Đảm bảo nút có kiểu dáng đẹp
            className={`btn btn-danger d-flex align-items-center gap-1 ${className}`}
        >
            {loading ? 'Đang xóa...' : (
                <>
                    <Trash2 size={18} /> Xóa
                </>
            )}
        </button>
    );
};

export default DishDeleteButton;