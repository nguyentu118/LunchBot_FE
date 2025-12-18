import React, { useState, useEffect, useCallback } from 'react';
import {Plus, List, Grid, Search, X} from 'lucide-react';
import { Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { AxiosResponse, AxiosError } from 'axios';

// Components
import AddDishModal from "../../features/dish/AddDishModal.tsx";
import AddCouponModal from "../../features/coupon/components/AddCouponModal.tsx";
import MerchantDishList from "../../features/dish/MerchantDishList.tsx";
import MerchantCouponManager from "../../features/coupon/components/MerchantCouponManager.tsx";
import DishUpdateForm from "../../features/dish/DishUpdateForm.tsx";
import Navigation from "./Navigation.tsx";
// Hooks & Config
import useCategories from "../../features/category/useCategories.ts";
import axiosInstance from "../../config/axiosConfig.ts";

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
    color?: string;
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
}

interface MerchantDishListProps {
    onDishCreatedToggle: boolean;
    selectedDish: Dish | null;
    setSelectedDish: (dish: Dish | null) => void;
    onEdit?: (dish: Dish) => void;
    onDelete?: (dishId: number) => void;
    searchFilters: SearchFilters;
}

// ==================== CONSTANTS ====================
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
const SidebarButton: React.FC<SidebarButtonProps> = ({ icon: Icon, text, onClick, color = 'danger', isActive = false }) => (
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
        <Icon size={18} />
        {text}
    </button>
);

// ==================== MAIN COMPONENT ====================
const MerchantDashboardBootstrap: React.FC = () => {
    const { categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();

    // Merchant State
    const [currentMerchantId, setCurrentMerchantId] = useState<number | null>(null);
    const [merchantName, setMerchantName] = useState<string>('Đang tải...');
    const [isLoadingId, setIsLoadingId] = useState<boolean>(true);

    // Stats State
    const [dishStats, setDishStats] = useState<DishStats>({ totalDishes: 0, recommendedDishes: 0 });

    // View State
    const [activeView, setActiveView] = useState<'dishes' | 'coupons'>('dishes');
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
        priceRange: ''
    });
    const [isSearching, setIsSearching] = useState<boolean>(false);

    // Form State
    const [newDishData, setNewDishData] = useState<DishCreateRequestState>(initialDishData);

    // ==================== EFFECTS ====================
    useEffect(() => {
        const fetchMerchantId = async () => {
            setIsLoadingId(true);
            try {
                const response = await axiosInstance.get('/merchants/current/id');
                setCurrentMerchantId(response.data.merchantId);
            } catch (error) {
                console.error("Lỗi tải Merchant ID:", error);
                toast.error("Không thể tải Merchant ID. Vui lòng đăng nhập lại.");
                setCurrentMerchantId(null);
            }

            try {
                const profileResponse = await axiosInstance.get('/merchants/profile');
                setMerchantName(profileResponse.data.restaurantName || 'Cửa hàng của tôi');
            } catch (error) {
                console.warn("Không thể tải tên Merchant.", error);
                setMerchantName('Cửa hàng của tôi');
            } finally {
                setIsLoadingId(false);
            }
        };
        fetchMerchantId();
    }, []);

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

                setDishStats({ totalDishes, recommendedDishes });
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            }
        };

        if (currentMerchantId) {
            fetchDishStats();
        }
    }, [currentMerchantId, dishCreatedToggle]);

    // ==================== HANDLERS ====================
    const handleAddDish = useCallback(async (data: Omit<DishCreateRequestState, 'imagesFiles' | 'merchantId'> & { uploadedUrls: string[] }) => {
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
        const { name, value, type } = e.target;

        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            setNewDishData(prev => ({ ...prev, imagesFiles: files }));
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setNewDishData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'preparationTime') {
            const numValue = parseInt(value);
            setNewDishData(prev => ({ ...prev, [name]: isNaN(numValue) ? undefined : numValue }));
        } else {
            setNewDishData(prev => ({ ...prev, [name]: value }));
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
            return { ...prev, categoryIds: newSet };
        });
    };

    const handleSearchChange = (field: keyof SearchFilters, value: string) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = useCallback(async () => {
        setIsSearching(true);
        setDishCreatedToggle(prev => !prev);
        setTimeout(() => setIsSearching(false), 500);
    }, []);

    const handleClearSearch = () => {
        setSearchFilters({
            keyword: '',
            categoryId: '',
            priceRange: ''
        });
        setDishCreatedToggle(prev => !prev);
    };

    const hasActiveFilters = searchFilters.keyword || searchFilters.categoryId || searchFilters.priceRange;

    // ==================== LOADING & ERROR STATES ====================
    if (isLoadingId || isLoadingCategories) {
        return <div className="text-center p-5">Đang tải dữ liệu Merchant và Danh mục...</div>;
    }

    if (currentMerchantId === null) {
        return <div className="text-center p-5 text-danger">Lỗi nghiêm trọng: Không xác định được Merchant ID. Vui lòng đăng nhập lại.</div>;
    }

    // ==================== RENDER ====================
    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <header className="shadow-sm" style={{ backgroundColor: customStyles.primaryPink }}>
                <Navigation />
            </header>

            <div className="container-fluid px-3 py-3">
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center bg-white rounded-3 p-3 shadow-sm">
                            <div>
                                <h4 className="mb-1 fw-bold" style={{ color: customStyles.primaryPink }}>{merchantName}</h4>
                                <p className="text-muted mb-0 small">{activeView === 'dishes' ? 'Quản lý món ăn' : 'Quản lý mã giảm giá'}</p>
                            </div>
                            <button
                                className="btn btn-sm fw-semibold px-4"
                                style={{ backgroundColor: customStyles.primaryPink, color: 'white', borderRadius: '0.5rem' }}
                                onClick={() => activeView === 'dishes' ? setShowAddModal(true) : setShowCouponModal(true)}
                            >
                                <Plus size={16} className="me-1" />
                                {activeView === 'dishes' ? 'Thêm món ăn' : 'Thêm mã giảm giá'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="bg-white rounded-3 p-3 shadow-sm">
                            <div className="row g-3">
                                {/* Tăng chiều rộng ô tìm kiếm từ col-md-5 lên col-md-6 */}
                                <div className="col-md-6">
                                    <label className="form-label small fw-semibold text-muted mb-1">Tìm kiếm theo tên</label>
                                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            <Search size={18} className="text-muted" />
                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0" // Bỏ border giữa icon và input cho mượt
                                            placeholder={activeView === 'dishes' ? 'Nhập tên món ăn...' : 'Nhập tên mã giảm giá...'}
                                            value={searchFilters.keyword}
                                            onChange={(e) => handleSearchChange('keyword', e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        {searchFilters.keyword && (
                                            <button
                                                className="btn btn-outline-secondary border-start-0"
                                                type="button"
                                                onClick={() => handleSearchChange('keyword', '')}
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {activeView === 'dishes' && (
                                    <>
                                        {/* Điều chỉnh col-md-3 cho Danh mục */}
                                        <div className="col-md-3">
                                            <label className="form-label small fw-semibold text-muted mb-1">Danh mục</label>
                                            <select
                                                className="form-select"
                                                value={searchFilters.categoryId}
                                                onChange={(e) => handleSearchChange('categoryId', e.target.value)}
                                            >
                                                <option value="">Tất cả danh mục</option>
                                                {categories.map((cat: {id: number, name: string}) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Điều chỉnh col-md-3 cho Khoảng giá để tổng bằng 12 */}
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

                                {/* Nếu view là coupons, ô tìm kiếm sẽ chiếm hết col-12 để không bị trống */}
                                {activeView === 'coupons' && <div className="col-md-6"></div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-lg-3">
                        <div className="rounded-3 p-3 shadow-sm mb-3" style={customStyles.sidebarBg}>
                            <h6 className="fw-bold text-white mb-3">Menu</h6>
                            <div className="d-grid">
                                <SidebarButton icon={List} text="Món ăn" onClick={() => setActiveView('dishes')} isActive={activeView === 'dishes'} />
                                <SidebarButton icon={Grid} text="Mã giảm giá" onClick={() => setActiveView('coupons')} isActive={activeView === 'coupons'} />
                            </div>
                        </div>

                        <div className="bg-white rounded-3 p-3 shadow-sm mb-3">
                            <h6 className="fw-bold mb-3">Thống kê nhanh</h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Tổng món:</span>
                                    <span className="fw-bold" style={{ color: customStyles.primaryPink }}>{dishStats.totalDishes}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Món nổi bật:</span>
                                    <span className="fw-bold text-warning">{dishStats.recommendedDishes}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Đang hoạt động:</span>
                                    <span className="badge bg-success">Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-light rounded-3 p-3 shadow-sm">
                            <h6 className="fw-bold mb-2 d-flex align-items-center gap-1">
                                <span style={{ fontSize: '1.2rem' }}>💡</span> Mẹo hay
                            </h6>
                            <p className="small text-muted mb-0">
                                Món ăn có ảnh đẹp và mô tả chi tiết sẽ thu hút khách hàng hơn!
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        <div className="bg-white rounded-3 shadow-sm" style={{ minHeight: '500px' }}>
                            {activeView === 'dishes' && (
                                <MerchantDishList
                                    onDishCreatedToggle={dishCreatedToggle}
                                    selectedDish={selectedDish}
                                    setSelectedDish={setSelectedDish}
                                    onEdit={handleEditDish}
                                    searchFilters={searchFilters}
                                />
                            )}
                            {activeView === 'coupons' && (
                                <MerchantCouponManager
                                    brandColor={customStyles.primaryPink}
                                    refreshTrigger={couponCreatedToggle}
                                />
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

            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setSelectedDishIdToEdit(null); }} size="xl" centered>
                <Modal.Header closeButton style={{ backgroundColor: customStyles.primaryPink, color: 'white', borderBottom: 'none' }}>
                    <Modal.Title style={{ fontWeight: 'bold' }}>Chỉnh Sửa Món Ăn</Modal.Title>
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
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
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