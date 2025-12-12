import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import axiosInstance from "../../config/axiosConfig.ts";


interface ProcessedDishImage {
    id: number;
    imageUrl: string;
}

// Interface chi tiết món ăn (thêm address và sửa images)
interface DishDetail {
    dishId: number;
    name: string;
    description: string;
    address: string;
    price: number;
    discountPrice: number | null;
    preparationTime: number;
    viewCount: number;
    images: ProcessedDishImage[];
    merchantId: number;
    merchantName: string;
}

const DishDetailPage: React.FC = () => {
    const { dishId } = useParams<{ dishId: string }>();
    const navigate = useNavigate();
    const [dish, setDish] = useState<DishDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        // Reset selected index khi ID thay đổi
        setSelectedImageIndex(0);
        fetchDishDetail();
    }, [dishId]);

    const fetchDishDetail = async () => {
        try {
            setLoading(true);

            // ✅ SỬA LỖI 1 & 2: Dùng await và lấy data từ response.data
            const response = await axiosInstance.get(`/dishes/${dishId}`);

            // Dữ liệu thô từ backend (chứa imagesUrls: string và merchant DTO)
            const rawData = response.data;

            // --- XỬ LÝ ẢNH ---
            let imageUrls: string[] = [];
            try {
                // ✅ SỬA LỖI 3: Parse chuỗi JSON ảnh thành mảng URL
                if (rawData.imagesUrls) {
                    const parsedUrls = JSON.parse(rawData.imagesUrls);
                    if (Array.isArray(parsedUrls)) {
                        imageUrls = parsedUrls.filter(url => typeof url === 'string');
                    }
                }
            } catch (e) {
                console.error("Lỗi khi parse imagesUrls:", e);
                imageUrls = [];
            }

            // Chuyển mảng URL thành cấu trúc { id, imageUrl } để khớp với ProcessedDishImage[]
            const processedImages: ProcessedDishImage[] = imageUrls.map((url, index) => ({
                id: index + 1,
                imageUrl: url,
            }));

            // --- XỬ LÝ DỮ LIỆU CUỐI CÙNG ---
            const finalDishData: DishDetail = {
                // Lấy các trường cơ bản từ rawData
                ...rawData,

                // Lấy tên Merchant từ MerchantResponseDTO (merchant object)
                merchantName: rawData.merchant?.name || 'Không xác định',

                // Gắn mảng ảnh đã xử lý
                images: processedImages,

                // Đảm bảo address được đưa vào
                address: rawData.address || '',
            };

            setDish(finalDishData);
        } catch (err) {
            // ✅ SỬA LỖI XỬ LÝ AXIOS ERROR
            let message = 'Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng hoặc server.';
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError;
                // Cố gắng lấy message từ response data nếu có
                message = (axiosError.response?.data as { message?: string })?.message
                    || `Không tìm thấy món ăn (Lỗi ${axiosError.response?.status || 'mạng'})`;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="dish-detail-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    if (error || !dish || dish.images.length === 0) {
        return (
            <div className="dish-detail-container">
                <div className="error">
                    <p>{error || 'Không tìm thấy món ăn hoặc món ăn chưa có ảnh'}</p>
                    <button onClick={() => navigate('/')}>Quay lại trang chủ</button>
                </div>
            </div>
        );
    }

    // Đảm bảo luôn có ảnh để hiển thị (đã kiểm tra ở if block trên)
    const currentImage = dish.images[selectedImageIndex] || dish.images[0];

    return (
        <div className="dish-detail-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Quay lại
            </button>

            <div className="dish-detail-content">
                {/* Image Gallery */}
                <div className="dish-images">
                    <div className="main-image">
                        <img
                            src={currentImage.imageUrl}
                            alt={dish.name}
                        />
                    </div>

                    {dish.images.length > 1 && (
                        <div className="thumbnail-list">
                            {dish.images.map((image, index) => (
                                <div
                                    key={image.id}
                                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img src={image.imageUrl} alt={`${dish.name} ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dish Info */}
                <div className="dish-info">
                    <h1 className="dish-name">{dish.name}</h1>

                    <div className="dish-meta">
                        <span className="view-count">👁️ {dish.viewCount} lượt xem</span>
                        {dish.preparationTime > 0 && (
                            <span className="prep-time">⏱️ {dish.preparationTime} phút</span>
                        )}
                        {/* ✅ THÊM: Hiển thị địa chỉ */}
                        {dish.address && (
                            <span className="dish-address">📍 {dish.address}</span>
                        )}
                    </div>

                    <div className="price-section">
                        {dish.discountPrice && dish.discountPrice < dish.price ? (
                            <>
                                <span className="original-price">{formatPrice(dish.price)}</span>
                                <span className="discount-price">{formatPrice(dish.discountPrice)}</span>
                                <span className="discount-badge">
                                    -{Math.round(((dish.price - dish.discountPrice) / dish.price) * 100)}%
                                </span>
                            </>
                        ) : (
                            <span className="current-price">{formatPrice(dish.price)}</span>
                        )}
                    </div>

                    <div className="description-section">
                        <h3>Mô tả</h3>
                        <p className="description">{dish.description || 'Chưa có mô tả'}</p>
                    </div>

                    <div className="merchant-info">
                        <h3>Thông tin cửa hàng</h3>
                        <p className="merchant-name">🏪 {dish.merchantName}</p>
                    </div>

                    <div className="action-buttons">
                        <button className="btn-add-to-cart">
                            🛒 Thêm vào giỏ hàng
                        </button>
                        <button className="btn-buy-now">
                            💳 Mua ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DishDetailPage;