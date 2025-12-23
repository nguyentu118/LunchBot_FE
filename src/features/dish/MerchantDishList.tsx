import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, Phone, Store, UtensilsCrossed } from 'lucide-react';
import axiosInstance from "../../config/axiosConfig.ts";
import { Spinner, Alert, Container, Card, Row, Col, Badge } from 'react-bootstrap';
import Navigation from "../../components/layout/Navigation";

interface Dish {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    isRecommended?: boolean;
}

const MerchantProfilePage = () => {
    const { merchantId } = useParams<{ merchantId: string }>();

    const [merchant, setMerchant] = useState<any>(null);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDishes, setLoadingDishes] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔍 merchantId from params:', merchantId);

        if (merchantId) {
            fetchMerchantProfile();
            fetchMerchantDishes();
        } else {
            console.error('❌ merchantId is undefined!');
        }
    }, [merchantId]);

    const fetchMerchantProfile = async () => {
        if (!merchantId) return;

        try {
            setLoading(true);
            console.log('📡 Fetching merchant profile for ID:', merchantId);
            const response = await axiosInstance.get(`/merchants/profile/${merchantId}`);
            console.log('✅ Merchant profile:', response.data);
            setMerchant(response.data);
        } catch (err: any) {
            console.error('❌ Error fetching merchant profile:', err);
            setError(err.response?.data?.message || 'Không thể tải thông tin nhà hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchantDishes = async () => {
        if (!merchantId) {
            console.error('❌ Cannot fetch dishes: merchantId is undefined');
            return;
        }

        try {
            setLoadingDishes(true);
            const url = `/merchants/profile/${merchantId}/dishes`;
            console.log('📡 Fetching dishes from:', url);

            const response = await axiosInstance.get(url);
            console.log('✅ Dishes response:', response.data);
            setDishes(response.data || []);
        } catch (err: any) {
            console.error('❌ Error fetching dishes:', err);
            console.error('Error details:', err.response?.data);
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
                                <Row className="g-4">
                                    {dishes.map((dish) => (
                                        <Col key={dish.id} xs={12} sm={6} md={4} lg={3}>
                                            <Card className="h-100 border-0 shadow-sm hover-shadow transition">
                                                {/* Dish Image */}
                                                <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                                                    {dish.images && dish.images.length > 0 ? (
                                                        <Card.Img
                                                            variant="top"
                                                            src={dish.images[0]}
                                                            style={{
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                transition: 'transform 0.3s ease'
                                                            }}
                                                            className="dish-image"
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
                                                    {dish.discountPrice && dish.discountPrice < dish.price && (
                                                        <Badge
                                                            bg="danger"
                                                            className="position-absolute top-0 end-0 m-2"
                                                        >
                                                            -{Math.round((1 - dish.discountPrice / dish.price) * 100)}%
                                                        </Badge>
                                                    )}
                                                </div>

                                                <Card.Body className="d-flex flex-column">
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

                                                    <div className="mt-2">
                                                        {dish.discountPrice && dish.discountPrice < dish.price ? (
                                                            <>
                                                                <div className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>
                                                                    {formatPrice(dish.discountPrice)}
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
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    </>
                )}
            </Container>

            <style>{`
                .hover-shadow {
                    transition: box-shadow 0.3s ease, transform 0.3s ease;
                    cursor: pointer;
                }
                
                .hover-shadow:hover {
                    box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
                    transform: translateY(-4px);
                }

                .dish-image:hover {
                    transform: scale(1.05);
                }

                .transition {
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default MerchantProfilePage;