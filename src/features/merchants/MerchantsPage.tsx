// src/features/merchants/MerchantsPage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Spinner, Alert, Pagination, Button, InputGroup } from 'react-bootstrap';
import { Search } from 'lucide-react';
import Navigation from "../../components/layout/Navigation.tsx";
import MerchantCard from './components/MerchantCard';
import { MerchantApiService, MerchantDTO } from './services/MerchantApi.service';

const MerchantsPage: React.FC = () => {
    const [merchants, setMerchants] = useState<MerchantDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [pageSize] = useState<number>(12);

    // Search state
    const [keyword, setKeyword] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');

    // Fetch merchants
    const fetchMerchants = async (page: number, searchTerm?: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await MerchantApiService.getAllMerchants(
                page,
                pageSize,
                searchTerm
            );

            setMerchants(response.content);
            setCurrentPage(response.pageable.pageNumber);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải danh sách nhà hàng');
            console.error('Error fetching merchants:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchMerchants(0, keyword);
    }, [keyword]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setKeyword(searchInput);
        setCurrentPage(0);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchMerchants(page, keyword);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate pagination items
    const renderPaginationItems = () => {
        const items = [];
        const maxVisible = 5;

        let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(0, endPage - maxVisible + 1);
        }

        // First page
        if (startPage > 0) {
            items.push(
                <Pagination.First key="first" onClick={() => handlePageChange(0)} />
            );
        }

        // Previous
        if (currentPage > 0) {
            items.push(
                <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />
            );
        }

        // Page numbers
        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page + 1}
                </Pagination.Item>
            );
        }

        // Next
        if (currentPage < totalPages - 1) {
            items.push(
                <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} />
            );
        }

        // Last page
        if (endPage < totalPages - 1) {
            items.push(
                <Pagination.Last key="last" onClick={() => handlePageChange(totalPages - 1)} />
            );
        }

        return items;
    };

    return (
        <>
            <Navigation />

            <div className="bg-light py-5" style={{ color: '#FF5E62' }}>
                <Container>
                    {/* Header Section */}
                    <div className="text-center mb-5">
                        {/* Đã xóa text-primary để không bị ghi đè màu */}
                        <h1 className="display-4 fw-bold mb-3" style={{ color: '#FF5E62' }}>
                            Danh Sách Nhà Hàng
                        </h1>
                        <p className="text-muted lead">
                            Khám phá {totalElements} nhà hàng tuyệt vời
                        </p>
                    </div>

                    {/* Search Bar */}
                    <Row className="justify-content-center mb-5">
                        <Col md={8} lg={6}>
                            <Form onSubmit={handleSearch}>
                                <InputGroup>
                                    <div className="position-relative flex-grow-1">
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm kiếm nhà hàng..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="py-3 border-2"
                                            style={{
                                                borderRadius: '50px 0 0 50px', // Bo góc trái
                                                paddingLeft: '45px'
                                            }}
                                        />
                                        <Search
                                            className="position-absolute text-muted"
                                            size={20}
                                            style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        style={{
                                            backgroundColor: '#FF5E62',
                                            borderColor: '#FF5E62',
                                            borderRadius: '0 50px 50px 0', // Bo góc phải
                                            padding: '0 30px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Tìm kiếm
                                    </Button>
                                </InputGroup>
                            </Form>
                        </Col>
                    </Row>

                    {/* Loading Spinner */}
                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Đang tải danh sách...</p>
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Merchants Grid */}
                    {!loading && !error && (
                        <>
                            {merchants.length === 0 ? (
                                <Alert variant="info" className="text-center">
                                    <p className="mb-0">
                                        {keyword ? `Không tìm thấy nhà hàng nào với từ khóa "${keyword}"` : 'Chưa có nhà hàng nào'}
                                    </p>
                                </Alert>
                            ) : (
                                <>
                                    <Row className="g-4 mb-5">
                                        {merchants.map((merchant) => (
                                            <Col key={merchant.id} xs={12} sm={6} md={4} lg={3}>
                                                <MerchantCard merchant={merchant} />
                                            </Col>
                                        ))}
                                    </Row>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center">
                                            <Pagination className="mb-0">
                                                {renderPaginationItems()}
                                            </Pagination>
                                        </div>
                                    )}

                                    {/* Results Info */}
                                    <div className="text-center mt-3">
                                        <small className="text-muted">
                                            Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} nhà hàng
                                        </small>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </Container>
            </div>
        </>
    );
};

export default MerchantsPage;