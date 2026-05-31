# 🍽️ Self Restaurant Management System

Hệ thống quản lý nhà hàng tự phục vụ — **3 phân hệ**: Bàn ăn, Bếp (KDS), Thu ngân (POS).

---

## Tech Stack

| Tầng       | Công nghệ                                                     |
|------------|---------------------------------------------------------------|
| Frontend   | ReactJS 18 + Vite, React Router v6, Zustand, TanStack Query   |
| Styling    | TailwindCSS                                                   |
| Realtime   | Socket.io                                                     |
| Backend    | Node.js + Express.js                                          |
| Database   | **SQL Server** (2019/2022/Azure SQL) + Prisma ORM             |
| Auth       | JWT (Access Token 15m + Refresh Token 7d)                     |
| QR Code    | VietQR standard                                               |
| Export     | PDFKit (PDF), ExcelJS (Excel)                                 |

---

## Yêu cầu hệ thống

- **Node.js** >= 18
- **SQL Server** 2019 / 2022 / Express / Azure SQL
- **npm** >= 9

---

## Cài đặt & Chạy

### Bước 1 — Tạo database trên SQL Server

```sql
-- Mở SQL Server Management Studio (SSMS) hoặc Azure Data Studio
CREATE DATABASE self_restaurant;
GO
```

### Bước 2 — Cài dependencies

```bash
# Từ thư mục gốc
npm run install:all

# Hoặc riêng từng phần
cd frontend && npm install
cd ../backend && npm install
```

### Bước 3 — Cấu hình Backend

```bash
cd backend
cp .env.example .env
```

Mở file `.env` và sửa `DATABASE_URL`:

```
# SQL auth (tài khoản sa hoặc user tạo riêng):
DATABASE_URL="sqlserver://localhost:1433;database=self_restaurant;user=sa;password=YourPassword123;encrypt=false;trustServerCertificate=true"

# Windows Authentication:
DATABASE_URL="sqlserver://localhost:1433;database=self_restaurant;integratedSecurity=true;trustServerCertificate=true"

# SQL Server Express (named instance):
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS:1433;database=self_restaurant;user=sa;password=YourPassword123;encrypt=false;trustServerCertificate=true"
```

> **Lưu ý**: Nếu dùng `encrypt=false` thì thêm `trustServerCertificate=true`.  
> Azure SQL luôn dùng `encrypt=true`.

### Bước 4 — Migrate & Seed database

```bash
cd backend

# Tạo tất cả bảng
npx prisma migrate dev --name init

# Nạp dữ liệu mẫu
npm run db:seed
```

### Bước 5 — Cấu hình Frontend

```bash
cd frontend
cp .env.example .env
# Mặc định đã đúng, không cần sửa khi chạy local
```

### Bước 6 — Chạy development

```bash
# Chạy cả hai (từ thư mục gốc)
npm run dev

# Hoặc riêng lẻ trong 2 terminal
npm run dev:backend    # → http://localhost:5000
npm run dev:frontend   # → http://localhost:3000
```

---

## Tài khoản demo

| Mã NV  | Mật khẩu | Vai trò    | URL sau đăng nhập  |
|--------|----------|------------|--------------------|
| BT001  | 123456   | Bếp trưởng | /kitchen           |
| DB001  | 123456   | Đầu bếp    | /kitchen/kds       |
| TN001  | 123456   | Thu ngân   | /cashier/payment   |

**Tablet tại bàn** (không đăng nhập, truy cập thẳng):
```
http://localhost:3000/table/B01/menu
http://localhost:3000/table/B02/menu
```

**Thẻ thành viên mẫu**: `THE001` · `THE002` · `THE003`

---

## Cấu trúc dự án

```
self-restaurant/
├── frontend/
│   └── src/
│       ├── assets/             ← CSS (Tailwind)
│       ├── components/
│       │   ├── common/         ← Button, Input, Modal, Badge, Spinner,
│       │   │                      EmptyState, ConfirmDialog, SearchInput
│       │   └── layout/         ← ProtectedRoute, KitchenLayout, CashierLayout
│       ├── constants/          ← roles.js, status.js
│       ├── hooks/              ← useAuth, useSocket, useDownload
│       ├── pages/
│       │   ├── auth/           ← LoginPage
│       │   ├── table/          ← MenuPage · OrderPage · InvoicePage · MemberCardPage
│       │   ├── kitchen/        ← KDSPage · FoodCatalogPage · DailyMenuPage
│       │   └── cashier/        ← PaymentPage · InvoiceHistoryPage · RevenueReportPage
│       ├── router/             ← React Router v6
│       ├── services/           ← 8 service files (axios)
│       ├── socket/             ← Socket.io client
│       ├── store/              ← authStore · cartStore (Zustand)
│       └── utils/              ← format.js
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma       ← 15 models, provider = sqlserver
    │   └── seed.js             ← 4 NV · 10 bàn · 19 món · thực đơn hôm nay · 3 thẻ TV
    └── src/
        ├── config/             ← database.js · socket.js
        ├── controllers/        ← 9 controllers đầy đủ logic
        ├── middleware/         ← authMiddleware · roleMiddleware · errorHandler
        ├── routes/             ← 9 route files + index.js
        ├── sockets/            ← orderSocket · kitchenSocket
        ├── utils/              ← invoiceCode · qrCode (VietQR) · pdfExporter · excelExporter
        ├── app.js
        └── server.js
```

---

## Phân quyền (RBAC)

| Role       | Trang                      | Quyền                                       |
|------------|----------------------------|---------------------------------------------|
| BEP_TRUONG | /kitchen/kds               | Xem KDS, cập nhật trạng thái chế biến       |
|            | /kitchen/food-catalog      | CRUD danh mục món ăn                        |
|            | /kitchen/daily-menu        | Tạo/chỉnh sửa thực đơn ngày                |
| DAU_BEP    | /kitchen/kds               | Bắt đầu làm / hoàn tất từng món            |
| THU_NGAN   | /cashier/payment           | Khoá HĐ, thanh toán tiền mặt / QR          |
|            | /cashier/invoice-history   | Xem lịch sử hóa đơn                        |
|            | /cashier/report            | Lập báo cáo, xuất PDF / Excel              |
| (public)   | /table/:id/menu            | Xem thực đơn, thêm giỏ hàng               |
|            | /table/:id/order           | Gửi order lên bếp                          |
|            | /table/:id/invoice         | Xem hóa đơn tạm tính (realtime)            |
|            | /table/:id/member-card     | Quét thẻ thành viên                        |

---

## API Endpoints

| Method | Endpoint                                  | Quyền            |
|--------|-------------------------------------------|------------------|
| POST   | /api/auth/login                           | Public           |
| POST   | /api/auth/logout                          | Auth             |
| POST   | /api/auth/refresh                         | Public           |
| GET    | /api/auth/me                              | Auth             |
| GET    | /api/foods                                | Public           |
| POST   | /api/foods                                | BEP_TRUONG       |
| PUT    | /api/foods/:id                            | BEP_TRUONG       |
| DELETE | /api/foods/:id                            | BEP_TRUONG       |
| GET    | /api/menus/today                          | Public           |
| GET    | /api/menus/:date                          | Public           |
| POST   | /api/menus                                | BEP_TRUONG       |
| PUT    | /api/menus/:id                            | BEP_TRUONG       |
| PATCH  | /api/menus/:menuId/items/:itemId          | BEP_TRUONG/DB    |
| DELETE | /api/menus/:menuId/items/:itemId          | BEP_TRUONG       |
| GET    | /api/orders/kds                           | BEP_TRUONG/DB    |
| POST   | /api/orders                               | Public           |
| GET    | /api/orders/table/:tableId                | Public           |
| PATCH  | /api/orders/:id/items/:itemId/start       | BEP_TRUONG/DB    |
| PATCH  | /api/orders/:id/items/:itemId/complete    | BEP_TRUONG/DB    |
| DELETE | /api/orders/:id/items/:itemId             | Public           |
| GET    | /api/invoices/table/:tableId              | Public           |
| GET    | /api/invoices/history                     | THU_NGAN         |
| GET    | /api/invoices/:id                         | Auth             |
| POST   | /api/invoices/:id/lock                    | THU_NGAN         |
| POST   | /api/invoices/:id/unlock                  | THU_NGAN         |
| POST   | /api/payments/:invoiceId/cash             | THU_NGAN         |
| POST   | /api/payments/:invoiceId/transfer         | THU_NGAN         |
| POST   | /api/payments/:invoiceId/confirm          | THU_NGAN         |
| GET    | /api/payments/:invoiceId/qr               | THU_NGAN         |
| POST   | /api/member-cards/scan                    | Public           |
| GET    | /api/member-cards/:id                     | Public           |
| GET    | /api/member-cards/:id/points              | Public           |
| POST   | /api/reports/daily                        | THU_NGAN         |
| GET    | /api/reports                              | THU_NGAN         |
| GET    | /api/reports/:id                          | THU_NGAN         |
| GET    | /api/reports/:id/export/pdf               | THU_NGAN         |
| GET    | /api/reports/:id/export/excel             | THU_NGAN         |
| GET    | /api/tables                               | Public           |

---

## Socket.io Events

| Event                      | Hướng               | Mô tả                           |
|----------------------------|---------------------|---------------------------------|
| `order:new`                | Server → Kitchen    | Order mới từ bàn                |
| `order:item:statusChanged` | Server → Table      | Trạng thái món thay đổi         |
| `order:item:completed`     | Server → Table      | Món hoàn tất chế biến           |
| `invoice:updated`          | Server → Table/POS  | Hóa đơn cập nhật                |
| `invoice:locked`           | Server → Table      | Thu ngân khoá hóa đơn           |
| `invoice:paid`             | Server → Table      | Thanh toán thành công           |
| `table:statusChanged`      | Server → Cashier    | Trạng thái bàn thay đổi         |

---

## Xử lý lỗi thường gặp

**Lỗi kết nối SQL Server:**
```
Error: Login failed for user 'sa'
```
→ Kiểm tra SQL Server Authentication đã được bật:  
SSMS → Server Properties → Security → **SQL Server and Windows Authentication mode**

**Named instance (SQL Server Express):**
```
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS;database=self_restaurant;..."
```

**Port không phải 1433:**
```
DATABASE_URL="sqlserver://localhost:14330;database=self_restaurant;..."
```

**Prisma generate lại sau khi sửa schema:**
```bash
cd backend && npx prisma generate
```
