export interface CartItem {
    id: number;
    dishId: number;
    dishName: string;
    dishImage: string;
    price: number;
    quantity: number;
    subtotal: number; // price * quantity
}

export interface CartResponse {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}