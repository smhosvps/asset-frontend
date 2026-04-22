import { Button } from "@/components/ui/button";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useRemoveUserPropertyMutation,
} from "@/redux/features/user/userApi";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const SuperadminDashboard = () => {
  const { data, isLoading, refetch } = useGetAllUsersQuery({});
  const [deleteUser, { isSuccess, error }] = useDeleteUserMutation();
  const [removeUserProperty, { isLoading: removing }] =
    useRemoveUserPropertyMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries =
    data && data?.users?.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (isSuccess) {
      toast.success("User successfully added.");
      refetch();
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  const handleRemoveProperty = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this property?")) {
      try {
        const response = await removeUserProperty({ userId: id }).unwrap();
        console.log(response, "remove response")
        refetch();
        alert("Success");
      } catch (error: any) {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="px-6 py-3 min-h-screen">
      {/* <h2 className="text-lg text-gray-700 mt-2">Dashboard &gt; Superadmin Panel</h2> */}

      <div className="flex-end flex justify-end">
        <Link to="/dashboard/add-admin-account">
          <button className="bg-green-700 p-2 rounded-md text-white font-medium text-sm flex flex-row items-center gap-2">
            <PlusCircle />
            Add Account
          </button>
        </Link>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md overflow-x-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Manage User's Accounts
          </h3>
        </div>

        {isLoading ? (
          <div>Loading</div>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  className="ml-2 px-2 py-1 border border-gray-300 rounded-md"
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2 text-sm text-gray-700">entries</span>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.map((user: any, index: number) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstEntry + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {user.isVerified ? "True" : "False"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user?.user_property ? (
                        <Button
                          className="bg-red-700 mr-2"
                          title={removing ? "Removing..." : "Remove Property"}
                          onClick={() => handleRemoveProperty(user._id)}
                          disabled={removing}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </Button>
                      ) : (
                        <>
                          {user.isVerified == true && (
                            <Link to={`/dashboard/asign-property/${user._id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 bg-green-700 text-white hover:bg-green-600 hover:text-white mr-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                  Assign property
                                </span>
                              </Button>
                            </Link>
                          )}
                        </>
                      )}
                      {user.isVerified == true && (
                        <Link
                          to={`/dashboard/edit-admin-account/${user._id}`}
                          className="edit-link"
                        >
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="ml-2 text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Showing {indexOfFirstEntry + 1} to{" "}
                {Math.min(indexOfLastEntry, data && data?.users.length)} of{" "}
                {data && data?.users.length} entries
              </span>
              <div>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={indexOfLastEntry >= data && data?.users.length}
                  className="ml-2 px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminDashboard;
