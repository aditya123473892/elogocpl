import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  RefreshCw,
  BarChart3,
  Package,
  Truck,
  Clock,
  FileText,
  Eye,
  MapPin,
  Train,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { operationalReportAPI } from "../utils/Api";

// Tab data
const TABS = [
  { id: 'rakePlanning', label: 'Rake Planning / DCT', icon: FileText },
  { id: 'inTransitStatus', label: 'Intransit Rake Status', icon: Train },
  { id: 'stockInventory', label: 'Stock Inventory', icon: Package },
  { id: 'transitTime', label: 'Transit Time Data', icon: Clock },
  { id: 'dealerCompensation', label: 'Dealer Compensation', icon: BarChart3 },
  { id: 'rakeVisibility', label: 'Rake Visibility', icon: Eye },
  { id: 'rohPodDetails', label: 'ROH / POD Details', icon: FileText },
  { id: 'rakeLoading', label: 'Rake Loading Details', icon: Activity },
];

// Utility functions
const formatCurrency = (amount) =>
  amount || amount === 0 ? `₹${Number(amount).toLocaleString("en-IN")}` : "N/A";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const formatNumber = (num) =>
  num || num === 0 ? Number(num).toLocaleString("en-IN") : "N/A";

// Summary Card Component
const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</p>
      </div>
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
  </div>
);

// Table Component
const DataTable = ({ columns, data, onRowClick }) => (
  <div className="overflow-x-auto">
    {data && data.length > 0 ? (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr
              key={index}
              className={onRowClick ? "hover:bg-gray-50 cursor-pointer" : "hover:bg-gray-50"}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No data available</p>
        <p className="text-gray-400 text-sm mt-1">Add records to see data here</p>
      </div>
    )}
  </div>
);

const OperationalReport = () => {
  const [reportData, setReportData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('rakePlanning');

  // Global filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
    route: "",
    vehicle: "",
    rake: "",
    rakeId: "",
    destination: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reportResponse, summaryResponse] = await Promise.all([
        operationalReportAPI.getOperationalReport(filters),
        operationalReportAPI.getOperationalSummary(filters),
      ]);

      if (reportResponse.success) {
        setReportData(reportResponse.data);
      }
      if (summaryResponse.success) {
        setSummaryData(summaryResponse.data);
      }
    } catch (err) {
      console.error("Error fetching operational report:", err);
      setError(err.message || "Failed to fetch operational report");
      toast.error("Failed to fetch operational report");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!reportData) return;

    const sections = [
      { name: "Rake Planning", data: reportData.rakePlanning },
      { name: "In-Transit Visits", data: reportData.inTransitStatus.visits || [] },
      { name: "In-Transit Departures", data: reportData.inTransitStatus.departures || [] },
      { name: "First Mile Inventory", data: reportData.stockInventory.firstMile },
      { name: "Second Mile Inventory", data: reportData.stockInventory.secondMile },
      { name: "Last Mile Inventory", data: reportData.stockInventory.lastMile },
      { name: "Transit Time", data: reportData.transitTime },
      { name: "Rake Visibility", data: reportData.rakeVisibility },
      { name: "ROH/POD Details", data: reportData.rohPodDetails },
      { name: "Rake Loading", data: reportData.rakeLoading },
    ];

    let csvContent = "OPERATIONAL REPORT\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Filters: ${JSON.stringify(filters)}\n\n`;

    sections.forEach((section) => {
      if (section.data && section.data.length > 0) {
        csvContent += `\n=== ${section.name} ===\n`;
        const headers = Object.keys(section.data[0]);
        csvContent += headers.join(",") + "\n";
        section.data.forEach((row) => {
          csvContent += headers.map((h) => `"${row[h] || ""}"`).join(",") + "\n";
        });
      }
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `operational-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  // Handle row click for drill-down
  const handleRowClick = (row) => {
    setSelectedRow(row);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading operational report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operational Report</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive view of all operational metrics
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Rake Plans"
              value={summaryData.totalRakePlans}
              icon={FileText}
              color="text-blue-600"
            />
            <SummaryCard
              title="In-Transit Rakes"
              value={summaryData.inTransitRakes}
              icon={Train}
              color="text-purple-600"
            />
            <SummaryCard
              title="Total Inventory"
              value={summaryData.firstMileInventory + summaryData.secondMileInventory + summaryData.lastMileInventory}
              icon={Package}
              color="text-green-600"
            />
            <SummaryCard
              title="Active Loading Stages"
              value={summaryData.activeLoadingStages}
              icon={Activity}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Global Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Global Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Plant</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route / Zone</label>
              <input
                type="text"
                value={filters.route}
                onChange={(e) => handleFilterChange("route", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter route"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle / Truck</label>
              <input
                type="text"
                value={filters.vehicle}
                onChange={(e) => handleFilterChange("vehicle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vehicle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rake Number</label>
              <input
                type="text"
                value={filters.rake}
                onChange={(e) => handleFilterChange("rake", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rake"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rake ID</label>
              <input
                type="text"
                value={filters.rakeId}
                onChange={(e) => handleFilterChange("rakeId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rake ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Location</label>
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => handleFilterChange("destination", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter destination"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setFilters({ startDate: "", endDate: "", location: "", route: "", vehicle: "", rake: "", rakeId: "", destination: "" })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Report Sections - Tabbed Layout */}
        {reportData && (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border mb-6">
              <div className="flex overflow-x-auto border-b">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {activeTab === 'rakePlanning' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rake Planning / DCT</h3>
                  <DataTable
                    columns={[
                      { key: "PlanId", label: "ID" },
                      { key: "Rake_Name", label: "Rake Name" },
                      { key: "Trip_No", label: "Trip No" },
                      { key: "Plan_Date", label: "Plan Date", render: formatDate },
                      { key: "Train_No", label: "Train No" },
                      { key: "Route", label: "Route" },
                      { key: "Base_Depot", label: "Base Depot" },
                    ]}
                    data={reportData.rakePlanning}
                    onRowClick={handleRowClick}
                  />
                </div>
              )}

              {activeTab === 'inTransitStatus' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Intransit Rake Status</h3>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Rakes Left for Arrival (Departed but not arrived)</h4>
                    <DataTable
                      columns={[
                        { key: "VISIT_ID", label: "Visit ID" },
                        { key: "RAKE_ID", label: "Rake ID" },
                        { key: "TERMINAL_ID", label: "Terminal ID" },
                        { key: "DEPARTURE_DATE", label: "Operation Start", render: formatDate },
                        { key: "ARRVAL_DATE", label: "Operation End", render: formatDate },
                        { key: "IB_TRAIN_NO", label: "Placement" },
                      ]}
                      data={reportData.inTransitStatus.visits || []}
                      onRowClick={handleRowClick}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Rakes Set for Departure</h4>
                    <DataTable
                      columns={[
                        { key: "DepartureId", label: "ID" },
                        { key: "RakeName", label: "Rake Name" },
                        { key: "TrainNumber", label: "Train Number" },
                        { key: "DepartureDate", label: "Operation Start", render: formatDate },
                        { key: "ArrivalDate", label: "Operation End", render: formatDate },
                        { key: "LineTrack", label: "Placement" },
                      ]}
                      data={reportData.inTransitStatus.departures || []}
                      onRowClick={handleRowClick}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'stockInventory' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Inventory</h3>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">First Mile (OEM Pickup)</h4>
                    <DataTable
                      columns={[
                        { key: "ID", label: "ID" },
                        { key: "Truck_Number", label: "Truck Number" },
                        { key: "Plant", label: "Plant" },
                        { key: "Pickup_Date", label: "Pickup Date", render: formatDate },
                        { key: "Status", label: "Status" },
                      ]}
                      data={reportData.stockInventory.firstMile}
                      onRowClick={handleRowClick}
                    />
                  </div>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Second Mile (Arrival at Plant)</h4>
                    <DataTable
                      columns={[
                        { key: "ID", label: "ID" },
                        { key: "Truck_Number", label: "Truck Number" },
                        { key: "Plant", label: "Plant" },
                        { key: "Arrival_Date", label: "Arrival Date", render: formatDate },
                        { key: "Status", label: "Status" },
                      ]}
                      data={reportData.stockInventory.secondMile}
                      onRowClick={handleRowClick}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Last Mile (Departure)</h4>
                    <DataTable
                      columns={[
                        { key: "ID", label: "ID" },
                        { key: "Truck_Number", label: "Truck Number" },
                        { key: "Plant", label: "Plant" },
                        { key: "DepartureDate", label: "Departure Date", render: formatDate },
                        { key: "Status", label: "Status" },
                      ]}
                      data={reportData.stockInventory.lastMile}
                      onRowClick={handleRowClick}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'transitTime' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transit Time Data</h3>
                  <DataTable
                    columns={[
                      { key: "truckNumber", label: "Truck Number" },
                      { key: "vinNumber", label: "VIN Number" },
                      { key: "plant", label: "Plant" },
                      { key: "pickupDate", label: "Pickup Date", render: formatDate },
                      { key: "deliveryDate", label: "Delivery Date", render: formatDate },
                      { key: "transitTimeDays", label: "Transit Days", render: (val) => val?.toFixed(2) || "N/A" },
                    ]}
                    data={reportData.transitTime}
                    onRowClick={handleRowClick}
                  />
                </div>
              )}

              {activeTab === 'dealerCompensation' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dealer Compensation</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="h-5 w-5" />
                      <span>{reportData.dealerCompensation.message}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rakeVisibility' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rake Visibility</h3>
                  <DataTable
                    columns={[
                      { key: "type", label: "Type" },
                      { key: "trainNo", label: "Train No" },
                      { key: "rakeId", label: "Rake ID", render: (val, row) => row.rakeId || row.rakeName || "N/A" },
                      { key: "terminalId", label: "Terminal ID", render: (val, row) => row.terminalId || "N/A" },
                      { key: "date", label: "Date", render: formatDate },
                      { key: "status", label: "Status" },
                      { key: "route", label: "Route", render: (val, row) => row.route || row.routeId || "N/A" },
                      { key: "tripNo", label: "Trip No" },
                    ]}
                    data={reportData.rakeVisibility}
                    onRowClick={handleRowClick}
                  />
                </div>
              )}

              {activeTab === 'rohPodDetails' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ROH / POD Details</h3>
                  <DataTable
                    columns={[
                      { key: "rakeName", label: "Rake Name" },
                      { key: "owner", label: "Owner" },
                      { key: "operator", label: "Operator" },
                      { key: "rohMonths", label: "ROH Months" },
                      { key: "pohMonths", label: "POH Months" },
                      { key: "leaseFrom", label: "Lease From", render: formatDate },
                      { key: "leaseTo", label: "Lease To", render: formatDate },
                      { key: "status", label: "Status" },
                    ]}
                    data={reportData.rohPodDetails}
                    onRowClick={handleRowClick}
                  />
                </div>
              )}

              {activeTab === 'rakeLoading' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rake Loading Details</h3>
                  <DataTable
                    columns={[
                      { key: "ID", label: "ID" },
                      { key: "LoadingStation", label: "Loading Station" },
                      { key: "OperationType", label: "Operation Type" },
                      { key: "RakeNo", label: "Rake No" },
                      { key: "CreatedAt", label: "Created At", render: formatDateTime },
                    ]}
                    data={reportData.rakeLoading}
                    onRowClick={handleRowClick}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Detailed View</h3>
                  <p className="text-blue-100">Record Details</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(selectedRow, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalReport;
