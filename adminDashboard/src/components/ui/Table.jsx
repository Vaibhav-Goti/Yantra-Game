// import React from 'react';

// const Table = ({ 
//   children, 
//   className = '',
//   striped = false,
//   hover = true,
//   bordered = false,
//   responsive = true,
//   ...props 
// }) => {
//   const baseClasses = 'min-w-full divide-y divide-gray-200';
//   const stripedClasses = striped ? 'divide-y divide-gray-200' : '';
//   const combinedClasses = `${baseClasses} ${stripedClasses} ${className}`;
  
//   const tableElement = (
//     <table className={combinedClasses} {...props}>
//       {children}
//     </table>
//   );
  
//   if (responsive) {
//     return (
//       <div className="overflow-x-auto">
//         {tableElement}
//       </div>
//     );
//   }
  
//   return tableElement;
// };

// export const TableHeader = ({ 
//   children, 
//   className = '',
//   ...props 
// }) => {
//   return (
//     <thead className={`bg-gray-50 ${className}`} {...props}>
//       {children}
//     </thead>
//   );
// };

// export const TableBody = ({ 
//   children, 
//   className = '',
//   ...props 
// }) => {
//   return (
//     <tbody className={`bg-white divide-y divide-gray-200 ${className}`} {...props}>
//       {children}
//     </tbody>
//   );
// };

// export const TableRow = ({ 
//   children, 
//   className = '',
//   hover = true,
//   striped = false,
//   isEven = false,
//   ...props 
// }) => {
//   const baseClasses = 'transition-colors duration-150';
//   const hoverClasses = hover ? 'hover:bg-gray-50' : '';
//   const stripedClasses = striped && isEven ? 'bg-gray-50' : 'bg-white';
//   const combinedClasses = `${baseClasses} ${hoverClasses} ${stripedClasses} ${className}`;
  
//   return (
//     <tr className={combinedClasses} {...props}>
//       {children}
//     </tr>
//   );
// };

// export const TableColumn = ({ 
//   children, 
//   className = '',
//   header = false,
//   sortable = false,
//   sorted = null, // 'asc', 'desc', null
//   onSort,
//   ...props 
// }) => {
//   const baseClasses = header 
//     ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
//     : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  
//   const sortableClasses = sortable ? 'cursor-pointer select-none hover:bg-gray-100' : '';
//   const combinedClasses = `${baseClasses} ${sortableClasses} ${className}`;
  
//   const handleClick = () => {
//     if (sortable && onSort) {
//       const newSort = sorted === 'asc' ? 'desc' : sorted === 'desc' ? null : 'asc';
//       onSort(newSort);
//     }
//   };
  
//   const SortIcon = () => {
//     if (!sortable) return null;
    
//     if (sorted === 'asc') {
//       return (
//         <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
//         </svg>
//       );
//     }
    
//     if (sorted === 'desc') {
//       return (
//         <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//         </svg>
//       );
//     }
    
//     return (
//       <svg className="w-4 h-4 ml-1 inline opacity-50" fill="currentColor" viewBox="0 0 20 20">
//         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//       </svg>
//     );
//   };
  
//   return (
//     <td className={combinedClasses} onClick={handleClick} {...props}>
//       {children}
//       <SortIcon />
//     </td>
//   );
// };

// export const TableHeaderColumn = ({ 
//   children, 
//   className = '',
//   sortable = false,
//   sorted = null,
//   onSort,
//   ...props 
// }) => {
//   const baseClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
//   const sortableClasses = sortable ? 'cursor-pointer select-none hover:bg-gray-100' : '';
//   const combinedClasses = `${baseClasses} ${sortableClasses} ${className}`;
  
//   const handleClick = () => {
//     if (sortable && onSort) {
//       const newSort = sorted === 'asc' ? 'desc' : sorted === 'desc' ? null : 'asc';
//       onSort(newSort);
//     }
//   };
  
//   const SortIcon = () => {
//     if (!sortable) return null;
    
//     if (sorted === 'asc') {
//       return (
//         <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
//         </svg>
//       );
//     }
    
//     if (sorted === 'desc') {
//       return (
//         <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//         </svg>
//       );
//     }
    
//     return (
//       <svg className="w-4 h-4 ml-1 inline opacity-50" fill="currentColor" viewBox="0 0 20 20">
//         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//       </svg>
//     );
//   };
  
//   return (
//     <th className={combinedClasses} onClick={handleClick} {...props}>
//       {children}
//       <SortIcon />
//     </th>
//   );
// };

// export default Table;


import React from "react";

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      col.sortable ? "cursor-pointer select-none hover:bg-gray-100" : ""
                    } ${col.className || ""}`}
                    style={col.style}
                    onClick={
                      col.sortable && col.onSort
                        ? () => {
                            const newSort =
                              col.sorted === "asc"
                                ? "desc"
                                : col.sorted === "desc"
                                ? null
                                : "asc";
                            col.onSort(newSort);
                          }
                        : undefined
                    }
                  >
                    {col.label}
                    {col.sortable && (
                      <span className="ml-1 inline-block">
                        {col.sorted === "asc" ? (
                          <svg
                            className="w-3 h-3 inline"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 
                              3.293a1 1 0 01-1.414-1.414l4-4a1 1 
                              0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : col.sorted === "desc" ? (
                          <svg
                            className="w-3 h-3 inline"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 
                              10.586l3.293-3.293a1 1 0 
                              111.414 1.414l-4 4a1 1 
                              0 01-1.414 0l-4-4a1 1 
                              0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 inline opacity-50"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 
                              10.586l3.293-3.293a1 1 
                              0 111.414 1.414l-4 4a1 1 
                              0 01-1.414 0l-4-4a1 1 
                              0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className={`transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-gray-100" : "hover:bg-gray-100"
                    } ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 text-sm text-gray-700 whitespace-nowrap ${
                          col.className || ""
                        }`}
                        style={col.style}
                      >
                        {col.render ? col.render(row, idx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 text-center text-gray-500 italic"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;

