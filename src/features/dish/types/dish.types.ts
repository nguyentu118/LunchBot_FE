export interface DishSearchResponse {
    id: number;
    name: string;
    imagesUrls: string;
    price: number;
    restaurantName: string;
    isRecommended: boolean;
}

export interface DishSearchRequest {
    name?: string;
    categoryName?: string;
    minPrice?: number;
    maxPrice?: number;
    isRecommended?: boolean;
    page?: number;
    size?: number;
}

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}