# TOEIC 600 - Spaced Repetition App

Ứng dụng học 600 từ vựng TOEIC với thuật toán Spaced Repetition (SM-2), hỗ trợ quản lý dữ liệu hoàn toàn trên trình duyệt thông qua `localStorage`. Lộ trình 21 ngày bao gồm 50 chủ đề từ vựng đa dạng.

## 🚀 Hướng dẫn chạy dự án

Cài đặt dependencies và chạy ở môi trường development:

```bash
npm install
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 📚 Hướng dẫn nhập từ vựng vào app

Mặc định ứng dụng cung cấp 50 chủ đề rỗng. Người dùng cần tự nhập từ để học.

1. Mở app → bấm **"Quản lý"** (menu góc trên phải)
2. Chọn chủ đề muốn nhập (ví dụ: Contracts) bằng cách nhấn **"Nhập từ"**.
3. Tại trang quản lý chủ đề, có 2 cách để nhập:
   - **Nhập từng từ:** Điền thông tin vào form bên phải và bấm "Lưu & Thêm tiếp".
   - **Nhập nhiều từ:** Bấm nút **"📋 Nhập nhiều từ"** → Paste danh sách theo định dạng:
     `word | từ_loại | nghĩa_việt | định_nghĩa_anh | ví_dụ`

     *Ví dụ:*
     ```
     contract | n | hợp đồng | a binding legal agreement | The contract was signed.
     cancel | v | hủy bỏ | to call off something planned | The meeting was cancelled.
     party | n | bên tham gia | one side in a legal agreement |
     ```
   *(Cột định nghĩa và ví dụ có thể bỏ trống)*
4. Xem preview xem ứng dụng đã nhận diện đủ từ chưa, sau đó bấm **"Nhập tất cả"**.

## 📧 Hướng dẫn cài đặt nhắc nhở EmailJS

Ứng dụng hỗ trợ nhắc nhở học tập qua email bằng **EmailJS**.

1. Đăng ký tài khoản tại [emailjs.com](https://www.emailjs.com/) (miễn phí 200 email/tháng).
2. Tạo **Email Service** (kết nối Gmail).
3. Tạo **Email Template** với nội dung có chứa các biến sau:
   - `{{to_email}}`
   - `{{time_ago}}`
   - `{{studied_today}}`
   - `{{due_today}}`
   - `{{streak}}`
   - `{{app_url}}`
4. Mở app → Bấm vào nút **"Nhắc nhở"** (hình chuông) trên Dashboard.
5. Chuyển sang tab **"Cài đặt EmailJS"** → Điền Email nhận, Service ID, Template ID và Public Key.
6. Bấm **"Lưu"** và có thể test gửi mail. Tính năng hẹn giờ yêu cầu giữ trình duyệt mở.

## 🚀 Hướng dẫn Deploy lên Vercel

Ứng dụng không sử dụng Database backend nên việc deploy rất đơn giản:

1. Push mã nguồn này lên kho lưu trữ **GitHub**.
2. Đăng nhập vào [Vercel](https://vercel.com/) → **Add New Project** → Import repository từ GitHub.
3. Không cần thiết lập biến môi trường nào (Environment Variables).
4. Bấm **Deploy**.
5. Sau khi có domain, hãy cập nhật domain này vào ứng dụng nếu dùng cho tính năng nhắc nhở (`app_url`).

## 🛠 Công nghệ sử dụng
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Ngôn ngữ:** TypeScript
- **Lưu trữ:** `localStorage` (Trình duyệt)
- **Icons:** Lucide React
- **Email:** EmailJS (Client-side)
