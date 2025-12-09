const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function updateNav() {
  const token = getToken();
  const logoutBtn = document.getElementById('logoutBtn');
  const dashboardLink = document.getElementById('dashboardLink');
  const adminLink = document.getElementById('adminLink');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');

  if (token) {
    const role = localStorage.getItem('role');
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    dashboardLink.style.display = 'inline';
    logoutBtn.style.display = 'inline';
    adminLink.style.display = role === 'admin' ? 'inline' : 'none';
  } else {
    loginLink.style.display = 'inline';
    registerLink.style.display = 'inline';
    dashboardLink.style.display = 'none';
    adminLink.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();

  const form = document.getElementById('shortenForm');
  const orig = document.getElementById('originalUrl');
  const customCode = document.getElementById('customCode');
  const result = document.getElementById('result');
  const shortLink = document.getElementById('shortLink');
  const copyBtn = document.getElementById('copyBtn');
  const msg = document.getElementById('msg');
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    updateNav();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    result.style.display = 'none';
    const url = orig.value.trim();
    const alias = (customCode?.value || '').trim();
    if (!url) return;
    try {
      const res = await fetch(`${API_BASE}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': 'Bearer ' + getToken() } : {})
        },
        body: JSON.stringify({ originalUrl: url, customCode: alias || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        msg.textContent = data.message || 'Failed to shorten URL';
        msg.className = 'msg error';
        return;
      }
      shortLink.textContent = data.shortUrl;
      shortLink.href = data.shortUrl;
      result.style.display = 'block';
      msg.textContent = 'URL shortened successfully!';
      msg.className = 'msg success';
    } catch (err) {
      msg.textContent = 'Network error';
      msg.className = 'msg error';
    }
  });

  copyBtn.addEventListener('click', async () => {
    const text = shortLink.href;
    try {
      await navigator.clipboard.writeText(text);
      msg.textContent = 'Copied to clipboard!';
      msg.className = 'msg success';
    } catch {
      msg.textContent = 'Copy failed';
      msg.className = 'msg error';
    }
  });
});