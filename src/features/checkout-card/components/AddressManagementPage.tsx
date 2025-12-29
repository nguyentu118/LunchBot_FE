// src/features/address/pages/AddressManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import AddressSelector from '../../checkout-card/components/AddressSelector';
import { Address } from '../types/address.types';
import { addressService } from '../services/addressService';
import toast from 'react-hot-toast';
import Navigation from "../../../components/layout/Navigation.tsx";
import { Trash2 } from 'lucide-react';

const AddressManagementPage: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<number | null>(null); // TRACK ĐỊA CHỈ ĐANG XÓA
    const [isPopupOpen, setIsPopupOpen] = useState(false); // TRACK POPUP

    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await addressService.getAllAddresses();
            setAddresses(data);

            // Tự động chọn địa chỉ mặc định
            const defaultAddress = data.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else if (data.length > 0) {
                setSelectedAddressId(data[0].id);
            }
        } catch (err: any) {
            console.error('Error fetching addresses:', err);
            setError(err.message || 'Không thể tải danh sách địa chỉ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAddress = (address: Address) => {
        setSelectedAddressId(address.id);
    };

    const handleAddAddress = async (data: any) => {
        try {
            setIsLoading(true);
            await addressService.createAddress(data);
            toast.success('Thêm địa chỉ thành công!');
            await fetchAddresses();
        } catch (err: any) {
            console.error('Error adding address:', err);
            toast.error(err.message || 'Không thể thêm địa chỉ');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditAddress = async (addressId: number, data: any) => {
        try {
            setIsLoading(true);
            await addressService.updateAddress(addressId, data);
            toast.success('Cập nhật địa chỉ thành công!');
            await fetchAddresses();
        } catch (err: any) {
            console.error('Error updating address:', err);
            toast.error(err.message || 'Không thể cập nhật địa chỉ');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (isPopupOpen || isDeletingId !== null) return;

        setIsPopupOpen(true); // ĐÁNH DẤU POPUP ĐANG MỞ


        toast.custom((t) => (
            <div
                style={{
                    opacity: t.visible ? 1 : 0,
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'all 0.15s ease-out',
                    maxWidth: '400px',
                    width: '100%',
                    backgroundColor: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                    padding: '20px',
                    pointerEvents: 'auto',
                    borderTop: '4px solid #dc3545'
                }}
            >
                <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                        className="rounded-circle bg-danger bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '44px', height: '44px' }}
                    >
                        <Trash2 size={22} className="text-danger"/>
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="fw-bold text-dark mb-2">Xác nhận xóa địa chỉ</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                            Bạn có chắc chắn muốn xóa
                        </p>
                    </div>
                </div>

                <div className="d-flex gap-2 justify-content-end pt-2 border-top">
                    <button
                        className="btn btn-danger px-4 d-flex align-items-center gap-2"
                        onClick={async () => {
                            setIsDeletingId(addressId); // ĐÁNH DẤU ĐANG XÓA
                            toast.dismiss(t.id);

                            try {
                                await addressService.deleteAddress(addressId);
                                toast.success('Xóa địa chỉ thành công!', {
                                    icon: '✅',
                                    duration: 3000
                                });
                                await fetchAddresses();
                            } catch (err: any) {
                                console.error('Error deleting address:', err);
                                toast.error(err.message || 'Không thể xóa địa chỉ', {
                                    duration: 4000
                                });
                            } finally {
                                // RESET STATE SAU KHI HOÀN THÀNH
                                setTimeout(() => {
                                    setIsDeletingId(null);
                                    setIsPopupOpen(false);
                                }, 500);
                            }
                        }}
                        disabled={isDeletingId === addressId}
                        style={{ fontSize: '0.9rem' }}
                    >
                        {isDeletingId === addressId ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Xác nhận xóa
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-light border px-4"
                        onClick={() => {
                            toast.dismiss(t.id);
                            setIsPopupOpen(false); // RESET STATE KHI HỦY
                        }}
                        disabled={isDeletingId === addressId}
                        style={{ fontSize: '0.9rem' }}
                    >
                        Hủy bỏ
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                background: 'transparent',
                boxShadow: 'none'
            }
        });
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            setIsLoading(true);
            await addressService.setDefaultAddress(addressId);
            toast.success('Đã đặt làm địa chỉ mặc định!');
            await fetchAddresses();
        } catch (err: any) {
            console.error('Error setting default address:', err);
            toast.error(err.message || 'Không thể đặt địa chỉ mặc định');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && addresses.length === 0) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải danh sách địa chỉ...</p>
            </Container>
        );
    }

    return (
        <>
            <Navigation/>
            <Container className="py-4">
                <div className="mb-4">
                    <h2 className="mb-1">Quản lý địa chỉ giao hàng</h2>
                    <p className="text-muted">Thêm, chỉnh sửa hoặc xóa địa chỉ giao hàng của bạn</p>
                </div>

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <AddressSelector
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={handleSelectAddress}
                    onAddAddress={handleAddAddress}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                    onSetDefaultAddress={handleSetDefaultAddress}
                    isLoading={isLoading}
                />
            </Container>
        </>
    );
};

export default AddressManagementPage;