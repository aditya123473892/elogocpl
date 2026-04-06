import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Truck,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  MapPin,
  Calendar,
  BarChart3,
} from "lucide-react";

export function DriverSidebar({
  collapsed,
  toggleSidebar,
  activePage,
  setActivePage,
  mobileMenuOpen,
  toggleMobileMenu,
}) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "dashboard",
      description: "Overview & Analytics",
    },
    {
      name: "My Shipments",
      icon: Truck,
      path: "shipments",
      description: "Track Deliveries",
    },
    {
      name: "Schedule",
      icon: Calendar,
      path: "schedule",
      description: "View Schedule",
    },
    {
      name: "Location",
      icon: MapPin,
      path: "location",
      description: "Current Location",
    },
    {
      name: "Reports",
      icon: BarChart3,
      path: "reports",
      description: "Performance Reports",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "settings",
      description: "Profile Settings",
    },
  ];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        toggleMobileMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, toggleMobileMenu]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const handleNavigation = (path) => {
    setActivePage(path);
    navigate(path === "dashboard" ? "/driver-dashboard" : `/driver/${path}`);
    if (mobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const isActiveItem = (path) => activePage === path;

  return (
    <>
      {/* Sidebar - Desktop */}
      <div
        className={`bg-slate-900 text-white ${
          collapsed ? "w-16" : "w-64"
        } flex-shrink-0 transition-all duration-300 ease-in-out hidden md:flex flex-col shadow-2xl border-r border-slate-700 fixed h-full z-40`}
      >
        {/* Header Section */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          {collapsed ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 group"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <div className="relative">
                  <ChevronRight className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white">Fleet Driver</h1>
                  <p className="text-xs text-slate-400">Portal</p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 group"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <div className="relative">
                  <ChevronLeft className="h-5 w-5 transform group-hover:-translate-x-0.5 transition-transform duration-200" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {navItems.map((item, index) => (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                to={
                  item.path === "dashboard"
                    ? "/driver-dashboard"
                    : `/driver/${item.path}`
                }
                state={{ fromSidebar: true }}
                onClick={() => handleNavigation(item.path)}
                className={`group flex items-center py-3 px-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActiveItem(item.path)
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white hover:transform hover:scale-105"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActiveItem(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl"></div>
                )}
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 relative z-10 ${
                    isActiveItem(item.path)
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {!collapsed && (
                  <div className="ml-3 flex-1 min-w-0 relative z-10">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div
                      className={`text-xs transition-colors duration-200 ${
                        isActiveItem(item.path)
                          ? "text-green-100"
                          : "text-slate-400 group-hover:text-slate-300"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
                {isActiveItem(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r shadow-lg"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
              </Link>
              {collapsed && hoveredItem === item.path && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-600 z-50 whitespace-nowrap animate-in slide-in-from-left-2 duration-200">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.description}
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 border-4 border-transparent border-r-slate-800"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Section & Logout */}
        <div className="border-t border-slate-700 p-4 space-y-3 bg-slate-800/30">
          {user && (
            <div className="text-center text-sm">
              <p className="text-slate-300">{user.name || "Driver"}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`group flex items-center justify-center py-3 px-3 w-full rounded-xl transition-all duration-200 text-red-400 hover:bg-red-900/30 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 ${
              collapsed ? "" : ""
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={toggleMobileMenu}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white md:hidden transform transition-transform duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Fleet Driver</h1>
              <p className="text-xs text-slate-400">Portal</p>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4 px-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={
                item.path === "dashboard"
                  ? "/driver-dashboard"
                  : `/driver/${item.path}`
              }
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center py-3 px-3 rounded-xl transition-all duration-200 ${
                isActiveItem(item.path)
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-slate-700 p-4 space-y-3 mt-auto">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full py-3 px-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-900/30 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
