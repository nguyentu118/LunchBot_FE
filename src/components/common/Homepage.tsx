import React, {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Carousel,
    Col,
    Container,
    Form,
    Image,
    InputGroup,
    Nav,
    Navbar,
    Row
} from 'react-bootstrap';
import './Homepage.css';
// Đã loại bỏ User, LogOut, Briefcase, Settings vì chúng đã ở trong UserDropdown.tsx
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
import {Link} from "react-router-dom";
// ⭐ IMPORT COMPONENT VÀ TYPE MỚI ⭐
import UserDropdown, {UserRole} from './UserDropdown';


interface Category {
    name: string;
    image: string;
    colorClass: string;
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


// --- Hàm hỗ trợ ---

const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(value);
};


const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [discountSlideIndex, setDiscountSlideIndex] = useState<number>(0);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<UserRole>(null);

    useEffect(() => {
        const checkAuthStatus = () => {
            // Lấy token và role từ localStorage
            const token = localStorage.getItem('token');
            const storedRole = localStorage.getItem('userRole');

            if (token && storedRole) {
                setIsLoggedIn(true);

                // Chuẩn hóa role trước khi set
                const normalizedRole = storedRole.trim().toUpperCase().replace(/^ROLE_/, '');
                console.log('Normalized role:', normalizedRole);

                setUserRole(normalizedRole as UserRole);
            } else {
                setIsLoggedIn(false);
                setUserRole(null);
            }
        };

        checkAuthStatus();
    }, []);

    // Hàm xử lý Đăng xuất
    const handleLogout = useCallback(() => {
        // Xóa token và role từ localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId'); // Nếu có

        setIsLoggedIn(false);
        setUserRole(null);

    }, []);

    // Dữ liệu Food Categories (kiểu Category[])
    const foodCategories: Category[] = [
        {name: 'Burger', image: '🍔', colorClass: 'bg-warning text-dark'},
        {name: 'Pizza', image: '🍕', colorClass: 'bg-danger text-white'},
        {name: 'Sushi', image: '🍣', colorClass: 'bg-info text-white'},
        {name: 'Pasta', image: '🍝', colorClass: 'bg-secondary text-white'},
        {name: 'Salad', image: '🥗', colorClass: 'bg-success text-white'},
        {name: 'Dessert', image: '🍰', colorClass: 'bg-pink-custom text-white'},
        {name: 'Coffee', image: '☕', colorClass: 'bg-dark text-white'},
        {name: 'Noodles', image: '🍜', colorClass: 'bg-primary text-white'},
    ];

    // Dữ liệu Discount Deals (kiểu Deal[])
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

    // Dữ liệu Popular Restaurants (kiểu Restaurant[])
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
            image: 'https://images.unsplash.com/photo-1525385444361-6c20d6c0eb74?w=400&h=300&fit=crop',
            favorite: true,
            deliveryFee: 'Miễn phí'
        },
    ];

    // State quản lý Favorites (kiểu Record<number, boolean>)
    const [favorites, setFavorites] = useState<Record<number, boolean>>(
        popularRestaurants.reduce((acc, r) => ({...acc, [r.id]: r.favorite}), {} as Record<number, boolean>)
    );

    // Hàm Toggle Favorite (kiểu useCallback)
    const toggleFavorite = useCallback((id: number) => {
        setFavorites(prev => ({...prev, [id]: !prev[id]}));
    }, []);

    // Auto slide cho Hero Carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % foodCategories.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [foodCategories.length]);

    // Logic cho Slider Ưu đãi (hiển thị 3 card, dùng margin/style thay vì Bootstrap Carousel)
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
                <Navbar
                    expand="md"
                    variant="dark"
                    className="shadow sticky-top"
                    style={{backgroundColor: '#FF5E62'}}
                >
                    <Container>
                        <Navbar.Brand href="#">
                            <div className="d-flex align-items-center">
                                {/* ... Logo */}
                                <div className="bg-white p-1 rounded shadow-sm me-2">
                                    <svg className="text-danger" style={{width: '24px', height: '24px'}}
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="h5 fw-bold mb-0 text-white">Lunch<span
                                        className="text-warning">Bot</span></h1>
                                    <p className="text-sm mb-0 text-white-50">Gợi ý món ngon mỗi ngày</p>
                                </div>
                            </div>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto align-items-center">
                                <Nav.Link href="#" className="text-white mx-1">🏠 Trang chủ</Nav.Link>
                                <Nav.Link href="#" className="text-white mx-1">🎁 Ưu đãi</Nav.Link>
                                <Nav.Link href="#" className="text-white mx-1">🍽️ Nhà hàng</Nav.Link>

                                {/* ⭐ SỬ DỤNG COMPONENT UserDropdown ĐÃ TÁCH FILE ⭐ */}
                                {isLoggedIn && userRole ? (
                                    <UserDropdown userRole={userRole} handleLogout={handleLogout}/>
                                ) : (
                                    // HIỂN THỊ KHI CHƯA ĐĂNG NHẬP (Nút Đăng nhập)
                                    <Button variant="light" className="ms-md-3 mt-2 mt-md-0 fw-bold">
                                        <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                                            📝 Đăng nhập
                                        </Link>
                                    </Button>
                                )}
                                {/* ⭐ HẾT LOGIC HIỂN THỊ ⭐ */}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                {/* Hero Section */}
                <div className="bg-gradient-primary-danger py-5 shadow-lg"
                     style={{backgroundColor: '#FF5E62', position: 'relative', overflow: 'hidden'}}>
                    <Container className="py-md-5">
                        <Row className="align-items-center">
                            {/* Left Content */}
                            <Col md={7} lg={6} className="text-white z-1">
                                <Alert variant="light"
                                       className="d-inline-block rounded-pill mb-4 py-2 px-4 shadow-sm">
                                            <span
                                                className="small fw-semibold text-danger">🎉 Giảm giá đến 50% hôm nay!</span>
                                </Alert>
                                <h1 className="display-5 fw-bold mb-4">
                                    Khám phá món ăn<br/>ngon nhất tại<br/>
                                    <span className="text-warning">Hà Nội</span>
                                </h1>
                                <p className="lead mb-4 text-white-75">
                                    Hàng nghìn nhà hàng, quán ăn với ưu đãi hấp dẫn
                                </p>

                                {/* Search Bar */}
                                <Card className="p-2 shadow-lg rounded-4 border-0">
                                    <Form className="d-flex flex-column flex-sm-row gap-2">
                                        <InputGroup className="bg-light rounded-3 p-1">
                                            <InputGroup.Text className="bg-light border-0">
                                                <Search size={20} className="text-muted"/>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Tìm món ăn, nhà hàng..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="border-0 bg-light"
                                            />
                                        </InputGroup>
                                        <InputGroup className="bg-light rounded-3 p-1">
                                            <InputGroup.Text className="bg-light border-0">
                                                <MapPin size={20} className="text-danger"/>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Địa chỉ giao hàng"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="border-0 bg-light"
                                            />
                                        </InputGroup>
                                        <Button variant="warning" type="submit"
                                                className="fw-bold px-4 shadow-sm">
                                            Tìm kiếm
                                        </Button>
                                    </Form>
                                </Card>
                            </Col>

                            {/* Right - Food Category Slider (Sử dụng Bootstrap Carousel) */}
                            <Col md={5} lg={6} className="mt-5 mt-md-0 d-flex justify-content-center">
                                <div style={{maxWidth: '350px', width: '100%'}}>
                                    <Carousel
                                        activeIndex={currentSlide}
                                        onSelect={(selectedIndex: number) => setCurrentSlide(selectedIndex)}
                                        controls={false}
                                        indicators={true}
                                        interval={3000}
                                    >
                                        {foodCategories.map((category, index) => (
                                            <Carousel.Item key={index}>
                                                <Card
                                                    className={`text-center p-5 rounded-4 border-0 shadow-lg ${category.colorClass}`}
                                                    style={{minHeight: '350px'}}>
                                                    <div
                                                        className="d-flex flex-column align-items-center justify-content-center">
                                                        <div style={{
                                                            fontSize: '100px',
                                                            marginBottom: '10px'
                                                        }}>{category.image}</div>
                                                        <h3 className="fw-bold h2">{category.name}</h3>
                                                    </div>
                                                </Card>
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                </div>
                            </Col>
                        </Row>
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

                    {/* Horizontal Card Slider (Cần CSS custom để làm hiệu ứng trượt) */}
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
                                        <Card.Text
                                            className="text-muted small mb-3">{deal.restaurant}</Card.Text>

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
                <footer className="bg-dark text-white pt-5 pb-4">
                    <Container>
                        <Row className="g-4 mb-4">
                            {/* 1. Company Info & Logo */}
                            <Col xs={12} md={6} lg={4}>
                                <div className="d-flex align-items-center space-x-2 mb-3">
                                    <div className="bg-danger p-2 rounded shadow-sm">
                                        <svg className="text-white" style={{width: '24px', height: '24px'}}
                                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                                        </svg>
                                    </div>
                                    <h3 className="h4 fw-bold mb-0">Lunch<span
                                        className="text-primary">Bot</span></h3>
                                </div>
                                <p className="text-muted small mb-3">
                                    Nền tảng đặt đồ ăn và giao hàng hàng đầu tại Việt Nam. Đảm bảo chất lượng,
                                    tốc độ và dịch vụ khách hàng 24/7.
                                </p>
                                <div className="d-flex gap-3">
                                    <a href="#" className="text-muted text-decoration-none"><Facebook
                                        size={24}/></a>
                                    <a href="#" className="text-muted text-decoration-none"><Instagram
                                        size={24}/></a>
                                    <a href="#" className="text-muted text-decoration-none"><Twitter size={24}/></a>
                                    <a href="#" className="text-muted text-decoration-none"><Youtube size={24}/></a>
                                </div>
                            </Col>

                            {/* 2. Dịch vụ */}
                            <Col xs={6} md={3} lg={2}>
                                <h4 className="h6 fw-semibold mb-3 text-primary">Dịch vụ</h4>
                                <ul className="list-unstyled small">
                                    <li><a href="#" className="text-muted text-decoration-none">Tìm kiếm Nhà
                                        hàng</a></li>
                                    <li><a href="#" className="text-muted text-decoration-none">Ưu đãi hôm
                                        nay</a></li>
                                    <li><a href="#" className="text-muted text-decoration-none">Giao hàng siêu
                                        tốc</a></li>
                                    <li><a href="#" className="text-muted text-decoration-none">Theo dõi đơn
                                        hàng</a></li>
                                </ul>
                            </Col>

                            {/* 3. Công ty */}
                            <Col xs={6} md={3} lg={2}>
                                <h4 className="h6 fw-semibold mb-3 text-primary">Công ty</h4>
                                <ul className="list-unstyled small">
                                    <li><a href="#" className="text-muted text-decoration-none">Về chúng tôi</a>
                                    </li>
                                    <li><a href="#" className="text-muted text-decoration-none">Tuyển dụng</a>
                                    </li>
                                    <li><a href="#" className="text-muted text-decoration-none">Blog Tin tức</a>
                                    </li>
                                    <li><a href="#" className="text-muted text-decoration-none">Trở thành đối
                                        tác</a></li>
                                </ul>
                            </Col>

                            {/* 4. Hỗ trợ & Liên hệ */}
                            <Col xs={12} md={6} lg={4}>
                                <h4 className="h6 fw-semibold mb-3 text-primary">Hỗ trợ</h4>
                                <ul className="list-unstyled small">
                                    <li><a href="#" className="text-muted text-decoration-none">Trung tâm trợ
                                        giúp</a></li>
                                    <li><a href="#" className="text-muted text-decoration-none">Điều khoản dịch
                                        vụ</a></li>
                                    <li><a href="#" className="text-muted text-decoration-none">Chính sách bảo
                                        mật</a></li>
                                </ul>
                                <h4 className="h6 fw-semibold mt-4 mb-3 text-primary">Liên hệ</h4>

                                <ul className="list-unstyled small">
                                    <li className="d-flex align-items-center text-muted mb-1">
                                        <Phone size={16} className="me-2 text-danger"/>
                                        +84 987 654 321
                                    </li>

                                    <li className="d-flex align-items-center text-muted">
                                        <Mail size={16} className="me-2 text-danger"/>
                                        support@lunchbot.vn
                                    </li>
                                </ul>

                                {/* Copyright */}
                                <div className="border-top border-secondary pt-4 mt-4 text-center">
                                    <p className="text-muted small mb-0">
                                        © {new Date().getFullYear()} LunchBot. Đã đăng ký bản quyền. Được phát triển bởi
                                        CodeGym Vietnam.
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </footer>
            </div>
        </div>

    );
}

export default HomePage;