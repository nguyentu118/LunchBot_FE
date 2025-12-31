// features/cart/components/CartItemCard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Form, InputGroup } from 'react-bootstrap';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '../types/cart';
import toast from "react-hot-toast";

interface CartItemCardProps {
    item: CartItem;
    onUpdateQuantity: (dishId: number, newQuantity: number) => Promise<void>;
    onRemove: (dishId: number) => Promise<void> | void;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const CartItemCard: React.FC<CartItemCardProps> = ({
                                                       item,
                                                       onUpdateQuantity,
                                                       onRemove
                                                   }) => {
    // State hiển thị nội bộ (giúp UI mượt, không cần chờ server)
    const [localQuantity, setLocalQuantity] = useState(item.quantity);

    // THÊM STATE ĐỂ TRACK POPUP VÀ TRẠNG THÁI XÓA
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dùng ref để chặn việc gọi API quá dồn dập (Debounce đơn giản)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Đồng bộ khi cha thay đổi (ví dụ load lại trang)
    useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    // Hàm xử lý gọi API (có delay nhẹ để tránh spam request)
    const triggerUpdateApi = (newQty: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            try {
                await onUpdateQuantity(item.dishId, newQty);
            } catch (error) {
                console.error("Lỗi update:", error);
                toast.error('Có lỗi khi cập nhật số lượng');
                setLocalQuantity(item.quantity); // Revert nếu lỗi
            }
        }, 500); // Đợi 0.5s sau khi bấm liên tục mới gửi request cuối cùng
    };

    // Xử lý nút Tăng (+)
    const handleIncrease = () => {
        if (localQuantity >= 999) return;

        const newQty = localQuantity + 1;
        setLocalQuantity(newQty); // 1. Cập nhật UI ngay lập tức (Mượt)
        triggerUpdateApi(newQty); // 2. Gọi API ngầm
    };

    // Xử lý nút Giảm (-)
    const handleDecrease = () => {
        if (localQuantity <= 1) return;

        const newQty = localQuantity - 1;
        setLocalQuantity(newQty); // 1. Cập nhật UI ngay lập tức
        triggerUpdateApi(newQty); // 2. Gọi API ngầm
    };

    // Xử lý nhập tay input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setLocalQuantity(0); // Cho phép xóa trắng để nhập
            return;
        }
        const numVal = parseInt(val);
        if (!isNaN(numVal)) {
            setLocalQuantity(numVal);
        }
    };

    const handleInputBlur = () => {
        let finalQty = localQuantity;
        if (finalQty < 1) finalQty = 1;
        if (finalQty > 999) finalQty = 999;

        if (finalQty !== localQuantity) setLocalQuantity(finalQty);

        // Gọi API ngay khi blur (không cần delay)
        if (finalQty !== item.quantity) {
            onUpdateQuantity(item.dishId, finalQty);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    // Hàm xóa - ĐÃ FIX
    const handleRemove = () => {
        // NGĂN MỞ POPUP NẾU ĐÃ CÓ POPUP ĐANG MỞ
        if (isPopupOpen || isDeleting) return;

        setIsPopupOpen(true); // ĐÁNH DẤU POPUP ĐANG MỞ

        toast((t) => (
            <div className="d-flex align-items-start w-100" style={{ minWidth: '300px' }}>
                <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3 flex-shrink-0">
                    <Trash2 size={20} className="text-danger" />
                </div>
                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">Xóa món này?</h6>
                    <p className="text-muted small mb-3">Bạn muốn xóa <b>"{item.dishName}"</b>?</p>
                    <div className="d-flex gap-2 justify-content-end">
                        <button
                            onClick={async () => {
                                setIsDeleting(true); // ĐÁNH DẤU ĐANG XÓA
                                try {
                                    await onRemove(item.dishId);
                                    window.dispatchEvent(new Event('cartUpdated'));
                                    toast.dismiss(t.id);
                                } catch (e) {
                                    console.error(e);
                                    toast.error('Có lỗi khi xóa món');
                                } finally {
                                    // RESET STATE SAU KHI HOÀN THÀNH
                                    setTimeout(() => {
                                        setIsDeleting(false);
                                        setIsPopupOpen(false);
                                    }, 500);
                                }
                            }}
                            className="btn btn-sm btn-danger fw-bold px-3 rounded-3"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                setIsPopupOpen(false); // RESET STATE KHI HỦY
                            }}
                            className="btn btn-sm btn-light border"
                            disabled={isDeleting}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-center">
                    {/* ẢNH */}
                    <img
                        src={item.dishImage || '/default-dish.jpg'}
                        alt={item.dishName}
                        className="rounded"
                        style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Food"; }}
                    />

                    {/* THÔNG TIN */}
                    <div className="flex-grow-1 ms-3">
                        <h5 className="mb-1 fw-bold text-truncate" style={{ maxWidth: '250px' }}>
                            {item.dishName}
                        </h5>
                        <p className="text-danger fw-bold mb-2">{formatCurrency(item.discountPrice)}</p>

                        {/* --- KHU VỰC CỘNG TRỪ SỐ LƯỢNG --- */}
                        <InputGroup size="sm" style={{ width: '120px' }}>
                            <Button
                                variant="outline-secondary"
                                onClick={handleDecrease}
                                disabled={localQuantity <= 1 || isDeleting || isPopupOpen}
                                type="button"
                                className="d-flex align-items-center justify-content-center px-2"
                            >
                                <Minus size={14} />
                            </Button>

                            <Form.Control
                                type="number"
                                value={localQuantity}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                className="text-center fw-bold text-secondary border-secondary"
                                style={{ zIndex: 0 }}
                                disabled={isDeleting || isPopupOpen}
                            />

                            <Button
                                variant="outline-secondary"
                                onClick={handleIncrease}
                                disabled={localQuantity >= 999 || isDeleting || isPopupOpen}
                                type="button"
                                className="d-flex align-items-center justify-content-center px-2"
                            >
                                <Plus size={14} />
                            </Button>
                        </InputGroup>
                        {/* ---------------------------------- */}
                    </div>

                    {/* TỔNG TIỀN & XÓA */}
                    <div className="text-end ms-2">
                        <p className="fw-bold text-danger mb-3" style={{ fontSize: '1.1rem' }}>
                            {formatCurrency(item.discountPrice * localQuantity)}
                        </p>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleRemove}
                            type="button"
                            disabled={isDeleting || isPopupOpen}
                        >
                            {isDeleting ? (
                                <span className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default CartItemCard;