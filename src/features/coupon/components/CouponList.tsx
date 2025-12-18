import React, { useRef } from 'react';
import { Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { RefreshCw, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCouponList } from '../hooks/useCouponList';
import CouponCard from './CouponCard';

interface CouponListProps {
    merchantId?: number;
    onlyActive?: boolean;
    showMerchantView?: boolean;
    title?: string;
    brandColor?: string;
    emptyMessage?: string;
}

const CouponList: React.FC<CouponListProps> = ({
                                                   merchantId,
                                                   onlyActive = false,
                                                   showMerchantView = false,
                                                   title,
                                                   brandColor = '#FF5E62',
                                                   emptyMessage = 'Chưa có mã giảm giá nào'
                                               }) => {
    const { coupons:rawData , isLoading, error, refetch } = useCouponList({
        merchantId,
        onlyActive ,
        autoFetch: true
    });

    const coupons = Array.isArray(rawData) ? rawData : [];

    // 1. Tạo Ref để tham chiếu đến vùng chứa danh sách (scroll container)
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleCopyCode = (code: string) => {
        toast.success(`Đã sao chép mã: ${code}`, {
            icon: '📋',
            duration: 2000
        });
    };

    // 2. Hàm xử lý cuộn trái/phải
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300; // Khoảng cách cuộn (tương đương chiều rộng 1 card)

            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: brandColor }} />
                <p className="mt-3 text-muted">Đang tải danh sách mã giảm giá...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-4">
                <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" size="sm" onClick={refetch}>
                    <RefreshCw size={16} className="me-2" />
                    Thử lại
                </Button>
            </Alert>
        );
    }

    return (
        <div>
            {title && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold d-flex align-items-center gap-2">
                        <Ticket size={28} color={brandColor} />
                        {title}
                    </h3>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={refetch}
                        className="d-flex align-items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </Button>
                </div>
            )}

            {coupons.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                    <Ticket size={48} className="mb-3 opacity-50" />
                    <p className="mb-0">{emptyMessage}</p>
                </Alert>
            ) : (
                // 3. Vùng chứa Slider (Position Relative để đặt nút bấm tuyệt đối)
                <div className="position-relative px-2">

                    {/* Nút bấm bên Trái */}
                    <Button
                        variant="light"
                        className="shadow-sm border rounded-circle position-absolute start-0 top-50 translate-middle-y d-none d-md-flex justify-content-center align-items-center"
                        style={{ zIndex: 10, width: '40px', height: '40px' }}
                        onClick={() => scroll('left')}
                    >
                        <ChevronLeft size={24} />
                    </Button>

                    {/* Container chứa danh sách Coupon */}
                    <div
                        ref={scrollContainerRef}
                        style={{
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            scrollbarWidth: 'none', // Firefox: ẩn thanh cuộn
                            msOverflowStyle: 'none', // IE/Edge: ẩn thanh cuộn
                            paddingBottom: '10px' // Tạo khoảng trống cho bóng đổ nếu có
                        }}
                        className="hide-scrollbar" // Class tùy chỉnh nếu muốn ẩn thanh cuộn trên Chrome/Safari
                    >

                        {/* Thêm flex-nowrap để các cột không bị xuống dòng */}
                        <Row className="g-3 flex-nowrap">
                            {coupons.map((coupon) => (
                                <Col
                                    key={coupon.id}
                                    xs={10} sm={6} lg={4} xl={3}
                                    style={{ flex: '0 0 auto' }}
                                >
                                    <CouponCard
                                        coupon={coupon}
                                        showMerchantView={showMerchantView}
                                        brandColor={brandColor}
                                        onCopy={handleCopyCode}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Nút bấm bên Phải */}
                    <Button
                        variant="light"
                        className="shadow-sm border rounded-circle position-absolute end-0 top-50 translate-middle-y d-none d-md-flex justify-content-center align-items-center"
                        style={{ zIndex: 10, width: '40px', height: '40px' }}
                        onClick={() => scroll('right')}
                    >
                        <ChevronRight size={24} />
                    </Button>
                </div>
            )}

            {/* CSS nội bộ để ẩn thanh cuộn trên Chrome/Safari/Webkit */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default CouponList;