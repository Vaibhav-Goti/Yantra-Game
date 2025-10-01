import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // install lucide-react
import Button from "./ui/Button";
import Dropdown, { DropdownItem } from "./ui/Dropdown";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  limit, 
  onLimitChange, 
  totalItems,
  showLimitDropdown = true,
  limitOptions = [1,5, 10, 20, 50, 100]
}) => {
  if (totalPages <= 1 && !showLimitDropdown) return null;
  
  return (
    <div className="flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
      {/* Left side - Items info and limit dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {/* Items info */}
        {totalItems && (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
          </span>
        )}
        
        {/* Limit dropdown */}
        {showLimitDropdown && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
            <Dropdown
              trigger={
                <Button variant="outline" size="sm" className="min-w-[80px] text-xs sm:text-sm">
                  {limit} entries
                </Button>
              }
            >
              {limitOptions.map((option) => (
                <DropdownItem
                  key={option}
                  onClick={() => onLimitChange && onLimitChange(option)}
                  className={limit === option ? "bg-blue-50 text-blue-700" : ""}
                >
                  {option} entries
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        )}
      </div>

      {/* Right side - Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {/* Previous */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* Page Numbers - Responsive */}
          <div className="flex items-center gap-1">
            {/* Mobile: Show only current page */}
            <div className="sm:hidden">
              <span className="text-sm text-gray-600 px-2 py-1">
                {currentPage} / {totalPages}
              </span>
            </div>

            {/* Desktop: Show full pagination */}
            <div className="hidden sm:flex items-center gap-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="w-8 h-8 p-0 text-xs"
                  >
                    1
                  </Button>
                  {currentPage > 4 && <span className="text-gray-400 text-xs">...</span>}
                </>
              )}

              {/* Page numbers around current page */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-gray-400 text-xs">...</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="w-8 h-8 p-0 text-xs"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
