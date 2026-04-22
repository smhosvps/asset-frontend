import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import {
  useCreateSubCategoryMutation,
  useGetSubCategoriesQuery,
} from "@/redux/features/category/subcategoryApi";
import { ArrowBigLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddSubCategory({}) {
  const navigate = useNavigate();
  const { refetch } = useGetSubCategoriesQuery({});
  const { data: categoriesResponse } = useGetCategoriesQuery({});
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [createSubCategory, { isLoading, isSuccess, error }] =
    useCreateSubCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubCategory({ categoryName, subCategoryName }).unwrap();
      setCategoryName("");
      setSubCategoryName("");
    } catch (err) {
      alert("Error saving sub category");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Subcategory successfully added.");
      navigate("/dashboard/manage-sub-category");
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
    <div className="p-6 min-h-screen">
      <div className="container bg-white p-6 rounded-lg shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowBigLeft className="mr-2" /> Back
        </button>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b-[1px] border-gray-200 pb-2 text-gray-700">
            Add Sub-Category
          </h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="mt-1 mb-5 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option>Select Category</option>
                {categoriesResponse?.map((i: any, index: any) => (
                  <option key={index}>{i.categoryName}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-600 text-sm font-medium mb-2"
                htmlFor="categoryName"
              >
                Subcategory
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="subCategoryName"
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="Wing Name"
              />
            </div>
            <button
              className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {isLoading ? "Creating Subcategory" : "Create Subcategory"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
