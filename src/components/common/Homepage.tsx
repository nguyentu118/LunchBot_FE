import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Image,
    InputGroup,
    Row
} from 'react-bootstrap';
import './Homepage.css';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Facebook,
    Heart,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Search,
    Star,
    Twitter,
    Youtube
} from 'lucide-react';
// Import Navigation Component
import Navigation from '../layout/Navigation';


interface Category {
    name: string;
    image: string;
    colorClass: string;
    restaurantCount: number;
}

interface Deal {
    id: number;
    title: string;
    restaurant: string;
    discount: string;
    originalPrice: number;
    discountPrice: number;
    image: string;
    badge: string;
    rating: number;
    time: string;
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


// Hàm hỗ trợ format tiền tệ
const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};


const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [discountSlideIndex, setDiscountSlideIndex] = useState<number>(0);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(true);

    // Dữ liệu Food Categories
    const foodCategories: Category[] = [
        {name: 'Burger', image: '🍔', colorClass: 'bg-warning text-dark', restaurantCount: 145},
        {name: 'Pizza', image: '🍕', colorClass: 'bg-danger text-white', restaurantCount: 128},
        {name: 'Sushi', image: '🍣', colorClass: 'bg-info text-white', restaurantCount: 89},
        {name: 'Pasta', image: '🍝', colorClass: 'bg-secondary text-white', restaurantCount: 112},
        {name: 'Salad', image: '🥗', colorClass: 'bg-success text-white', restaurantCount: 95},
        {name: 'Dessert', image: '🍰', colorClass: 'bg-pink-custom text-white', restaurantCount: 156},
        {name: 'Coffee', image: '☕', colorClass: 'bg-dark text-white', restaurantCount: 203},
        {name: 'Noodles', image: '🍜', colorClass: 'bg-primary text-white', restaurantCount: 167},
    ];

    const infiniteCategories = [...foodCategories, ...foodCategories, ...foodCategories];

    // ⭐ CẤU HÌNH SLIDER
    const itemWidth = 130;
    const gap = 12;
    const itemWidthWithGap = itemWidth + gap;
    const totalOriginalItems = foodCategories.length;

    // ⭐ BẮT ĐẦU TỪ BẢN SAO THỨ 2 (giữa)
    useEffect(() => {
        setCurrentSlide(totalOriginalItems);
    }, []);

    // ⭐ HÀM CHUYỂN SLIDE TIẾP THEO
    const nextCategorySlide = useCallback(() => {
        setIsTransitioning(true);
        setCurrentSlide(prev => prev + 1);
    }, []);

    // ⭐ HÀM CHUYỂN SLIDE TRƯỚC ĐÓ
    const prevCategorySlide = useCallback(() => {
        setIsTransitioning(true);
        setCurrentSlide(prev => prev - 1);
    }, []);

    // ⭐ XỬ LÝ INFINITE LOOP (Reset về giữa khi đến cuối hoặc đầu)
    useEffect(() => {
        // Nếu đến cuối bản sao thứ 2 (vị trí totalOriginalItems * 2)
        if (currentSlide >= totalOriginalItems * 2) {
            setTimeout(() => {
                setIsTransitioning(false); // Tắt transition
                setCurrentSlide(totalOriginalItems); // Nhảy về đầu bản sao thứ 2
            }, 400); // 400ms = thời gian transition
        }
        // Nếu về đầu bản sao thứ 1 (vị trí 0)
        else if (currentSlide < totalOriginalItems) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentSlide(totalOriginalItems * 2 - 1); // Nhảy về cuối bản sao thứ 2
            }, 400);
        }
    }, [currentSlide, totalOriginalItems]);

    // ⭐ BẬT LẠI TRANSITION SAU KHI RESET
    useEffect(() => {
        if (!isTransitioning) {
            setTimeout(() => {
                setIsTransitioning(true);
            }, 50);
        }
    }, [isTransitioning]);

    // ⭐ AUTO SLIDE MỖI 3 GIÂY
    useEffect(() => {
        const timer = setInterval(() => {
            nextCategorySlide();
        }, 1500);
        return () => clearInterval(timer);
    }, [nextCategorySlide]);


    // Dữ liệu Discount Deals
    const discountDeals: Deal[] = [
        {
            id: 1,
            title: 'Burger Combo Deal',
            restaurant: 'Burger King Express',
            discount: '50% OFF',
            originalPrice: 250000,
            discountPrice: 125000,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop',
            badge: 'HOT DEAL',
            rating: 4.5,
            time: '15-20 min'
        },
        {
            id: 2,
            title: 'Pizza Feast',
            restaurant: 'Pizza Hut Deluxe',
            discount: '40% OFF',
            originalPrice: 350000,
            discountPrice: 210000,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=350&fit=crop',
            badge: 'POPULAR',
            rating: 4.7,
            time: '25-30 min'
        },
        {
            id: 3,
            title: 'Sushi Premium Set',
            restaurant: 'Tokyo Sushi Bar',
            discount: '35% OFF',
            originalPrice: 450000,
            discountPrice: 292500,
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=350&fit=crop',
            badge: 'NEW',
            rating: 4.8,
            time: '20-25 min'
        },
        {
            id: 4,
            title: 'Pasta Italiano',
            restaurant: 'Italian Kitchen',
            discount: '45% OFF',
            originalPrice: 280000,
            discountPrice: 154000,
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=350&fit=crop',
            badge: 'TRENDING',
            rating: 4.6,
            time: '18-22 min'
        },
        {
            id: 5,
            title: 'Healthy Bowl',
            restaurant: 'Fresh & Green',
            discount: '30% OFF',
            originalPrice: 180000,
            discountPrice: 126000,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop',
            badge: 'HEALTHY',
            rating: 4.4,
            time: '10-15 min'
        },
        {
            id: 6,
            title: 'BBQ Ribs Special',
            restaurant: 'Smokehouse BBQ',
            discount: '55% OFF',
            originalPrice: 500000,
            discountPrice: 225000,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop',
            badge: 'BEST SELLER',
            rating: 4.9,
            time: '30-35 min'
        },
    ];

    // Dữ liệu Popular Restaurants
    const popularRestaurants: Restaurant[] = [
        {
            id: 1,
            name: "Phở Hà Nội",
            cuisine: 'Món Việt • Phở • Bún',
            time: '15-25 phút',
            price: '50.000₫ - 100.000₫',
            rating: 4.8,
            reviews: '2.5k+',
            image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop',
            favorite: false,
            deliveryFee: 'Miễn phí'
        },
        {
            id: 2,
            name: 'Gà Rán KFC',
            cuisine: 'Fastfood • Gà rán • Burger',
            time: '20-30 phút',
            price: '80.000₫ - 200.000₫',
            rating: 4.6,
            reviews: '5k+',
            image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
            favorite: true,
            deliveryFee: '15.000₫'
        },
        {
            id: 3,
            name: 'Lẩu Thái Tomyum',
            cuisine: 'Món Thái • Lẩu • Hải sản',
            time: '25-35 phút',
            price: '150.000₫ - 300.000₫',
            rating: 4.7,
            reviews: '1.8k+',
            image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&h=300&fit=crop',
            favorite: false,
            deliveryFee: '20.000₫'
        },
        {
            id: 4,
            name: 'Sushi Tokyo',
            cuisine: 'Nhật Bản • Sushi • Sashimi',
            time: '30-40 phút',
            price: '200.000₫ - 500.000₫',
            rating: 4.9,
            reviews: '3.2k+',
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
            favorite: true,
            deliveryFee: 'Miễn phí'
        },
        {
            id: 5,
            name: 'Bún Chả Hương Liên',
            cuisine: 'Món Việt • Bún chả • Nem',
            time: '15-20 phút',
            price: '40.000₫ - 80.000₫',
            rating: 4.5,
            reviews: '4.1k+',
            image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop',
            favorite: false,
            deliveryFee: 'Miễn phí'
        },
        {
            id: 6,
            name: 'Pizza 4P\'s',
            cuisine: 'Ý • Pizza • Pasta',
            time: '25-35 phút',
            price: '150.000₫ - 350.000₫',
            rating: 4.8,
            reviews: '6.7k+',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
            favorite: true,
            deliveryFee: '25.000₫'
        },
        {
            id: 7,
            name: 'Cơm Tấm Sườn Bì',
            cuisine: 'Món Việt • Cơm tấm • Sườn',
            time: '10-15 phút',
            price: '35.000₫ - 70.000₫',
            rating: 4.4,
            reviews: '2.9k+',
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
            favorite: false,
            deliveryFee: 'Miễn phí'
        },
        {
            id: 8,
            name: 'Trà Sữa Gong Cha',
            cuisine: 'Đồ uống • Trà sữa • Smoothie',
            time: '5-10 phút',
            price: '30.000₫ - 60.000₫',
            rating: 4.6,
            reviews: '8.3k+',
            image: 'http://gongcha.com.vn/wp-content/uploads/2019/11/Okinawa-Milk-Foam-Smoothie.png',
            favorite: true,
            deliveryFee: 'Miễn phí'
        },
    ];

    // State quản lý Favorites
    const [favorites, setFavorites] = useState<Record<number, boolean>>(
        popularRestaurants.reduce((acc, r) => ({...acc, [r.id]: r.favorite}), {} as Record<number, boolean>)
    );

    // Hàm Toggle Favorite
    const toggleFavorite = useCallback((id: number) => {
        setFavorites(prev => ({...prev, [id]: !prev[id]}));
    }, []);

    // Logic cho Slider ưu đãi
    const nextDiscountSlide = useCallback(() => {
        setDiscountSlideIndex((prev) => Math.min(prev + 1, discountDeals.length - 3));
    }, [discountDeals.length]);

    const prevDiscountSlide = useCallback(() => {
        setDiscountSlideIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    return (
        <div className="homepage-wrapper bg-light">
            <div className="bg-light min-vh-100">
                {/* Navigation Bar */}
                <Navigation/>
                {/* Hero Section - NEW DESIGN */}
                <div className="py-5 shadow-lg"
                     style={{
                         backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop)',
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         minHeight: '500px'
                     }}>
                    {/* Overlay */}
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
                        {/* Center Content */}
                        <div className="text-center text-white mb-5">
                            <Alert variant="light"
                                   className="d-inline-block rounded-pill mb-4 py-2 px-4 shadow-sm">
                                <span className="small fw-semibold text-danger">🎉 Giảm giá đến 50% hôm nay!</span>
                            </Alert>
                            <h1 className="display-4 fw-bold mb-3" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                                Khám phá món ăn ngon nhất tại <span className="text-warning">Hà Nội</span> VN
                            </h1>

                            {/* Search Bar - Centered */}
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
                                            <Button variant="danger" type="submit"
                                                    className="fw-bold px-5 shadow-sm"
                                                    style={{minWidth: '120px'}}>
                                                Tìm kiếm
                                            </Button>
                                        </Form>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        {/* Food Categories Horizontal Slider */}
                        <div className="mt-4">
                            <p className="text-white text-center mb-3" style={{fontSize: '0.95rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                                Bún, Phở, Đồ chay, Gà Rán, Pizza, Bugger, Cafe, Sinh tố, Nước ép,...
                            </p>
                            <div className="position-relative">
                                {/* Previous Button */}
                                <Button
                                    variant="light"
                                    onClick={prevCategorySlide}
                                    className="rounded-circle shadow position-absolute start-0 top-50 translate-middle-y d-none d-lg-flex align-items-center justify-content-center"
                                    style={{zIndex: 10, width: '45px', height: '45px', padding: 0, left: '-20px'}}
                                >
                                    <ChevronLeft size={24} className="text-dark"/>
                                </Button>

                                {/* Slider Container */}
                                <div className="overflow-hidden">
                                    <div
                                        className="d-flex gap-3 pb-2"
                                        style={{
                                            transform: `translateX(-${currentSlide * itemWidthWithGap}px)`,
                                            transition: isTransitioning ? 'transform 0.4s ease-in-out' : 'none'
                                        }}
                                    >
                                        {infiniteCategories.map((category, index) => (
                                            <div
                                                key={index}
                                                className="flex-shrink-0 text-center"
                                                style={{width: `${itemWidth}px`, cursor: 'pointer'}}
                                            >
                                                <Card className="border-0 shadow-sm bg-white rounded-4 overflow-hidden h-100"
                                                      style={{transition: 'transform 0.2s'}}
                                                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <div className="p-3">
                                                        <div style={{fontSize: '52px', marginBottom: '10px'}}>
                                                            {category.image}
                                                        </div>
                                                        <h6 className="fw-bold mb-1 text-dark">
                                                            {category.name}
                                                        </h6>
                                                        <p className="text-muted mb-0" style={{fontSize: '0.75rem'}}>
                                                            {category.restaurantCount} quán
                                                        </p>
                                                    </div>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Button */}
                                <Button
                                    variant="light"
                                    onClick={nextCategorySlide}
                                    className="rounded-circle shadow position-absolute end-0 top-50 translate-middle-y d-none d-lg-flex align-items-center justify-content-center"
                                    style={{zIndex: 10, width: '45px', height: '45px', padding: 0, right: '-20px'}}
                                >
                                    <ChevronRight size={24} className="text-dark"/>
                                </Button>
                            </div>
                        </div>
                    </Container>
                </div>

                {/* Discount Deals Section */}
                <Container className="py-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="h3 fw-bold text-dark mb-1">🔥 Ưu đãi hôm nay</h2>
                            <p className="text-muted">Món ăn giảm giá hot nhất - Đặt ngay kẻo lỡ!</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="light"
                                onClick={prevDiscountSlide}
                                disabled={discountSlideIndex === 0}
                                className="rounded-circle shadow-sm"
                            >
                                <ChevronLeft size={24} className="text-primary"/>
                            </Button>
                            <Button
                                variant="light"
                                onClick={nextDiscountSlide}
                                disabled={discountSlideIndex >= discountDeals.length - 3}
                                className="rounded-circle shadow-sm"
                            >
                                <ChevronRight size={24} className="text-primary"/>
                            </Button>
                        </div>
                    </div>

                    {/* Horizontal Card Slider */}
                    <div className="overflow-hidden">
                        <div
                            className="d-flex flex-row flex-nowrap gap-4 pb-3"
                            style={{
                                transform: `translateX(-${discountSlideIndex * (33.333)}%)`,
                                transition: 'transform 0.5s ease-in-out'
                            }}
                        >
                            {discountDeals.map((deal) => (
                                <Card
                                    key={deal.id}
                                    className="shadow-sm rounded-4 flex-shrink-0"
                                    style={{minWidth: '320px', width: '320px'}}
                                >
                                    <div className="position-relative">
                                        <Image
                                            src={deal.image}
                                            alt={deal.title}
                                            fluid
                                            className="rounded-top-4"
                                            style={{height: '180px', objectFit: 'cover'}}
                                        />
                                        <Badge bg="danger"
                                               className="position-absolute top-0 start-0 m-2 fw-bold p-2 shadow-sm">
                                            {deal.badge}
                                        </Badge>
                                        <Badge bg="warning"
                                               className="position-absolute top-0 end-0 m-2 fw-bold p-2 shadow-lg fs-6">
                                            {deal.discount}
                                        </Badge>
                                        <Badge bg="white"
                                               className="position-absolute bottom-0 start-0 m-2 p-2 shadow-sm text-dark">
                                            <Star size={14} fill="#FFA500" className="text-warning me-1"/>
                                            {deal.rating}
                                        </Badge>
                                    </div>

                                    <Card.Body className="p-3">
                                        <Card.Title className="h5 fw-bold mb-1">{deal.title}</Card.Title>
                                        <Card.Text className="text-muted small mb-3">{deal.restaurant}</Card.Text>

                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-1 text-muted small">
                                                <Clock size={16} className="text-primary"/>
                                                {deal.time}
                                            </div>
                                            <div className="text-end">
                                                <div className="text-muted small text-decoration-line-through">
                                                    {formatCurrency(deal.originalPrice)}
                                                </div>
                                                <div className="text-danger fw-bold h6 mb-0">
                                                    {formatCurrency(deal.discountPrice)}
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="danger" className="w-100 fw-bold shadow-sm">
                                            Đặt ngay
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Container>

                {/* Popular Restaurants Section */}
                <div className="bg-white py-5">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="h3 fw-bold text-dark mb-2">⭐ Nhà hàng nổi tiếng</h2>
                            <p className="text-muted">Được yêu thích nhất tại Hà Nội</p>
                            <div className="bg-primary mx-auto mt-3 rounded-pill"
                                 style={{width: '60px', height: '3px'}}></div>
                        </div>

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
                                            <Card.Title className="h5 fw-bold mb-1">{restaurant.name}</Card.Title>
                                            <Card.Text
                                                className="text-muted small mb-3">{restaurant.cuisine}</Card.Text>

                                            <div
                                                className="d-flex align-items-center justify-content-between small text-dark mb-3">
                                                <div className="d-flex align-items-center gap-1">
                                                    <Clock size={16} className="text-primary"/>
                                                    <span>{restaurant.time}</span>
                                                </div>
                                                <span className="fw-semibold text-danger">{restaurant.price}</span>
                                            </div>

                                            <div
                                                className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                                                <span className="small text-muted">Phí giao: <span
                                                    className="fw-semibold text-success">{restaurant.deliveryFee}</span></span>
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
                    </Container>
                </div>
                {/* Footer */}
                <footer className="bg-dark text-white pt-5 pb-4" style={{position: 'relative', zIndex: 1}}>
                    <Container>
                        <Row className="g-4 mb-4">
                            {/* Company Info & Logo */}
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
                                    Nền tảng đặt đồ ăn và giao hàng hàng đầu tại Việt Nam. Đảm bảo chất lượng,
                                    tốc độ và dịch vụ khách hàng 24/7.
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

                            {/* Dịch vụ */}
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
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Giao hàng siêu tốc
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Theo dõi đơn hàng
                                        </a>
                                    </li>
                                </ul>
                            </Col>

                            {/* Công ty */}
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
                                            Tuyển dụng
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Blog Tin tức
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Trở thành đối tác
                                        </a>
                                    </li>
                                </ul>
                            </Col>

                            {/* Hỗ trợ & Liên hệ */}
                            <Col xs={12} md={6} lg={4}>
                                <h4 className="h6 fw-semibold mb-3" style={{color: '#0d6efd'}}>Hỗ trợ</h4>
                                <ul className="list-unstyled small">
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Trung tâm trợ giúp
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Điều khoản dịch vụ
                                        </a>
                                    </li>
                                    <li className="mb-2">
                                        <a href="#" className="text-decoration-none" style={{color: '#adb5bd'}}>
                                            Chính sách bảo mật
                                        </a>
                                    </li>
                                </ul>
                                <h4 className="h6 fw-semibold mt-4 mb-3" style={{color: '#0d6efd'}}>Liên hệ</h4>
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
                        <div className="border-top pt-4 mt-4 text-center" style={{borderColor: '#495057 !important'}}>
                            <p className="small mb-0" style={{color: '#adb5bd'}}>
                                © {new Date().getFullYear()} LunchBot. Đã đăng ký bản quyền. Được phát triển bởi CodeGym.
                            </p>
                        </div>
                    </Container>
                </footer>
            </div>
        </div>
    );
}
export default HomePage