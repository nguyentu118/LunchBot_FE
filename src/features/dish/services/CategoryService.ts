const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface Category {
    id: number;
    name: string;
}

export const categoryService = {
    /**
     * Lấy tất cả categories
     */
    getAllCategories: async (): Promise<Category[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Category[] = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    /**
     * Lấy categories với số lượng dishes
     */
    getCategoriesWithDishes: async (): Promise<any[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories/with-dishes`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching categories with dishes:', error);
            throw error;
        }
    }
};

export default categoryService;