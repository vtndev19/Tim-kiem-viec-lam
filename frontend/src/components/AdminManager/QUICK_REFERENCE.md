# 📖 Quick Reference Guide - Admin Dashboard

## 🚀 Getting Started (30 seconds)

```bash
# 1. Install dependencies
npm install react-icons

# 2. Import in App.js
import AdminDashboard from './components/AdminManager/components/Dashboard';

# 3. Use it
<AdminDashboard />

# Done! ✅
```

---

## 📋 File Structure at a Glance

```
AdminManager/
├── components/
│   ├── Dashboard.js          ← Main page (klik ở đây để mulai)
│   ├── Sidebar.js            ← Left navigation
│   ├── UserManagement.js     ← User CRUD
│   ├── NewsPost.js           ← Post CRUD
│   ├── EmailMarketing.js     ← Email campaigns
│   └── NotificationPanel.js  ← Notifications
└── styles/
    ├── Dashboard.css
    ├── Sidebar.css
    ├── UserManagement.css
    ├── NewsPost.css
    ├── EmailMarketing.css
    └── NotificationPanel.css
```

---

## 🎯 Component Quick Reference

### Dashboard.js

```jsx
import Dashboard from "./components/AdminManager/components/Dashboard";
<Dashboard />;
```

**Shows**: Main page, stats, activity feed, quick summary

### Sidebar.js

```jsx
<Sidebar activeMenu={menu} setActiveMenu={setMenu} onLogout={handleLogout} />
```

**Props**: activeMenu, setActiveMenu, onLogout

### UserManagement.js

```jsx
<UserManagement />
```

**Features**: List, search, filter, add, edit, delete, lock/unlock users

### NewsPost.js

```jsx
<NewsPost />
```

**Features**: List, search, create, edit, delete, publish/draft posts

### EmailMarketing.js

```jsx
<EmailMarketing />
```

**Features**: List campaigns, create, schedule, view stats, delete

### NotificationPanel.js

```jsx
<NotificationPanel />
```

**Features**: Send notifications, list, mark read, delete

---

## 🎨 Customization Cheat Sheet

### Change Primary Color

Find and replace in all CSS files:

```css
/* OLD */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* NEW */
linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%)
```

### Change Sidebar Width

In `Sidebar.css`:

```css
.sidebar {
  width: 280px; /* Change this */
}
```

### Change Text Colors

In CSS files:

```css
--text-primary: #1a202c; /* Dark text */
--text-secondary: #718096; /* Gray text */
```

### Change Animations

In CSS files, look for:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## 🔧 Common Tasks

### Task 1: Add a New Menu Item

In `Sidebar.js`, find `menuItems` array:

```jsx
const menuItems = [
  // ... existing items
  {
    id: "reports", // Unique ID
    label: "Báo cáo", // Display text
    icon: FaChartBar, // Icon from react-icons
  },
];
```

Then handle in `Dashboard.js`:

```jsx
case 'reports':
  return <Reports />;  // Import & show your component
```

### Task 2: Add Form Field

In `UserManagement.js`, add to formData:

```jsx
const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  newField: "", // Add here
});
```

And add input:

```jsx
<div className="form-group">
  <label htmlFor="newField">Label</label>
  <input
    type="text"
    id="newField"
    name="newField"
    value={formData.newField}
    onChange={handleInputChange}
  />
</div>
```

### Task 3: Connect to API

Replace mock data:

```jsx
// Before
useEffect(() => {
  setUsers(mockUsers);
}, []);

// After
useEffect(() => {
  fetch("/api/users")
    .then((r) => r.json())
    .then(setUsers)
    .catch(console.error);
}, []);
```

### Task 4: Change Table Columns

In any component with a table, modify `<thead>`:

```jsx
<thead>
  <tr>
    <th>Column 1</th>
    <th>Column 2</th>
    {/* Add/remove columns */}
  </tr>
</thead>
```

And modify data display in `<tbody>`

### Task 5: Add Modal Validation

In form submission:

```jsx
const handleSave = (e) => {
  e.preventDefault();

  // Validation
  if (!formData.name.trim()) {
    alert("Tên không được trống!");
    return;
  }

  // Save
  // ...
};
```

---

## 📱 Responsive Breakpoints

When testing:

- **Mobile**: Resize to ~375px width
- **Tablet**: Resize to ~768px width
- **Desktop**: Resize to ~1024px width

---

## 🎯 Component Hierarchy

```
Dashboard
├── Sidebar
│   ├── Logo
│   ├── Menu Items
│   └── Logout Button
└── Main Content Area
    ├── Home (Dashboard stats)
    ├── UserManagement (if menu.users)
    ├── NewsPost (if menu.news)
    ├── EmailMarketing (if menu.email)
    └── NotificationPanel (if menu.notification)
```

---

## 💾 State Management Pattern

All components follow same pattern:

```jsx
const [items, setItems] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [showModal, setShowModal] = useState(false);
const [editingItem, setEditingItem] = useState(null);
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);

useEffect(() => {
  // Fetch data
}, []);

// Filter/Search
const filtered = items.filter(/* ... */);

// CRUD operations
const handleAdd = () => {
  /* ... */
};
const handleEdit = (item) => {
  /* ... */
};
const handleSave = () => {
  /* ... */
};
const handleDelete = (id) => {
  /* ... */
};
```

---

## 🎨 CSS Classes Reference

### Common Button Classes

```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-icon btn-edit">Edit</button>
<button className="btn-icon btn-delete">Delete</button>
<button className="btn-icon btn-view">View</button>
```

### Badge Classes

```jsx
<span className="role-badge user">User</span>
<span className="role-badge recruiter">Recruiter</span>
<span className="status-badge active">Active</span>
<span className="status-badge inactive">Inactive</span>
```

### Container Classes

```jsx
<div className="modal-overlay">...</div>
<div className="modal-content">...</div>
<div className="table-container">...</div>
<div className="filters-section">...</div>
<div className="management-header">...</div>
```

---

## ⚡ Performance Tips

1. **For Large Lists**: Add pagination

```jsx
const itemsPerPage = 10;
const currentPage = 1;
const paginatedItems = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

2. **For Slow API**: Add loading state

```jsx
{
  loading && <div className="loading">Loading...</div>;
}
{
  items.length > 0 ? <Table /> : <Empty />;
}
```

3. **For Heavy Renders**: Memoize components

```jsx
import { memo } from "react";
const UserRow = memo(({ user, onEdit, onDelete }) => <tr>...</tr>);
```

---

## 🔍 Debugging Tips

### Console Logs

```jsx
// Log state changes
useEffect(() => {
  console.log("Active menu changed:", activeMenu);
}, [activeMenu]);

// Log form data
const handleInputChange = (e) => {
  const { name, value } = e.target;
  console.log(`${name} changed to:`, value);
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

### Browser DevTools

- **React DevTools**: Monitor component state/props
- **Network Tab**: Check API calls
- **Console**: View errors/warnings
- **Responsive Mode**: Test mobile view

---

## 🎯 Color Palette Quick Reference

```
Primary: #667eea    ← Main buttons, links
Accent:  #764ba2    ← Gradients
Success: #48bb78    ← Green badges
Warning: #ed8936    ← Orange badges
Error:   #f56565    ← Red badges
Info:    #4299e1    ← Blue badges
Text:    #1a202c    ← Dark text
Muted:   #718096    ← Gray text
```

---

## 📊 Modal Pattern

All modals follow same pattern:

```jsx
// State
const [showModal, setShowModal] = useState(false);
const [editingItem, setEditingItem] = useState(null);

// Open modal
const handleOpen = (item = null) => {
  setEditingItem(item);
  setShowModal(true);
};

// Close modal
const handleClose = () => {
  setShowModal(false);
  setEditingItem(null);
};

// Save
const handleSave = async (e) => {
  e.preventDefault();
  // API call
  handleClose();
};

// JSX
{
  showModal && (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSave}>{/* Form fields */}</form>
      </div>
    </div>
  );
}
```

---

## 🚀 Quick Deployment Checklist

- [ ] Replace mock data with API
- [ ] Add authentication
- [ ] Test on mobile
- [ ] Fix any console errors
- [ ] Optimize images
- [ ] Check performance
- [ ] Test cross-browser
- [ ] Add error handling
- [ ] Add loading states
- [ ] Review accessibility

---

## 🆘 Common Errors & Solutions

| Error                   | Solution                       |
| ----------------------- | ------------------------------ |
| Icons not showing       | Run `npm install react-icons`  |
| Styles not loading      | Check CSS import paths         |
| Modal stuck             | Check `onClick` handlers       |
| Table horizontal scroll | Check `table-container` width  |
| Sidebar overlapping     | Check `position` and `z-index` |
| Form not submitting     | Check `onSubmit` handler       |

---

## 📚 Documentation Map

| Document                  | Content                      |
| ------------------------- | ---------------------------- |
| **README.md**             | Full setup & features guide  |
| **USAGE_EXAMPLES.md**     | 6 integration examples       |
| **STRUCTURE.md**          | Detailed component structure |
| **COMPLETION_SUMMARY.md** | Project overview             |
| **QUICK_REFERENCE.md**    | This file                    |

---

## 🎓 Learning Resources

- React Docs: https://react.dev
- CSS Grid: https://css-tricks.com/snippets/css/complete-guide-grid/
- Flexbox: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- react-icons: https://react-icons.github.io/react-icons/

---

## 💡 Pro Tips

1. **Use DevTools**: Chrome React DevTools extension is your friend
2. **Mobile First**: Always check mobile view while developing
3. **Consistent Naming**: Use same patterns across components
4. **DRY CSS**: Reuse classes instead of creating new ones
5. **Comments**: Document why, not what
6. **Testing**: Test API integration early
7. **Backup**: Version control your changes

---

**Happy Coding! 🚀**

Last Updated: December 17, 2024  
Version: 1.0.0
