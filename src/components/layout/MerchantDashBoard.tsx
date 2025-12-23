import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Plus, List, Grid, Search, X, ClipboardList, TrendingUp, BarChart3, User, Camera} from 'lucide-react';
import {Modal, Spinner} from "react-bootstrap";
import toast from "react-hot-toast";
import {AxiosResponse, AxiosError} from 'axios';

// Components
import AddDishModal from "../../features/dish/AddDishModal.tsx";
import AddCouponModal from "../../features/coupon/components/AddCouponModal.tsx";
import MerchantDishList from "../../features/dish/MerchantDishList.tsx";
import MerchantCouponManager from "../../features/coupon/components/MerchantCouponManager.tsx";
import DishUpdateForm from "../../features/dish/DishUpdateForm.tsx";
import Navigation from "./Navigation.tsx";
import MerchantOrderManager from "../../features/merchants/MerchantOrderManager";
import OrderStatisticsCard from "../../features/merchants/OrderStatisticsCard.tsx";
import RevenueStatistics from "../../features/merchants/RevenueStatistics.tsx";
import OrderByDish from "../../features/order/components/OrderByDish.tsx";

// Hooks & Config
import useCategories from "../../features/category/useCategories.ts";
import axiosInstance from "../../config/axiosConfig.ts";
import {useParams} from "react-router-dom";

// ==================== INTERFACES ====================
interface Dish {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string | null;
    images?: string[];
    categoryIds?: number[];
    priceNumber?: number;
}

interface DishCreateRequestState {
    name: string;
    merchantId: number | undefined;
    address: string;
    imagesFiles: FileList | null;
    preparationTime: number | undefined;
    description: string;
    price: string;
    discountPrice: string;
    serviceFee: string;
    categoryIds: Set<number>;
    isRecommended: boolean;
}

interface SidebarButtonProps {
    icon: React.ElementType;
    text: string;
    onClick: () => void;
    isActive?: boolean;
}

interface DishStats {
    totalDishes: number;
    recommendedDishes: number;
}

interface SearchFilters {
    keyword: string;
    categoryId: string;
    priceRange: string;
    status: string;
    date: string;
}

const customStyles = {
    primaryPink: '#ff5e62',
    secondaryYellow: '#ffe033',
    primaryColor: '#dc3545',
    sidebarBg: {
        background: 'linear-gradient(to bottom right, #dc3545, #ff5e62)'
    },
};

const initialDishData: DishCreateRequestState = {
    name: '',
    merchantId: undefined,
    address: '',
    imagesFiles: null,
    preparationTime: undefined,
    description: '',
    price: '',
    discountPrice: '',
    serviceFee: '',
    categoryIds: new Set<number>(),
    isRecommended: false,
};

// ==================== COMPONENTS ====================
const SidebarButton: React.FC<SidebarButtonProps> = ({
                                                         icon: Icon,
                                                         text,
                                                         onClick,
                                                         isActive = false
                                                     }) => (
    <button
        onClick={onClick}
        className="btn w-100 py-2 mb-2 fw-semibold d-flex justify-content-start align-items-center gap-2"
        style={{
            borderRadius: '0.5rem',
            backgroundColor: isActive ? 'white' : 'transparent',
            color: isActive ? customStyles.primaryPink : 'white',
            border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.9rem'
        }}
    >
        <Icon size={18}/>
        {text}
    </button>
);

// ==================== MAIN COMPONENT ====================
const MerchantDashboardBootstrap: React.FC = () => {
    const {categories, isLoading: isLoadingCategories, error: categoriesError} = useCategories();
    const [merchantInfo, setMerchantInfo] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { merchantId } = useParams<{ merchantId: string }>();

    // Merchant State
    const [currentMerchantId, setCurrentMerchantId] = useState<number | null>(null);
    const [merchantName, setMerchantName] = useState<string>('Đang tải...');
    const [isLoadingId, setIsLoadingId] = useState<boolean>(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stats State
    const [dishStats, setDishStats] = useState<DishStats>({totalDishes: 0, recommendedDishes: 0});

    // View State
    const [activeView, setActiveView] = useState<'dishes' | 'coupons' | 'orders'|'statistics'|'orderByDish'>('dishes');
    const [dishCreatedToggle, setDishCreatedToggle] = useState<boolean>(false);
    const [couponCreatedToggle, setCouponCreatedToggle] = useState<boolean>(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    // Modal States
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedDishIdToEdit, setSelectedDishIdToEdit] = useState<number | null>(null);

    // Search & Filter State
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        keyword: '',
        categoryId: '',
        priceRange: '',
        status: '',
        date: ''
    });

    // Form State
    const [newDishData, setNewDishData] = useState<DishCreateRequestState>(initialDishData);

    // ==================== EFFECTS ====================
    // ✅ CONSOLIDATED: Fetch merchantId và profile trong 1 useEffect
    useEffect(() => {
        const fetchMerchantData = async () => {
            setIsLoadingId(true);
            try {
                // Bước 1: Lấy merchantId
                const idResponse = await axiosInstance.get('/merchants/current/id');
                const fetchedMerchantId = idResponse.data.merchantId;
                setCurrentMerchantId(fetchedMerchantId);

                // Bước 2: Lấy profile đầy đủ (bao gồm avatarUrl)
                // ⚠️ QUAN TRỌNG: Dùng đúng endpoint mà backend trả về avatarUrl
                const profileResponse = await axiosInstance.get('/merchants/my-profile');

                setMerchantInfo(profileResponse.data);
                setMerchantName(profileResponse.data.restaurantName || 'Cửa hàng của tôi');

            } catch (error) {
                console.error("❌ Lỗi tải thông tin Merchant:", error);
                toast.error("Không thể tải thông tin Merchant");
                setCurrentMerchantId(null);
            } finally {
                setIsLoadingId(false);
            }
        };

        fetchMerchantData();
    }, []); // Chỉ chạy 1 lần khi mount

    // Fetch dish statistics
    useEffect(() => {
        const fetchDishStats = async () => {
            try {
                const response = await axiosInstance.get('/dishes/list');
                let dishesData: any[] = [];

                if (typeof response.data === 'string') {
                    try {
                        const parsed = JSON.parse(response.data.trim());
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
                    }
                } else if (Array.isArray(response.data)) {
                    dishesData = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    const possibleKeys = ['dishes', 'data', 'content', 'items', 'list'];
                    for (const key of possibleKeys) {
                        if (Array.isArray(response.data[key])) {
                            dishesData = response.data[key];
                            break;
                        }
                    }
                }

                const totalDishes = dishesData.length;
                const recommendedDishes = dishesData.filter((dish: any) => dish.isRecommended === true).length;

                setDishStats({totalDishes, recommendedDishes});
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            }
        };

        if (currentMerchantId) {
            fetchDishStats();
        }
    }, [currentMerchantId, dishCreatedToggle]);

    // ==================== HANDLERS ====================
    const handleAddDish = useCallback(async (data: Omit<DishCreateRequestState, 'imagesFiles' | 'merchantId'> & {
        uploadedUrls: string[]
    }) => {
        if (isLoadingId || currentMerchantId === null) {
            toast.error("Thông tin Merchant chưa sẵn sàng. Vui lòng thử lại sau giây lát.");
            return;
        }

        const requestBody = {
            name: data.name,
            imagesUrls: JSON.stringify(data.uploadedUrls),
            address: data.address,
            preparationTime: data.preparationTime,
            description: data.description,
            price: parseFloat(data.price),
            discountPrice: parseFloat(data.discountPrice),
            serviceFee: data.serviceFee ? parseFloat(data.serviceFee) : 0,
            categoryIds: Array.from(data.categoryIds),
            isRecommended: data.isRecommended,
            merchantId: currentMerchantId,
        };

        try {
            const response: AxiosResponse = await axiosInstance.post('/dishes/create', requestBody);
            toast.success(`Thêm món ăn "${response.data.name}" thành công!`);
            setDishCreatedToggle(prev => !prev);
            setNewDishData(initialDishData);
            setShowAddModal(false);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            let errorMessage = 'Lỗi kết nối hoặc lỗi hệ thống khi thêm món ăn.';
            if ((error as AxiosError).response) {
                const errorData = (error as AxiosError).response?.data;
                errorMessage = (errorData as any)?.message || (errorData as string) || (error as AxiosError).response?.statusText || errorMessage;
            } else if ((error as AxiosError).request) {
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
            } else {
                errorMessage = (error as Error).message || errorMessage;
            }
            toast.error(errorMessage);
        }
    }, [currentMerchantId, isLoadingId]);

    const handleEditDish = useCallback((dish: Dish) => {
        setSelectedDishIdToEdit(dish.id);
        setShowEditModal(true);
    }, []);

    const handleNewDishChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;

        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            setNewDishData(prev => ({...prev, imagesFiles: files}));
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setNewDishData(prev => ({...prev, [name]: checked}));
        } else if (name === 'preparationTime') {
            const numValue = parseInt(value);
            setNewDishData(prev => ({...prev, [name]: isNaN(numValue) ? undefined : numValue}));
        } else {
            setNewDishData(prev => ({...prev, [name]: value}));
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        setNewDishData(prev => {
            const newSet = new Set(prev.categoryIds);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return {...prev, categoryIds: newSet};
        });
    };

    const handleSearchChange = (field: keyof SearchFilters, value: string) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!currentMerchantId) {
            toast.error("Chưa xác định được Merchant ID");
            return;
        }

        const CLOUD_NAME = "dxoln0uq3";
        const UPLOAD_PRESET = "lunchbot_dishes";

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const loadingToast = toast.loading("Đang tải ảnh lên...");

        try {
            setIsUploading(true);

            // Bước 1: Upload lên Cloudinary
            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );

            if (!cloudinaryRes.ok) {
                throw new Error('Upload Cloudinary thất bại');
            }

            const imageData = await cloudinaryRes.json();
            const secureUrl = imageData.secure_url;

            console.log('✅ Uploaded to Cloudinary:', secureUrl);

            // Bước 2: Lưu URL vào backend
            const patchResponse = await axiosInstance.patch('/merchants/my-profile/avatar', {
                avatarUrl: secureUrl
            });

            console.log('✅ Backend response:', patchResponse.data);

            // Bước 3: Cập nhật state ngay lập tức
            setMerchantInfo((prev: any) => ({
                ...prev,
                avatarUrl: secureUrl
            }));

            toast.dismiss(loadingToast);
            toast.success("Cập nhật ảnh đại diện thành công!");

        } catch (error: any) {
            console.error('❌ Upload error:', error);
            toast.dismiss(loadingToast);
            toast.error("Lỗi khi cập nhật ảnh: " + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
            // Reset input để có thể upload lại cùng file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getHeaderConfig = () => {
        switch (activeView) {
            case 'dishes':
                return {
                    subTitle: 'Quản lý món ăn',
                    btnText: 'Thêm món ăn',
                    showButton: true,
                    onClick: () => setShowAddModal(true)
                };
            case 'coupons':
                return {
                    subTitle: 'Quản lý mã giảm giá',
                    btnText: 'Thêm mã giảm giá',
                    showButton: true,
                    onClick: () => setShowCouponModal(true)
                };
            case 'orders':
                return {
                    subTitle: 'Quản lý và theo dõi đơn hàng',
                    btnText: '',
                    showButton: false,
                    onClick: () => {}
                };
            case 'statistics':
                return {
                    subTitle: 'Thống kê doanh thu',
                    btnText: '',
                    showButton: false,
                    onClick: () => {}
                };
            case 'orderByDish':
                return {
                    subTitle: 'Thống kê đơn hàng theo món ăn',
                    btnText: '',
                    showButton: false,
                    onClick: () => {}
                };
            default:
                return {
                    subTitle: '',
                    btnText: '',
                    showButton: false,
                    onClick: () => {}
                };
        }
    };

    const headerConfig = getHeaderConfig();

    // ==================== LOADING & ERROR STATES ====================
    if (isLoadingId || isLoadingCategories) {
        return <div className="text-center p-5">Đang tải dữ liệu Merchant và Danh mục...</div>;
    }

    if (currentMerchantId === null) {
        return <div className="text-center p-5 text-danger">Lỗi nghiêm trọng: Không xác định được Merchant ID. Vui lòng đăng nhập lại.</div>;
    }

    // ==================== RENDER ====================
    return (
        <div className="min-vh-100" style={{backgroundColor: '#f8f9fa'}}>
            <header className="shadow-sm" style={{backgroundColor: customStyles.primaryPink}}>
                <Navigation/>
            </header>

            <div className="container-fluid px-3 py-3">
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center bg-white rounded-3 p-3 shadow-sm">
                            <div className="d-flex align-items-center gap-3">
                                <div className="position-relative">
                                    <div
                                        className="rounded-circle border border-4 border-white shadow-sm overflow-hidden bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {merchantInfo?.avatarUrl ? (
                                            <img
                                                src={merchantInfo.avatarUrl}
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                                alt="Merchant Avatar"
                                            />
                                        ) : (
                                            <User size={40} className="text-secondary" />
                                        )}

                                        {isUploading && (
                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                            >
                                                <Spinner animation="border" size="sm" variant="light" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle border-0 p-2 shadow"
                                        style={{ width: '36px', height: '36px' }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera size={16} />
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                <div>
                                    <h4 className="mb-1 fw-bold" style={{color: customStyles.primaryPink}}>
                                        {merchantName}
                                    </h4>
                                    <p className="text-muted mb-0 small">{headerConfig.subTitle}</p>
                                </div>
                            </div>

                            {headerConfig.showButton && (
                                <button
                                    className="btn btn-sm fw-semibold px-4"
                                    style={{
                                        backgroundColor: customStyles.primaryPink,
                                        color: 'white',
                                        borderRadius: '0.5rem'
                                    }}
                                    onClick={headerConfig.onClick}
                                >
                                    <Plus size={16} className="me-1"/>
                                    {headerConfig.btnText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTER BAR */}
                {activeView !== 'statistics' && (
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="bg-white rounded-3 p-3 shadow-sm">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                            {activeView === 'orders' ? 'Tìm đơn hàng' : 'Tìm kiếm theo tên'}
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0">
                                                <Search size={18} className="text-muted"/>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder={
                                                    activeView === 'dishes' ? 'Nhập tên món ăn...' :
                                                        activeView === 'orders' ? 'Mã đơn, tên khách...' :
                                                            'Nhập tên mã giảm giá...'
                                                }
                                                value={searchFilters.keyword}
                                                onChange={(e) => handleSearchChange('keyword', e.target.value)}
                                            />
                                            {searchFilters.keyword && (
                                                <button
                                                    className="btn btn-outline-secondary border-start-0"
                                                    type="button"
                                                    onClick={() => handleSearchChange('keyword', '')}
                                                >
                                                    <X size={18}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {activeView === 'dishes' && (
                                        <>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold text-muted mb-1">Danh mục</label>
                                                <select
                                                    className="form-select"
                                                    value={searchFilters.categoryId}
                                                    onChange={(e) => handleSearchChange('categoryId', e.target.value)}
                                                >
                                                    <option value="">Tất cả danh mục</option>
                                                    {categories.map((cat: any) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold text-muted mb-1">Khoảng giá</label>
                                                <select
                                                    className="form-select"
                                                    value={searchFilters.priceRange}
                                                    onChange={(e) => handleSearchChange('priceRange', e.target.value)}
                                                >
                                                    <option value="">Tất cả</option>
                                                    <option value="0-50000">Dưới 50k</option>
                                                    <option value="50000-100000">50k - 100k</option>
                                                    <option value="100000-200000">100k - 200k</option>
                                                    <option value="200000-999999999">Trên 200k</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {activeView === 'orders' && (
                                        <>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold text-muted mb-1">Trạng thái</label>
                                                <select
                                                    className="form-select"
                                                    value={searchFilters.status}
                                                    onChange={(e) => handleSearchChange('status', e.target.value)}
                                                >
                                                    <option value="">Tất cả trạng thái</option>
                                                    <option value="PENDING">Chờ xác nhận</option>
                                                    <option value="PROCESSING">Đang chế biến</option>
                                                    <option value="READY">Đã xong món</option>
                                                    <option value="DELIVERING">Đang giao</option>
                                                    <option value="COMPLETED">Hoàn thành</option>
                                                    <option value="CANCELLED">Đã hủy</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold text-muted mb-1">Ngày đặt</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={searchFilters.date}
                                                    onChange={(e) => handleSearchChange('date', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {activeView === 'coupons' && <div className="col-md-6"></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row g-3">
                    <div className="col-lg-3">
                        <div className="rounded-3 p-3 shadow-sm mb-3" style={customStyles.sidebarBg}>
                            <h6 className="fw-bold text-white mb-3">Menu</h6>
                            <div className="d-grid">
                                <SidebarButton icon={List} text="Món ăn" onClick={() => setActiveView('dishes')}
                                               isActive={activeView === 'dishes'}/>
                                <SidebarButton icon={Grid} text="Mã giảm giá" onClick={() => setActiveView('coupons')}
                                               isActive={activeView === 'coupons'}/>
                                <SidebarButton icon={ClipboardList} text="Quản lý đơn hàng"
                                               onClick={() => setActiveView('orders')}
                                               isActive={activeView === 'orders'}/>
                                <SidebarButton
                                    icon={TrendingUp}
                                    text="Thống kê Doanh số"
                                    onClick={() => setActiveView('statistics')}
                                    isActive={activeView === 'statistics'}
                                />
                                <SidebarButton
                                    icon={BarChart3}
                                    text="Thống kê theo món"
                                    onClick={() => setActiveView('orderByDish')}
                                    isActive={activeView === 'orderByDish'}
                                />
                            </div>
                        </div>

                        {activeView === 'dishes' && (
                            <div className="bg-white rounded-3 p-3 shadow-sm mb-3">
                                <h6 className="fw-bold mb-3">Thống kê nhanh</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Tổng món:</span>
                                        <span className="fw-bold" style={{color: customStyles.primaryPink}}>
                                            {dishStats.totalDishes}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Món nổi bật:</span>
                                        <span className="fw-bold text-warning">{dishStats.recommendedDishes}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeView === 'orders' && (
                            <OrderStatisticsCard/>
                        )}

                        <div className="bg-light rounded-3 p-3 shadow-sm">
                            <h6 className="fw-bold mb-2 d-flex align-items-center gap-1">
                                <span style={{fontSize: '1.2rem'}}>💡</span> Mẹo hay
                            </h6>
                            <p className="small text-muted mb-0">
                                Món ăn có ảnh đẹp và mô tả chi tiết sẽ thu hút khách hàng hơn!
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        <div className="bg-white rounded-3 shadow-sm" style={{minHeight: '500px'}}>
                            {activeView === 'dishes' && (
                                <MerchantDishList
                                    onDishCreatedToggle={dishCreatedToggle}
                                    selectedDish={selectedDish}
                                    setSelectedDish={setSelectedDish}
                                    onEdit={handleEditDish}
                                    onDishDeleted={() => setDishCreatedToggle(prev => !prev)}
                                    searchFilters={searchFilters}
                                />
                            )}
                            {activeView === 'coupons' && (
                                <MerchantCouponManager
                                    brandColor={customStyles.primaryPink}
                                    refreshTrigger={couponCreatedToggle}
                                />
                            )}
                            {activeView === 'orders' && (
                                <MerchantOrderManager
                                    filters={{
                                        keyword: searchFilters.keyword,
                                        status: searchFilters.status,
                                        date: searchFilters.date
                                    }}
                                />
                            )}
                            {activeView === 'statistics' && (
                                <RevenueStatistics merchantId={currentMerchantId} />
                            )}
                            {activeView === 'orderByDish' && (
                                <OrderByDish />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddDishModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddDish}
                newDishData={newDishData}
                handleNewDishChange={handleNewDishChange}
                handleCategoryToggle={handleCategoryToggle}
                customStyles={customStyles}
                MOCK_CATEGORIES={categories}
            />

            <AddCouponModal
                show={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                onSuccess={() => setCouponCreatedToggle(prev => !prev)}
                customStyles={customStyles}
            />

            <Modal show={showEditModal} onHide={() => {
                setShowEditModal(false);
                setSelectedDishIdToEdit(null);
            }} size="xl" centered>
                <Modal.Header closeButton
                              style={{backgroundColor: customStyles.primaryPink, color: 'white', borderBottom: 'none'}}>
                    <Modal.Title style={{fontWeight: 'bold'}}>Chỉnh Sửa Món Ăn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDishIdToEdit ? (
                        <DishUpdateForm
                            dishId={selectedDishIdToEdit}
                            onSuccess={() => setDishCreatedToggle(prev => !prev)}
                            onCancel={() => {
                                setShowEditModal(false);
                                setSelectedDishIdToEdit(null);
                            }}
                        />
                    ) : (
                        <div>Không tìm thấy ID món ăn để sửa.</div>
                    )}
                </Modal.Body>
            </Modal>

            {categoriesError && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: 1050}}>
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Lỗi:</strong> {categoriesError}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantDashboardBootstrap;