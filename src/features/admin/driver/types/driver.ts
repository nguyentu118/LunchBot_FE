export interface ShippingPartnerRequest {
    name: string;
    email: string;
    phone: string;
    address?: string;
    commissionRate: number;
    isDefault: boolean;
}

export interface ShippingPartnerResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    commissionRate: number;
    isDefault: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    isLocked: boolean;
    createdAt: string;
}
