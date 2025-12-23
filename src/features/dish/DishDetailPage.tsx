import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Badge, Button, Container, Spinner} from 'react-bootstrap';
import toast from 'react-hot-toast';
import {
    AlertCircle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Eye,
    ShoppingCart,
    Store
} from 'lucide-react';
import axiosInstance from "../../config/axiosConfig";
import Navigation from "../../components/layout/Navigation";
import DishGrid from "./DishGrid.tsx";
import {useCart} from "../cart/hooks/useCart.ts";
import UserCouponSection from "../coupon/components/UserCouponSection.tsx";

interface DishImage {
    id: number;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface DishDetail {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    preparationTime: number | null;
    viewCount: number;
    images: DishImage[];
    merchantId: number;
    merchantName: string;
    categories: Category[];
}

interface SuggestedDish {
    id: number;
    name: string;
    slug?: string;
    price: number;
    discountPrice: number | null;
    imageUrl: string;
    merchantName: string;
    preparationTime: number;
}

const DishDetailPage: React.FC = () => {
    const {dishId} = useParams<{ dishId: string }>();
    const navigate = useNavigate();
    const {addToCart, isLoading: isAddingToCart} = useCart();

    const [dish, setDish] = useState<DishDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [relatedDishes, setRelatedDishes] = useState<SuggestedDish[]>([]);
    const [mostViewedDishes, setMostViewedDishes] = useState<SuggestedDish[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [loadingMostViewed, setLoadingMostViewed] = useState(false);

    const brandColor = '#FF5E62';

    useEffect(() => {
        window.scrollTo(0, 0);

        // ✅ VALIDATE dishId
        if (!dishId || isNaN(Number(dishId)) || Number(dishId) <= 0) {
            navigate('/*', {replace: true});
            return;
        }

        fetchDishDetail();
        fetchRelatedDishes();
        fetchMostViewedDishes();
    }, [dishId]);

    const fetchDishDetail = async () => {
        try {
            const response = await axiosInstance.get<DishDetail>(`/dishes/${dishId}`);

            if (!response.data || !response.data.id) {
                navigate('/not-found', {replace: true});
                return;
            }

            setDish(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching dish:', err);

            if (err.response?.status === 404) {
                // ✅ THÊM: Hiển thị thông báo cụ thể
                const errorMsg = err.response?.data?.error || 'Món ăn không tồn tại hoặc không còn khả dụng';

                setError(errorMsg);
                setLoading(false);

                // Hiển thị toast thông báo
                toast.error(errorMsg, {duration: 4000});

                // Sau 2s redirect về trang chủ
                setTimeout(() => {
                    navigate('/', {replace: true});
                }, 2000);
            } else {
                setError('Không thể tải thông tin món ăn');
                setLoading(false);
            }
        }
    };

    const fetchRelatedDishes = async () => {
        setLoadingRelated(true);
        try {
            const response = await axiosInstance.get<SuggestedDish[]>(`/dishes/${dishId}/related`);
            setRelatedDishes(response.data);
        } catch (err) {
            console.error('Lỗi khi tải món ăn liên quan:', err);
        } finally {
            setLoadingRelated(false);
        }
    };

    const fetchMostViewedDishes = async () => {
        setLoadingMostViewed(true);
        try {
            const response = await axiosInstance.get<SuggestedDish[]>('/dishes/most-viewed');
            setMostViewedDishes(response.data);
        } catch (err) {
            console.error('Lỗi khi tải món ăn phổ biến:', err);
        } finally {
            setLoadingMostViewed(false);
        }
    };

    const handleNextImage = () => {
        if (dish && dish.images && dish.images.length > 0) {
            setSelectedImageIndex((prev) => (prev + 1) % dish.images.length);
        }
    };

    const handlePrevImage = () => {
        if (dish && dish.images && dish.images.length > 0) {
            setSelectedImageIndex((prev) => (prev - 1 + dish.images.length) % dish.images.length);
        }
    };

    const handleAddToCart = async (selectedDishId?: number) => {
        const targetDishId = selectedDishId || dish?.id;

        if (!targetDishId) {
            toast.error('Không tìm thấy món ăn');
            return;
        }

        await addToCart(targetDishId, 1);
    };

    const handleBuyNow = async () => {
        if (!dish?.id) {
            toast.error('Không tìm thấy món ăn');
            return;
        }

        await addToCart(dish.id, 1);

        setTimeout(() => {
            navigate('/cart');
        }, 1500);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" style={{color: brandColor}}/>
            </div>
        );
    }

    if (error || !dish) {
        return (
            <div className="min-vh-100 bg-light">
                <Navigation/>
                <Container className="py-5">
                    <div className="text-center">
                        <div className="mb-4">
                            <AlertCircle size={80} className="text-danger opacity-50"/>
                        </div>
                        <h3 className="text-danger mb-3">{error || 'Không tìm thấy món ăn'}</h3>
                        <p className="text-muted mb-4">
                            Món ăn này có thể đã bị xóa hoặc không còn khả dụng
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                                <ArrowLeft size={16} className="me-2"/>
                                Quay lại
                            </Button>
                            <Button variant="danger" onClick={() => navigate('/')}>
                                Về trang chủ
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    const discountPercent = (dish.price && dish.discountPrice)
        ? Math.round(((dish.price - dish.discountPrice) / dish.price) * 100)
        : 0;

    return (
        <>
            <Navigation/>
            <div className="bg-light min-vh-100 py-4">
                <Container>
                    <Button
                        variant="link"
                        className="text-decoration-none mb-3 p-0 d-flex align-items-center"
                        style={{color: '#6c757d'}}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} className="me-1"/>
                        Quay lại danh sách
                    </Button>

                    <div className="bg-white rounded-4 shadow-sm overflow-hidden">
                        <div className="row g-0">
                            {/* CỘT TRÁI: ẢNH */}
                            <div className="col-lg-6 p-4">
                                <div
                                    className="position-relative mb-3 rounded-4 overflow-hidden"
                                    style={{height: '400px', backgroundColor: '#f8f9fa'}}
                                >
                                    <img
                                        src={
                                            (dish.images && dish.images.length > 0 && dish.images[selectedImageIndex])
                                                ? dish.images[selectedImageIndex].imageUrl
                                                : 'https://placehold.co/600x400?text=No+Image'
                                        }
                                        alt={dish.name}
                                        className="w-100 h-100 object-fit-cover"
                                        style={{transition: 'all 0.3s ease'}}
                                    />

                                    {dish.images && dish.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="btn position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    border: 'none'
                                                }}
                                            >
                                                <ChevronLeft size={24} color="#333"/>
                                            </button>

                                            <button
                                                onClick={handleNextImage}
                                                className="btn position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    border: 'none'
                                                }}
                                            >
                                                <ChevronRight size={24} color="#333"/>
                                            </button>

                                            <div
                                                className="position-absolute bottom-0 end-0 m-3 px-2 py-1 rounded bg-dark bg-opacity-50 text-white small">
                                                {selectedImageIndex + 1} / {dish.images.length}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="d-flex gap-2 overflow-auto pb-2" style={{scrollbarWidth: 'thin'}}>
                                    {dish.images?.map((img, index) => (
                                        <div
                                            key={img.id || index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className="rounded-3 overflow-hidden flex-shrink-0"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                border: selectedImageIndex === index
                                                    ? `2px solid ${brandColor}`
                                                    : '2px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img
                                                src={img.imageUrl}
                                                alt={`View ${index + 1}`}
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CỘT PHẢI: THÔNG TIN */}
                            <div className="col-lg-6 p-4 d-flex flex-column">
                                <div className="mb-auto">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center text-muted small">
                                            <Eye size={16} className="me-1"/>
                                            {dish.viewCount} lượt xem
                                        </div>
                                    </div>

                                    <h1 className="h2 fw-bold mb-3 text-dark">{dish.name}</h1>

                                    {dish.categories && dish.categories.length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {dish.categories.map((category) => (
                                                <Badge
                                                    key={category.id}
                                                    bg="light"
                                                    text="dark"
                                                    className="px-3 py-2 fw-normal"
                                                    style={{
                                                        fontSize: '0.875rem',
                                                        border: `1px solid ${brandColor}`,
                                                        color: brandColor,
                                                        backgroundColor: 'transparent'
                                                    }}
                                                >
                                                    {category.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="d-flex gap-4 mb-4 text-secondary">
                                        <div className="d-flex align-items-center">
                                            <Clock size={18} className="me-2 text-warning"/>
                                            <span>{dish.preparationTime || 15} phút chuẩn bị</span>
                                        </div>
                                    </div>

                                    <div className="mb-4 p-3 bg-light rounded-3">
                                        {dish.discountPrice && dish.discountPrice < dish.price ? (
                                            <div className="d-flex align-items-end gap-2">
                                                <span className="h2 fw-bold mb-0" style={{color: brandColor}}>
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(dish.discountPrice)}
                                                </span>
                                                <span className="text-decoration-line-through text-muted mb-1">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(dish.price)}
                                                </span>
                                                <Badge bg="danger" className="mb-1">-{discountPercent}%</Badge>
                                            </div>
                                        ) : (
                                            <span className="h2 fw-bold mb-0" style={{color: brandColor}}>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(dish.price)}
                                            </span>
                                        )}
                                    </div>

                                    <h5 className="fw-semibold mb-2">Mô tả món ăn</h5>
                                    <p className="text-muted mb-4" style={{lineHeight: '1.6'}}>
                                        {dish.description || 'Chưa có mô tả chi tiết cho món ăn này.'}
                                    </p>

                                    <div className="d-flex align-items-center p-3 border rounded-3 mb-4">
                                        <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                                            <Store size={24} className="text-primary"/>
                                        </div>
                                        <div>
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none d-flex align-items-center text-dark hover-opacity"
                                                onClick={() => navigate(`/merchants/profile/${dish.merchantId}`)}
                                                style={{textAlign: 'left'}}
                                            >
                                                <div>
                                                    <small className="text-muted d-block"
                                                           style={{fontSize: '0.75rem', lineHeight: '1'}}>
                                                        Được cung cấp bởi
                                                    </small>
                                                    <span
                                                        className="fw-bold text-danger">{dish.merchantName || 'Cửa hàng đối tác'}
                                                     </span>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* NÚT HÀNH ĐỘNG */}
                                <div className="d-grid gap-2 d-md-flex mt-3">
                                    <Button
                                        variant="outline-light"
                                        size="lg"
                                        onClick={() => handleAddToCart()}
                                        disabled={isAddingToCart}
                                        className="flex-grow-1 d-flex align-items-center justify-content-center fw-bold"
                                        style={{
                                            borderColor: brandColor,
                                            color: brandColor,
                                            backgroundColor: 'white'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isAddingToCart) {
                                                e.currentTarget.style.backgroundColor = '#fff0f0';
                                            }
                                        }}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <ShoppingCart size={20} className="me-2"/>
                                        {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleBuyNow}
                                        disabled={isAddingToCart}
                                        className="flex-grow-1 d-flex align-items-center justify-content-center fw-bold text-white"
                                        style={{
                                            backgroundColor: brandColor,
                                            borderColor: brandColor
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isAddingToCart) {
                                                e.currentTarget.style.opacity = '0.9';
                                            }
                                        }}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <CreditCard size={20} className="me-2"/>
                                        Mua ngay
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION MÃ GIẢM GIÁ */}
                    {dish?.merchantId && (
                        <UserCouponSection
                            merchantId={dish.merchantId}
                            merchantName={dish.merchantName}
                            brandColor={brandColor}
                        />
                    )}

                    <DishGrid
                        title="Món dành riêng cho bạn"
                        dishes={relatedDishes}
                        loading={loadingRelated}
                        emptyMessage="Chưa có món ăn liên quan"
                        brandColor={brandColor}
                        onAddToCart={handleAddToCart}
                        autoScroll={false}
                    />

                    <DishGrid
                        title="Mọi người cũng thích"
                        dishes={mostViewedDishes}
                        loading={loadingMostViewed}
                        emptyMessage="Chưa có dữ liệu món ăn phổ biến"
                        brandColor={brandColor}
                        onAddToCart={handleAddToCart}
                        autoScroll={true}
                        autoScrollInterval={3000}
                    />
                </Container>
            </div>
        </>
    );
};

export default DishDetailPage;