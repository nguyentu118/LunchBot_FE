export interface GuestCartItem {
    dishId: number;
    quantity: number;
    // Cache thông tin món
    dishName?: string;
    dishImage?: string;
    price?: number;
    cachedAt?: number;
}

export interface GuestCartItemDetail extends GuestCartItem {
    dishName: string;
    dishImage: string;
    price: number;
    subtotal: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 giờ
const STORAGE_KEY = 'GUEST_CART';

export const GuestCartHelper = {
    getCart: (): GuestCartItem[] => {
        try {
            const cartJson = localStorage.getItem(STORAGE_KEY);
            return cartJson ? JSON.parse(cartJson) : [];
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    },

    saveCart: (cart: GuestCartItem[]): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            // Trigger event để các component khác biết cart đã thay đổi
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    },

    // 🔥 Thêm món VÀ cache thông tin
    addItem: (
        dishId: number,
        quantity: number,
        dishInfo?: { name: string; image: string; price: number }
    ): void => {
        const cart = GuestCartHelper.getCart();
        const existingItem = cart.find(item => item.dishId === dishId);

        if (existingItem) {
            existingItem.quantity += quantity;

            // Cập nhật cache nếu có thông tin mới
            if (dishInfo) {
                existingItem.dishName = dishInfo.name;
                existingItem.dishImage = dishInfo.image;
                existingItem.price = dishInfo.price;
                existingItem.cachedAt = Date.now();
            }
        } else {
            const newItem: GuestCartItem = {
                dishId,
                quantity,
                ...(dishInfo && {
                    dishName: dishInfo.name,
                    dishImage: dishInfo.image,
                    price: dishInfo.price,
                    cachedAt: Date.now()
                })
            };
            cart.push(newItem);
        }

        GuestCartHelper.saveCart(cart);
    },

    updateItem: (dishId: number, quantity: number): void => {
        const cart = GuestCartHelper.getCart();
        const item = cart.find(item => item.dishId === dishId);

        if (item) {
            if (quantity <= 0) {
                // Nếu quantity <= 0 → xóa món
                GuestCartHelper.removeItem(dishId);
            } else {
                item.quantity = quantity;
                GuestCartHelper.saveCart(cart);
            }
        }
    },

    removeItem: (dishId: number): void => {
        const cart = GuestCartHelper.getCart();
        const filteredCart = cart.filter(item => item.dishId !== dishId);
        GuestCartHelper.saveCart(filteredCart);
    },

    clearCart: (): void => {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('cartUpdated'));
    },

    getTotalCount: (): number => {
        const cart = GuestCartHelper.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    // 🔥 Kiểm tra món nào cần refresh cache
    getItemsNeedingRefresh: (): number[] => {
        const cart = GuestCartHelper.getCart();
        const now = Date.now();

        return cart
            .filter(item => {
                // Cần refresh nếu:
                // 1. Chưa có cache
                if (!item.cachedAt) return true;

                // 2. Thiếu thông tin
                if (!item.dishName || item.price === undefined || item.price === null) return true;

                // 3. Cache đã cũ (> 24h)
                if ((now - item.cachedAt) > CACHE_DURATION) return true;

                return false;
            })
            .map(item => item.dishId);
    },

    // 🔥 Cập nhật cache cho nhiều món
    updateCache: (dishes: Array<{ id: number; name: string; image: string; price: number }>): void => {
        const cart = GuestCartHelper.getCart();
        const dishMap = new Map(dishes.map(d => [d.id, d]));

        cart.forEach(item => {
            const dish = dishMap.get(item.dishId);
            if (dish) {
                item.dishName = dish.name;
                item.dishImage = dish.image;
                item.price = dish.price;
                item.cachedAt = Date.now();
            }
        });

        GuestCartHelper.saveCart(cart);
    },

    // 🔥 Kiểm tra xem cart có món không hợp lệ không
    hasInvalidItems: (): boolean => {
        const cart = GuestCartHelper.getCart();
        return cart.some(item =>
            !item.dishName ||
            item.price === undefined ||
            item.price === null
        );
    },

    // 🔥 Lấy thông tin chi tiết cart (cho UI)
    getCartDetails: (): GuestCartItemDetail[] => {
        const cart = GuestCartHelper.getCart();

        return cart
            .filter(item =>
                item.dishName &&
                item.price !== undefined &&
                item.price !== null
            )
            .map(item => ({
                ...item,
                dishName: item.dishName!,
                dishImage: item.dishImage || '/images/placeholder-dish.jpg',
                price: item.price!,
                subtotal: item.price! * item.quantity
            }));
    },

    // 🔥 Sync cart khi user login
    prepareForSync: (): Array<{ dishId: number; quantity: number }> => {
        const cart = GuestCartHelper.getCart();
        return cart.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity
        }));
    }
};