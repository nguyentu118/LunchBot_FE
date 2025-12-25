import React, {useRef, useState, useEffect, useCallback, memo } from 'react';
import { Upload, Pencil, Image as ImageIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import axiosInstance from "../../config/axiosConfig.ts";
import toast from "react-hot-toast";
import DishDeleteButton from "./DishDeleteButton.tsx";

interface Dish {
    id: number;
    name: string;
    description: string;
    price: string;
    preparationTime: number;
    image: string | null;
    images?: string[];
    categoryIds?: number[];
    priceNumber?: number;
}

interface SearchFilters {
    keyword: string;
    categoryId: string;
    priceRange: string;
}

interface MerchantDishListProps {
    onDishCreatedToggle: boolean;
    selectedDish: Dish | null;
    setSelectedDish: (dish: Dish | null) => void;
    onEdit?: (dish: Dish) => void;
    onDelete?: (dishId: number) => void;
    onDishDeleted?: () => void;
    searchFilters: SearchFilters;
}

const MerchantDishList: React.FC<MerchantDishListProps> = memo(({
                                                                    onDishCreatedToggle,
                                                                    selectedDish,
                                                                    setSelectedDish,
                                                                    onEdit,
                                                                    onDishDeleted,
                                                                    searchFilters
                                                                }) => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSearching, setIsSearching] = useState<boolean>(false); // 🔥 Loading cho debounce

    // 🔥 PAGINATION
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const ITEMS_PER_PAGE = 6;

    // State cho Image Gallery Modal
    const [showGallery, setShowGallery] = useState(false);
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    const hasActiveFilters = searchFilters.keyword || searchFilters.categoryId || searchFilters.priceRange;

    // 🔥 FETCH DISHES - Tự động chọn API phù hợp
    const fetchMerchantDishes = useCallback(async (showToast = true) => {
        setIsLoading(true);
        try {
            let dishesData: any[] = [];
            let totalPagesFromServer = 0;
            let totalElementsFromServer = 0;

            // ✅ NẾU CÓ FILTER → Dùng API search với pagination
            if (hasActiveFilters) {
                const params: any = {
                    page: currentPage,
                    size: ITEMS_PER_PAGE
                };

                if (searchFilters.keyword?.trim()) {
                    params.keyword = searchFilters.keyword.trim();
                }
                if (searchFilters.categoryId) {
                    params.categoryId = searchFilters.categoryId;
                }
                if (searchFilters.priceRange) {
                    params.priceRange = searchFilters.priceRange;
                }

                const response = await axiosInstance.get('/dishes/merchant/search', { params });
                const data = response.data;

                dishesData = data.content || [];
                totalPagesFromServer = data.totalPages || 0;
                totalElementsFromServer = data.totalElements || 0;
            }
            // ✅ NẾU KHÔNG CÓ FILTER → Dùng API list và phân trang client-side
            else {
                const response = await axiosInstance.get('/dishes/list');

                // Xử lý response giống code cũ
                if (typeof response.data === 'string') {
                    try {
                        const cleanedString = response.data.trim();
                        const parsed = JSON.parse(cleanedString);

                        if (Array.isArray(parsed)) {
                            dishesData = parsed;
                        } else if (parsed && typeof parsed === 'object') {
                            const possibleKeys = ['dishes', 'data', 'content', 'items', 'list'];
                            for (const key of possibleKeys) {
                                if (Array.isArray(parsed[key])) {
                                    dishesData = parsed[key];
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Parse error:', e);
                        toast.error('Lỗi parse dữ liệu. Vui lòng liên hệ developer.');
                    }
                }
                else if (Array.isArray(response.data)) {
                    dishesData = response.data;
                }
                else if (response.data && typeof response.data === 'object') {
                    const possibleArrayKeys = ['dishes', 'data', 'content', 'items', 'list'];
                    for (const key of possibleArrayKeys) {
                        if (Array.isArray(response.data[key])) {
                            dishesData = response.data[key];
                            break;
                        }
                    }
                }

                // 🔥 CLIENT-SIDE PAGINATION khi không có filter
                totalElementsFromServer = dishesData.length;
                totalPagesFromServer = Math.ceil(dishesData.length / ITEMS_PER_PAGE);

                const startIndex = currentPage * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                dishesData = dishesData.slice(startIndex, endIndex);
            }

            // Xử lý dữ liệu chung
            const fetchedDishes: Dish[] = dishesData.map((dish: any) => {
                let images: string[] = [];
                if (dish.imagesUrls) {
                    try {
                        const parsed = JSON.parse(dish.imagesUrls);
                        images = Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        console.warn('Failed to parse images for dish:', dish.id);
                    }
                }

                const priceNumber = typeof dish.price === 'number' ? dish.price : parseFloat(dish.price) || 0;
                const formattedPrice = priceNumber.toLocaleString('vi-VN') + 'đ';

                return {
                    id: dish.id,
                    name: dish.name || 'Món ăn không tên',
                    description: dish.description || 'Chưa có mô tả.',
                    preparationTime: dish.preparationTime  || "15-20",
                    price: formattedPrice,
                    priceNumber: priceNumber,
                    image: images.length > 0 ? images[0] : null,
                    images: images,
                    categoryIds: dish.categoryIds || []
                };
            });

            setDishes(fetchedDishes);
            setTotalPages(totalPagesFromServer);
            setTotalElements(totalElementsFromServer);

        } catch (error) {
            console.error("Lỗi tải danh sách món ăn:", error);
            toast.error("Không thể tải danh sách món. Vui lòng kiểm tra kết nối.");
            setDishes([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchFilters, hasActiveFilters]);

    const isFirstLoad = useRef(true);

    // 🔥 DEBOUNCE: Đợi 1s sau khi user ngừng gõ mới fetch
    useEffect(() => {
        // Không debounce lần đầu load hoặc khi toggle create
        if (isFirstLoad.current) {
            fetchMerchantDishes(true);
            isFirstLoad.current = false;
            return;
        }

        // ✅ Debounce cho search filters
        const timeoutId = setTimeout(() => {
            fetchMerchantDishes(false);
            setIsSearching(false);
        }, 500);

        // Cleanup: Hủy timeout nếu user tiếp tục gõ
        return () => {
            clearTimeout(timeoutId);
            setIsSearching(false);
        };
    }, [searchFilters, currentPage]);

    // Fetch ngay lập tức khi có dish mới được tạo/xóa
    useEffect(() => {
        if (!isFirstLoad.current) {
            fetchMerchantDishes(false);
        }
    }, [onDishCreatedToggle]);

    // Reset về trang 0 khi filter thay đổi
    useEffect(() => {
        setCurrentPage(0);
    }, [searchFilters]);

    const goToPage = (page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const openGallery = (images: string[], startIndex: number = 0) => {
        setCurrentImages(images);
        setCurrentImageIndex(startIndex);
        setShowGallery(true);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    };

    const handleImageError = (imageUrl: string) => {
        console.error('❌ Failed to load image:', imageUrl);
        setImageErrors(prev => new Set(prev).add(imageUrl));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-4 p-4 shadow">
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải danh sách món ăn...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-4 p-4 shadow">
                {/* 🔥 Searching Indicator */}
                {isSearching && (
                    <div className="alert alert-light d-flex align-items-center mb-3" role="alert">
                        <div className="spinner-border spinner-border-sm text-danger me-2" role="status">
                            <span className="visually-hidden">Searching...</span>
                        </div>
                        <small className="text-muted">Đang tìm kiếm...</small>
                    </div>
                )}

                {hasActiveFilters && dishes.length === 0 && !isSearching && (
                    <div className="alert alert-info d-flex align-items-center" role="alert">
                        <AlertCircle size={20} className="me-2" />
                        <div>
                            Không tìm thấy món ăn phù hợp với bộ lọc của bạn.
                        </div>
                    </div>
                )}

                {/* 🔥 LIST LAYOUT */}
                <div className="list-group">
                    {dishes.length === 0 && !hasActiveFilters ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">Chưa có món ăn nào.</h4>
                            <p className="text-secondary">Hãy bấm "Thêm món ăn" để bắt đầu.</p>
                        </div>
                    ) : (
                        dishes.map((dish: Dish) => (
                            <div
                                key={dish.id}
                                onClick={() => setSelectedDish(dish)}
                                className={`list-group-item list-group-item-action cursor-pointer mb-2 ${
                                    selectedDish?.id === dish.id ? 'border-danger border-2 bg-light' : ''
                                }`}
                                style={{
                                    borderRadius: '0.75rem',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <div className="d-flex gap-3 align-items-start">
                                    {/* 🖼️ Thumbnail Image */}
                                    <div
                                        className="bg-light d-flex align-items-center justify-content-center position-relative overflow-hidden flex-shrink-0"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '0.5rem'
                                        }}
                                    >
                                        {dish.image && !imageErrors.has(dish.image) ? (
                                            <img
                                                src={dish.image}
                                                alt={dish.name}
                                                className="w-100 h-100"
                                                style={{
                                                    objectFit: 'cover',
                                                    objectPosition: 'center'
                                                }}
                                                onError={() => handleImageError(dish.image!)}
                                            />
                                        ) : (
                                            <div className="d-flex flex-column align-items-center justify-content-center">
                                                {imageErrors.has(dish.image!) ? (
                                                    <>
                                                        <AlertCircle size={32} className="text-danger" />
                                                        <small className="text-danger fw-bold mt-1">Lỗi</small>
                                                    </>
                                                ) : (
                                                    <Upload size={32} className="text-secondary" />
                                                )}
                                            </div>
                                        )}

                                        {dish.images && dish.images.length > 1 && (
                                            <button
                                                className="position-absolute top-0 end-0 m-1 btn btn-sm btn-dark bg-opacity-75"
                                                style={{ borderRadius: '0.375rem', padding: '0.25rem 0.5rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openGallery(dish.images || [], 0);
                                                }}
                                                title="Xem tất cả ảnh"
                                            >
                                                <ImageIcon size={12} className="me-1" />
                                                {dish.images.length}
                                            </button>
                                        )}
                                    </div>

                                    {/* 📝 Dish Info */}
                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold mb-0 text-dark">{dish.name}</h5>
                                            <span className="h5 fw-bold text-danger mb-0 ms-3 flex-shrink-0">
                                                {dish.price}
                                            </span>
                                        </div>

                                        <p
                                            className="text-muted small mb-3"
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                lineHeight: '1.4'
                                            }}
                                        >
                                            Mô tả : {dish.description}
                                        </p>

                                        <p
                                            className="text-muted small mb-3"
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                lineHeight: '1.4'
                                            }}
                                        >
                                            Thời gian chuẩn bị : {dish.preparationTime + " phút"}
                                        </p>

                                        <div className="d-flex gap-2 justify-content-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit?.(dish);
                                                }}
                                            >
                                                <Pencil size={14} className="me-1" />
                                                Sửa
                                            </button>

                                            <DishDeleteButton
                                                dishId={dish.id}
                                                dishName={dish.name}
                                                className="btn-sm"
                                                onDeleteSuccess={() => {
                                                    fetchMerchantDishes(false);
                                                    onDishDeleted?.();
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 🔥 PAGINATION UI */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="d-flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i).map(page => (
                                <button
                                    key={page}
                                    className={`btn ${currentPage === page ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => goToPage(page)}
                                    style={{ minWidth: '40px' }}
                                >
                                    {page + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn btn-outline-danger"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="text-center mt-3 text-muted small">
                        Trang {currentPage + 1} / {totalPages} - Tổng {totalElements} món
                    </div>
                )}
            </div>

            {/* Image Gallery Modal */}
            {showGallery && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                    onClick={() => setShowGallery(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-transparent border-0">
                            <div className="d-flex justify-content-between align-items-center p-3">
                                <span className="text-white fw-bold">
                                    Ảnh {currentImageIndex + 1} / {currentImages.length}
                                </span>
                                <button
                                    className="btn btn-close btn-close-white"
                                    onClick={() => setShowGallery(false)}
                                ></button>
                            </div>

                            <div className="position-relative" style={{ height: '70vh' }}>
                                <img
                                    src={currentImages[currentImageIndex]}
                                    alt={`Image ${currentImageIndex + 1}`}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'contain' }}
                                    onError={(e) => {
                                        console.error('❌ Gallery image failed to load:', currentImages[currentImageIndex]);
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />

                                {currentImages.length > 1 && (
                                    <>
                                        <button
                                            className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                                            onClick={prevImage}
                                            style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                                            onClick={nextImage}
                                            style={{ borderRadius: '50%', width: '50px', height: '50px' }}
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {currentImages.length > 1 && (
                                <div className="d-flex gap-2 p-3 overflow-auto" style={{ maxWidth: '100%' }}>
                                    {currentImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className={`cursor-pointer ${idx === currentImageIndex ? 'border border-3 border-danger' : 'opacity-50'}`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            onError={(e) => {
                                                console.error('❌ Thumbnail failed to load:', img);
                                                e.currentTarget.style.opacity = '0.2';
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default MerchantDishList;