'use client';

import React from 'react';
// Custom SVG components for navigation icons

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first and last page
      // Show current page and pages around it
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipses if needed
      if (startPage > 1) {
        pageNumbers.unshift(-1); // -1 represents ellipsis
        pageNumbers.unshift(1);
      }

      if (endPage < totalPages) {
        pageNumbers.push(-2); // -2 represents ellipsis
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
      <div className="flex w-0 flex-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium ${
            currentPage === 1
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>
      </div>

      <div className="hidden md:flex">
        {pageNumbers.map((page, index) => {
          if (page === -1 || page === -2) {
            // Render ellipsis
            return (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                currentPage === page
                  ? 'border-buttonPrimary text-buttonPrimary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <div className="flex w-0 flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Next
          <svg className="ml-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
