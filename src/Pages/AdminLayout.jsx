import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../Components/dashboard/Header"; // Adjust import path as needed
import FleetManagementAdminDashboard from "./Admindashboard";
import AdminUsers from "./AdminUsers";
import AdminTransportRequests from "./AdminTransportRequests";
import { AdminSidebar } from "../Components/Adminsidebar";
// Add this import at the top with other imports
import EquipmentDetails from "./EquipmentDetails";
import { locationAPI } from "../utils/Api";

const AdminLayout = () => {
  // Sidebar states
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // Header states
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [locations, setLocations] = useState([]);

  // Get user data from auth context
  const { user, logout, selectedLocation } = useAuth();

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await locationAPI.getAllLocations();
        setLocations(data.data || []);
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };
    loadLocations();
  }, []);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false); // Expand on mobile when sidebar is shown
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu) {
        if (!event.target.closest(".dropdown-container")) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  // Memoized toggle and handler functions to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => {
      if (!prev) {
        setShowUserMenu(false);
      }
      return !prev;
    });
  }, []);
  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(!showUserMenu);
  }, []);
  const handleLogout = useCallback(() => logout(), [logout]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <Header
          toggleMobileMenu={toggleMobileMenu}
          mobileMenuOpen={mobileMenuOpen}
          showUserMenu={showUserMenu}
          toggleUserMenu={toggleUserMenu}
          user={user}
          handleLogout={handleLogout}
          collapsed={collapsed}
          toggleSidebar={toggleSidebar}
          selectedLocation={selectedLocation}
          locations={locations}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<FleetManagementAdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route
              path="/transport-requests"
              element={<AdminTransportRequests />}
            />
            <Route path="/fleet-equipment" element={<EquipmentDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
