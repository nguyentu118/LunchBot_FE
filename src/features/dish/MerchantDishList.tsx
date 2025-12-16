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
    image: string | null;
    images?: string[];
}

interface MerchantDishListProps {
    onDishCreatedToggle: boolean;
    selectedDish: Dish | null;
    setSelectedDish: (dish: Dish | null) => void;
    onEdit?: (dish: Dish) => void;
    onDelete?: (dishId: number) => void;
}

const MerchantDishList: React.FC<MerchantDishListProps> = memo(({
                                                                    onDishCreatedToggle,
                                                                    selectedDish,
                                                                    setSelectedDish,
                                                                    onEdit,
                                                                }) => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 🔥 PHÂN TRANG
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 6; // Số món ăn mỗi trang

    // State cho Image Gallery Modal
    const [showGallery, setShowGallery] = useState(false);
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // State để track ảnh bị lỗi
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    const fetchMerchantDishes = useCallback(async (showToast = true) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/dishes/list');

            let dishesData: any[] = [];

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
                    toast.error('Lỗi parse dữ liệu. Vui lòng liên hệ developer để fix Backend.' + e);
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

            const fetchedDishes: Dish[] = dishesData.map((dish: any) => {
                // Parse imagesUrls safely
                let images: string[] = [];
                if (dish.imagesUrls) {
                    try {
                        const parsed = JSON.parse(dish.imagesUrls);
                        images = Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        console.warn('Failed to parse imagesUrls for dish:', dish.id, e);
                    }
                }

                // Format price
                const formattedPrice = typeof dish.price === 'number'
                    ? dish.price.toLocaleString('vi-VN') + 'đ'
                    : (dish.price || '0') + 'đ';

                return {
                    id: dish.id,
                    name: dish.name || 'Món ăn không tên',
                    description: dish.description || 'Chưa có mô tả.',
                    price: formattedPrice,
                    image: images.length > 0 ? images[0] : null,
                    images: images,
                };
            });

            setDishes(fetchedDishes);

            if (showToast && fetchedDishes.length > 0) {
                toast.success(`Đã tải ${fetchedDishes.length} món ăn.`, { duration: 1500 });
            } else if (showToast && fetchedDishes.length === 0) {
                toast.error("Chưa có món ăn nào.", { duration: 1500 });
            }
        } catch (error) {
            console.error("Lỗi tải danh sách món ăn:", error);
            toast.error("Không thể tải danh sách món. Vui lòng kiểm tra kết nối hoặc đăng nhập.");
            setDishes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (isFirstLoad.current) {
            // 1. Nếu là lần đầu vào trang: Tải và HIỆN thông báo
            fetchMerchantDishes(true);
            isFirstLoad.current = false; // Đánh dấu là đã load xong lần đầu
        } else {
            // 2. Nếu useEffect chạy lại do `onDishCreatedToggle` thay đổi (tức là vừa update/thêm mới):
            // Tải lại nhưng KHÔNG hiện thông báo (Silent reload)
            fetchMerchantDishes(false);
        }
    }, [fetchMerchantDishes, onDishCreatedToggle]);

    // 🔥 TÍNH TOÁN PHÂN TRANG
    const totalPages = Math.ceil(dishes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentDishes = dishes.slice(startIndex, endIndex);

    // Reset về trang 1 khi dishes thay đổi
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [dishes.length, currentPage, totalPages]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
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
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {currentDishes.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <h4 className="text-muted">Chưa có món ăn nào.</h4>
                            <p className="text-secondary">Hãy bấm "Thêm món ăn" để bắt đầu.</p>
                        </div>
                    ) : (
                        currentDishes.map((dish: Dish) => (
                            <div className="col" key={dish.id}>
                                <div
                                    onClick={() => setSelectedDish(dish)}
                                    className={`card shadow-sm h-100 cursor-pointer ${selectedDish?.id === dish.id ? 'border-danger border-2' : ''}`}
                                    style={{
                                        borderRadius: '0.75rem',
                                        transition: 'all 0.3s',
                                        transform: selectedDish?.id === dish.id ? 'scale(1.05)' : 'scale(1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div
                                        className="card-img-top bg-light d-flex align-items-center justify-content-center position-relative overflow-hidden"
                                        style={{
                                            height: '180px',
                                            borderTopLeftRadius: '0.75rem',
                                            borderTopRightRadius: '0.75rem'
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
                                            <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                                                {imageErrors.has(dish.image!) ? (
                                                    <>
                                                        <AlertCircle size={48} className="text-danger" />
                                                        <small className="text-danger fw-bold">Lỗi tải ảnh</small>
                                                    </>
                                                ) : (
                                                    <Upload size={48} className="text-secondary" />
                                                )}
                                            </div>
                                        )}

                                        {dish.images && dish.images.length > 1 && (
                                            <button
                                                className="position-absolute top-0 end-0 m-2 btn btn-sm btn-dark bg-opacity-75"
                                                style={{ borderRadius: '0.5rem', zIndex: 10 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openGallery(dish.images || [], 0);
                                                }}
                                                title="Xem tất cả ảnh"
                                            >
                                                <ImageIcon size={14} className="me-1" />
                                                {dish.images.length}
                                            </button>
                                        )}
                                    </div>

                                    <div className="card-body">
                                        <h4 className="card-title h6 fw-bold text-dark mb-2">{dish.name}</h4>
                                        <p className="card-text text-muted small mb-3"
                                           style={{
                                               overflow: 'hidden',
                                               textOverflow: 'ellipsis',
                                               display: '-webkit-box',
                                               WebkitLineClamp: 2,
                                               WebkitBoxOrient: 'vertical'
                                           }}>
                                            {dish.description}
                                        </p>
                                        <p className="h5 fw-bold text-danger mb-3">{dish.price}</p>

                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-sm btn-outline-primary flex-fill"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit?.(dish);
                                                }}
                                            >
                                                <Pencil size={16} className="me-1" />
                                                Sửa
                                            </button>

                                            <DishDeleteButton
                                                dishId={dish.id}
                                                dishName={dish.name}
                                                className="btn-sm flex-fill"
                                                onDeleteSuccess={() => {
                                                    fetchMerchantDishes();
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
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="d-flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`btn ${currentPage === page ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => goToPage(page)}
                                    style={{ minWidth: '40px' }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn btn-outline-danger"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Hiển thị thông tin trang */}
                {totalPages > 1 && (
                    <div className="text-center mt-3 text-muted small">
                        Trang {currentPage} / {totalPages} - Hiển thị {startIndex + 1} đến {Math.min(endIndex, dishes.length)} của {dishes.length} món
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