import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    return (<div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}/>
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[70px]' : 'lg:ml-[260px]'}`}>
        <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} onToggleSidebar={() => setCollapsed(!collapsed)}/>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>);
};
export default AppLayout;
