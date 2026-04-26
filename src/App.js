import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AdminDashboard from "./Pages/Admindashboard";
import Login from "./Pages/Login";
import AdminUsers from "./Pages/AdminUsers";
import CustomerDashboard from "./Pages/CustomerDashboard";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import { RoleSidebar } from "./Components/RoleSidebar";
import { useAuth } from "./contexts/AuthContext";
import AdminTransportRequests from "./Pages/AdminTransportRequests"; // Import the new component
import EditRequestModal from "./Components/EditRequestModal"; // Import the new component
import AdminLayout from "./Pages/AdminLayout";
import ShipmentsPage from "./Pages/Myshipments";
import ContainerDetailsPage from "./Pages/Containerdetailspage";
import VendorDetails from "./Pages/VendorDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DriverDetails from "./Pages/DriverDetails";
import EquipmentDetails from "./Pages/EquipmentDetails";
import Vindetails from "./Pages/VinDetailsPage";
import ASNManagement from "./Pages/ASNupload";
import ASNReport from "./Pages/ASNReport";
import OEMPickupPage from "./Pages/Oempickup";
import ArrivalAtPlantPage from "./Pages/Arrivalatplant";
import RakeArrivalPage from "./Pages/RakeArrival";
import VINSurveyPage from "./Components/Vinsurvey";
import LoadingStagePage from "./Components/Loadingstage";
import LocationMaster from "./Pages/LocationMaster";
import VehicleMaster from "./Pages/VehicleMaster";
import DriverMaster from "./Pages/DriverMaster";
import TransportReports from "./Pages/Reports";
import VendorController from "./Pages/Vendorcontroller";
import AllReportsPage from "./Pages/AllAdminreports";
import AdminManageRequest from "./Pages/AdminManageRequest";
import RakeMaster from "./Pages/Rakemaster";
import RouteMaster from "./Pages/RouteMaster";
import RakePlanning from "./Pages/Rakeplanning";
import ArticleMaster from "./Pages/ArticleMaster";
import RakeDeaprture from "./Pages/RakeDeaprture";
import RakeVisit from "./Pages/RakeVisit";
import MonthlyReport from "./Pages/MonthlyReport";
import ExamTypeManagement from "./Pages/ExamTypeManagement";
import RakeExamManagement from "./Pages/RakeExamManagement";
import RakeDeparture from "./Pages/RakeDeparture";
import RakeReport from "./Pages/RakeReport";
import UnifiedReport from "./Pages/UnifiedReport";
import RailOperationsReport from "./Pages/RailOperationsReport";
import LastMileDeparturePage from "./Pages/LastMileDeparture";
import LastMileDepartureDashboard from "./Pages/LastMileDepartureDashboard";
import Workflow from "./Pages/Workflow";
import OperationalReport from "./Pages/OperationalReport";
import Header from "./Components/dashboard/Header";
import { terminalMasterAPI } from "./utils/Api";
import RateContractMaster from "./Pages/RateContractMaster";
import CustomerMaster from "./Pages/CustomerMaster";  

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Header states
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [terminals, setTerminals] = useState([]);
  
  const { user, logout, selectedLocation } = useAuth();
  
  // Debug logging
  console.log('DashboardLayout - selectedLocation from AuthContext:', selectedLocation);

  // Load terminals
  useEffect(() => {
    const loadTerminals = async () => {
      try {
        const data = await terminalMasterAPI.getAllTerminals();
        console.log('DashboardLayout - Terminals API response:', data);
        console.log('DashboardLayout - Terminals data array:', data.data);
        console.log('DashboardLayout - First terminal structure:', data.data?.[0]);
        setTerminals(data.data || []);
      } catch (error) {
        console.error("Failed to load terminals:", error);
      }
    };
    loadTerminals();
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  const handleLogout = () => logout();

  const sidebarProps = {
    collapsed,
    toggleSidebar,
    activePage,
    setActivePage,
    mobileMenuOpen,
    toggleMobileMenu,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <RoleSidebar {...sidebarProps} />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          collapsed ? "md:ml-16" : "md:ml-64"
        } md:min-w-0`}
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
          terminals={terminals}
        />
        
        <div className="p-6">{React.cloneElement(children, sidebarProps)}</div>
      </main>
    </div>
  );
};

// Component to redirect based on user role
const RoleRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "Admin":
      return <Navigate to="/admin-dashboard" />;
    case "Customer":
      return <Navigate to="/customer-dashboard" />;
    case "Driver":
      return <Navigate to="/driver-dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin routes - AdminLayout handles its own sidebar */}
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendor-controller"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <VendorController />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/editrequests"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <VendorController />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <AdminUsers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/editrequest"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <AdminManageRequest />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rakemaster"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <RakeMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rakevisit"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <RakeVisit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rake-departure"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <RakeDeparture />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rake-exam"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeExamManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/allreports"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <AllReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transport-requests"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <AdminTransportRequests />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rake-report"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <RakeReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/unified-report"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <UnifiedReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rail-operations-report"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <RailOperationsReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customer-master"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <CustomerMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/operational-report"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <OperationalReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vin-survey"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <VINSurveyPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Customer route */}
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <CustomerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/workflow"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <Workflow />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/ASN"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ASNManagement></ASNManagement>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/location-master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <LocationMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/asn-reports"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ASNReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/monthly-report"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <MonthlyReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/unified-report"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <UnifiedReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rail-operations-report"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RailOperationsReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rake-report"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/oem-pickup"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <OEMPickupPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/last-mile-departure"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <LastMileDeparturePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/last-mile-departure/list"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <LastMileDepartureDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/arrival-plant"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ArrivalAtPlantPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rake-arrival"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeArrivalPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rake-departure"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeDeparture />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/vin-survey"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <VINSurveyPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/loading-stage"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <LoadingStagePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/vehicle-master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <VehicleMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
                <Route
            path="/customer/rakeplanning"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
              <RakePlanning />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/driver-master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <DriverMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
                   <Route
            path="/customer/article-master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ArticleMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rate-contract-master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RateContractMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/customer-master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <CustomerMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/operational-report"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <OperationalReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
                             <Route
            path="/customer/rake-deaprture"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeDeaprture />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/my-shipments" // Changed from "/my-shipments"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ShipmentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/container-page" // Changed from "/my-shipments"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ContainerDetailsPage></ContainerDetailsPage>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-modal"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <EditRequestModal></EditRequestModal>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/vendors"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <VendorDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/equipments"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <EquipmentDetails></EquipmentDetails>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
                   <Route
            path="/customer/Route-Master"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                <RouteMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rakemaster"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeMaster />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rakevisit"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeVisit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/exam-types"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <ExamTypeManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rake-exam"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <RakeExamManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/drivers"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <DriverDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <DriverDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/equipments"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <DashboardLayout>
                  <EquipmentDetails></EquipmentDetails>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/reports"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <TransportReports></TransportReports>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/vinpage"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <DashboardLayout>
                  <Vindetails></Vindetails>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Driver route */}
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <DashboardLayout>
                  <div>Driver Dashboard (To be implemented)</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;

// Add this route in the Routes component, near the other admin routes
