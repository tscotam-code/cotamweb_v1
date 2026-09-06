export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. API Lấy danh sách sản phẩm
    if (url.pathname === "/api/products" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM products").all();
      return Response.json(results);
    }

    // 2. API Lưu/Cập nhật người dùng khi Đăng nhập Social (Google/Facebook)
    if (url.pathname === "/api/auth/social" && request.method === "POST") {
      const { id, name, email, avatar, provider } = await request.json();

      await env.DB.prepare(`
        INSERT INTO users (id, name, email, avatar, provider, provider_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          avatar = excluded.avatar
      `).bind(id, name, email, avatar, provider, id).run();

      return Response.json({ success: true, message: "Đăng nhập thành công" });
    }

    // 3. API Lấy danh sách đơn hàng cho Admin Dashboard
    if (url.pathname === "/api/admin/orders" && request.method === "GET") {
      const { results } = await env.DB.prepare(`
        SELECT orders.*, users.name as customer_name 
        FROM orders 
        JOIN users ON orders.user_id = users.id
        ORDER BY created_at DESC
      `).all();
      return Response.json(results);
    }

    return new Response("CotamWeb API Running", { status: 200 });
  }
};