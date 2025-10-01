// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// const Sidebar = ({ 
//   isOpen = true,
//   className = '',
//   ...props 
// }) => {
//   const location = useLocation();
  
//   const menuItems = [
//     {
//       name: 'Dashboard',
//       href: '/dashboard',
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
//         </svg>
//       )
//     },
//     {
//       name: 'Machines',
//       href: '/machines',
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
//         </svg>
//       )
//     },
//     {
//       name: 'Timeframes',
//       href: '/timeframes',
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       )
//     },
//     {
//       name: 'Game Sessions',
//       href: '/sessions',
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//         </svg>
//       )
//     },
//     {
//       name: 'Statistics',
//       href: '/statistics',
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//         </svg>
//       )
//     },
//     {
//       name: 'Users',
//       href: '/users',
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//         </svg>
//       )
//     }
//   ];
  
//   const isActive = (href) => location.pathname === href;
  
//   return (
//     <div className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} ${className}`} {...props}>
//       <div className="flex flex-col h-full">
//         {/* Logo */}
//         <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
//           <div className="flex items-center">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-lg">G</span>
//             </div>
//             {isOpen && (
//               <span className="ml-3 text-xl font-semibold">Gaming Admin</span>
//             )}
//           </div>
//         </div>
        
//         {/* Navigation */}
//         <nav className="flex-1 px-4 py-6 space-y-2">
//           {menuItems.map((item) => (
//             <Link
//               key={item.name}
//               to={item.href}
//               className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//                 isActive(item.href)
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//               }`}
//             >
//               <span className="flex-shrink-0">{item.icon}</span>
//               {isOpen && <span className="ml-3">{item.name}</span>}
//             </Link>
//           ))}
//         </nav>
        
//         {/* User section */}
//         <div className="p-4 border-t border-gray-700">
//           <div className="flex items-center">
//             <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
//               <span className="text-white text-sm font-medium">A</span>
//             </div>
//             {isOpen && (
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-white">Admin User</p>
//                 <p className="text-xs text-gray-400">admin@example.com</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { menuItems } from "../../routes.jsx";
import { useFetchUserApi } from "../../hooks/useUserApi.jsx";

const Sidebar = ({ isOpen = true, className = "", ...props }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { data: user, isPending, isError, error } = useFetchUserApi()

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? "w-64" : "w-16"} ${className}`} {...props}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            {isOpen && <span className="ml-3 text-xl font-semibold">Gaming Admin</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive(item.path) ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{user?.data?.name
                    ? user.data.name.charAt(0).toUpperCase(): ''}
              </span>
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.data?.name
                    ? user.data.name.charAt(0).toUpperCase() + user.data.name.slice(1)
                    : ''}</p>
                <p className="text-xs text-gray-400">{user?.data?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
