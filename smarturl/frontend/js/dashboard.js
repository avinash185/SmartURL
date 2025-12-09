const API_BASE = '/api';

function getToken() { return localStorage.getItem('token'); }

function requireAuth() {
  const t = getToken();
  if (!t) window.location.href = 'login.html';
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

let filterFavorites = false;

async function loadUrls() {
  const msg = document.getElementById('msg');
  msg.textContent = '';
  try {
    const endpoint = filterFavorites ? `${API_BASE}/favorites` : `${API_BASE}/urls`;
    const res = await fetch(endpoint, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.message || 'Failed to load';
      msg.className = 'msg error';
      return;
    }
    const tbody = document.querySelector('#urlsTable tbody');
    tbody.innerHTML = '';
    data.forEach(row => {
      const tr = document.createElement('tr');
      const shortUrl = `${location.origin}/api/${row.short_url}`;
      const isFav = !!row.is_favorite;
      const star = isFav ? '★' : '☆';
      tr.innerHTML = `
        <td><a href="${shortUrl}" target="_blank">${row.short_url}</a></td>
        <td class="truncate"><a href="${row.original_url}" target="_blank">${row.original_url}</a></td>
        <td>${row.click_count}</td>
        <td>${formatDate(row.created_at)}</td>
        <td><button data-id="${row.id}" data-fav="${isFav ? 1 : 0}" class="btn fav" aria-label="Toggle favorite">${star}</button></td>
        <td><button data-id="${row.id}" class="btn danger del">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    msg.textContent = 'Network error';
    msg.className = 'msg error';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  loadUrls();

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });

  document.getElementById('filterAll')?.addEventListener('click', () => { filterFavorites = false; loadUrls(); });
  document.getElementById('filterFav')?.addEventListener('click', () => { filterFavorites = true; loadUrls(); });

  document.querySelector('#urlsTable tbody').addEventListener('click', async (e) => {
    const msg = document.getElementById('msg');
    if (e.target.classList.contains('del')) {
      const id = e.target.getAttribute('data-id');
      const ok = confirm('Delete this URL?');
      if (!ok) return;
      try {
        const res = await fetch(`${API_BASE}/url/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const data = await res.json();
        if (!res.ok) {
          msg.textContent = data.message || 'Delete failed';
          msg.className = 'msg error';
          return;
        }
        msg.textContent = 'Deleted';
        msg.className = 'msg success';
        loadUrls();
      } catch {
        msg.textContent = 'Network error';
        msg.className = 'msg error';
      }
    }
    if (e.target.classList.contains('fav')) {
      const id = e.target.getAttribute('data-id');
      const current = e.target.getAttribute('data-fav') === '1';
      try {
        const res = await fetch(`${API_BASE}/url/${id}/favorite`, {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ favorite: !current })
        });
        const data = await res.json();
        if (!res.ok) {
          msg.textContent = data.message || 'Update failed';
          msg.className = 'msg error';
          return;
        }
        e.target.setAttribute('data-fav', data.favorite ? '1' : '0');
        e.target.textContent = data.favorite ? '★' : '☆';
        msg.textContent = data.favorite ? 'Added to favorites' : 'Removed from favorites';
        msg.className = 'msg success';
        if (filterFavorites) loadUrls();
      } catch {
        msg.textContent = 'Network error';
        msg.className = 'msg error';
      }
    }
  });
});