import React, { useState, useCallback } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import MerchantDishList from '../../features/dish/MerchantDishList';
import AddDishModal from '../../features/dish/AddDishModal';
import DishUpdateForm from '../../features/dish/DishUpdateForm';
import useCategories from '../../features/category/useCategories';
import axiosInstance from '../../config/axiosConfig';
import toast from 'react-hot-toast';

const MenuPage: React.FC = () => {
    const { categories } = useCategories() as any;
    const [searchFilters, setSearchFilters] = useState({
        keyword: '',
        categoryId: '',
        priceRange: '',
        status: '',
        date: ''
    });

    const [dishCreatedToggle, setDishCreatedToggle] = useState(false);
    const [selectedDish, setSelectedDish] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDishIdToEdit, setSelectedDishIdToEdit] = useState<number | null>(null);
    const [newDishData, setNewDishData] = useState<any>({
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

    const handleSearchChange = (field: string, value: string) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddDish = useCallback(async (data: any) => {
        try {
            const merchantIdRes = await axiosInstance.get('/merchants/current/id');
            const merchantId = merchantIdRes.data.merchantId;

            const requestBody = {
                ...data,
                imagesUrls: JSON.stringify(data.uploadedUrls),
                price: parseFloat(data.price),
                discountPrice: parseFloat(data.discountPrice),
                serviceFee: data.serviceFee ? parseFloat(data.serviceFee) : 0,
                categoryIds: Array.from(data.categoryIds),
                merchantId: merchantId,
            };

            const response = await axiosInstance.post('/dishes/create', requestBody);
            toast.success(`Thêm món ăn "${response.data.name}" thành công!`);
            setDishCreatedToggle(prev => !prev);
            setShowAddModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi thêm món ăn");
        }
    }, []);

    const handleEditDish = useCallback((dish: any) => {
        setSelectedDishIdToEdit(dish.id);
        setShowEditModal(true);
    }, []);

    const handleNewDishChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;

        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            setNewDishData((prev: any) => ({...prev, imagesFiles: files}));
        } else if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setNewDishData((prev: any) => ({...prev, [name]: checked}));
        } else if (name === 'preparationTime') {
            const numValue = parseInt(value);
            setNewDishData((prev: any) => ({...prev, [name]: isNaN(numValue) ? undefined : numValue}));
        } else {
            setNewDishData((prev: any) => ({...prev, [name]: value}));
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        setNewDishData((prev: any) => {
            const newSet = new Set(prev.categoryIds);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return {...prev, categoryIds: newSet};
        });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Quản lý món ăn</h5>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={16} className="me-1" />
                    Thêm món ăn
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-light rounded-3 p-3 mb-3">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Tìm kiếm</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <Search size={18} className="text-muted"/>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchFilters.keyword}
                                onChange={(e) => handleSearchChange('keyword', e.target.value)}
                            />
                            {searchFilters.keyword && (
                                <button
                                    className="btn btn-outline-secondary border-start-0"
                                    onClick={() => handleSearchChange('keyword', '')}
                                >
                                    <X size={18}/>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Danh mục</label>
                        <select
                            className="form-select"
                            value={searchFilters.categoryId}
                            onChange={(e) => handleSearchChange('categoryId', e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {categories?.map((cat: any) => (
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
                            <option value="200000-999999999">Trên 200k</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Dishes List */}
            <MerchantDishList
                onDishCreatedToggle={dishCreatedToggle}
                selectedDish={selectedDish}
                setSelectedDish={setSelectedDish}
                onEdit={handleEditDish}
                onDishDeleted={() => setDishCreatedToggle(prev => !prev)}
                searchFilters={searchFilters}
            />

            {/* Modals */}
            <AddDishModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddDish}
                newDishData={newDishData}
                handleNewDishChange={handleNewDishChange}
                handleCategoryToggle={handleCategoryToggle}
                customStyles={{ primaryPink: '#ff5e62' }}
                MOCK_CATEGORIES={categories || []}
            />

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
                <Modal.Header closeButton style={{backgroundColor: '#ff5e62', color: 'white'}}>
                    <Modal.Title className="fw-bold">Chỉnh Sửa Món Ăn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDishIdToEdit ? (
                        <DishUpdateForm
                            dishId={selectedDishIdToEdit}
                            onSuccess={() => {
                                setDishCreatedToggle(prev => !prev);
                                setShowEditModal(false);
                            }}
                            onCancel={() => setShowEditModal(false)}
                        />
                    ) : <div>Không tìm thấy ID món ăn.</div>}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MenuPage;