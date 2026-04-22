import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { useGetUserQuery } from "./redux/api/apiSlice";
import { useEffect } from "react";
import { setCredentials } from "./redux/features/auth/authSlice";
import SignInScreen from "./screens/auth/SignInScreen";
import RegisterAsGuestScreen from "./screens/auth/RegisterAsGuestScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import OTPVerificationScreen from "./screens/auth/OTPVerificationScreen";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import IsNotLoginAuth from "./redux/features/auth/IsNotLoginAuth";
import SharedLayout from "./screens/SharedLayout";
import UserProfileSettings from "./screens/admin/UserProfileSettings";
import AdminRoute from "./redux/features/auth/AdminRoutes";
import NotFoundScreen from "./screens/NotFoundScreen";
import Loader from "./components/loader/Loader";
import UsersPage from "./screens/admin/UsersPage";
import Accounts from "./screens/admin/accounts/Accounts";
import AddAccount from "./screens/admin/accounts/AddAccount";
import ManageProperties from "./screens/admin/properties/ManageProperties";
import ManageCategory from "./screens/admin/properties/ManageCategory";
import ManageSubcategories from "./screens/admin/properties/ManageSubcategories";
import AddCategory from "./screens/admin/properties/AddCategory";
import AddSubCategory from "./screens/admin/properties/AddSubCategory";
import AddProperties from "./screens/admin/properties/AddProperties";
import ManageItems from "./screens/admin/items/ManageItems";
import AddItems from "./screens/admin/items/AddItems";
import SuperadminDashboard from "./screens/admin/dashboard/SuperadminDashboard";
import RequestPage from "./screens/admin/request/RequestPage";
import HomePage from "./screens/HomePage";
import EditAccount from "./screens/admin/accounts/EditAccount";
import AssignAssets from "./screens/admin/assets/AssignAssets";
import AssetDetails from "./screens/admin/assets/AssetDetails";
import AddAsset from "./screens/admin/assets/AddAsset";
import EditAsset from "./screens/admin/assets/EditAsset";
import AssetTable from "./screens/admin/assets/AssetTable";
import ViewProperty from "./screens/admin/properties/ViewProperty";
import AssignProperty from "./screens/admin/accounts/AssignProperty";
import UserSharedLayout from "./screens/UserSharedLayout";
import MyProperty from "./screens/user/MyProperty";
import MaintenanceRequest from "./screens/user/MaintenanceRequest";
import EquipmentRequest from "./screens/user/EquipmentRequest";
import ServiceRequestForm from "./screens/user/ServiceRequestForm";
import EquipmentRequestForm from "./screens/user/EquipmentRequestForm";

function App() {
  const dispatch = useDispatch();
  const { data: user, isLoading } = useGetUserQuery({});

  useEffect(() => {
    if (user) {
      dispatch(
        setCredentials({ user, token: localStorage.getItem("token") || "" })
      );
    }
  }, [user, dispatch]);

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFoundScreen />} />
          <Route element={<IsNotLoginAuth />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route element={<IsNotLoginAuth />}>
            <Route path="/sign-in" element={<SignInScreen />} />
          </Route>
          <Route element={<IsNotLoginAuth />}>
            <Route path="/register" element={<RegisterAsGuestScreen />} />
          </Route>
          <Route element={<IsNotLoginAuth />}>
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          </Route>
          <Route element={<IsNotLoginAuth />}>
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
          </Route>
          <Route element={<IsNotLoginAuth />}>
            <Route
              path="/otp-verification"
              element={<OTPVerificationScreen />}
            />
          </Route>
          {/* Admin Routes */}
          <Route
            element={
              <AdminRoute allowedRoles={["Maintenance Admin"]} />
            }
          >
            <Route path="/dashboard" element={<SharedLayout />}>
              <Route index element={<SuperadminDashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="add-admin-account" element={<AddAccount />} />
              <Route path="edit-admin-account/:id" element={<EditAccount />} />
              <Route path="asign-property/:id" element={<AssignProperty />} />
              <Route path="properties" element={<ManageProperties />} />
              <Route path="manage-category" element={<ManageCategory />} />
              <Route
                path="manage-sub-category"
                element={<ManageSubcategories />}
              />
              <Route path="add-category" element={<AddCategory />} />
              <Route path="add-subcategory" element={<AddSubCategory />} />
              <Route path="add-properties" element={<AddProperties />} />
              <Route path="view-property/:id" element={<ViewProperty />} />
            


              <Route path="manage-items" element={<ManageItems />} />
              <Route path="add-items" element={<AddItems />} /> view-property
              <Route path="assets" element={<AssetTable />} />
              <Route path="add-assets" element={<AddAsset />} />
              <Route path="edit-asset/:id" element={<EditAsset />} />
              <Route path="view-asset/:id" element={<AssetDetails />} />
              <Route path="asign-asset/:id" element={<AssignAssets />} />
              <Route path="requests" element={<RequestPage />} />
              <Route path="settings" element={<UserProfileSettings />} />
            </Route>
          </Route>
          <Route
            element={
              <AdminRoute allowedRoles={["user"]} />
            }
          >
            <Route path="/user-dashboard" element={<UserSharedLayout />}>
              <Route index element={<MyProperty />} />
              <Route path="maintenance-request" element={<MaintenanceRequest />} />
              <Route path="equipment-request" element={<EquipmentRequest />} />
              <Route path="view-asset/:id" element={<AssetDetails />} />
              <Route path="service-request-form/:id" element={<ServiceRequestForm />} />
              <Route path="equipment-request-form/:id" element={<EquipmentRequestForm />} />


              <Route path="asign-property/:id" element={<AssignProperty />} />
              <Route path="properties" element={<ManageProperties />} />
              <Route path="manage-category" element={<ManageCategory />} />
              <Route
                path="manage-sub-category"
                element={<ManageSubcategories />}
              />
              <Route path="add-category" element={<AddCategory />} />
              <Route path="add-subcategory" element={<AddSubCategory />} />
              <Route path="add-properties" element={<AddProperties />} />
              <Route path="view-property/:id" element={<ViewProperty />} />
            

              <Route path="members" element={<UsersPage />} />
              <Route path="settings" element={<UserProfileSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
