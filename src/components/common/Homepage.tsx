import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Badge, Button, Card, Col, Container, Form, Image, InputGroup, Row} from 'react-bootstrap';
import './Homepage.css';
import {
    ChevronLeft, ChevronRight, Clock, Facebook, Heart, Instagram,
    Mail, MapPin, Phone, Search, Star, Twitter, Youtube, Zap
} from 'lucide-react';
import Navigation from '../layout/Navigation';
import SuggestedDishesSection from '../../features/dish/SuggestedDishesSection.tsx';
import TopDiscountsSection from '../../features/dish/TopDiscountsSection.tsx';
import useCategoriesWithDishes from "../../features/category/hooks/useCategoriesWithDishes.ts";
import {CategoryIconWithBackground} from './CategoryIconMapper.tsx';
import usePopularMerchants from '../../features/merchants/hooks/usePopularMerchants';
import {PopularMerchantDto} from "../../features/merchants/types/merchant.ts";

interface CategoryDisplay {
    id: number;
    name: string;
    iconUrl: string;
    restaurantCount: number;
    colorClass: string;
}

interface Restaurant {
    id: number;
    name: string;
    cuisine: string;
    time: string;
    price: string;
    rating: number;
    reviews: string;
    image: string;
    favorite: boolean;
    deliveryFee: string;
}

const formatMerchantForDisplay = (merchant: PopularMerchantDto): Restaurant => {
    console.log('🔄 Formatting merchant:', merchant);

    return {
        id: merchant.id,
        name: merchant.name || 'Nhà hàng',

        // ✅ Sử dụng cuisine thay vì description
        cuisine: merchant.cuisine || 'Món Việt',

        // ✅ Sử dụng deliveryTime từ backend
        time: merchant.deliveryTime || '20-30 phút',

        // ✅ Sử dụng priceRange thay vì tính toán từ averagePrice
        price: merchant.priceRange || '50.000₫ - 150.000₫',

        // ✅ Rating từ backend
        rating: merchant.rating || 4.5,

        // ✅ Reviews từ backend (đã format sẵn)
        reviews: merchant.reviews || '0',

        // ✅ Sử dụng imageUrl thay vì avatarUrl
        image: merchant.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',

        favorite: false,

        // ✅ DeliveryFee từ backend
        deliveryFee: merchant.deliveryFee || 'Miễn phí'
    };
};

const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(true);


    // ⭐ Fetch categories từ API
    const {categories: apiCategories, loading: categoriesLoading, error: categoriesError} = useCategoriesWithDishes();

    const {merchants: apiMerchants, loading: merchantsLoading, error: merchantsError} = usePopularMerchants(8);

    const popularRestaurants: Restaurant[] = apiMerchants.map(formatMerchantForDisplay);

    // ⭐ THÊM DÒNG NÀY ĐỂ DEBUG
    console.log('🏪 API Merchants Data:', apiMerchants);
    console.log('🏪 First Merchant:', apiMerchants[0]);


    // ⭐ Hàm generate màu cho categories
    const getCategoryColor = (index: number) => {
        const colors = [
            {bg: '#fff5f5', icon: '#dc3545'}, // Đỏ
            {bg: '#fff8e1', icon: '#ff9800'}, // Cam
            {bg: '#f3e5f5', icon: '#9c27b0'}, // Tím
            {bg: '#e8f5e9', icon: '#4caf50'}, // Xanh lá
            {bg: '#e3f2fd', icon: '#2196f3'}, // Xanh dương
            {bg: '#fce4ec', icon: '#e91e63'}, // Hồng
            {bg: '#fff3e0', icon: '#ff6f00'}, // Vàng cam
            {bg: '#f1f8e9', icon: '#689f38'}, // Xanh olive
        ];
        return colors[index % colors.length];
    };

    // ⭐ Map dữ liệu từ API
    const foodCategories: CategoryDisplay[] = apiCategories.map((cat, index) => {
        const colorScheme = getCategoryColor(index);
        return {
            id: cat.id,
            name: cat.name,
            iconUrl: cat.iconUrl,
            restaurantCount: cat.restaurantCount,
            colorClass: '', // Không dùng nữa vì dùng dynamic color
            backgroundColor: colorScheme.bg,
            iconColor: colorScheme.icon
        };
    });

    // Tạo infinite categories
    const infiniteCategories = [...foodCategories, ...foodCategories, ...foodCategories];

    // ⭐ CẤU HÌNH SLIDER
    const itemWidth = 130;
    const gap = 12;
    const itemWidthWithGap = itemWidth + gap;
    const totalOriginalItems = foodCategories.length;

    // ⭐ Set initial slide position
    useEffect(() => {
        if (totalOriginalItems > 0) {
            setCurrentSlide(totalOriginalItems);
        }
    }, [totalOriginalItems]);

    // ⭐ Next slide handler
    const nextCategorySlide = useCallback(() => {
        if (totalOriginalItems === 0) return;
        setIsTransitioning(true);
        setCurrentSlide(prev => prev + 1);
    }, [totalOriginalItems]);

    // ⭐ Previous slide handler
    const prevCategorySlide = useCallback(() => {
        if (totalOriginalItems === 0) return;
        setIsTransitioning(true);
        setCurrentSlide(prev => prev - 1);
    }, [totalOriginalItems]);

    // ⭐ Infinite loop logic
    useEffect(() => {
        if (totalOriginalItems === 0) return;

        if (currentSlide >= totalOriginalItems * 2) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentSlide(totalOriginalItems);
            }, 400);
        } else if (currentSlide < totalOriginalItems) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentSlide(totalOriginalItems * 2 - 1);
            }, 400);
        }
    }, [currentSlide, totalOriginalItems]);

    // ⭐ Re-enable transition
    useEffect(() => {
        if (!isTransitioning) {
            const timeout = setTimeout(() => {
                setIsTransitioning(true);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [isTransitioning]);

    // ⭐ Auto slide
    useEffect(() => {
        if (foodCategories.length === 0) return;

        const timer = setInterval(() => {
            nextCategorySlide();
        }, 3000);
        return () => clearInterval(timer);
    }, [nextCategorySlide, foodCategories.length]);

    const [favorites, setFavorites] = useState<Record<number, boolean>>(
        popularRestaurants.reduce((acc, r) => ({...acc, [r.id]: r.favorite}), {} as Record<number, boolean>)
    );

    const toggleFavorite = useCallback((id: number) => {
        setFavorites(prev => ({...prev, [id]: !prev[id]}));
    }, []);

    return (
        <div className="homepage-wrapper bg-light">
            <div className="bg-light min-vh-100">
                <Navigation/>

                {/* Hero Section */}
                <div className="py-5 shadow-lg"
                     style={{
                         backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop)',
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         minHeight: '500px'
                     }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 0
                    }}></div>

                    <Container className="py-5" style={{position: 'relative', zIndex: 1}}>
                        <div className="text-center text-white mb-5">
                            <Alert variant="light" className="d-inline-block rounded-pill mb-4 py-2 px-4 shadow-sm">
                                <span className="small fw-semibold text-danger">
                                    <Zap size={20} className="me-2 text-danger" fill="currentColor"/>
                                    Giảm giá đến 50% hôm nay!
                                </span>
                            </Alert>
                            <h1 className="display-4 fw-bold mb-3" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                                Khám phá món ăn ngon nhất tại <span className="text-warning">Hà Nội</span> VN
                            </h1>

                            <Row className="justify-content-center mb-4">
                                <Col xs={12} lg={10} xl={9}>
                                    <Card className="p-2 shadow-lg rounded-4 border-0">
                                        <Form className="d-flex flex-column flex-md-row gap-2 align-items-stretch">
                                            <div className="d-flex gap-2 flex-grow-1">
                                                <InputGroup className="bg-light rounded-3 p-1 flex-grow-1">
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <Search size={20} className="text-muted"/>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Nhập vị trí giao hàng của bạn"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="border-0 bg-light"
                                                    />
                                                </InputGroup>
                                                <Button variant="light" className="border">
                                                    <MapPin size={20} className="text-danger"/>
                                                    <span className="ms-2 d-none d-lg-inline">Định vị</span>
                                                </Button>
                                            </div>
                                            <Button variant="danger" type="submit" className="fw-bold px-5 shadow-sm"
                                                    style={{minWidth: '120px'}}>
                                                Tìm kiếm
                                            </Button>
                                        </Form>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        {/* Food Categories Slider */}
                        <div className="mt-4">
                            <p className="text-white text-center mb-3"
                               style={{fontSize: '0.95rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                                Bún, Phở, Đồ chay, Gà Rán, Pizza, Burger, Cafe, Sinh tố, Nước ép,...
                            </p>

                            {/* Loading State */}
                            {categoriesLoading && (
                                <div className="text-center text-white py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <p className="mt-2">Đang tải danh mục...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {categoriesError && (
                                <Alert variant="danger" className="mx-auto" style={{maxWidth: '600px'}}>
                                    <strong>Lỗi:</strong> {categoriesError}
                                </Alert>
                            )}

                            {/* Success State - Slider */}
                            {!categoriesLoading && !categoriesError && foodCategories.length > 0 && (
                                <div className="position-relative">
                                    <Button
                                        variant="light"
                                        onClick={prevCategorySlide}
                                        className="rounded-circle shadow position-absolute start-0 top-50 translate-middle-y d-none d-lg-flex align-items-center justify-content-center"
                                        style={{zIndex: 10, width: '45px', height: '45px', padding: 0, left: '-20px'}}
                                    >
                                        <ChevronLeft size={24} className="text-dark"/>
                                    </Button>

                                    <div className="overflow-hidden">
                                        <div
                                            className="d-flex gap-3 pb-2"
                                            style={{
                                                transform: `translateX(-${currentSlide * itemWidthWithGap}px)`,
                                                transition: isTransitioning ? 'transform 0.4s ease-in-out' : 'none'
                                            }}
                                        >
                                            {infiniteCategories.map((category, index) => {
                                                const colorScheme = getCategoryColor(index % foodCategories.length);
                                                return (
                                                    <div
                                                        key={`${category.id}-${index}`}
                                                        className="flex-shrink-0 text-center"
                                                        style={{width: `${itemWidth}px`, cursor: 'pointer'}}
                                                    >
                                                        <Card
                                                            className="border-0 shadow-sm bg-white rounded-4 overflow-hidden h-100"
                                                            style={{transition: 'transform 0.2s'}}
                                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                        >
                                                            <div className="p-3">
                                                                <CategoryIconWithBackground
                                                                    categoryName={category.name}
                                                                    size={36}
                                                                    backgroundColor={colorScheme.bg}
                                                                    color={colorScheme.icon}
                                                                />
                                                                <h6 className="fw-bold mb-1 text-dark mt-2">
                                                                    {category.name}
                                                                </h6>
                                                                <p className="text-muted mb-0"
                                                                   style={{fontSize: '0.75rem'}}>
                                                                    {category.restaurantCount} quán
                                                                </p>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Button
                                        variant="light"
                                        onClick={nextCategorySlide}
                                        className="rounded-circle shadow position-absolute end-0 top-50 translate-middle-y d-none d-lg-flex align-items-center justify-content-center"
                                        style={{zIndex: 10, width: '45px', height: '45px', padding: 0, right: '-20px'}}
                                    >
                                        <ChevronRight size={24} className="text-dark"/>
                                    </Button>
                                </div>
                            )}

                            {/* Empty State */}
                            {!categoriesLoading && !categoriesError && foodCategories.length === 0 && (
                                <Alert variant="info" className="mx-auto text-center" style={{maxWidth: '600px'}}>
                                    Chưa có danh mục nào. Vui lòng thêm dữ liệu vào database.
                                </Alert>
                            )}
                        </div>
                    </Container>
                </div>

                <TopDiscountsSection/>
                <SuggestedDishesSection/>

                {/* Popular Restaurants */}
                <div className="bg-white py-5">
                    <Container>
                        <div className="mb-5">
                            <h2 className="fw-bold mb-3 d-flex align-items-center">⭐ Nhà hàng nổi tiếng</h2>
                        </div>
                        {/* Loading State */}
                        {merchantsLoading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-3 text-muted">Đang tải danh sách nhà hàng...</p>
                            </div>
                        )}
                        {/* Error State */}
                        {merchantsError && (
                            <Alert variant="danger" className="text-center">
                                <strong>Lỗi:</strong> {merchantsError}
                            </Alert>
                        )}

                        {/* Success State */}
                        {!merchantsLoading && !merchantsError && popularRestaurants.length > 0 && (
                            <>
                                <Row className="g-4">
                                    {popularRestaurants.map((restaurant) => (
                                        <Col xs={12} sm={6} md={4} lg={3} key={restaurant.id}>
                                            <Card className="shadow-sm rounded-4 border-0 h-100">
                                                <div className="position-relative">
                                                    <Image
                                                        src={restaurant.image}
                                                        alt={restaurant.name}
                                                        fluid
                                                        className="rounded-top-4"
                                                        style={{height: '180px', objectFit: 'cover'}}
                                                    />
                                                    <Button
                                                        onClick={() => toggleFavorite(restaurant.id)}
                                                        variant="light"
                                                        className="rounded-circle p-2 position-absolute top-0 end-0 m-3 shadow-sm"
                                                    >
                                                        <Heart
                                                            size={20}
                                                            className={favorites[restaurant.id] ? 'text-danger fill-danger' : 'text-muted'}
                                                            fill={favorites[restaurant.id] ? '#FF5E62' : 'none'}
                                                            stroke={favorites[restaurant.id] ? '#FF5E62' : 'currentColor'}
                                                        />
                                                    </Button>
                                                    <Badge bg="primary"
                                                           className="position-absolute bottom-0 start-0 m-3 p-2 fw-bold shadow-sm">
                                                        <Star size={14} fill="white" className="me-1"/>
                                                        {restaurant.rating} ({restaurant.reviews})
                                                    </Badge>
                                                </div>

                                                <Card.Body className="p-3 d-flex flex-column">
                                                    <Card.Title
                                                        className="h5 fw-bold mb-1">{restaurant.name}</Card.Title>
                                                    <Card.Text
                                                        className="text-muted small mb-3">{restaurant.cuisine}</Card.Text>

                                                    <div
                                                        className="d-flex align-items-center justify-content-between small text-dark mb-3">
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Clock size={16} className="text-primary"/>
                                                            <span>{restaurant.time}</span>
                                                        </div>
                                                        <span
                                                            className="fw-semibold text-danger">{restaurant.price}</span>
                                                    </div>

                                                    <div
                                                        className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                                                <span className="small text-muted">
                                                    Phí giao: <span
                                                    className="fw-semibold text-success">{restaurant.deliveryFee}</span>
                                                </span>
                                                        <a href="#"
                                                           className="text-primary small fw-semibold text-decoration-none">
                                                            Xem chi tiết &rarr;
                                                        </a>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                <div className="text-center mt-5">
                                    <Button variant="danger" className="fw-bold px-4 py-2 shadow-lg">
                                        Xem tất cả nhà hàng
                                        <ChevronRight size={20} className="ms-2"/>
                                    </Button>
                                </div>
                            </>
                        )}
                        {/* Empty State */}
                        {!merchantsLoading && !merchantsError && popularRestaurants.length === 0 && (
                            <Alert variant="info" className="text-center">
                                Chưa có nhà hàng nào. Vui lòng thêm dữ liệu vào database.
                            </Alert>
                        )}
                    </Container>
                </div>

                {/* Footer */}
                <footer className="bg-dark text-white pt-5 pb-4">
                    <Container>
                        <Row className="g-4 mb-4">
                            <Col xs={12} md={6} lg={4}>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="bg-danger p-2 rounded shadow-sm">
                                        <svg className="text-white" style={{width: '24px', height: '24px'}}
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                                        </svg>
                                    </div>
                                    <h3 className="h4 fw-bold mb-0">Lunch<span className="text-primary">Bot</span></h3>
                                </div>
                                <p className="small mb-3" style={{color: '#adb5bd'}}>
                                    Nền tảng đặt đồ ăn và giao hàng hàng đầu tại Việt Nam.
                                </p>
                                <div className="d-flex gap-3">
                                    <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                        <Facebook size={24}/>
                                    </a>
                                    <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                        <Instagram size={24}/>
                                    </a>
                                    <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                        <Twitter size={24}/>
                                    </a>
                                    <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                        <Youtube size={24}/>
                                    </a>
                                </div>
                            </Col>

                            <Col xs={6} md={3} lg={2}>
                                <h4 className="h6 fw-semibold mb-3" style={{color: '#0d6efd'}}>Dịch vụ</h4>
                                <ul className="list-unstyled small">
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Tìm kiếm Nhà hàng
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Ưu đãi hôm nay
                                        </a>
                                    </li>
                                </ul>
                            </Col>

                            <Col xs={6} md={3} lg={2}>
                                <h4 className="h6 fw-semibold mb-3" style={{color: '#0d6efd'}}>Công ty</h4>
                                <ul className="list-unstyled small">
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Về chúng tôi
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Blog
                                        </a>
                                    </li>
                                </ul>
                            </Col>

                            <Col xs={12} md={6} lg={4}>
                                <h4 className="h6 fw-semibold mb-3" style={{color: '#0d6efd'}}>Liên hệ</h4>
                                <ul className="list-unstyled small">
                                    <li className="d-flex align-items-center mb-2" style={{color: '#adb5bd'}}>
                                        <Phone size={16} className="me-2" style={{color: '#dc3545'}}/>
                                        +84 987 654 321
                                    </li>
                                    <li className="d-flex align-items-center" style={{color: '#adb5bd'}}>
                                        <Mail size={16} className="me-2" style={{color: '#dc3545'}}/>
                                        support@lunchbot.vn
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                        <div className="border-top pt-4 mt-4 text-center">
                            <p className="small mb-0" style={{color: '#adb5bd'}}>
                                © {new Date().getFullYear()} LunchBot. Phát triển bởi CodeGym.
                            </p>
                        </div>
                    </Container>
                </footer>
            </div>
        </div>
    );
}

export default HomePage;