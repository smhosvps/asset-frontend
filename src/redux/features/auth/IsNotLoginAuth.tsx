// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useGetUserQuery } from "@/redux/api/apiSlice";

// const IsNotLoginAuth: React.FC = () => {
//   const { data: user } = useGetUserQuery();
//   const location = useLocation();

//   // If user is not authenticated, allow access to the route (likely a public route)
//   if (!user) {
//     return <Outlet />;
//   }

//   // If user is authenticated, redirect to home page
//   return (
//     <Navigate
//       to={`${user?.user?.role === "user" ? "/user-dashboard" : "dashboard"}`}
//       state={{ from: location }}
//       replace
//     />
//   );
// };

// export default IsNotLoginAuth;



// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useGetUserQuery } from "@/redux/api/apiSlice";

// const IsNotLoginAuth: React.FC = () => {
//   const { data, isLoading } = useGetUserQuery();
//   const location = useLocation();

//   // Show nothing while loading user data
//   if (isLoading) {
//     return null;
//   }

//   // If user is not authenticated, allow access
//   if (!data) {
//     return <Outlet />;
//   }

//   // If user is authenticated, redirect to the appropriate dashboard
//   return (
//     <Navigate
//       to={data.user.role === "user" ? "/user-dashboard" : "/dashboard"}
//       state={{ from: location }}
//       replace
//     />
//   );
// };

// export default IsNotLoginAuth;

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetUserQuery } from "@/redux/api/apiSlice";

const IsNotLoginAuth: React.FC = () => {
  const { data: user, isLoading, isError } = useGetUserQuery({});
  const location = useLocation();

  // Handle loading state
  if (isLoading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  // Allow access if there's an error (assuming error means not authenticated) or no user
  if (isError || !user) {
    return <Outlet />;
  }

  // Determine proper redirect path based on user role
  const redirectPath = user?.user?.role === "user" 
    ? "/user-dashboard" 
    : "/dashboard";

  return (
    <Navigate
      to={redirectPath}
      state={{ from: location }}
      replace
    />
  );
};

export default IsNotLoginAuth;
