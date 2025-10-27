import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import React from 'react';
import Login from './pages/login';
import Home from './pages/home';
import '../css/app.css';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/admin/dashboard';



export function App() {
return (
<BrowserRouter>
<Routes>
<Route path="/login" element={<Login/>} />
<Route path="/" element={<Home/>} />
<Route element={<ProtectedRoute/>}>
  <Route path="/admin/*" element={<Dashboard/>} />
</Route>

</Routes>
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


