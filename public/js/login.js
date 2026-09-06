// Giải mã Token JWT từ Google
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
}

// Hàm nhận phản hồi khi người dùng bấm Đăng nhập Google thành công
async function handleCredentialResponse(response) {
    const userData = parseJwt(response.credential);

    // Gửi thông tin về API Cloudflare Worker để lưu vào CSDL D1
    const apiResponse = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: userData.sub,
            name: userData.name,
            email: userData.email,
            avatar: userData.picture,
            provider: 'google'
        })
    });

    const result = await apiResponse.json();
    if (result.success) {
        // Lưu thông tin vào LocalStorage để dùng cho toàn trang
        localStorage.setItem('user', JSON.stringify(userData));
        alert('Đăng nhập thành công!');
        window.location.href = 'index.html'; // Chuyển về trang chủ
    }
}