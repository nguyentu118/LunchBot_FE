// src/features/address/pages/AddressManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AddressSelector from '../../checkout-card/components/AddressSelector';
import { Address } from '../types/address.types';
import { addressService } from '../services/addressService';
import toast from 'react-hot-toast';
import Navigation from "../../../components/layout/Navigation.tsx";

const AddressManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            return;
        }

        try {
            setIsLoading(true);
            await addressService.deleteAddress(addressId);
            toast.success('Xóa địa chỉ thành công!');
            await fetchAddresses();
        } catch (err: any) {
            console.error('Error deleting address:', err);
            toast.error(err.message || 'Không thể xóa địa chỉ');
            throw err;
        } finally {
            setIsLoading(false);
        }
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