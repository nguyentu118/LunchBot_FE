import React from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import Navigation from '../../components/layout/Navigation';
import CartItemCard from './components/CartItemCard';
import CartSummary from './components/CartSummary';
import { useCartData } from './hooks/useCartData';
import { CartApiService } from './services/CartApi.service';
import { GuestCartHelper } from './types/guestCart';

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useCartData();

    const token = localStorage.getItem('token');
    const isLoggedIn = Boolean(token);

    const handleUpdateQuantity = async (dishId: number, newQuantity: number) => {
        try {
            if (isLoggedIn) {
                // User đã đăng nhập: gọi API
                await CartApiService.updateCartItem(dishId, newQuantity);
            } else {
                // Guest user: cập nhật localStorage
                if (newQuantity <= 0) {
                    GuestCartHelper.removeItem(dishId);
                } else {
                    GuestCartHelper.updateItem(dishId, newQuantity);
                }

                // Dispatch event để cập nhật header
                window.dispatchEvent(new Event('cartUpdated'));
            }

            toast.success('Đã cập nhật số lượng!');
            await refetch();

        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Không thể cập nhật. Vui lòng thử lại!');
        }
    };

    const handleRemoveItem = async (dishId: number) => {
        try {
            if (isLoggedIn) {
                // User đã đăng nhập: gọi API
                await CartApiService.removeFromCart(dishId);
            } else {
                // Guest user: xóa khỏi localStorage
                GuestCartHelper.removeItem(dishId);

                // Dispatch event để cập nhật header
                window.dispatchEvent(new Event('cartUpdated'));
            }

            toast.success('Đã xóa món khỏi giỏ hàng');
            await refetch();

        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Lỗi khi xóa món ăn');
        }
    };

    const handleCheckout = () => {
        if (!isLoggedIn) {
            toast.error('Vui lòng đăng nhập để thanh toán!');
            navigate('/login');
            return;
        }

        toast("Tính năng thanh toán đang được phát triển!", { icon: '🚧' });
        // navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    // --- RENDER ---

    if (isLoading) {
        return (
            <div className="min-vh-100 bg-light">
                <Navigation />
                <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
                    <Spinner animation="border" variant="danger" />
                    <span className="ms-2">Đang tải giỏ hàng...</span>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 bg-light">
                <Navigation />
                <Container className="text-center py-5">
                    <h3 className="text-danger">Có lỗi xảy ra!</h3>
                    <p>Không thể tải thông tin giỏ hàng.</p>
                    <Button variant="outline-primary" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                </Container>
            </div>
        );
    }

    // Giỏ hàng trống
    if (!data || data.items.length === 0) {
        return (
            <div className="min-vh-100 bg-light">
                <Navigation />
                <Container className="text-center py-5 mt-5">
                    <div className="mb-4">
                        <ShoppingCart size={80} className="text-muted opacity-50" />
                    </div>
                    <h3 className="mb-3">Giỏ hàng của bạn đang trống</h3>
                    <p className="text-muted mb-4">Hãy chọn những món ăn ngon lành để lấp đầy bụng đói nhé!</p>
                    <Button
                        variant="danger"
                        size="lg"
                        className="px-4 rounded-pill shadow-sm"
                        onClick={handleContinueShopping}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Container>
            </div>
        );
    }

    // Giao diện chính
    return (
        <div className="min-vh-100 bg-light">
            <Navigation />

            <Container className="py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h2 className="fw-bold mb-0 text-dark d-flex align-items-center">
                        <ShoppingCart className="me-2 text-danger" size={32} />
                        Giỏ hàng của bạn
                        {!isLoggedIn && (
                            <span className="badge bg-warning text-dark ms-2">Guest</span>
                        )}
                    </h2>
                    <Button
                        variant="link"
                        className="text-decoration-none text-muted d-flex align-items-center"
                        onClick={handleContinueShopping}
                    >
                        <ArrowLeft size={18} className="me-1" />
                        Tiếp tục mua sắm
                    </Button>
                </div>

                {/* Thông báo cho guest user */}
                {!isLoggedIn && (
                    <div className="alert alert-info mb-4" role="alert">
                        <strong>💡 Lưu ý:</strong> Bạn đang mua sắm với tư cách khách.
                        <Button
                            variant="link"
                            className="p-0 ms-2"
                            onClick={() => navigate('/login')}
                        >
                            Đăng nhập ngay
                        </Button> để lưu giỏ hàng và trải nghiệm đầy đủ!
                    </div>
                )}

                <Row>
                    <Col lg={8}>
                        <div className="bg-white p-3 rounded shadow-sm mb-3">
                            <p className="text-muted mb-0">
                                Bạn đang có <strong className="text-danger">{data.totalItems}</strong> món trong giỏ hàng
                            </p>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {data.items.map((item) => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>
                    </Col>

                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: '90px', zIndex: 1 }}>
                            <CartSummary
                                totalItems={data.totalItems}
                                totalPrice={data.totalPrice}
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