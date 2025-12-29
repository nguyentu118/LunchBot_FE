// features/cart/types/guestCart.ts

export interface GuestCartItem {
    dishId: number;
    quantity: number;
    dishName?: string;
    dishImage?: string;
    price?: number;
    cachedAt?: number;
    restaurantId?: number;
    restaurantName?: string;
}

export interface GuestCartItemDetail extends GuestCartItem {
    dishName: string;
    dishImage: string;
    price: number;
    subtotal: number;
    restaurantId: number;
    restaurantName: string;
}

const STORAGE_KEY = 'GUEST_CART';

export const GuestCartHelper = {
    getCart: (): GuestCartItem[] => {
        try {
            const cartJson = localStorage.getItem(STORAGE_KEY);
            return cartJson ? JSON.parse(cartJson) : [];
        } catch (error) {
            console.error('Error reading cart:', error);
            return [];
        }
    },

    saveCart: (cart: GuestCartItem[]): void => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        // Sự kiện này giúp Navigation.tsx và useCartCount nhận biết thay đổi
        window.dispatchEvent(new Event('cartUpdated'));
    },

    // --- 1. THÊM HÀM NÀY: Để Navigation lấy được số hiển thị lên Icon ---
    getTotalCount: (): number => {
        const cart = GuestCartHelper.getCart();
        return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    },

    // --- 2. THÊM HÀM NÀY: Để CartApi.services.ts lấy dữ liệu sync ---
    prepareForSync: (): { dishId: number; quantity: number }[] => {
        const cart = GuestCartHelper.getCart();
        return cart.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity
        }));
    },

    // --- 3. THÊM HÀM NÀY: Để CartPage.tsx gọi khi bấm tăng/giảm số lượng ---
    updateItem: (dishId: number, quantity: number) => {
        const cart = GuestCartHelper.getCart();
        const idToCheck = Number(dishId);
        const newQty = Number(quantity);

        const index = cart.findIndex(i => Number(i.dishId) === idToCheck);

        if (index > -1) {
            if (newQty <= 0) {
                cart.splice(index, 1); // Xóa nếu số lượng <= 0
            } else {
                cart[index].quantity = newQty;
            }
            GuestCartHelper.saveCart(cart);
        }
    },

    removeItem: (dishId: number) => {
        const cart = GuestCartHelper.getCart();
        const idToRemove = Number(dishId);
        const newCart = cart.filter(item => Number(item.dishId) !== idToRemove);
        GuestCartHelper.saveCart(newCart);
    },

    addItem: (dishId: number, quantity: number, dishInfo?: any) => {
        const cart = GuestCartHelper.getCart();
        const idToCheck = Number(dishId);
        const qtyToAdd = Number(quantity);

        const existingItemIndex = cart.findIndex(i => Number(i.dishId) === idToCheck);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = Number(cart[existingItemIndex].quantity) + qtyToAdd;
            // Update info nếu có
            if (dishInfo) {
                if (dishInfo.name) cart[existingItemIndex].dishName = dishInfo.name;
                if (dishInfo.image) cart[existingItemIndex].dishImage = dishInfo.image;
                if (dishInfo.price) cart[existingItemIndex].price = dishInfo.price;
                if (dishInfo.restaurantId) cart[existingItemIndex].restaurantId = dishInfo.restaurantId;
                if (dishInfo.restaurantName) cart[existingItemIndex].restaurantName = dishInfo.restaurantName;
            }
        } else {
            cart.push({
                dishId: idToCheck,
                quantity: qtyToAdd,
                dishName: dishInfo?.name,
                dishImage: dishInfo?.image,
                price: dishInfo?.price,
                restaurantId: dishInfo?.restaurantId,
                restaurantName: dishInfo?.restaurantName,
                cachedAt: Date.now()
            });
        }
        GuestCartHelper.saveCart(cart);
    },

    hasInvalidItems: (): boolean => {
        const cart = GuestCartHelper.getCart();
        return cart.some(item => !item.dishId || item.quantity <= 0);
    },

    getCartDetails: (): GuestCartItemDetail[] => {
        const cart = GuestCartHelper.getCart();
        return cart.map(item => ({
            ...item,
            dishName: item.dishName || 'Đang tải...',
            dishImage: item.dishImage || '/images/placeholder-dish.jpg',
            price: item.price || 0,
            restaurantId: item.restaurantId || -1,
            restaurantName: item.restaurantName || 'Đang cập nhật...',
            subtotal: (item.price || 0) * item.quantity
        }));
    },

    updateCache: (itemsInfo: any[]) => {
        const cart = GuestCartHelper.getCart();
        let hasChange = false;

        cart.forEach(cartItem => {
            const info = itemsInfo.find((i: any) => i.id === cartItem.dishId);
            if (info) {
                const needsUpdate =
                    cartItem.restaurantId !== info.restaurantId ||
                    cartItem.dishName !== info.name ||
                    cartItem.price !== info.price;

                if (needsUpdate) {
                    cartItem.dishName = info.name;
                    cartItem.dishImage = info.image;
                    cartItem.price = info.price;
                    cartItem.restaurantId = info.restaurantId;
                    cartItem.restaurantName = info.restaurantName;
                    cartItem.cachedAt = Date.now();
                    hasChange = true;
                }
            }
        });
        if (hasChange) {
            GuestCartHelper.saveCart(cart);
        }
    }
};