export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 0. Xử lý Route xác thực Zalo Domain
    if (url.pathname === "/zalo_verifierMjM_Cg75Qlugjhy2wuKo6pocY4FGq58LDJaq.html") {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta property="zalo-platform-site-verification" content="MjM_Cg75Qlugjhy2wuKo6pocY4FGq58LDJaq" />
</head>
<body>
    There Is No Limit To What You Can Accomplish Using Zalo!
</body>
</html>`;

      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 1. API Lấy danh sách sản phẩm
    if (url.pathname === "/api/products" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return Response.json(results);
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    // 2. API Đăng nhập Google (Social Login)
    if (url.pathname === "/api/auth/social" && request.method === "POST") {
      try {
        const { id, name, email, avatar, provider } = await request.json();
        await env.DB.prepare(`
          INSERT INTO users (id, name, email, avatar_url, provider, provider_id, last_login)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            avatar_url = excluded.avatar_url,
            provider = excluded.provider,
            provider_id = excluded.provider_id,
            updated_at = CURRENT_TIMESTAMP,
            last_login = CURRENT_TIMESTAMP
        `).bind(id, name, email, avatar, provider, id).run();

        return Response.json({ success: true, message: "Đăng nhập thành công" });
      } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    // 3. Phục vụ trang chủ -> Chuyển sang login.html
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/login.html", request.url), request));
    }

    // 4. Phục vụ toàn bộ các file tĩnh trong thư mục public/ (CSS, JS, Images)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("CotamWeb API Running", { status: 200 });
  }
};