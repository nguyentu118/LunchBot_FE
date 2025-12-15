export interface Category {
    id: number;
    name: string;
    iconUrl: string;  // ⭐ Thay vì 'image'
    restaurantCount: number;
    colorClass?: string; // Optional - sẽ generate random
}