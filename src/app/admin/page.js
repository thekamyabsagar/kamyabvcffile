"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import AdminLogin from "../components/AdminLogin";
import toast from "react-hot-toast";
import { HiArrowLeft, HiUsers, HiSearch, HiShieldCheck, HiCreditCard, HiUserAdd, HiTrash } from "react-icons/hi";
import { CiLogout } from "react-icons/ci";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    activePackages: 0,
    totalContactsUsed: 0,
  });

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === "unauthenticated") {
        setShowLogin(true);
        setLoading(false);
        return;
      }

      if (status === "authenticated") {
        try {
          const response = await fetch("/api/admin/auth");
          const data = await response.json();
          
          if (!data.isAdmin) {
            setShowLogin(true);
            setLoading(false);
            return;
          }
          
          setIsAdmin(true);
          setShowLogin(false);
          fetchUsers();
        } catch (error) {
          console.error("Error checking admin status:", error);
          setShowLogin(true);
          setLoading(false);
        }
      }
    };

    checkAdminStatus();
  }, [status, router]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setIsAdmin(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage = `Are you sure you want to ${newRole === "admin" ? "grant admin access to" : "remove admin access from"} this user?`;
    
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Are you sure you want to delete user: ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const onSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      setIsLoggingOut(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader size="12" />
          <p className="text-slate-600 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated as admin
  if (showLogin) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <Logo />
            <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
              Admin Dashboard
            </span>
          </div>
                <button
                  onClick={onSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-blue-800 transition-colors disabled:opacity-50"
                >
                  <CiLogout className="w-4 h-4" />
                  {isLoggingOut ? "Signing Out..." : "Sign Out"}
                </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <HiUsers className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Admins</p>
              <HiShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalAdmins}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Active Packages</p>
              <HiCreditCard className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.activePackages}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Contacts Used</p>
              <HiUserAdd className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalContactsUsed}</p>
          </div>
        </div>

        {/* User Management Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <HiUsers className="w-6 h-6 text-indigo-600" />
              User Management
            </h2>
            
            {/* Search */}
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="8" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Package</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Contacts</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Joined</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 font-medium text-slate-900">
                            {user.username || "—"}
                          </td>
                          <td className="py-4 px-4 text-slate-600">{user.email}</td>
                          <td className="py-4 px-4 text-slate-600">{user.phoneNumber || "—"}</td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.packageStatus === "active"
                                  ? "bg-green-100 text-green-800"
                                  : user.packageStatus === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {user.packageName || "No Package"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-slate-600">
                            {user.contactsUsed} / {user.contactLimit || 0}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-500 text-sm">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleRoleChange(user.id, user.role)}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                  user.role === "admin"
                                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                }`}
                                disabled={user.email === session?.user?.email}
                              >
                                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                disabled={user.email === session?.user?.email}
                                title="Delete user"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
