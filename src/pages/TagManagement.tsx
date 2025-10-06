import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import GenericDeleteDialog from "src/components/GenericDeleteDialog";
import CreateTagDialog from "src/components/tags/CreateTagDialog";
import TagItem from "src/components/tags/TagItem";
import { Input } from "src/components/libs/shadcn/input";
import { useDebounce } from "src/hooks/useDebounce";
import { usePagnitedTagList, useUpdateTagMutation, useDeleteTagMutation, useCreateTagMutation } from "src/hooks/useTag";
import { type Tag, type TagRequest } from "src/types/tag/tag";
import { cn } from "src/utils/cn";
import { useQueryClient } from "@tanstack/react-query";

export default function TagManagement() {
  const [tagRequest, setTagRequest] = useState<TagRequest>({
    searchTerm: "",
    pageNumber: 1,
    pageSize: 15,
    totalPages: 0,
  });
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const queryClient = useQueryClient();
  const createTag = useCreateTagMutation();
  const updateTag = useUpdateTagMutation();
  const deleteTag = useDeleteTagMutation();

  const debouncedRequest = useDebounce({ ...tagRequest, pageNumber: undefined }, 500);
  const tagList = usePagnitedTagList({ ...debouncedRequest, pageNumber: tagRequest.pageNumber });

  useEffect(() => {
    if (tagList.isError) console.log(tagList.error);
  }, [tagList.isError]);

  const handleEdit = async (id: number, newName: string) => {
    await updateTag.mutateAsync({ id, name: newName });
    queryClient.invalidateQueries({ queryKey: ["tag"] });
  };

  const handleCreate = async (name: string) => {
    await createTag.mutateAsync(name);
    queryClient.invalidateQueries({ queryKey: ["tag"] });
  };

  const handleDelete = async () => {
    if (tagToDelete) {
      await deleteTag.mutateAsync(tagToDelete.id);
      queryClient.invalidateQueries({ queryKey: ["tag"] });
      setTagToDelete(null);
    }
  };

  return (
    <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Tag Management</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Manage all tags in the system. Tags can be used to categorize questions.
          </p>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <Input
              className="pl-10 pr-4 w-full"
              placeholder="Search tags..."
              value={tagRequest.searchTerm}
              onChange={(e) =>
                setTagRequest((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                  pageNumber: 1,
                }))
              }
            />
          </div>
          <CreateTagDialog onSubmit={handleCreate} isLoading={createTag.isPending} />
        </div>

        <div className="mt-8 flow-root">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden rounded-lg">
              {tagList.isPending ? (
                <div className="flex justify-center items-center w-full min-h-[200px] bg-white">
                  <Loader2 className="animate-spin size-10 text-gray-400" />
                </div>
              ) : tagList.isError ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] bg-white text-gray-500">
                  <p>Failed to load tags. Please try again later.</p>
                </div>
              ) : tagList.data?.data.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] bg-white text-gray-500">
                  <p>No tags found. Try adjusting your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {tagList.data?.data.results.map((tag) => (
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      onEdit={handleEdit}
                      onDelete={setTagToDelete}
                      isEditing={updateTag.isPending || deleteTag.isPending}
                    />
                  ))}
                </div>
              )}

              <GenericDeleteDialog
                isOpen={!!tagToDelete}
                onClose={() => setTagToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Tag"
                itemName={tagToDelete?.name ?? ""}
                isLoading={deleteTag.isPending}
              />

              {tagList.data && tagList.data.data.results.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3 mt-6">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">{(tagRequest.pageNumber - 1) * tagRequest.pageSize + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(
                            tagRequest.pageNumber * tagRequest.pageSize,
                            tagList.data.data.pagnition.totalPages * tagRequest.pageSize,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {tagList.data.data.pagnition.totalPages * tagRequest.pageSize}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setTagRequest((prev) => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
                          disabled={tagRequest.pageNumber === 1}
                          className={cn(
                            "relative cursor-pointer inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                          Page {tagRequest.pageNumber} of {tagList.data.data.pagnition.totalPages}
                        </span>
                        <button
                          onClick={() => setTagRequest((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
                          disabled={tagRequest.pageNumber === tagList.data.data.pagnition.totalPages}
                          className={cn(
                            "relative cursor-pointer inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
