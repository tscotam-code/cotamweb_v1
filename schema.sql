-- Bảng Sản phẩm
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Đơn hàng
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Xóa bảng cũ để cập nhật lại cấu trúc mới đầy đủ
DROP TABLE IF EXISTS users;

-- Tạo bảng users hỗ trợ đa phương thức xác thực (Local + Social OAuth)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                           -- Khóa chính (Chuỗi UUID tạo ngẫu nhiên hoặc gán ID mặc định)
    username TEXT UNIQUE,                          -- Tên đăng nhập (Dùng cho tài khoản local, có thể NULL nếu dùng Social)
    email TEXT UNIQUE NOT NULL,                    -- Địa chỉ email chính (Bắt buộc duy nhất trên toàn hệ thống)
    password_hash TEXT,                            -- Mật khẩu đã mã hóa (Để trống/NULL nếu đăng nhập bằng Google/Social)
    name TEXT,                                     -- Họ và tên hiển thị người dùng
    avatar_url TEXT,                               -- URL ảnh đại diện (Lấy từ Google picture hoặc link upload)
    provider TEXT NOT NULL DEFAULT 'local',        -- Nguồn đăng nhập: 'local', 'google', 'github', 'facebook'
    provider_id TEXT,                              -- Mã ID định danh từ nhà cung cấp (Ví dụ: giá trị 'sub' từ Google JWT)
    role TEXT DEFAULT 'customer',                  -- Phân quyền hệ thống: 'customer' (Khách hàng), 'admin' (Quản trị)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Thời gian khởi tạo tài khoản
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Thời gian cập nhật thông tin gần nhất
    last_login DATETIME                            -- Thời điểm thực hiện đăng nhập gần nhất
);

-- Tạo Index để tối ưu hóa tốc độ truy vấn D1 khi tìm kiếm tài khoản
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);