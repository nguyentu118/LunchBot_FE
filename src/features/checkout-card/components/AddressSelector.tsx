// src/features/checkout/components/AddressSelector.tsx
// hiển thị danh sách địa chỉ,nutst thêm mới, chọn địa chỉ giao hàng,
import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { MapPin, Plus } from 'lucide-react';
import { Address } from '../types/address.types';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

interface AddressSelectorProps {
    addresses: Address[];
    selectedAddressId: number | null;
    onSelectAddress: (address: Address) => void;
    onAddAddress: (data: any) => Promise<void>;
    onEditAddress: (addressId: number, data: any) => Promise<void>;
    onDeleteAddress: (addressId: number) => Promise<void>;
    onSetDefaultAddress: (addressId: number) => Promise<void>;
    isLoading?: boolean;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
                                                             addresses,
                                                             selectedAddressId,
                                                             onSelectAddress,
                                                             onAddAddress,
                                                             onEditAddress,
                                                             onDeleteAddress,
                                                             onSetDefaultAddress,
                                                             isLoading = false
                                                         }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingAddress(null);
    };

    const handleSubmitAdd = async (data: any) => {
        await onAddAddress(data);
        handleCloseModal();
    };

    const handleSubmitEdit = async (data: any) => {
        if (editingAddress) {
            await onEditAddress(editingAddress.id, data);
            handleCloseModal();
        }
    };

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 d-flex align-items-center">
                        <MapPin size={20} className="text-danger me-2" />
                        Địa chỉ giao hàng
                    </h5>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        className="d-flex align-items-center gap-2"
                    >
                        <Plus size={18} />
                        Thêm địa chỉ mới
                    </Button>
                </div>
            </Card.Header>

            <Card.Body>
                {addresses.length === 0 ? (
                    <Alert variant="info" className="mb-0">
                        <p className="mb-2">Bạn chưa có địa chỉ giao hàng nào.</p>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16} className="me-1" />
                            Thêm địa chỉ đầu tiên
                        </Button>
                    </Alert>
                ) : (
                    <div>
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                isSelected={address.id === selectedAddressId}
                                onSelect={onSelectAddress}
                                onEdit={handleEdit}
                                onDelete={onDeleteAddress}
                                onSetDefault={onSetDefaultAddress}
                                showActions={true}
                            />
                        ))}
                    </div>
                )}
            </Card.Body>

            {/* Add Address Modal */}
            <AddressForm
                show={showAddModal}
                onHide={handleCloseModal}
                onSubmit={handleSubmitAdd}
                isLoading={isLoading}
            />

            {/* Edit Address Modal */}
            <AddressForm
                show={!!editingAddress}
                onHide={handleCloseModal}
                onSubmit={handleSubmitEdit}
                address={editingAddress}
                isLoading={isLoading}
            />
        </Card>
    );
};

export default AddressSelector;