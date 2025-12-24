import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Badge, Button, Card, Col, Container, Row, Spinner} from 'react-bootstrap';
import {ChevronLeft, ChevronRight, Heart, ShoppingCart, Trash2} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../config/axiosConfig';
import Navigation from '../../components/layout/Navigation';
import {useCart} from '../cart/hooks/useCart';

interface DishImage {
    id: number;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

interface Dish {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    preparationTime: number | null;
    images: DishImage[];
    merchantName: string;
}

interface Favorite {
    id: number;
    userId: number;
    dishId: number;
    createdAt: string;
    dish: Dish;
}

const FavoriteDishesPage: React.FC = () => {
    const navigate = useNavigate();
    const {addToCart, isLoading: isAddingToCart} = useCart();

    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<number | null>(null);

// --- State cho Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Bạn có thể thay đổi số lượng hiển thị ở đây
    const brandColor = '#FF5E62';

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get<Favorite[]>('/favorites');

            console.log('Favorites response:', response.data);

            if (Array.isArray(response.data)) {
                setFavorites(response.data);
            } else {
                setFavorites([]);
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách yêu thích:', err);

            if (err.response?.status === 401) {
                toast.error('Vui lòng đăng nhập để xem món ăn yêu thích');
                navigate('/login');
            } else {
                toast.error('Không thể tải danh sách yêu thích');
            }
        } finally {
            setLoading(false);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = favorites.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(favorites.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleRemoveFavorite = async (dishId: number, dishName: string) => {
        setRemovingId(dishId);
        try {
            await axiosInstance.delete(`/favorites/${dishId}`);
            setFavorites(prev => prev.filter(fav => fav.dishId !== dishId));
            toast.success(`Đã xóa "${dishName}" khỏi danh sách yêu thích`);
        } catch (err: any) {
            console.error('Lỗi khi xóa yêu thích:', err);
            toast.error('Không thể xóa món ăn khỏi danh sách yêu thích');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (dishId: number) => {
        await addToCart(dishId, 1);
    };

    const handleViewDetail = (dishId: number) => {
        navigate(`/dishes/${dishId}`);
    };

    const getDiscountPercent = (price: number, discountPrice: number | null) => {
        if (!discountPrice || discountPrice >= price) return 0;
        return Math.round(((price - discountPrice) / price) * 100);
    };

    if (loading) {
        return (
            <>
                <Navigation/>
                <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
                    <Spinner animation="border" style={{color: brandColor}}/>
                </div>
            </>
        );
    }

    return (
        <>
            <Navigation/>
            <div className="bg-light min-vh-100 py-5">
                <Container>
                    <div className="mb-4">
                        <h1 className="h2 fw-bold d-flex align-items-center mb-2">
                            <Heart size={32} fill={brandColor} color={brandColor} className="me-3"/>
                            Món ăn yêu thích
                        </h1>
                        <p className="text-muted">
                            {favorites.length > 0
                                ? `Bạn có ${favorites.length} món ăn yêu thích`
                                : 'Chưa có món ăn yêu thích nào'}
                        </p>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-4">
                                <Heart size={80} className="text-muted opacity-50"/>
                            </div>
                            <h3 className="text-muted mb-3">Chưa có món ăn yêu thích</h3>
                            <p className="text-muted mb-4">
                                Hãy khám phá và thêm những món ăn yêu thích của bạn
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/')}
                                style={{backgroundColor: brandColor, borderColor: brandColor}}
                            >
                                Khám phá món ăn
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* QUAN TRỌNG: Đổi favorites.map thành currentItems.map để chạy phân trang */}
                            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                                {currentItems.map((favorite) => {
                                    const dish = favorite.dish;
                                    if (!dish) return null;

                                    const primaryImage = dish.images && dish.images.length > 0
                                        ? dish.images[0]
                                        : 'https://placehold.co/400x300?text=No+Image';
                                    const discountPercent = getDiscountPercent(dish.price, dish.discountPrice);

                                    return (
                                        <Col key={favorite.id}>
                                            <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                                                <div className="position-relative">
                                                    <Card.Img
                                                        variant="top"
                                                        src={primaryImage}
                                                        alt={dish.name}
                                                        style={{
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleViewDetail(dish.id)}
                                                    />
                                                    {discountPercent > 0 && (
                                                        <Badge
                                                            bg="danger"
                                                            className="position-absolute top-0 start-0 m-2"
                                                        >
                                                            -{discountPercent}%
                                                        </Badge>
                                                    )}

                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                                        onClick={() => handleRemoveFavorite(dish.id, dish.name)}
                                                        disabled={removingId === dish.id}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        {removingId === dish.id ? (
                                                            <Spinner animation="border" size="sm"/>
                                                        ) : (
                                                            <Trash2 size={18} color={brandColor}/>
                                                        )}
                                                    </Button>
                                                </div>

                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title
                                                        className="fw-bold mb-2"
                                                        style={{
                                                            fontSize: '1rem',
                                                            height: '48px',
                                                            overflow: 'hidden',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleViewDetail(dish.id)}
                                                    >
                                                        {dish.name}
                                                    </Card.Title>

                                                    <div className="text-muted small mb-2">
                                                        <small>{dish.merchantName}</small>
                                                    </div>

                                                    <div
                                                        className="mt-auto d-flex justify-content-between align-items-center">
                                                        <div className="d-flex flex-column">
                                                            {dish.discountPrice && dish.discountPrice < dish.price ? (
                                                                <>
                                                                    <span className="fw-bold text-danger"
                                                                          style={{fontSize: '1.1rem'}}>
                                                                        {new Intl.NumberFormat('vi-VN').format(dish.discountPrice)}đ
                                                                    </span>
                                                                    <span
                                                                        className="text-muted text-decoration-line-through"
                                                                        style={{fontSize: '0.75rem'}}>
                                                                        {new Intl.NumberFormat('vi-VN').format(dish.price)}đ
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="fw-bold text-danger"
                                                                      style={{fontSize: '1.1rem'}}>
                                                                    {new Intl.NumberFormat('vi-VN').format(dish.price)}đ
                                                                </span>
                                                            )}
                                                        </div>

                                                        <Button
                                                            style={{color: brandColor}}
                                                            variant="light"
                                                            className="rounded-circle shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddToCart(dish.id);
                                                            }}
                                                            disabled={isAddingToCart}
                                                        >
                                                            {isAddingToCart ? (
                                                                <Spinner animation="border" size="sm"/>
                                                            ) : (
                                                                <ShoppingCart size={18}/>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>

                            {/* Pagination - Thanh điều hướng trang */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-5">
                                    <nav aria-label="Pagination">
                                        <ul className="pagination align-items-center">
                                            {/* Nút Trước (Thay bằng icon <) */}
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link d-flex align-items-center justify-content-center"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        marginRight: '5px',
                                                        color: currentPage === 1 ? '#6c757d' : brandColor,
                                                        border: '1px solid #dee2e6'
                                                    }}
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                            </li>

                                            {/* Các số trang */}
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <li
                                                        key={pageNumber}
                                                        className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pageNumber)}
                                                            style={
                                                                currentPage === pageNumber
                                                                    ? {
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '8px',
                                                                        margin: '0 3px',
                                                                        backgroundColor: brandColor,
                                                                        borderColor: brandColor,
                                                                        color: 'white'
                                                                    }
                                                                    : {
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '8px',
                                                                        margin: '0 3px',
                                                                        color: brandColor,
                                                                        border: '1px solid #dee2e6'
                                                                    }
                                                            }
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    </li>
                                                );
                                            })}

                                            {/* Nút Sau (Thay bằng icon >) */}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link d-flex align-items-center justify-content-center"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        marginLeft: '5px',
                                                        color: currentPage === totalPages ? '#6c757d' : brandColor,
                                                        border: '1px solid #dee2e6'
                                                    }}
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </div>

            <style>{`
                .hover-shadow { transition: all 0.3s ease; }
                .hover-shadow:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important; }
                .page-item.active .page-link { color: white !important; }
            `}</style>
        </>
    );
};

export default FavoriteDishesPage;