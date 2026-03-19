import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Truck,
  MapPin,
  Package,
} from "lucide-react";
import { dealerTripDetailsAPI } from "../utils/Api";
import OEMPickupStatusSummary from "../Components/OEMPickupStatusSummary";

const MonthlyReport = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const itemsPerPage = 10;

  // Fetch and process reports
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await dealerTripDetailsAPI.getAllDealerTripDetails();
      const data = response.data || response || [];
      setReports(data);
      console.log("Dealer Trip Details data loaded:", data);
    } catch (error) {
      console.error("Error fetching Dealer Trip Details:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = [...new Set(reports.map(item => item.LOCATION).filter(Boolean))];
    return locations.sort();
  }, [reports]);

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = reports;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "with-rake") {
          return item.Rake_NO && item.Rake_NO.trim() !== "";
        } else if (statusFilter === "without-rake") {
          return !item.Rake_NO || item.Rake_NO.trim() === "";
        }
        return true;
      });
    }

    // Apply location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((item) => item.LOCATION === locationFilter);
    }

    return filtered;
  }, [reports, searchTerm, statusFilter, locationFilter]);

  // Filter data by selected month
  const monthlyFilteredData = useMemo(() => {
    if (!selectedMonth) return filteredData;

    return filteredData.filter((item) => {
      if (!item.created_at) return true;
      const itemDate = new Date(item.created_at);
      const itemMonth = itemDate.toISOString().slice(0, 7);
      return itemMonth === selectedMonth;
    });
  }, [filteredData, selectedMonth]);

  // Pagination
  const totalPages = Math.ceil(monthlyFilteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = monthlyFilteredData.slice(startIndex, endIndex);

  // Initialize data fetching
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExport = () => {
    alert("Export functionality would be implemented here");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Monthly Report
              </h1>
              <p className="text-sm text-gray-500">
                Vehicle transportation monthly summary
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by VIN, Dealer, Invoice..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="with-rake">With Rake No</option>
              <option value="without-rake">Without Rake No</option>
            </select>
          </div>
          
          <div>
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredData.length} records found</span>
          </div>
        </div>
      </div>

      {/* OEM Pickup Status Tracking */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚛 Vehicle Transit Status Overview
          </h3>
          <p className="text-sm text-gray-600">
            Monthly vehicle pickup and delivery status tracking
          </p>
        </div>
        <OEMPickupStatusSummary />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rake No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Load No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination City
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIN Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Way Bill
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item, index) => (
                <tr
                  key={item.ID}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.ID}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {item.Rake_NO || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {item.Load_No || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {item.Trip_No || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {item.INVOICE_NO || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.Invoice_Date ? new Date(item.Invoice_Date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.Destination_City || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 text-xs">
                    {item.VIN_Number || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.Dealer_Name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.LOCATION || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {item.EWAY_BILL || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, monthlyFilteredData.length)} of{" "}
              {monthlyFilteredData.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyFilteredData.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyFilteredData.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(monthlyFilteredData.map((item) => item.LOCATION).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">With Rake No</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyFilteredData.filter(item => item.Rake_NO && item.Rake_NO.trim() !== "").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
