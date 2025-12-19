/\*\*

- Ví dụ sử dụng Admin Dashboard
-
- Có hai cách để sử dụng:
- 1.  Import Dashboard (recommended) - Bao gồm tất cả functionality
- 2.  Import individual components - Nếu bạn muốn custom layout
      \*/

// ============================================
// CÁCH 1: Import Dashboard chính (RECOMMENDED)
// ============================================

import React from 'react';
import AdminDashboard from './components/AdminManager/components/Dashboard';

function AdminPage() {
return (
<div className="admin-page">
<AdminDashboard />
</div>
);
}

export default AdminPage;

// ============================================
// CÁCH 2: Import từ main.js
// ============================================

import { AdminDashboard } from './components/AdminManager/main';

function AdminPage() {
return <AdminDashboard />;
}

export default AdminPage;

// ============================================
// CÁCH 3: Import individual components
// ============================================

import React, { useState } from 'react';
import Sidebar from './components/AdminManager/components/Sidebar';
import UserManagement from './components/AdminManager/components/UserManagement';
import NewsPost from './components/AdminManager/components/NewsPost';
import EmailMarketing from './components/AdminManager/components/EmailMarketing';
import NotificationPanel from './components/AdminManager/components/NotificationPanel';

// Import styles
import './components/AdminManager/styles/Dashboard.css';
import './components/AdminManager/styles/Sidebar.css';
import './components/AdminManager/styles/UserManagement.css';
import './components/AdminManager/styles/NewsPost.css';
import './components/AdminManager/styles/EmailMarketing.css';
import './components/AdminManager/styles/NotificationPanel.css';

function CustomAdminDashboard() {
const [activeMenu, setActiveMenu] = useState('dashboard');

const handleLogout = () => {
console.log('Logging out...');
// Implement logout logic here
};

const renderContent = () => {
switch (activeMenu) {
case 'users':
return <UserManagement />;
case 'news':
return <NewsPost />;
case 'email':
return <EmailMarketing />;
case 'notification':
return <NotificationPanel />;
default:
return <div>Dashboard Home</div>;
}
};

return (
<div style={{ display: 'flex', height: '100vh' }}>
<Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
      />
<main style={{ flex: 1, overflow: 'auto', padding: '30px' }}>
{renderContent()}
</main>
</div>
);
}

export default CustomAdminDashboard;

// ============================================
// CÁCH 4: Routing Setup (React Router)
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './components/AdminManager/components/Dashboard';

function App() {
return (
<Router>
<Routes>
{/_ Admin Routes _/}
<Route path="/admin/_" element={<AdminLayout />} />
{/_ Other routes... \*/}
</Routes>
</Router>
);
}

export default App;

// AdminLayout.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../components/AdminManager/components/Dashboard';

function AdminLayout() {
return (
<Routes>
<Route path="/" element={<Dashboard />} />
</Routes>
);
}

export default AdminLayout;

// ============================================
// CÁCH 5: Thêm Authentication Check
// ============================================

import React, { useEffect, useState } from 'react';
import AdminDashboard from './components/AdminManager/components/Dashboard';
import Login from './components/Login';

function AdminPage() {
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Check if user is authenticated
const token = localStorage.getItem('adminToken');
if (token) {
// Verify token with backend
verifyToken(token);
} else {
setLoading(false);
}
}, []);

const verifyToken = async (token) => {
try {
const response = await fetch('/api/verify-token', {
headers: { Authorization: `Bearer ${token}` }
});
if (response.ok) {
setIsAuthenticated(true);
}
} catch (error) {
console.error('Token verification failed:', error);
} finally {
setLoading(false);
}
};

if (loading) {
return <div>Loading...</div>;
}

if (!isAuthenticated) {
return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
}

return <AdminDashboard />;
}

export default AdminPage;

// ============================================
// CÁCH 6: Tích hợp với API
// ============================================

// UserManagement.js - Modified version
import React, { useState, useEffect } from 'react';
import '../styles/UserManagement.css';

const UserManagement = () => {
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Fetch users from API
useEffect(() => {
fetchUsers();
}, []);

const fetchUsers = async () => {
setLoading(true);
setError(null);
try {
const response = await fetch('/api/users', {
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
}
});

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }

};

const handleSaveUser = async (formData) => {
try {
const method = editingUser ? 'PUT' : 'POST';
const url = editingUser
? `/api/users/${editingUser.id}`
: '/api/users';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save user');

      await fetchUsers(); // Refresh list
      handleCloseModal();
    } catch (error) {
      setError(error.message);
      console.error('Error saving user:', error);
    }

};

const handleDeleteUser = async (userId) => {
if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      await fetchUsers(); // Refresh list
    } catch (error) {
      setError(error.message);
      console.error('Error deleting user:', error);
    }

};

// ... rest of component code
};

export default UserManagement;

// ============================================
// STYLING TIPS
// ============================================

/\*\*

- Customize Dashboard Color Scheme:
-
- Tìm và thay đổi các giá trị này trong CSS files:
-
- Primary Color: #667eea
- Accent Color: #764ba2
- Background: #f5f7fa
- Text Dark: #1a202c
- Text Light: #718096
- Border: #e2e8f0
-
- Success: #48bb78
- Warning: #ed8936
- Error: #f56565
- Info: #4299e1
  \*/
