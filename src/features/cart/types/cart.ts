export interface CartItem {
    id: number;
    dishId: number;
    dishName: string;
    dishImage: string;
    price: number;
    quantity: number;
    subtotal: number;
    restaurantId: number;
    restaurantName: string;
    restaurantAddress?: string;
}

export interface CartResponse {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}

// Thêm interface cho nhóm cửa hàng
export interface RestaurantGroup {
    restaurantId: number;
    restaurantName: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    selected: boolean; // Checkbox cho cả nhóm
}

// Interface cho selected items
export interface SelectedItem {
    dishId: number;
    quantity: number;
    restaurantId: number;
}