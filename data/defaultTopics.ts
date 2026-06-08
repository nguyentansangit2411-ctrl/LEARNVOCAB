import { Topic } from "../lib/types";

export const defaultTopics: Topic[] = [
  // Group 1: General Business
  { id: "contracts", name: "Contracts", nameVi: "Hợp đồng", order: 1, words: [], createdAt: new Date().toISOString() },
  { id: "marketing", name: "Marketing", nameVi: "Tiếp thị", order: 2, words: [], createdAt: new Date().toISOString() },
  { id: "warranties", name: "Warranties", nameVi: "Bảo hành", order: 3, words: [], createdAt: new Date().toISOString() },
  { id: "business-planning", name: "Business Planning", nameVi: "Lập kế hoạch kinh doanh", order: 4, words: [], createdAt: new Date().toISOString() },
  { id: "conferences", name: "Conferences", nameVi: "Hội nghị", order: 5, words: [], createdAt: new Date().toISOString() },

  // Group 2: Office Issues
  { id: "computers", name: "Computers", nameVi: "Máy tính", order: 6, words: [], createdAt: new Date().toISOString() },
  { id: "office-technology", name: "Office Technology", nameVi: "Công nghệ văn phòng", order: 7, words: [], createdAt: new Date().toISOString() },
  { id: "office-procedures", name: "Office Procedures", nameVi: "Quy trình văn phòng", order: 8, words: [], createdAt: new Date().toISOString() },
  { id: "electronics", name: "Electronics", nameVi: "Điện tử", order: 9, words: [], createdAt: new Date().toISOString() },
  { id: "correspondence", name: "Correspondence", nameVi: "Thư tín thương mại", order: 10, words: [], createdAt: new Date().toISOString() },

  // Group 3: Personnel
  { id: "job-advertising-and-recruiting", name: "Job Advertising and Recruiting", nameVi: "Quảng cáo việc làm & Tuyển dụng", order: 11, words: [], createdAt: new Date().toISOString() },
  { id: "applying-and-interviewing", name: "Applying and Interviewing", nameVi: "Nộp đơn & Phỏng vấn", order: 12, words: [], createdAt: new Date().toISOString() },
  { id: "hiring-and-training", name: "Hiring and Training", nameVi: "Tuyển dụng & Đào tạo", order: 13, words: [], createdAt: new Date().toISOString() },
  { id: "salaries-and-benefits", name: "Salaries and Benefits", nameVi: "Lương thưởng & Phúc lợi", order: 14, words: [], createdAt: new Date().toISOString() },
  { id: "promotions-pensions-and-awards", name: "Promotions, Pensions, and Awards", nameVi: "Thăng tiến, Lương hưu & Thưởng", order: 15, words: [], createdAt: new Date().toISOString() },

  // Group 4: Purchasing
  { id: "shopping", name: "Shopping", nameVi: "Mua sắm", order: 16, words: [], createdAt: new Date().toISOString() },
  { id: "ordering-supplies", name: "Ordering Supplies", nameVi: "Đặt hàng nhà cung cấp", order: 17, words: [], createdAt: new Date().toISOString() },
  { id: "shipping", name: "Shipping", nameVi: "Vận chuyển hàng", order: 18, words: [], createdAt: new Date().toISOString() },
  { id: "invoices", name: "Invoices", nameVi: "Hóa đơn", order: 19, words: [], createdAt: new Date().toISOString() },
  { id: "inventory", name: "Inventory", nameVi: "Hàng tồn kho", order: 20, words: [], createdAt: new Date().toISOString() },

  // Group 5: Financing and Budgeting
  { id: "banking", name: "Banking", nameVi: "Ngân hàng", order: 21, words: [], createdAt: new Date().toISOString() },
  { id: "accounting", name: "Accounting", nameVi: "Kế toán", order: 22, words: [], createdAt: new Date().toISOString() },
  { id: "investments", name: "Investments", nameVi: "Đầu tư", order: 23, words: [], createdAt: new Date().toISOString() },
  { id: "taxes", name: "Taxes", nameVi: "Thuế", order: 24, words: [], createdAt: new Date().toISOString() },
  { id: "financial-statements", name: "Financial Statements", nameVi: "Báo cáo tài chính", order: 25, words: [], createdAt: new Date().toISOString() },

  // Group 6: Management
  { id: "property-and-departments", name: "Property and Departments", nameVi: "Tài sản & Các phòng ban", order: 26, words: [], createdAt: new Date().toISOString() },
  { id: "board-meetings-and-committees", name: "Board Meetings and Committees", nameVi: "Họp ban quản trị & Ủy ban", order: 27, words: [], createdAt: new Date().toISOString() },
  { id: "quality-control", name: "Quality Control", nameVi: "Kiểm soát chất lượng", order: 28, words: [], createdAt: new Date().toISOString() },
  { id: "product-development", name: "Product Development", nameVi: "Phát triển sản phẩm", order: 29, words: [], createdAt: new Date().toISOString() },
  { id: "renting-and-leasing", name: "Renting and Leasing", nameVi: "Thuê & Cho thuê", order: 30, words: [], createdAt: new Date().toISOString() },

  // Group 7: Restaurants and Events
  { id: "selecting-a-restaurant", name: "Selecting a Restaurant", nameVi: "Chọn nhà hàng", order: 31, words: [], createdAt: new Date().toISOString() },
  { id: "eating-out", name: "Eating Out", nameVi: "Ăn ngoài", order: 32, words: [], createdAt: new Date().toISOString() },
  { id: "ordering-lunch", name: "Ordering Lunch", nameVi: "Đặt bữa trưa", order: 33, words: [], createdAt: new Date().toISOString() },
  { id: "cooking-as-a-career", name: "Cooking as a Career", nameVi: "Nghề nấu ăn", order: 34, words: [], createdAt: new Date().toISOString() },
  { id: "events", name: "Events", nameVi: "Sự kiện", order: 35, words: [], createdAt: new Date().toISOString() },

  // Group 8: Travel
  { id: "general-travel", name: "General Travel", nameVi: "Du lịch đại chúng", order: 36, words: [], createdAt: new Date().toISOString() },
  { id: "airlines", name: "Airlines", nameVi: "Hãng hàng không", order: 37, words: [], createdAt: new Date().toISOString() },
  { id: "trains", name: "Trains", nameVi: "Tàu hỏa", order: 38, words: [], createdAt: new Date().toISOString() },
  { id: "hotels", name: "Hotels", nameVi: "Khách sạn", order: 39, words: [], createdAt: new Date().toISOString() },
  { id: "car-rentals", name: "Car Rentals", nameVi: "Thuê xe ô tô", order: 40, words: [], createdAt: new Date().toISOString() },

  // Group 9: Entertainment
  { id: "movies", name: "Movies", nameVi: "Phim ảnh", order: 41, words: [], createdAt: new Date().toISOString() },
  { id: "theater", name: "Theater", nameVi: "Sân khấu kịch", order: 42, words: [], createdAt: new Date().toISOString() },
  { id: "music", name: "Music", nameVi: "Âm nhạc", order: 43, words: [], createdAt: new Date().toISOString() },
  { id: "museums", name: "Museums", nameVi: "Bảo tàng", order: 44, words: [], createdAt: new Date().toISOString() },
  { id: "media", name: "Media", nameVi: "Truyền thông", order: 45, words: [], createdAt: new Date().toISOString() },

  // Group 10: Health
  { id: "doctors-office", name: "Doctor's Office", nameVi: "Phòng khám bác sĩ", order: 46, words: [], createdAt: new Date().toISOString() },
  { id: "dentists-office", name: "Dentist's Office", nameVi: "Phòng khám nha sĩ", order: 47, words: [], createdAt: new Date().toISOString() },
  { id: "health-insurance", name: "Health Insurance", nameVi: "Bảo hiểm y tế", order: 48, words: [], createdAt: new Date().toISOString() },
  { id: "hospitals", name: "Hospitals", nameVi: "Bệnh viện", order: 49, words: [], createdAt: new Date().toISOString() },
  { id: "pharmacy", name: "Pharmacy", nameVi: "Nhà thuốc", order: 50, words: [], createdAt: new Date().toISOString() }
];
