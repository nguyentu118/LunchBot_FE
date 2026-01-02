import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, Phone, Store, UtensilsCrossed, ChevronLeft, ChevronRight, Ticket, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import axiosInstance from "../../config/axiosConfig.ts";
import { Spinner, Alert, Container, Card, Row, Col, Badge, Pagination, Modal, Button } from 'react-bootstrap';
import Navigation from "../../components/layout/Navigation";
import CouponList from "../../features/coupon/components/CouponList";
import { useCart } from "../cart/hooks/useCart.ts";

interface Dish {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    preparationTime: number;
    images?: string[];
    isRecommended?: boolean;
}

const MerchantProfilePage = () => {
    const { merchantId } = useParams<{ merchantId: string }>();
    const { addToCart, isLoading: cartLoading } = useCart();

    const [merchant, setMerchant] = useState<any>(null);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDishes, setLoadingDishes] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const dishesPerPage = 8;

    useEffect(() => {
        if (merchantId) {
            fetchMerchantProfile();
            fetchMerchantDishes();
        }
    }, [merchantId]);

    const fetchMerchantProfile = async () => {
        if (!merchantId) return;

        try {
            setLoading(true);
            const response = await axiosInstance.get(`/merchants/profile/${merchantId}`);
            setMerchant(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải thông tin nhà hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchantDishes = async () => {
        if (!merchantId) return;

        try {
            setLoadingDishes(true);
            const url = `/merchants/profile/${merchantId}/dishes`;
            const response = await axiosInstance.get(url);

            const parsedDishes = (response.data || []).map((dish: any) => {
                let images = dish.images || dish.imagesUrls || [];

                if (typeof images === 'string') {
                    try {
                        images = JSON.parse(images);
                    } catch (e) {
                        images = [];
                    }
                }

                if (!Array.isArray(images)) {
                    images = [];
                }

                return {
                    ...dish,
                    images: images,
                    // Ensure discountPrice is properly parsed as number
                    discountPrice: dish.discountPrice ? Number(dish.discountPrice) : undefined
                };
            });

            setDishes(parsedDishes);
        } catch (err: any) {
            setDishes([]);
        } finally {
            setLoadingDishes(false);
        }
    };

    const formatTime = (time: string) => {
        if (!time) return null;
        return time.substring(0, 5);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleDishClick = (dish: Dish) => {
        setSelectedDish(dish);
        setQuantity(1);
        setCurrentImageIndex(0);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDish(null);
        setQuantity(1);
        setCurrentImageIndex(0);
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCartFromCard = async (e: React.MouseEvent, dishId: number) => {
        e.stopPropagation();
        await addToCart(dishId, 1);
    };

    const handleAddToCartFromModal = async () => {
        if (selectedDish) {
            await addToCart(selectedDish.id, quantity);
            handleCloseModal();
        }
    };
    
    // Pagination logic
    const indexOfLastDish = currentPage * dishesPerPage;
    const indexOfFirstDish = indexOfLastDish - dishesPerPage;
    const currentDishes = dishes.slice(indexOfFirstDish, indexOfLastDish);
    const totalPages = Math.ceil(dishes.length / dishesPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Spinner animation="border" variant="danger" />
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            <Navigation />

            <Container className="py-4">
                {error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <>
                        {/* Merchant Profile Section */}
                        <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-4">
                            <div className="bg-danger" style={{ height: '120px', opacity: 0.9 }}></div>

                            <div className="px-4 pb-4" style={{ marginTop: '-30px' }}>
                                <div className="d-flex align-items-end mb-3">
                                    <div className="position-relative">
                                        {merchant?.avatarUrl ? (
                                            <img
                                                src={merchant.avatarUrl}
                                                className="rounded-circle border border-4 border-white shadow"
                                                style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                                                alt="avatar"
                                            />
                                        ) : (
                                            <div className="rounded-circle border border-4 border-white shadow bg-light d-flex align-items-center justify-content-center"
                                                 style={{ width: '90px', height: '90px' }}>
                                                <Store size={35} className="text-secondary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ms-3 mb-2">
                                        <h2 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
                                            {merchant?.restaurantName}
                                        </h2>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6 d-flex align-items-center text-muted">
                                        <MapPin size={18} className="me-2 text-danger" />
                                        <span className="text-truncate">
                                            <strong className="text-dark">Địa chỉ: </strong>
                                            {merchant?.address || 'Địa chỉ đang được cập nhật'}
                                        </span>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center text-muted">
                                        <Phone size={18} className="me-2 text-danger" />
                                        <span>
                                            <strong className="text-dark">Số điện thoại: </strong>
                                            {merchant?.phone || 'Chưa có số điện thoại'}
                                        </span>
                                    </div>
                                    <div className="col-md-12 d-flex align-items-center text-muted mt-2">
                                        <Clock size={18} className="me-2 text-danger" />
                                        <span>
                                            <strong className="text-dark">Giờ hoạt động: </strong>
                                            {formatTime(merchant?.openTime) || '08:00'} - {formatTime(merchant?.closeTime) || '21:00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
                            <div className="d-flex align-items-center mb-4">
                                <Ticket size={24} className="text-danger me-2" />
                                <h3 className="fw-bold mb-0">Mã giảm giá</h3>
                            </div>

                            <CouponList
                                merchantId={Number(merchantId)}
                                onlyActive={true}
                                showMerchantView={false}
                                brandColor="#dc3545"
                                emptyMessage="Nhà hàng chưa có mã giảm giá nào"
                            />
                        </div>

                        {/* Dishes Section */}
                        <div className="bg-white rounded-3 shadow-sm p-4">
                            <div className="d-flex align-items-center mb-4">
                                <UtensilsCrossed size={24} className="text-danger me-2" />
                                <h3 className="fw-bold mb-0">Thực đơn</h3>
                                <Badge bg="danger" className="ms-2">{dishes.length} món</Badge>
                            </div>

                            {loadingDishes ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="danger" />
                                    <p className="text-muted mt-2">Đang tải thực đơn...</p>
                                </div>
                            ) : dishes.length === 0 ? (
                                <div className="text-center py-5">
                                    <UtensilsCrossed size={48} className="text-muted mb-3" />
                                    <p className="text-muted">Nhà hàng chưa có món ăn nào</p>
                                </div>
                            ) : (
                                <>
                                    <Row className="g-4">
                                        {currentDishes.map((dish) => {
                                            const hasDiscount = dish.discountPrice != null && dish.discountPrice > 0 && dish.discountPrice < dish.price;
                                            const finalPrice = hasDiscount ? dish.discountPrice : dish.price;

                                            return (
                                                <Col key={dish.id} xs={12} sm={6} md={4} lg={3}>
                                                    <Card
                                                        className="h-100 border-0 shadow-sm"
                                                        style={{
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onClick={() => handleDishClick(dish)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '';
                                                        }}
                                                    >
                                                        {/* Dish Image */}
                                                        <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                                                            {dish.images && dish.images.length > 0 ? (
                                                                <Card.Img
                                                                    variant="top"
                                                                    src={dish.images[0]}
                                                                    style={{
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                                                    <UtensilsCrossed size={40} className="text-muted" />
                                                                </div>
                                                            )}

                                                            {/* Recommended Badge */}
                                                            {dish.isRecommended && (
                                                                <Badge
                                                                    bg="warning"
                                                                    className="position-absolute top-0 start-0 m-2"
                                                                >
                                                                    ⭐ Nổi bật
                                                                </Badge>
                                                            )}

                                                            {/* Discount Badge */}
                                                            {hasDiscount && (
                                                                <Badge
                                                                    bg="danger"
                                                                    className="position-absolute top-0 end-0 m-2"
                                                                >
                                                                    -{Math.round((1 - dish.discountPrice! / dish.price) * 100)}%
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <Card.Body className="d-flex flex-column p-3">
                                                            <Card.Title className="fw-bold mb-2" style={{ fontSize: '1rem' }}>
                                                                {dish.name}
                                                            </Card.Title>

                                                            <Card.Text
                                                                className="text-muted small flex-grow-1"
                                                                style={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}
                                                            >
                                                                {dish.description || 'Món ăn ngon'}
                                                            </Card.Text>

                                                            {/* Price and Cart Button */}
                                                            <div className="d-flex align-items-center justify-content-between mt-2">
                                                                <div>
                                                                    {hasDiscount ? (
                                                                        <>
                                                                            <div className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>
                                                                                {formatPrice(finalPrice!)}
                                                                            </div>
                                                                            <div className="text-muted text-decoration-line-through small">
                                                                                {formatPrice(dish.price)}
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>
                                                                            {formatPrice(dish.price)}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Add to Cart Button */}
                                                                <button
                                                                    onClick={(e) => handleAddToCartFromCard(e, dish.id)}
                                                                    className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                                                    disabled={cartLoading}
                                                                    style={{
                                                                        width: '42px',
                                                                        height: '42px',
                                                                        transition: 'transform 0.2s',
                                                                        opacity: cartLoading ? 0.6 : 1
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (!cartLoading) {
                                                                            e.currentTarget.style.transform = 'scale(1.1)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                    title="Thêm vào giỏ hàng"
                                                                >
                                                                    <ShoppingCart size={18} style={{ color: "#FF5E62" }} />
                                                                </button>
                                                            </div>

                                                            {/* Preparation Time */}
                                                            {dish.preparationTime && (
                                                                <div className="small text-muted d-flex align-items-center mt-2">
                                                                    <Clock size={14} className="me-1 text-success" />
                                                                    Thời gian: <strong className="ms-1">{dish.preparationTime} phút</strong>
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center mt-5">
                                            <Pagination className="mb-0">
                                                <Pagination.Prev
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft size={18} />
                                                </Pagination.Prev>

                                                {[...Array(totalPages)].map((_, index) => {
                                                    const pageNumber = index + 1;

                                                    if (
                                                        pageNumber === 1 ||
                                                        pageNumber === totalPages ||
                                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <Pagination.Item
                                                                key={pageNumber}
                                                                active={pageNumber === currentPage}
                                                                onClick={() => handlePageChange(pageNumber)}
                                                            >
                                                                {pageNumber}
                                                            </Pagination.Item>
                                                        );
                                                    } else if (
                                                        pageNumber === currentPage - 2 ||
                                                        pageNumber === currentPage + 2
                                                    ) {
                                                        return <Pagination.Ellipsis key={pageNumber} disabled />;
                                                    }
                                                    return null;
                                                })}

                                                <Pagination.Next
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <ChevronRight size={18} />
                                                </Pagination.Next>
                                            </Pagination>
                                        </div>
                                    )}

                                    {/* Page info */}
                                    <div className="text-center mt-3 text-muted small">
                                        Hiển thị {indexOfFirstDish + 1}-{Math.min(indexOfLastDish, dishes.length)} trong tổng số {dishes.length} món
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </Container>

            {/* Dish Detail Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
                <Modal.Header className="border-0 pb-0 position-relative">
                    <Button
                        variant="light"
                        className="rounded-circle position-absolute top-0 end-0 m-3"
                        onClick={handleCloseModal}
                        style={{
                            width: '40px',
                            height: '40px',
                            zIndex: 10
                        }}
                    >
                        <X size={20} />
                    </Button>
                </Modal.Header>
                <Modal.Body className="pt-0 px-4 pb-4">
                    {selectedDish && (
                        <Row>
                            {/* Image Section */}
                            <Col md={6} className="mb-4 mb-md-0">
                                <div
                                    className="position-relative rounded-3 overflow-hidden mb-3"
                                    style={{ height: '400px' }}
                                >
                                    {selectedDish.images && selectedDish.images.length > 0 ? (
                                        <>
                                            <img
                                                src={selectedDish.images[currentImageIndex]}
                                                alt={selectedDish.name}
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />

                                            {/* Image Counter - Centered at bottom */}
                                            {selectedDish.images.length > 1 && (
                                                <div
                                                    className="position-absolute bottom-0 start-50 translate-middle-x mb-3 px-3 py-1 rounded-pill bg-dark text-white"
                                                    style={{ opacity: 0.8, fontSize: '0.875rem' }}
                                                >
                                                    {currentImageIndex + 1} / {selectedDish.images.length}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                            <UtensilsCrossed size={60} className="text-muted" />
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Gallery - Only show if multiple images */}
                                {selectedDish.images && selectedDish.images.length > 1 && (
                                    <div className="d-flex justify-content-center gap-2">
                                        {selectedDish.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className="rounded-2 overflow-hidden"
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    cursor: 'pointer',
                                                    border: currentImageIndex === index ? '3px solid #dc3545' : '2px solid #e0e0e0',
                                                    opacity: currentImageIndex === index ? 1 : 0.6,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => setCurrentImageIndex(index)}
                                                onMouseEnter={(e) => {
                                                    if (currentImageIndex !== index) {
                                                        e.currentTarget.style.opacity = '0.8';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentImageIndex !== index) {
                                                        e.currentTarget.style.opacity = '0.6';
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${selectedDish.name} ${index + 1}`}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Col>

                            {/* Details Section */}
                            <Col md={6}>
                                <div className="d-flex align-items-start justify-content-between mb-2">
                                    <h3 className="fw-bold mb-0">{selectedDish.name}</h3>
                                    {selectedDish.isRecommended && (
                                        <Badge bg="warning" text="dark">⭐ Nổi bật</Badge>
                                    )}
                                </div>

                                <p className="text-muted mb-3">
                                    {selectedDish.description || 'Món ăn ngon, được chế biến từ nguyên liệu tươi ngon'}
                                </p>

                                {/* Price */}
                                <div className="mb-4">
                                    {selectedDish.discountPrice && selectedDish.discountPrice < selectedDish.price ? (
                                        <>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <h4 className="fw-bold text-danger mb-0">
                                                    {formatPrice(selectedDish.discountPrice)}
                                                </h4>
                                                <Badge bg="danger">
                                                    -{Math.round((1 - selectedDish.discountPrice / selectedDish.price) * 100)}%
                                                </Badge>
                                            </div>
                                            <div className="text-muted text-decoration-line-through">
                                                {formatPrice(selectedDish.price)}
                                            </div>
                                        </>
                                    ) : (
                                        <h4 className="fw-bold text-danger mb-0">
                                            {formatPrice(selectedDish.price)}
                                        </h4>
                                    )}
                                </div>

                                {/* Preparation Time */}
                                {selectedDish.preparationTime && (
                                    <div className="d-flex align-items-center mb-4 text-muted">
                                        <Clock size={18} className="me-2 text-success" />
                                        <span>Thời gian chế biến: <strong>{selectedDish.preparationTime} phút</strong></span>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Số lượng</label>
                                    <div className="d-flex align-items-center gap-3">
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <Minus size={18} />
                                        </Button>
                                        <span className="fs-5 fw-bold" style={{ minWidth: '40px', textAlign: 'center' }}>
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => handleQuantityChange(1)}
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Total Price */}
                                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3">
                                    <span className="fw-semibold">Tổng cộng:</span>
                                    <span className="fs-4 fw-bold text-danger">
                                        {formatPrice((selectedDish.discountPrice && selectedDish.discountPrice < selectedDish.price
                                            ? selectedDish.discountPrice
                                            : selectedDish.price) * quantity)}
                                    </span>
                                </div>

                                {/* Add to Cart Button */}
                                <Button
                                    variant="danger"
                                    className="w-100 py-3 fw-bold"
                                    onClick={handleAddToCartFromModal}
                                    disabled={cartLoading}
                                >
                                    <ShoppingCart size={20} className="me-2" />
                                    {cartLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                </Button>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            <style>{`
                .pagination .page-link {
                    color: #dc3545;
                    border-color: #dee2e6;
                }

                .pagination .page-item.active .page-link {
                    background-color: #dc3545 !important;
                    border-color: #dc3545 !important;
                    color: #ffffff !important;
                }

                .pagination .page-link:hover {
                    color: #fff;
                    background-color: #dc3545;
                    border-color: #dc3545;
                }

                .pagination .page-item.disabled .page-link {
                    color: #6c757d;
                    background-color: #fff;
                    border-color: #dee2e6;
                }
            `}</style>
        </div>
    );
};

export default MerchantProfilePage;