import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Search, X, Sliders } from 'lucide-react';
import { searchDishes } from './services/DishService';
import { DishSearchResponse } from './types/dish.types';
import Navigation from "../../components/layout/Navigation.tsx";
import DishCard from "./DishCard.tsx";
import useCategories from './hooks/useCategories.ts';

const DishSearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Data states
    const [dishes, setDishes] = useState<DishSearchResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);

    // Filter states
    const [searchName, setSearchName] = useState<string>(searchParams.get('name') || '');
    const [categoryName, setCategoryName] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [isRecommended, setIsRecommended] = useState<boolean | null>(null);

    // Fetch categories from API
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

    // Parse image URL helper
    const parseImageUrl = (imagesUrls: string | undefined): string => {
        try {
            if (!imagesUrls) return 'https://placehold.co/300x200?text=No+Image';
            const urls = JSON.parse(imagesUrls);
            return Array.isArray(urls) && urls.length > 0
                ? urls[0]
                : 'https://placehold.co/300x200?text=No+Image';
        } catch {
            return 'https://placehold.co/300x200?text=No+Image';
        }
    };

    // Main search function
    const performSearch = async (page: number = 0, overrideParams?: {name?: string}): Promise<void> => {
        setLoading(true);
        setError('');

        try {
            const requestParams = {
                name: overrideParams?.name || searchName || undefined,
                categoryName: categoryName || undefined,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                isRecommended: isRecommended !== null ? isRecommended : undefined,
                page,
                size: 9
            };

            const response = await searchDishes(requestParams);

            const transformedDishes = (response.content || []).map(dish => ({
                id: dish.id,
                name: dish.name,
                price: dish.price,
                imageUrl: parseImageUrl(dish.imagesUrls),
                merchantName: dish.restaurantName || 'Cửa hàng',
            }));

            setDishes(transformedDishes);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(response.number || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err: any) {
            console.error('Lỗi tìm kiếm:', err);
            setError('Có lỗi xảy ra khi tìm kiếm món ăn. Vui lòng thử lại!');
            setDishes([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto search from URL params on mount
    useEffect(() => {
        const nameParam = searchParams.get('name');
        if (nameParam?.trim()) {
            setSearchName(nameParam.trim());
            performSearch(0, { name: nameParam.trim() });
        }
    }, []);

    // Event handlers
    const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        performSearch(0);
    };

    const handleClearFilters = (): void => {
        setSearchName('');
        setCategoryName('');
        setMinPrice('');
        setMaxPrice('');
        setIsRecommended(null);
    };

    const handleDishClick = useCallback((dishId: number): void => {
        navigate(`/dishes/${dishId}`);
    }, [navigate]);

    const handlePageChange = (newPage: number): void => {
        performSearch(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Count active filters
    const activeFiltersCount = [categoryName, minPrice, maxPrice, isRecommended].filter(Boolean).length;

    return (
        <>
            <Navigation />

            <Container fluid className="py-4">
                <Row>
                    {/* LEFT SIDEBAR - FILTERS */}
                    <Col lg={3} className="mb-4">
                        <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
                            <Card.Header className="bg-danger text-white">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <Sliders size={20} className="me-2" />
                                        <h6 className="mb-0">Bộ lọc</h6>
                                    </div>
                                    {activeFiltersCount > 0 && (
                                        <Badge bg="warning" text="dark">{activeFiltersCount}</Badge>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSearch}>
                                    {/* Search Input */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Tìm kiếm món ăn</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-light">
                                                <Search size={18} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nhập tên món..."
                                                value={searchName}
                                                onChange={(e) => setSearchName(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <hr />

                                    {/* Category Filter */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Loại món</Form.Label>
                                        <Form.Select
                                            value={categoryName}
                                            onChange={(e) => setCategoryName(e.target.value)}
                                            disabled={categoriesLoading}
                                        >
                                            <option value="">
                                                {categoriesLoading ? 'Đang tải...' : 'Tất cả loại món'}
                                            </option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Form.Select>
                                        {categoriesError && (
                                            <small className="text-danger d-block mt-1">{categoriesError}</small>
                                        )}
                                    </Form.Group>

                                    {/* Recommended Filter */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Món đề xuất</Form.Label>
                                        <Form.Select
                                            value={isRecommended === null ? '' : String(isRecommended)}
                                            onChange={(e) => setIsRecommended(
                                                e.target.value === '' ? null : e.target.value === 'true'
                                            )}
                                        >
                                            <option value="">Tất cả món</option>
                                            <option value="true">Chỉ món đề xuất</option>
                                            <option value="false">Món thường</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <hr />

                                    {/* Action Buttons */}
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="danger"
                                            type="submit"
                                            disabled={loading}
                                            className="fw-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                                    Đang tìm...
                                                </>
                                            ) : (
                                                <>
                                                    <Search size={18} className="me-2" />
                                                    Tìm kiếm
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleClearFilters}
                                            disabled={loading || activeFiltersCount === 0}
                                            size="sm"
                                        >
                                            <X size={16} className="me-1" />
                                            Xóa bộ lọc
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* RIGHT CONTENT - RESULTS */}
                    <Col lg={9}>
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
                                <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                                <p className="mb-0">{error}</p>
                            </Alert>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
                                <p className="mt-3 text-muted fw-semibold">Đang tìm kiếm món ăn...</p>
                            </div>
                        ) : (
                            <>
                                {/* Results Header */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div>
                                        <h4 className="mb-1">
                                            {totalElements > 0 ? (
                                                <>
                                                    <span className="text-danger fw-bold">{totalElements}</span> món ăn
                                                </>
                                            ) : (
                                                dishes.length === 0 ? 'Tìm kiếm món ăn' : 'Không tìm thấy'
                                            )}
                                        </h4>
                                        {searchName && (
                                            <p className="text-muted small mb-0">
                                                Kết quả cho "{searchName}"
                                            </p>
                                        )}
                                    </div>
                                    {categoryName && (
                                        <Badge bg="danger" className="py-2 px-3">{categoryName}</Badge>
                                    )}
                                </div>

                                {/* Results or Empty State */}
                                {dishes.length === 0 ? (
                                    <Card className="text-center py-5 border-0 shadow-sm">
                                        <Card.Body>
                                            <Search size={64} className="text-muted mb-3" />
                                            <h5 className="text-muted mb-2">Chưa có kết quả</h5>
                                            <p className="text-muted mb-0">
                                                Sử dụng bộ lọc bên trái để tìm món ăn
                                            </p>
                                        </Card.Body>
                                    </Card>
                                ) : (
                                    <>
                                        {/* Dish Grid */}
                                        <Row xs={1} sm={2} lg={3} className="g-4 mb-4">
                                            {dishes.map(dish => (
                                                <Col key={dish.id}>
                                                    <DishCard dish={dish} onDishClick={handleDishClick} />
                                                </Col>
                                            ))}
                                        </Row>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <Card className="border-0 shadow-sm">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            disabled={currentPage === 0}
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                        >
                                                            « Trước
                                                        </Button>

                                                        <div className="d-flex gap-2">
                                                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                                let pageNum = currentPage;
                                                                if (totalPages <= 5) {
                                                                    pageNum = idx;
                                                                } else if (currentPage < 3) {
                                                                    pageNum = idx;
                                                                } else if (currentPage > totalPages - 3) {
                                                                    pageNum = totalPages - 5 + idx;
                                                                } else {
                                                                    pageNum = currentPage - 2 + idx;
                                                                }

                                                                return (
                                                                    <Button
                                                                        key={pageNum}
                                                                        variant={currentPage === pageNum ? "danger" : "outline-danger"}
                                                                        size="sm"
                                                                        onClick={() => handlePageChange(pageNum)}
                                                                        style={{ minWidth: '40px' }}
                                                                    >
                                                                        {pageNum + 1}
                                                                    </Button>
                                                                );
                                                            })}
                                                        </div>

                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            disabled={currentPage >= totalPages - 1}
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                        >
                                                            Sau »
                                                        </Button>
                                                    </div>
                                                    <div className="text-center mt-2 text-muted small">
                                                        Trang {currentPage + 1} / {totalPages}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DishSearchPage;