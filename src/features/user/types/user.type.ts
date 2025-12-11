// src/features/user/types/user.type.ts (Tạo mới hoặc thêm vào file types hiện có)

export interface UserMeDTO {
    fullName: string;
    isLoggedIn: boolean;
}

export interface CartCountDTO {
    count: number;
}