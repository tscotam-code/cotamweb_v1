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

    // 2. API Đăng nhập Social chung (Google, Facebook, Zalo)
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

    // 3. API Xử lý Zalo OAuth Callback (Đổi code lấy Token & chuyển về Client)
    if (url.pathname === "/api/auth/zalo/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Thiếu Authorization Code từ Zalo", { status: 400 });
      }

      try {
        const ZALO_APP_ID = "314166203379498791";
        const ZALO_SECRET_KEY = "sSLENnChKMTM6Bn9P7IY";

        // Đổi code lấy access_token từ Zalo
        const tokenRes = await fetch("https://oauth.zaloapp.com/v4/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "secret_key": ZALO_SECRET_KEY
          },
          body: new URLSearchParams({
            code: code,
            app_id: ZALO_APP_ID,
            grant_type: "authorization_code"
          })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          return new Response("Lỗi cấp Token từ Zalo: " + JSON.stringify(tokenData), { status: 400 });
        }

        // Chuyển hướng người dùng về trang login.html kèm theo access_token
        return Response.redirect(`${url.origin}/login.html?zalo_token=${tokenData.access_token}`, 302);
      } catch (err) {
        return new Response("Lỗi hệ thống: " + err.message, { status: 500 });
      }
    }

    // 4. Phục vụ trang chủ -> Chuyển sang login.html
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/login.html", request.url), request));
    }

    // 5. Phục vụ toàn bộ các file tĩnh trong thư mục public/
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("CotamWeb API Running", { status: 200 });
  }
};