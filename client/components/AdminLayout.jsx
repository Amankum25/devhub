import { Outlet } from "react-router-dom";
import AdminNavigation from "./AdminNavigation";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminNavigation />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
