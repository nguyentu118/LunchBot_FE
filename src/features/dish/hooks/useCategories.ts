import { useState, useEffect } from 'react';
import categoryService from '../services/CategoryService';

interface UseCategoriesReturn {
    categories: string[];
    loading: boolean;
    error: string | null;
}

const useCategories = (): UseCategoriesReturn => {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await categoryService.getAllCategories();

                // Extract category names
                const categoryNames = data.map(cat => cat.name);
                setCategories(categoryNames);

            } catch (err: any) {
                console.error('Error fetching categories:', err);
                setError(err.message || 'Không thể tải danh mục');

                // Fallback to default categories
                setCategories(['Breakfast', 'Lunch', 'Dinner', 'Café']);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};

export default useCategories;