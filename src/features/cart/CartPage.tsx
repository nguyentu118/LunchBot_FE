import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from "../../config/axiosConfig.ts";
import Navigation from '../../components/layout/Navigation';
import CartSummary from './components/CartSummary';
import RestaurantGroupCard from './components/RestaurantGroupCard';
import { useCartData } from './hooks/useCartData';
import { CartApiService } from './services/CartApi.service';
import { GuestCartHelper } from './types/guestCart';
import { CartItem } from './types/cart';

// Định nghĩa kiểu dữ liệu mở rộng có chứa thông tin Merchant
interface EnrichedCartItem extends CartItem {
    restaurantId: number;
    restaurantName: string;
}

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading: isCartLoading, error, refetch } = useCartData();
    const token = localStorage.getItem('token');
    const isLoggedIn = Boolean(token);

    // State lưu các items đã được bổ sung thông tin Merchant
    const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
    const [isEnriching, setIsEnriching] = useState(false);

    // State lưu các món được chọn để thanh toán
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    // --- 1. LOGIC QUAN TRỌNG: GỌI API LẤY MERCHANT INFO ---
    useEffect(() => {
        const fetchMerchantInfo = async () => {
            if (!data || !data.items || data.items.length === 0) {
                setEnrichedItems([]);
                return;
            }

            // LOGIC CHECK MỚI:
            // Cần enrich nếu:
            // 1. Chưa có ID quán (hoặc = -1)
            // 2. Tên quán đang là "Unknown" hoặc "Đang cập nhật..." (để thử lấy lại)
            const needsEnrich = data.items.some(i =>
                !i.restaurantId ||
                i.restaurantId === -1 ||
                i.restaurantName === 'Unknown' ||
                i.restaurantName === 'Đang cập nhật...'
            );

            // Nếu dữ liệu đã xịn rồi thì thôi, hiển thị luôn
            if (!needsEnrich) {
                setEnrichedItems(data.items as EnrichedCartItem[]);
                return;
            }

            setIsEnriching(true);
            try {
                const promises = data.items.map(async (item) => {
                    // Nếu item này đã ngon rồi thì trả về luôn
                    if (item.restaurantId && item.restaurantId !== -1 && item.restaurantName !== 'Unknown' && item.restaurantName !== 'Đang cập nhật...') {
                        return item as EnrichedCartItem;
                    }

                    try {
                        // === SỬA QUAN TRỌNG: Dùng đường dẫn tương đối ===
                        // Đảm bảo Backend bạn đang chạy ở port 8080 và đã cấu hình proxy (nếu dùng vite/create-react-app)
                        // Hoặc bạn có thể sửa thành 'http://localhost:8080/api/dishes/' nếu chắc chắn port
                        const response = await axiosInstance.get(`/dishes/${item.dishId}`);

                        // Debug: Xem API trả về gì
                        // console.log(`API Dish ${item.dishId}:`, response.data);

                        const dishDetail = response.data;

                        // Kiểm tra kỹ dữ liệu trả về từ Java DTO
                        const merchantName = dishDetail.merchantName || 'Cửa hàng hệ thống';
                        const merchantId = dishDetail.merchantId || 0;

                        return {
                            ...item,
                            restaurantId: merchantId,
                            restaurantName: merchantName,
                            // Update luôn tên món/giá/ảnh từ server cho chính xác
                            dishName: dishDetail.name,
                            price: dishDetail.price,
                            dishImage: dishDetail.images?.[0]?.imageUrl || item.dishImage
                        } as EnrichedCartItem;

                    } catch (err: any) {
                        // In lỗi ra Console để kiểm tra (F12 -> Console)
                        console.error(`Lỗi lấy info món ${item.dishId}:`, err.response?.status, err.message);

                        // Nếu lỗi, giữ nguyên info cũ hoặc báo "Lỗi kết nối" thay vì Unknown
                        return {
                            ...item,
                            restaurantId: item.restaurantId || -1,
                            restaurantName: item.restaurantName || 'Không thể tải tên quán'
                        } as EnrichedCartItem;
                    }
                });

                const results = await Promise.all(promises);
                setEnrichedItems(results);

                // Update cache cho Guest để lần sau không phải load lại
                if (!isLoggedIn) {
                    const updates = results.map(r => ({
                        id: r.dishId,
                        name: r.dishName,
                        image: r.dishImage,
                        price: r.price,
                        restaurantId: r.restaurantId,
                        restaurantName: r.restaurantName
                    }));
                    GuestCartHelper.updateCache(updates);
                }

            } catch (error) {
                console.error("Lỗi chung:", error);
            } finally {
                setIsEnriching(false);
            }
        };

        fetchMerchantInfo();
    }, [data, isLoggedIn]);


    // --- 2. LOGIC GOM NHÓM (GROUPING) ---
    const groupedItems = useMemo(() => {
        if (!enrichedItems.length) return {};

        return enrichedItems.reduce((acc, item) => {
            const rId = item.restaurantId;
            if (!acc[rId]) {
                acc[rId] = {
                    restaurantName: item.restaurantName,
                    items: []
                };
            }
            acc[rId].items.push(item);
            return acc;
        }, {} as Record<number, { restaurantName: string, items: EnrichedCartItem[] }>);
    }, [enrichedItems]);

    // --- 3. TÍNH TOÁN TỔNG TIỀN (CHỈ CÁC MÓN ĐƯỢC CHỌN) ---
    const selectedSummary = useMemo(() => {
        return enrichedItems.reduce((acc, item) => {
            if (selectedItems.has(item.dishId)) {
                acc.count += item.quantity;
                acc.price += item.subtotal;
            }
            return acc;
        }, { count: 0, price: 0 });
    }, [enrichedItems, selectedItems]);

    // --- HANDLERS (XỬ LÝ SỰ KIỆN) ---

    // Chọn 1 món
    const handleSelectItem = (dishId: number, selected: boolean) => {
        const newSelected = new Set(selectedItems);
        if (selected) newSelected.add(dishId);
        else newSelected.delete(dishId);
        setSelectedItems(newSelected);
    };

    // Chọn cả nhóm (Cửa hàng)
    const handleSelectGroup = (restaurantId: number, selected: boolean) => {
        const group = groupedItems[restaurantId];
        if (!group) return;

        const newSelected = new Set(selectedItems);
        group.items.forEach(item => {
            if (selected) newSelected.add(item.dishId);
            else newSelected.delete(item.dishId);
        });
        setSelectedItems(newSelected);
    };

    // Chọn tất cả
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = enrichedItems.map(i => i.dishId);
            setSelectedItems(new Set(allIds));
        } else {
            setSelectedItems(new Set());
        }
    };

    // Update số lượng
    const handleUpdateQuantity = async (dishId: number, newQuantity: number) => {
        try {
            if (isLoggedIn) {
                await CartApiService.updateCartItem(dishId, newQuantity);
            } else {
                if (newQuantity <= 0) GuestCartHelper.removeItem(dishId);
                else GuestCartHelper.updateItem(dishId, newQuantity);
                window.dispatchEvent(new Event('cartUpdated'));
            }
            await refetch(); // Gọi lại hook để lấy data mới -> kích hoạt lại useEffect enrich
        } catch (error) {
            toast.error('Lỗi cập nhật số lượng' + error);
        }
    };

    // Xóa món
    const handleRemoveItem = async (dishId: number) => {
        try {
            if (isLoggedIn) {
                await CartApiService.removeFromCart(dishId);
            } else {
                GuestCartHelper.removeItem(dishId);
                window.dispatchEvent(new Event('cartUpdated'));
            }

            // Xóa khỏi danh sách selected nếu đang chọn
            if (selectedItems.has(dishId)) {
                const newSelected = new Set(selectedItems);
                newSelected.delete(dishId);
                setSelectedItems(newSelected);
            }
            toast.success('Đã xóa món ăn');
            await refetch();
        } catch (error) {
            toast.error('Lỗi khi xóa món ăn' + error);
        }
    };

    const handleCheckout = () => {
        if (!isLoggedIn) {
            toast.error('Vui lòng đăng nhập!');
            navigate('/login');
            return;
        }
        if (selectedItems.size === 0) {
            toast.error('Chưa chọn món nào!');
            return;
        }

        // Log ra để kiểm tra
        console.log("Thanh toán các món:", Array.from(selectedItems));
        toast.success("Chuyển đến trang thanh toán...");
        navigate('/checkout', { state: { itemIds: Array.from(selectedItems) } });
    };

    // Kiểm tra trạng thái "Chọn tất cả"
    const isAllSelected = enrichedItems.length > 0 && enrichedItems.length === selectedItems.size;
    const isLoading = isCartLoading || isEnriching;

    // --- RENDER ---

    if (isLoading) return (
        <div className="min-vh-100 bg-light">
            <Navigation />
            <Container className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="danger" />
                <span className="mt-3 text-muted">Đang tải thông tin cửa hàng...</span>
            </Container>
        </div>
    );

    if (error) return (
        <div className="min-vh-100 bg-light">
            <Navigation />
            <Container className="text-center py-5">
                <h3 className="text-danger">Lỗi tải giỏ hàng</h3>
                <Button variant="outline-primary" href="/">Về trang chủ</Button>
            </Container>
        </div>
    );

    if (!data || enrichedItems.length === 0) return (
        <div className="min-vh-100 bg-light">
            <Navigation />
            <Container className="text-center py-5 mt-5">
                <ShoppingCart size={80} className="text-muted opacity-50 mb-4" />
                <h3 className="mb-3">Giỏ hàng trống</h3>
                <Link to="/">
                    <Button variant="danger" size="lg" className="px-4 rounded-pill">Mua sắm ngay</Button>
                </Link>
            </Container>
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            <Navigation />
            <Container className="py-4">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h2 className="fw-bold mb-0 text-dark d-flex align-items-center">
                        <ShoppingCart className="me-2 text-danger" size={32} />
                        Giỏ hàng
                        {!isLoggedIn && <span className="badge bg-warning text-dark ms-2">Guest</span>}
                    </h2>
                    <Link to="/" className="text-decoration-none text-muted d-flex align-items-center">
                        <ArrowLeft size={18} className="me-1" /> Tiếp tục mua sắm
                    </Link>
                </div>

                <Row>
                    <Col lg={8}>

                        {/* List Groups */}
                        <div className="d-flex flex-column gap-3">
                            {Object.entries(groupedItems).map(([rId, groupData]) => {
                                const restaurantId = Number(rId);
                                const isGroupSelected = groupData.items.every(item => selectedItems.has(item.dishId));

                                return (
                                    <RestaurantGroupCard
                                        key={restaurantId}
                                        restaurantId={restaurantId}
                                        restaurantName={groupData.restaurantName}
                                        items={groupData.items}
                                        isSelected={isGroupSelected}
                                        selectedItems={selectedItems}
                                        onSelectGroup={handleSelectGroup}
                                        onSelectItem={handleSelectItem}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                    />
                                );
                            })}
                        </div>
                    </Col>

                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '90px', zIndex: 1 }}>
                            <CartSummary
                                totalItems={selectedSummary.count}
                                totalPrice={selectedSummary.price}
                                onCheckout={handleCheckout}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CartPage;