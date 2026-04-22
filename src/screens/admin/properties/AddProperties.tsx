import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetSubCategoriesQuery } from "@/redux/features/category/subcategoryApi";
import {
  useCreatePropertyMutation,
  useGetPropertiesQuery,
} from "@/redux/features/property/propertyApi";
import { ArrowBigLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddProperties({}) {
  const navigate = useNavigate();
  const { refetch } = useGetPropertiesQuery({});
  const [createProperty, { isLoading, isSuccess, error }] =
    useCreatePropertyMutation();
  const { data: categoriesResponse } = useGetCategoriesQuery({});
  const { data: subcategoriesResponse } = useGetSubCategoriesQuery({});

  const [formData, setFormData] = useState({
    categoryName: "",
    subCategoryName: "",
    flatNumber: "",
    assign_assets: [],
  });

  const isFormValid = 
    formData.categoryName && 
    formData.subCategoryName && 
    formData.flatNumber.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryName) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.subCategoryName) {
      toast.error("Please select a subcategory");
      return;
    }

    if (!formData.flatNumber.trim()) {
      toast.error("Please enter a flat number");
      return;
    }

    try {
      await createProperty({
        ...formData,
        flatNumber: formData.flatNumber.trim()
      }).unwrap();
      navigate("/dashboard/properties");
    } catch (error) {
      toast.error("Error creating property");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Property successfully added.");
      navigate("/dashboard/properties");
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
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowBigLeft className="mr-2" /> Back
      </button>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b-[1px] border-gray-200 pb-2 text-gray-700">
            Add Property
          </h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                className="mt-1 mb-5 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {categoriesResponse?.map((i: any, index: any) => (
                  <option key={index} value={i.categoryName}>
                    {i.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <select
                value={formData.subCategoryName}
                onChange={(e) =>
                  setFormData({ ...formData, subCategoryName: e.target.value })
                }
                className="mt-1 mb-5 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Sub Category</option>
                {subcategoriesResponse?.map((i: any, index: any) => (
                  <option key={index} value={i.subCategoryName}>
                    {i.subCategoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-600 text-sm font-medium mb-2"
                htmlFor="categoryName"
              >
                Flat Number
              </label>
              <input
                value={formData.flatNumber}
                onChange={(e) =>
                  setFormData({ ...formData, flatNumber: e.target.value })
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="categoryName"
                type="text"
                placeholder="Flat Number"
              />
            </div>

            <button
              className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Creating..." : "Create Property"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}