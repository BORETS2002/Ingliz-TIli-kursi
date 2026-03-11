// Admin Dashboard Application
class AdminApp {
  constructor() {
    this.apiBase = this.getApiBase();
    this.token = this.loadToken();
    this.currentPage = 'login';
    this.registrations = [];
    this.content = {};
    this.currentRegistrationId = null;

    // Initialize the app
    if (this.token) {
      this.showPage('dashboard');
      this.loadData();
    } else {
      this.showPage('login');
    }

    this.setupEventListeners();
  }

  // Get API base URL
  getApiBase() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If running on same host, use relative paths
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:${port || 3000}`;
    }
    
    return `${protocol}//${hostname}`;
  }

  // Load token from localStorage
  loadToken() {
    return localStorage.getItem('adminToken');
  }

  // Save token to localStorage
  saveToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  // Render the app
  render() {
    const app = document.getElementById('app');
    
    if (!this.token) {
      app.innerHTML = this.renderLoginPage();
    } else {
      app.innerHTML = this.renderDashboard();
    }
  }

  // Render login page
  renderLoginPage() {
    return `
      <div class="login-container">
        <div class="login-box">
          <div class="login-logo">📚 Speaking Hub</div>
          <h1 class="login-title">Admin Panel</h1>
          <p class="login-subtitle">Sign in to manage your course</p>
          
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" id="username" class="form-input" placeholder="Enter username" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="password" class="form-input" placeholder="Enter password" required>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Sign In
            </button>
          </form>
          
          <div id="loginError" style="color: var(--color-danger); margin-top: 16px; font-size: 14px; display: none;"></div>
        </div>
      </div>
    `;
  }

  // Render dashboard
  renderDashboard() {
    return `
      <div class="app-container">
        <div class="sidebar">
          <div class="logo">📚 Speaking Hub</div>
          
          <ul class="nav-menu">
            <li class="nav-item">
              <button class="nav-link active" data-page="dashboard">
                <span class="nav-icon">📊</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" data-page="registrations">
                <span class="nav-icon">👥</span>
                <span>Registrations</span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" data-page="content">
                <span class="nav-icon">📝</span>
                <span>Content</span>
              </button>
            </li>
          </ul>
          
          <div class="user-profile" style="position: relative; margin-top: 40px;">
            <div class="user-info">
              <div class="avatar">${this.getUserInitial()}</div>
              <span>Admin</span>
            </div>
            <button class="logout-btn" id="logoutBtn">Logout</button>
          </div>
        </div>
        
        <div class="main-content">
          <div class="header">
            <h1 class="header-title" id="pageTitle">Dashboard</h1>
            <div class="header-actions">
              <span id="lastUpdated" style="font-size: 12px; color: var(--color-text-secondary);"></span>
            </div>
          </div>
          
          <div class="content" id="content">
            <!-- Pages will be rendered here -->
          </div>
        </div>
      </div>
      
      <!-- Modals -->
      <div id="editRegistrationModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span>Edit Registration</span>
            <button class="modal-close" id="closeModalBtn">&times;</button>
          </div>
          <form id="editRegistrationForm">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input type="text" id="editFirstName" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input type="text" id="editLastName" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" id="editPhone" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Course</label>
              <input type="text" id="editCourse" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="editStatus" class="form-select" required>
                <option value="new">New</option>
                <option value="check">Check</option>
                <option value="time">Time</option>
                <option value="not">Not</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Note</label>
              <textarea id="editNote" class="form-textarea"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Toast Container -->
      <div id="toastContainer"></div>
    `;
  }

  // Get user initial
  getUserInitial() {
    const username = localStorage.getItem('adminUsername') || 'A';
    return username.charAt(0).toUpperCase();
  }

  // Show page
  showPage(page) {
    this.currentPage = page;
    const contentArea = document.getElementById('content');
    
    let html = '';
    let title = '';
    
    switch (page) {
      case 'dashboard':
        html = this.renderDashboardPage();
        title = 'Dashboard';
        break;
      case 'registrations':
        html = this.renderRegistrationsPage();
        title = 'Registrations';
        break;
      case 'content':
        html = this.renderContentPage();
        title = 'Content Management';
        break;
      default:
        html = '<p>Page not found</p>';
    }
    
    if (contentArea) {
      contentArea.innerHTML = html;
      document.getElementById('pageTitle').textContent = title;
      this.updateLastUpdated();
      
      // Re-attach event listeners for the new page
      this.attachPageEventListeners(page);
    }
  }

  // Render dashboard page
  renderDashboardPage() {
    const totalRegistrations = this.registrations.length;
    const newCount = this.registrations.filter(r => r.status === 'new').length;
    const checkCount = this.registrations.filter(r => r.status === 'check').length;
    
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="card">
          <div style="font-size: 32px; margin-bottom: 8px;">👥</div>
          <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 8px;">Total Registrations</div>
          <div style="font-size: 28px; font-weight: 600;">${totalRegistrations}</div>
        </div>
        
        <div class="card">
          <div style="font-size: 32px; margin-bottom: 8px;">🆕</div>
          <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 8px;">New</div>
          <div style="font-size: 28px; font-weight: 600;">${newCount}</div>
        </div>
        
        <div class="card">
          <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
          <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 8px;">To Check</div>
          <div style="font-size: 28px; font-weight: 600;">${checkCount}</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">Recent Registrations</div>
        <div class="table-container">
          ${this.registrations.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${this.registrations.slice(0, 5).map(r => `
                  <tr>
                    <td>${r.first_name} ${r.last_name}</td>
                    <td>${r.phone}</td>
                    <td>${r.course}</td>
                    <td><span class="status-badge status-${r.status}">${this.capitalizeStatus(r.status)}</span></td>
                    <td>${new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: var(--color-text-secondary);">No registrations yet</p>'}
        </div>
      </div>
    `;
  }

  // Render registrations page
  renderRegistrationsPage() {
    return `
      <div style="margin-bottom: 20px; display: flex; gap: 12px;">
        <input type="text" id="searchInput" class="form-input" placeholder="Search by name or phone..." style="flex: 1;">
        <button class="btn btn-primary" id="exportBtn">📥 Export CSV</button>
      </div>
      
      <div class="card">
        <div class="table-container">
          ${this.registrations.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="registrationsTableBody">
                ${this.registrations.map(r => `
                  <tr>
                    <td>${r.first_name} ${r.last_name}</td>
                    <td>${r.phone}</td>
                    <td>${r.course}</td>
                    <td><span class="status-badge status-${r.status}">${this.capitalizeStatus(r.status)}</span></td>
                    <td>${r.note || '-'}</td>
                    <td>${new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm edit-btn" data-id="${r.id}">Edit</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: var(--color-text-secondary);">No registrations found</p>'}
        </div>
      </div>
    `;
  }

  // Render content page
  renderContentPage() {
    return `
      <div class="card">
        <div class="card-title">Website Content</div>
        
        <form id="contentForm">
          <div class="form-group">
            <label class="form-label">Hero Title</label>
            <input type="text" id="heroTitle" class="form-input" value="${this.content.hero_title || ''}" placeholder="Main heading">
          </div>
          
          <div class="form-group">
            <label class="form-label">Hero Subtitle</label>
            <input type="text" id="heroSubtitle" class="form-input" value="${this.content.hero_subtitle || ''}" placeholder="Secondary heading">
          </div>
          
          <div class="form-group">
            <label class="form-label">Courses Heading</label>
            <input type="text" id="coursesHeading" class="form-input" value="${this.content.courses_heading || ''}" placeholder="Courses section heading">
          </div>
          
          <div class="form-group">
            <label class="form-label">Footer Text</label>
            <textarea id="footerText" class="form-textarea" placeholder="Footer content">${this.content.footer_text || ''}</textarea>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button type="submit" class="btn btn-primary">💾 Save Changes</button>
            <button type="reset" class="btn btn-secondary">↺ Reset</button>
          </div>
        </form>
      </div>
    `;
  }

  // Capitalize status
  capitalizeStatus(status) {
    const map = { 'new': 'New', 'check': 'To Check', 'time': 'Time', 'not': 'Not' };
    return map[status] || status;
  }

  // Setup event listeners
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Navigation
      if (e.target.closest('[data-page]')) {
        const page = e.target.closest('[data-page]').dataset.page;
        this.showPage(page);
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.closest('.nav-link').classList.add('active');
      }
      
      // Logout
      if (e.target.id === 'logoutBtn') {
        this.logout();
      }
      
      // Modal
      if (e.target.id === 'closeModalBtn' || e.target.id === 'cancelEditBtn') {
        document.getElementById('editRegistrationModal').classList.remove('active');
      }
    });
    
    // Login form
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'loginForm') {
        e.preventDefault();
        this.handleLogin();
      }
      
      if (e.target.id === 'editRegistrationForm') {
        e.preventDefault();
        this.handleEditRegistration();
      }
      
      if (e.target.id === 'contentForm') {
        e.preventDefault();
        this.handleSaveContent();
      }
    });
    
    // Initial render
    this.render();
  }

  // Attach page-specific event listeners
  attachPageEventListeners(page) {
    if (page === 'registrations') {
      // Search
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.filterRegistrations(e.target.value);
        });
      }
      
      // Edit buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          this.openEditModal(id);
        });
      });
      
      // Export
      const exportBtn = document.getElementById('exportBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportCSV());
      }
    }
  }

  // Handle login
  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
      const response = await fetch(`${this.apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      this.saveToken(data.token);
      localStorage.setItem('adminUsername', username);
      this.showPage('dashboard');
      this.loadData();
      this.render();
    } catch (error) {
      console.error('[v0] Login error:', error);
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
    }
  }

  // Handle logout
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    this.token = null;
    this.render();
    this.setupEventListeners();
  }

  // Load data from API
  async loadData() {
    try {
      // Load registrations
      const regResponse = await this.apiCall('/api/admin/registrations');
      this.registrations = regResponse;
      
      // Load content
      const contentResponse = await this.apiCall('/api/content');
      this.content = contentResponse;
      
      console.log('[v0] Data loaded successfully');
    } catch (error) {
      console.error('[v0] Error loading data:', error);
      this.showToast('Error loading data', 'error');
    }
  }

  // API call helper
  async apiCall(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${this.apiBase}${endpoint}`, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired');
      }
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Filter registrations
  filterRegistrations(query) {
    const tbody = document.getElementById('registrationsTableBody');
    if (!tbody) return;
    
    const filtered = this.registrations.filter(r => 
      r.first_name.toLowerCase().includes(query.toLowerCase()) ||
      r.last_name.toLowerCase().includes(query.toLowerCase()) ||
      r.phone.includes(query)
    );
    
    tbody.innerHTML = filtered.map(r => `
      <tr>
        <td>${r.first_name} ${r.last_name}</td>
        <td>${r.phone}</td>
        <td>${r.course}</td>
        <td><span class="status-badge status-${r.status}">${this.capitalizeStatus(r.status)}</span></td>
        <td>${r.note || '-'}</td>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-secondary btn-sm edit-btn" data-id="${r.id}">Edit</button>
        </td>
      </tr>
    `).join('');
    
    // Re-attach edit listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.openEditModal(id);
      });
    });
  }

  // Open edit modal
  openEditModal(id) {
    this.currentRegistrationId = id;
    const registration = this.registrations.find(r => r.id === id);
    
    if (!registration) return;
    
    document.getElementById('editFirstName').value = registration.first_name;
    document.getElementById('editLastName').value = registration.last_name;
    document.getElementById('editPhone').value = registration.phone;
    document.getElementById('editCourse').value = registration.course;
    document.getElementById('editStatus').value = registration.status;
    document.getElementById('editNote').value = registration.note || '';
    
    document.getElementById('editRegistrationModal').classList.add('active');
  }

  // Handle edit registration
  async handleEditRegistration() {
    if (!this.currentRegistrationId) return;
    
    const data = {
      status: document.getElementById('editStatus').value,
      note: document.getElementById('editNote').value
    };
    
    try {
      await this.apiCall(`/api/admin/registrations/${this.currentRegistrationId}/status`, 'PATCH', data);
      
      // Update local data
      const registration = this.registrations.find(r => r.id === this.currentRegistrationId);
      if (registration) {
        registration.status = data.status;
        registration.note = data.note;
      }
      
      document.getElementById('editRegistrationModal').classList.remove('active');
      this.showToast('Registration updated successfully', 'success');
      this.showPage('registrations');
    } catch (error) {
      console.error('[v0] Error updating registration:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Handle save content
  async handleSaveContent() {
    const data = {
      hero_title: document.getElementById('heroTitle').value,
      hero_subtitle: document.getElementById('heroSubtitle').value,
      courses_heading: document.getElementById('coursesHeading').value,
      footer_text: document.getElementById('footerText').value
    };
    
    try {
      await this.apiCall('/api/admin/content', 'PATCH', data);
      this.content = data;
      this.showToast('Content saved successfully', 'success');
    } catch (error) {
      console.error('[v0] Error saving content:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Export to CSV
  exportCSV() {
    const csv = [
      ['First Name', 'Last Name', 'Phone', 'Course', 'Status', 'Note', 'Date'],
      ...this.registrations.map(r => [
        r.first_name,
        r.last_name,
        r.phone,
        r.course,
        this.capitalizeStatus(r.status),
        r.note || '',
        new Date(r.created_at).toLocaleDateString()
      ])
    ];
    
    const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.showToast('CSV exported successfully', 'success');
  }

  // Show toast
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // Update last updated time
  updateLastUpdated() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const element = document.getElementById('lastUpdated');
    if (element) {
      element.textContent = `Last updated: ${timeStr}`;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AdminApp();
});
