import React from 'react';
import {
    UtensilsCrossed,  // Đồ ăn chung
    Soup,             // Phở, Súp
    Pizza,            // Pizza
    Sandwich,         // Burger, Bánh mì
    Salad,            // Salad, Ăn chay
    Coffee,           // Cà phê, Đồ uống
    Cake,             // Bánh, Dessert
    Fish,             // Hải sản
    Drumstick,        // Gà, Thịt
    Cookie,           // Snack, Đồ ăn vặt
    IceCream,         // Kem, Đồ lạnh
    Milk,             // Sữa, Sữa chua
    Apple,            // Trái cây
    Beef,             // Thịt bò
    Dessert,          // Tráng miệng
    ChefHat,          // Món Việt, Món truyền thống
    Croissant,        // Bánh Pháp
    Flame,            // Đồ nướng, BBQ
    LucideIcon
} from 'lucide-react';

/**
 * Map tên category sang icon tương ứng
 * Dựa vào tên category từ database để chọn icon phù hợp
 */
export const getCategoryIcon = (categoryName: string): LucideIcon => {
    const name = categoryName.toLowerCase().trim();

    // Món Việt
    if (name.includes('phở') || name.includes('pho')) return Soup;
    if (name.includes('bún') || name.includes('bun')) return Soup;
    if (name.includes('cơm') || name.includes('com')) return ChefHat;
    if (name.includes('bánh mì') || name.includes('banh mi')) return Sandwich;
    if (name.includes('món việt') || name.includes('viet')) return ChefHat;
    if (name.includes('huế') || name.includes('hue')) return Soup;
    if (name.includes('bắc') || name.includes('bac')) return Soup;
    if (name.includes('nam') || name.includes('miền nam')) return ChefHat;

    // Fast food & Western
    if (name.includes('pizza')) return Pizza;
    if (name.includes('burger') || name.includes('bugger')) return Sandwich;
    if (name.includes('sandwich')) return Sandwich;
    if (name.includes('hot dog') || name.includes('hotdog')) return Sandwich;
    if (name.includes('pasta') || name.includes('mì ý')) return UtensilsCrossed;

    // Đồ uống
    if (name.includes('coffee') || name.includes('cà phê') || name.includes('cafe')) return Coffee;
    if (name.includes('trà') || name.includes('tea') || name.includes('tra sua')) return Coffee;
    if (name.includes('sinh tố') || name.includes('smoothie')) return IceCream;
    if (name.includes('nước ép') || name.includes('juice')) return Apple;
    if (name.includes('sữa') || name.includes('milk')) return Milk;

    // Món nướng & thịt
    if (name.includes('gà') || name.includes('chicken') || name.includes('ga')) return Drumstick;
    if (name.includes('nướng') || name.includes('bbq') || name.includes('grill')) return Flame;
    if (name.includes('bò') || name.includes('beef') || name.includes('bo')) return Beef;

    // Hải sản
    if (name.includes('hải sản') || name.includes('seafood') || name.includes('hai san')) return Fish;
    if (name.includes('sushi') || name.includes('sashimi')) return Fish;

    // Món chay & salad
    if (name.includes('chay') || name.includes('vegetarian')) return Salad;
    if (name.includes('salad') || name.includes('rau')) return Salad;

    // Đồ ngọt & tráng miệng
    if (name.includes('bánh') || name.includes('cake')) return Cake;
    if (name.includes('kem') || name.includes('ice cream')) return IceCream;
    if (name.includes('dessert') || name.includes('tráng miệng')) return Dessert;
    if (name.includes('cookie') || name.includes('bánh quy')) return Cookie;
    if (name.includes('croissant')) return Croissant;

    // Đồ ăn vặt & snack
    if (name.includes('ăn vặt') || name.includes('snack') || name.includes('an vat')) return Cookie;
    if (name.includes('đồ uống') || name.includes('do uong')) return Coffee;

    // Món Á khác
    if (name.includes('mì') || name.includes('mi') || name.includes('noodle')) return Soup;
    if (name.includes('lẩu') || name.includes('lau') || name.includes('hot pot')) return Soup;
    if (name.includes('dimsum') || name.includes('dim sum')) return UtensilsCrossed;

    // Default icon
    return UtensilsCrossed;
};

/**
 * Component hiển thị icon cho category
 */
interface CategoryIconProps {
    categoryName: string;
    size?: number;
    className?: string;
    color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
                                                              categoryName,
                                                              size = 52,
                                                              className = '',
                                                              color = 'currentColor'
                                                          }) => {
    const IconComponent = getCategoryIcon(categoryName);

    return (
        <div className={`d-flex align-items-center justify-content-center ${className}`}>
            <IconComponent
                size={size}
                color={color}
                strokeWidth={1.5}
            />
        </div>
    );
};

/**
 * Component hiển thị icon với background màu
 */
interface CategoryIconWithBackgroundProps extends CategoryIconProps {
    backgroundColor?: string;
}

export const CategoryIconWithBackground: React.FC<CategoryIconWithBackgroundProps> = ({
                                                                                          categoryName,
                                                                                          size = 52,
                                                                                          backgroundColor = '#f8f9fa',
                                                                                          color = '#dc3545'
                                                                                      }) => {
    const IconComponent = getCategoryIcon(categoryName);

    return (
        <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
                width: `${size + 16}px`,
                height: `${size + 16}px`,
                backgroundColor: backgroundColor,
                margin: '0 auto'
            }}
        >
            <IconComponent
                size={size}
                color={color}
                strokeWidth={1.5}
            />
        </div>
    );
};

export default CategoryIcon;