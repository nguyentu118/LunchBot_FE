import React, { useState, useEffect, useCallback } from 'react';
import { Plus, List, Ticket, Grid } from 'lucide-react';
import { Modal } from "react-bootstrap";
import AddDishModal from "../../features/dish/AddDishModal.tsx";
import AddCouponModal from "../../features/coupon/components/AddCouponModal.tsx";
import MerchantDishList from "../../features/dish/MerchantDishList.tsx";
import MerchantCouponManager from "../../features/coupon/components/MerchantCouponManager.tsx";
import axiosInstance from "../../config/axiosConfig.ts";
import { AxiosResponse, AxiosError } from 'axios';
import useCategories from "../../features/category/useCategories.ts";
import toast from "react-hot-toast";
import DishUpdateForm from "../../features/dish/DishUpdateForm.tsx";
import Navigation from "./Navigation.tsx";

// --- INTERFACES ---
interface Dish {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string | null;
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

const customStyles = {
    primaryPink: '#ff5e62',
    secondaryYellow: '#ffe033',
    primaryColor: '#dc3545',
    sidebarBg: {
        background: 'linear-gradient(to bottom right, #dc3545, #ff5e62)'
    },
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
                                                         icon: Icon,
                                                         text,
                                                         onClick,
                                                         color = 'danger',
                                                         isActive = false
                                                     }) => (
    <button
        onClick={onClick}
        className={`btn w-100 py-3 mb-3 fw-bold d-flex justify-content-center align-items-center gap-2`}
        style={{
            borderRadius: '0.75rem',
            backgroundColor: isActive ? 'white' : 'transparent',
            color: isActive ? customStyles.primaryPink : 'white',
            border: isActive ? 'none' : '2px solid rgba(255, 255, 255, 0.3)'
        }}
    >
        <Icon size={20} />
        {text}
    </button>
);

const MerchantDashboardBootstrap: React.FC = () => {
    const { categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();

    const [currentMerchantId, setCurrentMerchantId] = useState<number | null>(null);
    const [merchantName, setMerchantName] = useState<string>('Đang tải...');
    const [isLoadingId, setIsLoadingId] = useState<boolean>(true);

    // State cho view type: 'dishes' | 'coupons'
    const [activeView, setActiveView] = useState<'dishes' | 'coupons'>('dishes');
    const [dishCreatedToggle, setDishCreatedToggle] = useState<boolean>(false);

    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
    const [selectedDishIdToEdit, setSelectedDishIdToEdit] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);

    const [newDishData, setNewDishData] = useState<DishCreateRequestState>({
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
    });

    useEffect(() => {
        const fetchMerchantId = async () => {
            let merchantNameData: string = 'Lỗi tải tên';
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
                merchantNameData = profileResponse.data.restaurantName || 'Cửa hàng của tôi';
                setMerchantName(merchantNameData);
            } catch (error) {
                console.warn("Không thể tải tên Merchant.", error);
                setMerchantName('Cửa hàng của tôi');
            } finally {
                setIsLoadingId(false);
            }
        };
        fetchMerchantId();
    }, []);

    const handleAddDish = useCallback(async (data: Omit<DishCreateRequestState, 'imagesFiles' | 'merchantId'> & { uploadedUrls: string[] }) => {
        if (isLoadingId || currentMerchantId === null) {
            toast.error("Thông tin Merchant chưa sẵn sàng. Vui lòng thử lại sau giây lát.");
            return;
        }

        const imagesUrlsJson = JSON.stringify(data.uploadedUrls);

        const requestBody = {
            name: data.name,
            imagesUrls: imagesUrlsJson,
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
            const createdDish = response.data;

            toast.success(`Thêm món ăn "${createdDish.name}" thành công!`);
            setDishCreatedToggle(prev => !prev);

            setNewDishData({
                name: '',
                merchantId: undefined,
                address:'',
                imagesFiles: null,
                preparationTime: undefined,
                description: '',
                price: '',
                discountPrice: '',
                serviceFee: '',
                categoryIds: new Set<number>(),
                isRecommended: false,
            });
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

    type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    type FileChangeEvent = React.ChangeEvent<HTMLInputElement>;

    const handleNewDishChange = (e: InputChangeEvent | FileChangeEvent) => {
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

    if (isLoadingId || isLoadingCategories) {
        return <div className="text-center p-5">Đang tải dữ liệu Merchant và Danh mục...</div>;
    }

    if (currentMerchantId === null) {
        return <div className="text-center p-5 text-danger">Lỗi nghiêm trọng: Không xác định được Merchant ID. Vui lòng đăng nhập lại.</div>;
    }

    return (
        <div className="min-vh-100 bg-light">
            {/* HEADER */}
            <header className="shadow-sm border-bottom" style={{ backgroundColor: customStyles.primaryPink }}>
                <Navigation />
            </header>

            <div className="container-fluid container-lg px-4 py-5">
                {/* BANNER DASHBOARD */}
                <div className="rounded-4 p-5 mb-5 shadow" style={{ backgroundColor: customStyles.primaryPink, color: 'white' }}>
                    <h2 className="display-6 fw-bold mb-2">{merchantName}</h2>
                    <p className="lead">
                        {activeView === 'dishes' ? 'Quản lý món ăn' : 'Quản lý mã giảm giá'}
                    </p>
                </div>

                <div className="row g-4">
                    {/* Sidebar */}
                    <div className="col-lg-4 col-xl-3">
                        <div className="rounded-4 p-4 shadow" style={customStyles.sidebarBg}>
                            <h3 className="h5 fw-bold text-white mb-4">Chức năng</h3>
                            <div className="d-grid gap-3">
                                <SidebarButton
                                    icon={List}
                                    text="Quản lý món ăn"
                                    onClick={() => setActiveView('dishes')}
                                    isActive={activeView === 'dishes'}
                                />
                                <SidebarButton
                                    icon={Grid}
                                    text="Quản lý mã giảm giá"
                                    onClick={() => setActiveView('coupons')}
                                    isActive={activeView === 'coupons'}
                                />

                                <div className="border-top border-white border-opacity-25 my-2"></div>

                                {activeView === 'dishes' && (
                                    <SidebarButton
                                        icon={Plus}
                                        text="Thêm món ăn"
                                        onClick={() => setShowAddModal(true)}
                                    />
                                )}

                                {activeView === 'coupons' && (
                                    <SidebarButton
                                        icon={Ticket}
                                        text="Thêm mã giảm giá"
                                        onClick={() => setShowCouponModal(true)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-8 col-xl-9">
                        {activeView === 'dishes' && (
                            <MerchantDishList
                                onDishCreatedToggle={dishCreatedToggle}
                                selectedDish={selectedDish}
                                setSelectedDish={setSelectedDish}
                                onEdit={handleEditDish}
                            />
                        )}

                        {activeView === 'coupons' && (
                            <MerchantCouponManager brandColor={customStyles.primaryPink} />
                        )}
                    </div>
                </div>
            </div>

            {/* ADD DISH MODAL */}
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

            {/* ADD COUPON MODAL */}
            <AddCouponModal
                show={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                onSuccess={() => {
                    setShowCouponModal(false);
                    toast.success("Tạo mã khuyến mãi thành công!");
                }}
                customStyles={customStyles}
            />

            {/* EDIT DISH MODAL */}
            <Modal
                show={showEditModal}
                onHide={() => {
                    setShowEditModal(false);
                    setSelectedDishIdToEdit(null);
                }}
                size="xl"
                centered
                dialogClassName="modal-dialog-short"
            >
                <Modal.Header
                    closeButton
                    style={{
                        backgroundColor: 'rgb(255, 94, 98)',
                        color: 'white',
                        borderBottom: 'none',
                        height: '84px'
                    }}
                >
                    <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>Chỉnh Sửa Món Ăn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDishIdToEdit ? (
                        <DishUpdateForm
                            dishId={selectedDishIdToEdit}
                            onSuccess={() => {
                                setShowEditModal(false);
                                setSelectedDishIdToEdit(null);
                                setDishCreatedToggle(prev => !prev);
                                toast.success("Cập nhật món ăn thành công!");
                            }}
                            onCancel={() => setShowEditModal(false)}
                        />
                    ) : (
                        <div>Không tìm thấy ID món ăn để sửa.</div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Hiển thị lỗi tải danh mục */}
            {categoriesError && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Lỗi tải danh mục:</strong> {categoriesError}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantDashboardBootstrap;