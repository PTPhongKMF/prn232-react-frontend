import { cn } from "src/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers: (number | "...")[] = [];

  // Always show first page
  pageNumbers.push(1);

  // Calculate the range of pages to show around current page
  let rangeStart = Math.max(2, currentPage - 2);
  let rangeEnd = Math.min(totalPages - 1, currentPage + 2);

  // Adjust range to always show 5 numbers when possible
  if (rangeEnd - rangeStart < 4) {
    if (rangeStart === 2) {
      rangeEnd = Math.min(totalPages - 1, rangeStart + 4);
    } else if (rangeEnd === totalPages - 1) {
      rangeStart = Math.max(2, rangeEnd - 4);
    }
  }

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pageNumbers.push("...");
  }

  // Add page numbers in the middle
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pageNumbers.push(i);
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    pageNumbers.push("...");
  }

  // Always show last page if more than 1 page
  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  return (
    <div className="mt-6 flex justify-center items-center gap-1.5 pb-8">
      {pageNumbers.map((pageNum, index) =>
        pageNum === "..." ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={pageNum}
            className={cn(
              "min-w-[2.5rem] h-8 rounded border text-sm transition-colors cursor-pointer",
              pageNum === currentPage
                ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                : "border-gray-200 hover:bg-gray-50",
            )}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ),
      )}
    </div>
  );
}
