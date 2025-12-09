const API_ADMIN = '/api/admin';
function getToken(){ return localStorage.getItem('token'); }
function requireAdmin(){
  const role = localStorage.getItem('role');
  if (role !== 'admin') window.location.href = 'index.html';
}
function formatDate(iso){ return new Date(iso).toLocaleString(); }

async function loadStats() {
  const res = await fetch(`${API_ADMIN}/stats`, {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('totalUrls').textContent = data.totalUrls;
    document.getElementById('totalClicks').textContent = data.totalClicks;
  }
}

async function loadUsers() {
  const res = await fetch(`${API_ADMIN}/users`, {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  if (res.ok) {
    data.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${formatDate(u.created_at)}</td>
        <td><button data-id="${u.id}" class="btn danger del-user">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

async function loadUrls() {
  const res = await fetch(`${API_ADMIN}/urls`, {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  const tbody = document.querySelector('#urlsTable tbody');
  tbody.innerHTML = '';
  if (res.ok) {
    data.forEach(row => {
      const shortUrl = `${location.origin}/api/${row.short_url}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.user_id ?? '-'}</td>
        <td><a href="${shortUrl}" target="_blank">${row.short_url}</a></td>
        <td class="truncate"><a href="${row.original_url}" target="_blank">${row.original_url}</a></td>
        <td>${row.click_count}</td>
        <td>${formatDate(row.created_at)}</td>
        <td><button data-id="${row.id}" class="btn danger del-url">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();
  loadStats();
  loadUsers();
  loadUrls();

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });

  const msg = document.getElementById('msg');

  document.querySelector('#usersTable tbody').addEventListener('click', async (e) => {
    if (e.target.classList.contains('del-user')) {
      const id = e.target.getAttribute('data-id');
      const ok = confirm('Delete this user? This also removes their URLs.');
      if (!ok) return;
      const res = await fetch(`${API_ADMIN}/user/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      const data = await res.json();
      if (!res.ok) {
        msg.textContent = data.message || 'Failed to delete user';
        msg.className = 'msg error';
        return;
      }
      msg.textContent = 'User deleted';
      msg.className = 'msg success';
      loadUsers();
      loadUrls();
      loadStats();
    }
  });

  document.querySelector('#urlsTable tbody').addEventListener('click', async (e) => {
    if (e.target.classList.contains('del-url')) {
      const id = e.target.getAttribute('data-id');
      const ok = confirm('Delete this URL?');
      if (!ok) return;
      const res = await fetch(`${API_ADMIN}/url/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      const data = await res.json();
      if (!res.ok) {
        msg.textContent = data.message || 'Failed to delete URL';
        msg.className = 'msg error';
        return;
      }
      msg.textContent = 'URL deleted';
      msg.className = 'msg success';
      loadUrls();
      loadStats();
    }
  });
});