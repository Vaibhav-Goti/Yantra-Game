import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import { menuItems } from "../../routes.jsx";

const Layout = ({
  children,
  // title = 'Dashboard',
  className = '',
  ...props
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const location = useLocation();
  // scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "auto" }); // scroll main div
    }
  }, [location.pathname]);
  // console.log(location)

  // detect screen size on first render
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);  // desktop open
      } else {
        setSidebarOpen(false); // mobile closed
      }
    };

    handleResize(); // run once on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const currentRoute = menuItems.find(
    (route) => route.path === location.pathname
  );

  // console.log(currentRoute);

  const title = currentRoute?.title || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Desktop Sidebar (always visible) */}
      <Sidebar className="hidden md:block" isOpen={sidebarOpen} />

      {/* Mobile Sidebar (drawer style, toggled with menu button) */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex md:hidden z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-opacity-0"
            onClick={toggleSidebar}
          ></div>

          {/* Sidebar itself */}
          <Sidebar
            isOpen={true}
            className="relative z-50 w-64"
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={title} onMenuToggle={toggleSidebar} />

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto ${className}`} {...props} ref={mainRef}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
