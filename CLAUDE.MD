# PROMPT: Build Website Học 600 Từ Vựng TOEIC

## 🎯 Mục tiêu tổng thể

Xây dựng một **Next.js 14 web app** để học thuộc 600 từ vựng TOEIC trong **3 tuần**, triển khai trên **Vercel** (miễn phí). App phải khoa học, có lộ trình rõ ràng, và dùng **Spaced Repetition (SM-2 algorithm)** để tối ưu việc ghi nhớ.

---

## 📁 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Email nhắc nhở**: EmailJS (free tier)
- **Lưu toàn bộ data + tiến độ**: localStorage (không cần backend/database)
- **Deploy**: Vercel

---

## 📊 Dữ liệu từ vựng — Nhập thủ công trong app

**Không dùng file code để import data.** Thay vào đó, app có giao diện quản lý nội dung (CRUD) ngay trong trình duyệt. Người dùng tự tạo topic và nhập từng từ vào, toàn bộ lưu localStorage.

### Cấu trúc data lưu trong localStorage:

```typescript
// localStorage key: "toeic_topics"
export interface Word {
  id: string;          // tự sinh: `${topicId}_${Date.now()}`
  word: string;        // từ tiếng Anh
  type: string;        // từ loại: "n", "v", "adj", "adv", "n/v", ...
  vietnamese: string;  // nghĩa tiếng Việt
  definition: string;  // định nghĩa tiếng Anh (có thể để trống)
  example: string;     // câu ví dụ (có thể để trống)
}

export interface Topic {
  id: string;          // tự sinh: slug từ tên
  name: string;        // tên tiếng Anh
  nameVi: string;      // tên tiếng Việt (có thể để trống)
  order: number;       // thứ tự trong lộ trình 21 ngày
  words: Word[];
  createdAt: string;
}
```

### 48 topic mặc định đã được tạo sẵn (rỗng, chưa có từ):

App khởi động lần đầu sẽ tự seed 48 topics theo danh sách chuẩn (chỉ có tên, chưa có từ). Người dùng vào từng topic để nhập từ.

### Danh sách 48 chủ đề (theo thứ tự trong sách):

**Nhóm 1 – 12 từ/topic (topics 1–20):**
1. Contract (Hợp đồng)
2. Marketing (Tiếp thị)
3. Warranties (Bảo hành)
4. Business Planning (Kế hoạch kinh doanh)
5. Conferences (Hội nghị)
6. Computers (Máy tính)
7. Office (Văn phòng)
8. Office Procedures (Thủ tục văn phòng)
9. Electronics (Thiết bị điện tử)
10. Correspondence (Thư tín)
11. Job Advertising & Recruiting
12. Applying & Interviewing
13. Hiring & Training
14. Salaries & Benefits
15. Promotions, Pensions & Awards
16. Shopping (Mua sắm)
17. Ordering Supplies
18. Shipping (Vận chuyển)
19. Invoices (Hóa đơn)
20. Inventory (Hàng tồn kho)

**Nhóm 2 – 10 từ/topic (topics 21–48):**
21. Banking (Ngân hàng)
22. Accounting (Kế toán)
23. Investments (Đầu tư)
24. Taxes (Thuế)
25. Financial Statements
26. Property & Department
27. Board Meetings & Committees
28. Quality Control
29. Product Development
30. Renting & Leasing
31. Selecting a Restaurant
32. Eating Out
33. Ordering Lunch
34. Cooking as a Career
35. Events (Sự kiện)
36. General Travel
37. Airlines
38. Trains
39. Hotels
40. Car Rentals
41. Films & Theater
42. Museums & Music
43. Media (Truyền thông)
44. Doctor's Office
45. Dentist's Office
46. Health Insurance
47. Hospitals
48. Pharmacy

**Tổng: 520–600 từ** (20 topics × 12 từ + 28 topics × 10 từ)

---

## 🗂️ Cấu trúc thư mục

```
/app
  /page.tsx                        → Dashboard (trang chủ)
  /plan/page.tsx                   → Lộ trình 21 ngày
  /topic/[id]/page.tsx             → Xem danh sách từ + nút thêm/sửa/xóa từ
  /study/[id]/page.tsx             → Màn hình học flashcard (Spaced Repetition)
  /review/page.tsx                 → Ôn tập từ đến hạn hôm nay
  /stats/page.tsx                  → Thống kê tiến độ
  /manage/page.tsx                 → Quản lý tất cả topics (danh sách, thêm topic mới)
  /manage/[id]/page.tsx            → Nhập từ cho một topic cụ thể

/components
  /TopicCard.tsx
  /FlashCard.tsx
  /ProgressBar.tsx
  /StudyPlanDay.tsx
  /EmailReminder.tsx
  /WordList.tsx
  /WordFormModal.tsx               → Modal thêm/sửa một từ
  /ImportWordsModal.tsx            → Modal paste nhiều từ cùng lúc
  /StatsChart.tsx

/data
  /defaultTopics.ts                → 48 topics mặc định (chỉ có id, name, nameVi, order — không có words)

/lib
  /sm2.ts
  /storage.ts
  /studyPlan.ts
  /types.ts

/styles
  /globals.css
```

---

## 🧠 Core Logic: Spaced Repetition (SM-2)

### File: `lib/sm2.ts`

Implement thuật toán SM-2 chuẩn:

```typescript
export interface WordProgress {
  wordId: string;
  interval: number;       // số ngày đến lần ôn tiếp
  easeFactor: number;     // độ dễ nhớ (bắt đầu = 2.5)
  repetitions: number;    // số lần đã ôn
  nextReview: string;     // ISO date string
  lastReview: string;     // ISO date string
  status: 'new' | 'learning' | 'known';
}

// Khi người dùng đánh giá từ:
// quality = 0 → Quên hoàn toàn (reset)
// quality = 1 → Khó, gần như quên
// quality = 2 → Khó nhưng nhớ ra
// quality = 3 → Đúng nhưng phải suy nghĩ
// quality = 4 → Đúng, ít suy nghĩ
// quality = 5 → Nhớ ngay, rất dễ

export function updateSM2(progress: WordProgress, quality: 0|1|2|3|4|5): WordProgress {
  // Implement SM-2 algorithm:
  // Nếu quality < 3: reset repetitions = 0, interval = 1
  // Nếu quality >= 3:
  //   repetitions === 0 → interval = 1
  //   repetitions === 1 → interval = 6
  //   repetitions > 1  → interval = round(interval * easeFactor)
  //   easeFactor = easeFactor + (0.1 - (5-quality) * (0.08 + (5-quality) * 0.02))
  //   easeFactor không được < 1.3
  //   repetitions++
  // nextReview = today + interval days
}

export function getDueWords(allProgress: WordProgress[]): WordProgress[] {
  const today = new Date().toISOString().split('T')[0];
  return allProgress.filter(p => p.nextReview <= today);
}
```

### File: `lib/storage.ts`

```typescript
// Lưu toàn bộ tiến độ vào localStorage key: "toeic_progress"
// Shape: { [wordId: string]: WordProgress }

export function getProgress(): Record<string, WordProgress>
export function saveProgress(progress: Record<string, WordProgress>): void
export function getWordProgress(wordId: string): WordProgress | null
export function updateWordProgress(wordId: string, quality: 0|1|2|3|4|5): void

// Lưu streak và metadata
// localStorage key: "toeic_meta"
export interface StudyMeta {
  startDate: string;        // ngày bắt đầu học
  lastStudyDate: string;    // ngày học gần nhất
  streak: number;           // chuỗi ngày học liên tiếp
  totalReviewed: number;    // tổng số lần đã ôn
  emailJS_serviceId: string;
  emailJS_templateId: string;
  emailJS_publicKey: string;
  userEmail: string;
}
```

---

## 📅 Lộ trình 3 tuần: `lib/studyPlan.ts`

### Nguyên tắc phân bổ:

```
Tổng: ~520 từ / 21 ngày = ~25 từ/ngày
Chia thành 3 giai đoạn:

Tuần 1 (Ngày 1–7):   Topics 1–16  → học từ mới (mỗi ngày 2 topics ~24 từ)
Tuần 2 (Ngày 8–14):  Topics 17–32 → học từ mới + bắt đầu ôn tuần 1
Tuần 3 (Ngày 15–21): Topics 33–48 → học từ mới + ôn tuần 1+2 theo SM-2
```

### Interface:

```typescript
export interface DayPlan {
  day: number;              // 1–21
  date: string;             // ISO date (tính từ startDate)
  newTopics: string[];      // topic IDs cần học hôm nay
  reviewWords: string[];    // word IDs cần ôn hôm nay (từ SM-2)
  estimatedMinutes: number; // ước tính thời gian (học ~1.5 phút/từ)
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  completedNewTopics: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

export function generateStudyPlan(startDate: string): DayPlan[]
export function getTodayPlan(startDate: string): DayPlan
export function getDayProgress(day: DayPlan): number // 0–100%
```

---

## 📱 Các trang & tính năng chi tiết

---

### 1. `/` — Dashboard (Trang chủ)

**Hiển thị:**
- Header: "TOEIC 600 — Lộ trình 21 ngày"
- **Banner hôm nay**: "Ngày X/21 — [ngày/tháng]"
  - Số từ mới cần học hôm nay
  - Số từ cần ôn lại (SM-2 due today)
  - Ước tính thời gian học
  - Nút **"Bắt đầu học hôm nay"** → `/study/[topicId-of-today]`
  - Nút **"Ôn tập ngay"** (nếu có từ due) → `/review`
- **Streak counter**: 🔥 X ngày liên tiếp
- **Overall progress bar**: X/520 từ đã nhớ
- **Grid 48 topic cards**: mỗi card hiển thị:
  - Tên topic (EN + VI)
  - Số từ đã nhớ / tổng
  - Progress bar nhỏ
  - Badge trạng thái: `Chưa học` / `Đang học` / `Hoàn thành`
  - Màu sắc theo nhóm (Business, HR, Finance, Food, Travel, Health)
- **Nút cài đặt email**: mở modal nhập emailJS config

---

### 2. `/plan` — Lộ trình 21 ngày

**Hiển thị dạng timeline dọc:**

Mỗi ngày hiển thị một card:
```
[ Ngày 1 · Thứ 2, 9/6 ]  ✅ Hoàn thành
  📚 Học mới: Contract, Marketing  (24 từ)
  🔁 Ôn lại: 0 từ
  ⏱ ~36 phút

[ Ngày 2 · Thứ 3, 10/6 ] ← TODAY (highlight)
  📚 Học mới: Warranties, Business Planning  (24 từ)
  🔁 Ôn lại: 12 từ (từ ngày 1)
  ⏱ ~54 phút
  [ Học ngay → ]

[ Ngày 3 · Thứ 4, 11/6 ]  🔒 Chưa đến
  ...
```

- Thanh tiến độ tổng thể ở đầu trang: X/21 ngày hoàn thành
- Nếu chưa đặt ngày bắt đầu: hiện modal "Bạn bắt đầu học từ ngày nào?"

---

### 3. `/topic/[id]` — Xem danh sách từ của topic

**Hiển thị:**
- Tên topic lớn + badge "X/Y từ đã nhớ"
- Toggle: `Xem danh sách` / `Xem theo bảng`
- Mỗi từ hiển thị card:
  ```
  [ contract ]  (n)
  hợp đồng, thỏa thuận
  ────────────────────
  a binding agreement between two parties
  "The contract was signed by both companies."
  ────────────────────
  Status: 🟢 Đã nhớ / 🟡 Đang học / ⚪ Chưa học
  ```
- **Nút ✏️ sửa** và **🗑️ xóa** trên mỗi word card
- Nút **"+ Thêm từ"** → mở `WordFormModal`
- Nút **"📋 Nhập nhiều từ"** → mở `ImportWordsModal`
- Nút **"Học flashcard"** → `/study/[id]` (chỉ hiện khi có ít nhất 1 từ)

---

### 4. `/manage` — Quản lý topics

**Hiển thị danh sách 48 topics dạng bảng:**

```
STT  Tên topic              Số từ   Tiến độ    Hành động
1    Contract (Hợp đồng)    12/12   ████░ 75%  [ Nhập từ ] [ Xem ]
2    Marketing (Tiếp thị)   0/12    ░░░░░  0%  [ Nhập từ ]
3    Warranties (Bảo hành)  5/12    ██░░░ 40%  [ Nhập từ ] [ Xem ]
...
```

- Thanh tìm kiếm lọc theo tên topic
- Nút **"+ Tạo topic mới"** (nếu muốn thêm ngoài 48 topic mặc định)
- Badge: `✅ Đủ từ` / `⚠️ Thiếu từ` / `⭕ Chưa có từ`
- Click **"Nhập từ"** → chuyển sang `/manage/[id]`

---

### 5. `/manage/[id]` — Nhập từ cho một topic

**Đây là trang nhập liệu chính.**

**Layout 2 cột:**
- Cột trái: danh sách từ đã có (có thể click để sửa)
- Cột phải: form nhập từ mới

**Form nhập 1 từ:**
```
Từ tiếng Anh *    [________________]
Từ loại           [n ▼] (dropdown: n, v, adj, adv, n/v, v/n, adj/n, phrase)
Nghĩa tiếng Việt *[________________]
Định nghĩa (EN)   [________________] (không bắt buộc)
Câu ví dụ         [________________] (không bắt buộc)

[ Lưu & thêm tiếp ]    [ Lưu & đóng ]
```

**Tính năng nhập nhanh nhiều từ (ImportWordsModal):**

Người dùng paste text theo định dạng đơn giản, mỗi từ 1 dòng hoặc tab-separated:

```
Nhập từ theo định dạng (mỗi dòng 1 từ):
word | từ_loại | nghĩa_việt | định_nghĩa_anh | ví_dụ

Ví dụ:
contract | n | hợp đồng | a binding legal agreement | The contract was signed.
cancel | v | hủy bỏ | to call off something planned | The meeting was cancelled.
party | n | bên tham gia | one side in a legal agreement |

[  Paste nội dung vào đây...                    ]
[                                               ]
[                                               ]

Preview: 3 từ được nhận diện ✅

[ Nhập tất cả ]    [ Hủy ]
```

**Logic parse:**
- Tách bằng `|` hoặc `\t` (tab)
- Cột 1: word (bắt buộc)
- Cột 2: type (nếu thiếu → để trống)
- Cột 3: vietnamese (bắt buộc)
- Cột 4: definition (không bắt buộc)
- Cột 5: example (không bắt buộc)
- Bỏ qua dòng trống hoặc dòng thiếu cột 1/3
- Hiện preview số từ parse được trước khi lưu

**Sau khi nhập xong:**
- Hiện toast: "✅ Đã thêm 12 từ vào Contract"
- Cập nhật badge số từ trên TopicCard ở Dashboard

---

### 5b. `/study/[id]` — Học Flashcard (Spaced Repetition)

**Đây là trang quan trọng nhất.**

**Flow học:**

**Bước 1 – Mặt trước flashcard** (chỉ hiện từ tiếng Anh):
```
┌─────────────────────────────────┐
│         contract                │
│           (n)                   │
│                                 │
│      [ 👁 Xem nghĩa ]           │
└─────────────────────────────────┘
  Từ 3/12  ░░░░░░░░░░ 25%
```

**Bước 2 – Lật thẻ** (hiện đầy đủ):
```
┌─────────────────────────────────┐
│         contract                │
│           (n)                   │
│  ──────────────────────────     │
│  hợp đồng, thỏa thuận          │
│                                 │
│  a binding agreement between    │
│  two or more parties            │
│                                 │
│  "The contract was signed..."   │
└─────────────────────────────────┘

Bạn nhớ từ này ở mức nào?

[ 😵 Quên ]  [ 😕 Khó ]  [ 🙂 Nhớ ra ]  [ 😊 Dễ ]
   (0)          (2)          (3)            (5)
```

**Logic sau khi chọn:**
- Gọi `updateSM2(wordProgress, quality)` → lưu vào localStorage
- Chuyển sang từ tiếp theo
- Từ bị "Quên" sẽ được hiện lại cuối session

**Kết thúc session:**
```
✅ Hoàn thành!
Đã học 12 từ — Contract

📊 Kết quả:
  😊 Dễ:     4 từ → ôn sau 6 ngày
  🙂 Nhớ ra: 5 từ → ôn sau 3 ngày
  😕 Khó:    2 từ → ôn lại ngày mai
  😵 Quên:   1 từ → ôn lại ngày mai

[ 🏠 Về trang chủ ]  [ ▶ Topic tiếp theo ]
```

---

### 6. `/review` — Ôn tập từ đến hạn

Tương tự `/study/[id]` nhưng:
- Gom tất cả từ có `nextReview <= today` từ mọi topic
- Không phân biệt topic, trộn ngẫu nhiên
- Header: "Ôn tập — X từ đến hạn hôm nay"
- Sau khi xong: hiện summary theo topic

---

### 7. `/stats` — Thống kê

**Hiển thị:**

**Tổng quan:**
- 🔥 Streak: X ngày liên tiếp
- 📚 Tổng từ đã học: X/520
- ✅ Từ đã nhớ (interval ≥ 7): X từ
- 📅 Ngày còn lại: X/21

**Biểu đồ (dùng CSS thuần, không cần chart library):**
- Bar chart: số từ học được mỗi ngày (7 ngày gần nhất)
- Donut/ring chart: tỷ lệ New / Learning / Known

**Bảng từ cần chú ý:**
- Top 10 từ bị "Quên" nhiều nhất
- Hiển thị: từ, số lần quên, topic, lần ôn tiếp theo

**Từ sắp đến hạn:**
- Hôm nay: X từ
- Ngày mai: X từ
- 3 ngày tới: X từ

---

### 8. EmailJS Reminder

**Cài đặt (modal từ Dashboard):**
```
Nhập email của bạn: [____________]
EmailJS Service ID: [____________]
EmailJS Template ID:[____________]
EmailJS Public Key: [____________]
[ Lưu cài đặt ]  [ Test gửi mail ]
```

**Nút "📧 Nhắc ôn bài"** trên Dashboard:

Khi bấm → chọn thời gian:
```
Nhắc tôi ôn bài sau:
[ 1 giờ ]  [ 2 giờ ]  [ 4 giờ ]  [ Tùy chỉnh ]
```

Sau khi chọn → gọi EmailJS gửi email với template:
```
Subject: ⏰ Đến giờ ôn từ vựng TOEIC rồi!

Bạn đặt nhắc nhở {{time_ago}}.

📊 Tiến độ hôm nay:
- Đã học: {{studied_today}} từ
- Cần ôn: {{due_today}} từ
- Streak: {{streak}} ngày 🔥

👉 Vào ôn ngay: {{app_url}}/review
```

**EmailJS template variables cần có:**
`{{to_email}}`, `{{time_ago}}`, `{{studied_today}}`, `{{due_today}}`, `{{streak}}`, `{{app_url}}`

---

## 🎨 Design System

### Màu sắc (CSS variables trong `globals.css`):

```css
:root {
  --bg: #0f0f13;
  --surface: #1a1a24;
  --surface-2: #242433;
  --border: #2e2e42;
  --text: #e8e8f0;
  --text-muted: #7878a0;
  --primary: #6c63ff;       /* tím indigo */
  --primary-hover: #5a52e8;
  --success: #22c55e;       /* xanh lá */
  --warning: #f59e0b;       /* vàng */
  --danger: #ef4444;        /* đỏ */
  --info: #3b82f6;          /* xanh dương */
}
```

### Typography:

- Font chữ: `Instrument Serif` (heading) + `JetBrains Mono` (từ tiếng Anh) + `Inter` (body)
- Import từ Google Fonts trong `layout.tsx`

### Topic color groups:

```typescript
const topicColors = {
  business: '#6c63ff',   // topics 1-10: Business & Office
  hr: '#f59e0b',         // topics 11-15: HR & Hiring
  commerce: '#22c55e',   // topics 16-20: Commerce
  finance: '#3b82f6',    // topics 21-25: Finance
  property: '#8b5cf6',   // topics 26-30: Property
  food: '#f97316',       // topics 31-34: Food & Restaurant
  travel: '#06b6d4',     // topics 35-40: Travel
  culture: '#ec4899',    // topics 41-43: Entertainment & Media
  health: '#10b981',     // topics 44-48: Health
}
```

---

## 🔧 Các file cần tạo (theo thứ tự)

1. `lib/types.ts` — tất cả interfaces
2. `lib/sm2.ts` — thuật toán SM-2
3. `lib/storage.ts` — localStorage helpers (topics + progress + meta)
4. `lib/studyPlan.ts` — logic lộ trình 21 ngày
5. `data/defaultTopics.ts` — 48 topics mặc định (chỉ id, name, nameVi, order, words: [])
6. `components/ProgressBar.tsx`
7. `components/TopicCard.tsx`
8. `components/FlashCard.tsx` — animation lật thẻ
9. `components/StudyPlanDay.tsx`
10. `components/EmailReminder.tsx`
11. `components/WordList.tsx`
12. `components/WordFormModal.tsx` — modal thêm/sửa 1 từ
13. `components/ImportWordsModal.tsx` — modal paste nhiều từ
14. `app/layout.tsx` — font + metadata
15. `app/page.tsx` — Dashboard
16. `app/plan/page.tsx`
17. `app/topic/[id]/page.tsx` — xem từ + nút sửa/xóa
18. `app/study/[id]/page.tsx`
19. `app/review/page.tsx`
20. `app/stats/page.tsx`
21. `app/manage/page.tsx` — danh sách 48 topics
22. `app/manage/[id]/page.tsx` — nhập từ cho 1 topic
23. `README.md` — hướng dẫn deploy Vercel + cài EmailJS + cách nhập từ

---

## 📝 README.md phải có:

### Hướng dẫn nhập từ vựng vào app:
```
1. Mở app → bấm "Quản lý từ vựng" (menu góc trên phải)
2. Chọn topic muốn nhập (vd: Contract)
3. Có 2 cách:
   a) Nhập từng từ: bấm "+ Thêm từ" → điền form → "Lưu & thêm tiếp"
   b) Nhập nhiều từ: bấm "📋 Nhập nhiều từ" → paste theo định dạng:
        word | từ_loại | nghĩa_việt | định_nghĩa_anh | ví_dụ
      Cột 4 (định nghĩa) và cột 5 (ví dụ) không bắt buộc.
4. Xem preview → bấm "Nhập tất cả"
```

### Hướng dẫn cài EmailJS:
```
1. Đăng ký tài khoản tại emailjs.com (free: 200 email/tháng)
2. Tạo Email Service (Gmail)
3. Tạo Email Template với variables: to_email, time_ago, studied_today, due_today, streak, app_url
4. Vào app → Settings → điền Service ID, Template ID, Public Key
```

### Hướng dẫn deploy Vercel:
```
1. Push code lên GitHub
2. Vào vercel.com → New Project → Import repo
3. Deploy (không cần biến môi trường vì dùng localStorage)
4. Lấy URL → điền vào app_url trong EmailJS template
```

---

## ✅ Checklist chất lượng

- [ ] App chạy được với `npm run dev` không có lỗi
- [ ] Lần đầu mở app: tự seed 48 topics rỗng vào localStorage
- [ ] Nhập từ thủ công (form đơn + paste nhiều từ) hoạt động và lưu đúng
- [ ] Parse pipe-separated text đúng, bỏ qua dòng lỗi, hiện preview
- [ ] Flashcard có animation lật thẻ mượt (CSS transform rotateY)
- [ ] SM-2 lưu đúng vào localStorage và đọc lại được sau khi refresh
- [ ] Lộ trình 21 ngày hiển thị đúng ngày hiện tại
- [ ] Responsive mobile (quan trọng vì học trên điện thoại)
- [ ] Dark theme mặc định
- [ ] EmailJS gửi được mail khi test
- [ ] Build `npm run build` không có TypeScript error
- [ ] Deploy được lên Vercel không cần config thêm

---

## 💡 Ghi chú quan trọng

1. **Không dùng database hay backend** — toàn bộ state lưu localStorage
2. **Lần đầu mở app**: hiện onboarding modal hỏi "Hôm nay bạn bắt đầu học, ngày mấy?" để tính lộ trình
3. **Từ "Quên" trong flashcard session** phải xuất hiện lại ở cuối session trước khi kết thúc
4. **Nếu skip ngày** (không học): app vẫn hoạt động bình thường, streak reset về 0, SM-2 vẫn đúng
5. **Ưu tiên mobile-first** vì người dùng học chủ yếu trên điện thoại