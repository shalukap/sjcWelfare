import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import React from 'react';
import Login from './pages/login';
import Home from './pages/home';
import '../css/app.css';
import ProtectedRoute from './components/ProtectedRoute';
import { PermissionProvider } from './contexts/PermissionContext';
import Dashboard from './pages/admin/dashboard';
import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import StudentUpgrade from './pages/students/StudentUpgrade';
import FeeAssignmentList from './pages/fee-assignments/FeeAssignmentList';
import FeeAssignmentCreateGrade from './pages/fee-assignments/FeeAssignmentCreateGrade';
import FeeAssignmentEdit from './pages/fee-assignments/FeeAssignmentEdit';
import PaymentList from './pages/payments/PaymentList';
import PaymentForm from './pages/payments/PaymentForm';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';

export function App() {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Home/>} />
          <Route element={<ProtectedRoute/>}>
            <Route path="/admin" element={<Dashboard/>}>
            <Route path="dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold">Welcome to Admin Dashboard</h1></div>} />
            <Route path="students" element={<StudentList/>} />
            <Route path="students/create" element={<StudentForm/>} />
            <Route path="students/edit/:id" element={<StudentForm/>} />
            <Route path="students/upgrade" element={<StudentUpgrade/>} />
            <Route path="fee-assignments" element={<FeeAssignmentList/>} />
            <Route path="fee-assignments/create-grade" element={<FeeAssignmentCreateGrade/>} />
            <Route path="fee-assignments/edit/:id" element={<FeeAssignmentEdit/>} />
            <Route path="payments" element={<PaymentList/>} />
            <Route path="payments/create" element={<PaymentForm/>} />
            <Route path="payments/edit/:id" element={<PaymentForm/>} />
            {/* Users */}
            <Route path="users" element={<UsersList/>} />
            <Route path="users/create" element={<UserForm/>} />
            <Route path="users/edit/:id" element={<UserForm/>} />
            <Route path="roles" element={<div className="p-8"><h1 className="text-2xl font-bold">Roles Management</h1></div>} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>} />
            </Route>
          </Route>

          {/* Redirect root admin to dashboard */}
          <Route path="/admin" element={<ProtectedRoute/>}>
            <Route index element={<div className="p-8"><h1 className="text-2xl font-bold">Welcome to Admin Dashboard</h1></div>} />
          </Route>
        </Routes>
      </PermissionProvider>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");

if (!container.hasAttribute("data-react-root")) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  container.setAttribute("data-react-root", "true");
}
