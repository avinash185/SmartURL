const API_BASE = '/api/auth';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const msg = document.getElementById('msg');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          msg.textContent = data.message || 'Login failed';
          msg.className = 'msg error';
          return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);
        msg.textContent = 'Login successful! Redirecting...';
        msg.className = 'msg success';
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 600);
      } catch {
        msg.textContent = 'Network error';
        msg.className = 'msg error';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          msg.textContent = data.message || 'Registration failed';
          msg.className = 'msg error';
          return;
        }
        msg.textContent = 'Registration successful! Please login.';
        msg.className = 'msg success';
        setTimeout(() => window.location.href = 'login.html', 800);
      } catch {
        msg.textContent = 'Network error';
        msg.className = 'msg error';
      }
    });
  }
});