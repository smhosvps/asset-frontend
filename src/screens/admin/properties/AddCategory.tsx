import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
} from "@/redux/features/category/categoryApi";
import { ArrowBigLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddCategory({}) {
  const navigate = useNavigate();
  const { refetch } = useGetCategoriesQuery({});
  const [categoryName, setCategoryName] = useState("");
  const [createCategory, { isLoading, isSuccess, error }] =
    useCreateCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ categoryName }).unwrap();
      setCategoryName("");
    } catch (err) {
      alert("Error saving category");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Category successfully added.");
      navigate("/dashboard/manage-category");
      refetch();
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error]);

  return (
    <div className="p-6min-h-screen">
      <div className="container bg-white p-6 rounded-lg shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowBigLeft className="mr-2" /> Back
        </button>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b-[1px] border-gray-200 pb-2 text-gray-700">
            Add Property-Category
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-600 text-sm font-semibold mb-2"
                htmlFor="categoryName"
              >
                Category Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category Name"
              />
            </div>
            <button
              className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {isLoading ? "Creating Category" : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
