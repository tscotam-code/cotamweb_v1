// Switch Tabs giữa Login & Sign Up
function switchTab(tab) {
    const loginTitle = document.getElementById('tab-login-title');
    const signupTitle = document.getElementById('tab-signup-title');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const avatarIcon = document.getElementById('avatar-icon');

    if (tab === 'login') {
        loginTitle.classList.add('active');
        signupTitle.classList.remove('active');
        loginForm.classList.add('active-form');
        signupForm.classList.remove('active-form');
        avatarIcon.className = "fa-regular fa-user";
    } else {
        signupTitle.classList.add('active');
        loginTitle.classList.remove('active');
        signupForm.classList.add('active-form');
        loginForm.classList.remove('active-form');
        avatarIcon.className = "fa-solid fa-camera"; // Đổi icon sang Camera cho Sign Up
    }
}

// Toggle Mật khẩu (Eye Icon)
function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Xử lý Form Login
async function handleLogin(e) {
    e.preventDefault();
    const account = document.getElementById('login-input').value;
    const pass = document.getElementById('login-password').value;

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, pass })
    });
    
    const result = await response.json();
    if(result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'index.html';
    } else {
        alert(result.message || 'Đăng nhập thất bại');
    }
}

// Xử lý Form Sign Up
async function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const pass = document.getElementById('signup-password').value;
    const repeatPass = document.getElementById('signup-repeat-password').value;

    if (pass !== repeatPass) {
        alert('Mật khẩu nhập lại không khớp!');
        return;
    }

    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, pass })
    });

    const result = await response.json();
    if(result.success) {
        alert('Đăng ký thành công! Hãy đăng nhập.');
        switchTab('login');
    }
}

// Kích hoạt Google Sign-In từ Nút Icon
function triggerGoogleLogin() {
    google.accounts.id.prompt();
}

function handleCredentialResponse(response) {
    // Nhận JWT Credential và gửi về Worker API
    fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential, provider: 'google' })
    }).then(res => res.json()).then(data => {
        if(data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        }
    });
}