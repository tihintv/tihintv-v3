// File: src/lib/adminAuth.ts
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "tihintv_admin_auth";
// Mã hóa nhẹ mật khẩu để lưu vào cookie cho an toàn hơn chút
const SECRET_TOKEN = "admin_logged_in_token_xyz"; 

// Hàm kiểm tra xem đã đăng nhập chưa
export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token?.value === SECRET_TOKEN;
}

// Hàm xử lý đăng nhập (gọi từ Client)
export async function loginAdmin(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    const cookieStore = await cookies();
    // Set cookie sống trong 7 ngày
    cookieStore.set(AUTH_COOKIE_NAME, SECRET_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/",
    });
    return true;
  }
  return false;
}

// Hàm xử lý đăng xuất
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}