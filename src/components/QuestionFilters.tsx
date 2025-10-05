import { Filter, Search, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "src/components/libs/shadcn/accordion";
import { Input } from "src/components/libs/shadcn/input";
import { type Tag } from "src/types/tag/tag";
import { type QuestionRequest } from "src/types/question/question";
import { cn } from "src/utils/cn";

interface QuestionFiltersProps {
  questionRequest: QuestionRequest;
  onRequestChange: (newRequest: QuestionRequest) => void;
  tagList?: Tag[];
}

export default function QuestionFilters({ questionRequest, onRequestChange, tagList }: QuestionFiltersProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="searchBar" className="border-0">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <Input
              className="pl-10 pr-4 w-full"
              placeholder="Search questions..."
              value={questionRequest.searchTerm}
              onChange={(e) =>
                onRequestChange({
                  ...questionRequest,
                  searchTerm: e.target.value,
                  pageNumber: 1,
                })
              }
            />
          </div>
          <AccordionTrigger className="px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Filter className="size-5" />
            <span className="ml-2">Filters</span>
          </AccordionTrigger>
        </div>

        <AccordionContent className="pt-4">
          <div className="rounded-lg p-4 border bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={questionRequest.sortByDateDescending ? "newest" : "oldest"}
                  onChange={(e) =>
                    onRequestChange({
                      ...questionRequest,
                      sortByDateDescending: e.target.value === "newest",
                      pageNumber: 1,
                    })
                  }
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={questionRequest.pageSize}
                  onChange={(e) =>
                    onRequestChange({
                      ...questionRequest,
                      pageSize: Number(e.target.value),
                      pageNumber: 1,
                    })
                  }
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2 mb-4">
                <div className="col-span-2 flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Filter by date</label>
                  {(questionRequest.from || questionRequest.to) && (
                    <button
                      onClick={() =>
                        onRequestChange({
                          ...questionRequest,
                          from: null,
                          to: null,
                          pageNumber: 1,
                        })
                      }
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="size-4" />
                      <span className="text-xs">Clear dates</span>
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
                  <Input
                    type="date"
                    className="w-full"
                    value={questionRequest.from ?? ""}
                    onChange={(e) =>
                      onRequestChange({
                        ...questionRequest,
                        from: e.target.value || null,
                        pageNumber: 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
                  <Input
                    type="date"
                    className="w-full"
                    value={questionRequest.to ?? ""}
                    onChange={(e) =>
                      onRequestChange({
                        ...questionRequest,
                        to: e.target.value || null,
                        pageNumber: 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Filter by tags</label>
                  {questionRequest.tagIds.length > 0 && (
                    <button
                      onClick={() =>
                        onRequestChange({
                          ...questionRequest,
                          tagIds: [],
                          pageNumber: 1,
                        })
                      }
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="size-4" />
                      <span className="text-xs">Clear all</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                  {tagList?.map((tag) => (
                    <label
                      key={tag.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                        questionRequest.tagIds.includes(tag.id)
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={questionRequest.tagIds.includes(tag.id)}
                        onChange={(e) => {
                          onRequestChange({
                            ...questionRequest,
                            tagIds: e.target.checked
                              ? [...questionRequest.tagIds, tag.id]
                              : questionRequest.tagIds.filter((id) => id !== tag.id),
                            pageNumber: 1,
                          });
                        }}
                        className="sr-only"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
