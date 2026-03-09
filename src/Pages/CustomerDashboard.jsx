import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, Edit, Calendar, FileText, Truck, Package, CheckCircle, XCircle, Clock, X, TrendingUp, AlertTriangle, MapPin, Users, Activity, BarChart3, PieChart } from "lucide-react";
import { dealerTripDetailsAPI } from "../utils/Api";
import { toast } from "react-toastify";

const DealerReport = () => {
  const [dealerRecords, setDealerRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Load Dealer Trip Details records
  useEffect(() => {
    loadDealerRecords();
  }, []);

  // Calculate statistics
  const statistics = {
    totalRecords: dealerRecords.length,
    todayRecords: dealerRecords.filter(record => {
      if (!record.CreatedAt) return false;
      const recordDate = new Date(record.CreatedAt);
      return !isNaN(recordDate.getTime()) && recordDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    }).length,
    uniqueDealers: new Set(dealerRecords.map(record => record.Dealer_Name).filter(Boolean)).size,
    uniqueCities: new Set(dealerRecords.map(record => record.Destination_City).filter(Boolean)).size,
    pendingEwayBills: dealerRecords.filter(record => {
      if (!record.EWAY_BILL || !record.VALID_TILL) return false;
      const validTill = new Date(record.VALID_TILL);
      return !isNaN(validTill.getTime()) && validTill > new Date();
    }).length,
    expiredEwayBills: dealerRecords.filter(record => {
      if (!record.EWAY_BILL || !record.VALID_TILL) return false;
      const validTill = new Date(record.VALID_TILL);
      return !isNaN(validTill.getTime()) && validTill < new Date();
    }).length,
    topDealer: dealerRecords.length > 0 ? 
      Object.entries(
        dealerRecords.reduce((acc, record) => {
          if (record.Dealer_Name) {
            acc[record.Dealer_Name] = (acc[record.Dealer_Name] || 0) + 1;
          }
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0] : null,
    topCity: dealerRecords.length > 0 ?
      Object.entries(
        dealerRecords.reduce((acc, record) => {
          if (record.Destination_City) {
            acc[record.Destination_City] = (acc[record.Destination_City] || 0) + 1;
          }
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0] : null
  };

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = dealerRecords;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.VIN_Number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Sales_Model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Dealer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Destination_City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.INVOICE_NO?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.CreatedAt).toISOString().split('T')[0];
        return recordDate === dateFilter;
      });
    }

    setFilteredRecords(filtered);
  }, [dealerRecords, searchTerm, statusFilter, dateFilter]);

  const loadDealerRecords = async () => {
    try {
      setLoading(true);
      const data = await dealerTripDetailsAPI.getAllDealerTripDetails();
      setDealerRecords(data.data || data || []);
      setFilteredRecords(data.data || data || []);
    } catch (error) {
      console.error("Error loading Dealer Trip Details records:", error);
      toast.error("Failed to load Dealer Trip Details records");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Dealer Trip Details record?")) {
      return;
    }

    try {
      await dealerTripDetailsAPI.deleteDealerTripDetails(id);
      toast.success("Dealer Trip Details record deleted successfully");
      loadDealerRecords();
    } catch (error) {
      console.error("Error deleting Dealer Trip Details record:", error);
      toast.error("Failed to delete Dealer Trip Details record");
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setEditFormData(record);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await dealerTripDetailsAPI.updateDealerTripDetails(selectedRecord.ID, editFormData);
      toast.success("Dealer Trip Details record updated successfully");
      setShowEditModal(false);
      setSelectedRecord(null);
      setEditFormData({});
      loadDealerRecords();
    } catch (error) {
      console.error("Error updating Dealer Trip Details record:", error);
      toast.error("Failed to update Dealer Trip Details record");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "Rake_NO", "Load_No", "Trip_No", "INVOICE_NO", 
      "Invoice_Date", "Destination_City", "Production_Model", 
      "GR_Number", "Engine_No", "VIN_Number", "Sales_Model", 
      "Dealer_Name", "LOCATION", "EWAY_BILL", "VALID_TILL", "Created At"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(record => [
        record.ID || "",
        record.Rake_NO || "",
        record.Load_No || "",
        record.Trip_No || "",
        record.INVOICE_NO || "",
        record.Invoice_Date || "",
        record.Destination_City || "",
        record.Production_Model || "",
        record.GR_Number || "",
        record.Engine_No || "",
        record.VIN_Number || "",
        record.Sales_Model || "",
        record.Dealer_Name || "",
        record.LOCATION || "",
        record.EWAY_BILL || "",
        record.VALID_TILL || "",
        record.CreatedAt ? new Date(record.CreatedAt).toLocaleString() : ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dealer_trip_details_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dealer Trip Details records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dealer Trip Details Reports
        </h1>
        <p className="text-gray-600">
          View and manage all Dealer Trip Details records uploaded to the system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Records Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalRecords}</p>
              <p className="text-xs text-gray-500 mt-1">All time shipments</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's Records Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Records</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.todayRecords}</p>
              <p className="text-xs text-gray-500 mt-1">Added today</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Unique Dealers Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Dealers</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.uniqueDealers}</p>
              <p className="text-xs text-gray-500 mt-1">Active dealers</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Destination Cities Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Destination Cities</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.uniqueCities}</p>
              <p className="text-xs text-gray-500 mt-1">Service locations</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Performance Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Top Dealer</p>
              <p className="font-semibold text-gray-900">
                {statistics.topDealer ? `${statistics.topDealer[0]} (${statistics.topDealer[1]} shipments)` : 'No data'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Destination</p>
              <p className="font-semibold text-gray-900">
                {statistics.topCity ? `${statistics.topCity[0]} (${statistics.topCity[1]} shipments)` : 'No data'}
              </p>
            </div>
          </div>
        </div>

        {/* E-Way Bill Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">E-Way Bill Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {statistics.pendingEwayBills}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expired</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                statistics.expiredEwayBills > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {statistics.expiredEwayBills}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
          </div>
          <div className="space-y-2">
            {statistics.expiredEwayBills > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ {statistics.expiredEwayBills} expired E-Way Bill(s) found
                </p>
              </div>
            )}
            {statistics.todayRecords > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ {statistics.todayRecords} new shipment(s) today
                </p>
              </div>
            )}
            {statistics.expiredEwayBills === 0 && statistics.todayRecords === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  ℹ️ No new alerts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Showing {filteredRecords.length} of {dealerRecords.length} records
            </span>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Destination Cities Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Destination Cities</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(
              dealerRecords.reduce((acc, record) => {
                if (record.Destination_City) {
                  acc[record.Destination_City] = (acc[record.Destination_City] || 0) + 1;
                }
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([city, count], index) => {
                const maxCount = Math.max(
                  ...Object.values(
                    dealerRecords.reduce((acc, record) => {
                      if (record.Destination_City) {
                        acc[record.Destination_City] = (acc[record.Destination_City] || 0) + 1;
                      }
                      return acc;
                    }, {})
                  )
                );
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={city} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 w-20 truncate">{city}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {dealerRecords.filter(record => record.Destination_City).length === 0 && (
              <p className="text-gray-500 text-center py-4">No destination data available</p>
            )}
          </div>
        </div>

        {/* Dealer Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Dealers by Shipments</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(
              dealerRecords.reduce((acc, record) => {
                if (record.Dealer_Name) {
                  acc[record.Dealer_Name] = (acc[record.Dealer_Name] || 0) + 1;
                }
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([dealer, count], index) => {
                const maxCount = Math.max(
                  ...Object.values(
                    dealerRecords.reduce((acc, record) => {
                      if (record.Dealer_Name) {
                        acc[record.Dealer_Name] = (acc[record.Dealer_Name] || 0) + 1;
                      }
                      return acc;
                    }, {})
                  )
                );
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={dealer} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 w-32 truncate">{dealer}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {dealerRecords.filter(record => record.Dealer_Name).length === 0 && (
              <p className="text-gray-500 text-center py-4">No dealer data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("");
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
         
            <button
              onClick={() => {
                const expiredRecords = dealerRecords.filter(record => 
                  record.EWAY_BILL && record.VALID_TILL && (() => {
                    const validTill = new Date(record.VALID_TILL);
                    return !isNaN(validTill.getTime()) && validTill < new Date();
                  })()
                );
                setFilteredRecords(expiredRecords);
              }}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Show Expired E-Way Bills
            </button>
            <button
              onClick={loadDealerRecords}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search - Moved above table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ASN number, vehicle, supplier..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">PENDING (LEFT FOR OEM PICKUP)</option>
              <option value="processing">STARTER (OEM PICKUP DONE)</option>
             
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Showing {filteredRecords.length} of {dealerRecords.length} records
            </span>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rake No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Load No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIN Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Way Bill Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Dealer Trip Details records found</p>
                    <p className="text-sm">
                      {searchTerm || statusFilter !== "all" || dateFilter
                        ? "Try adjusting your filters"
                        : "No Dealer Trip Details records have been uploaded yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.ID}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Rake_NO || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Load_No || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Trip_No || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.INVOICE_NO || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Invoice_Date ? new Date(record.Invoice_Date).toLocaleDateString() : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Destination_City || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.VIN_Number || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Dealer_Name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.EWAY_BILL ? (
                        record.VALID_TILL ? (
                          (() => {
                            const validTill = new Date(record.VALID_TILL);
                            if (isNaN(validTill.getTime())) {
                              return (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Invalid Date
                                </span>
                              );
                            }
                            return validTill > new Date() ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Expired
                              </span>
                            );
                          })()
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            No Validity
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FileText className="w-3 h-3 mr-1" />
                              No E-Way Bill
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.CreatedAt ? new Date(record.CreatedAt).toLocaleDateString() : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Dealer Trip Details - ID: {selectedRecord.ID}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRecord(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">ID</label>
                        <p className="text-sm text-gray-900">{selectedRecord.ID}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Rake No</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Rake_NO || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Load No</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Load_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Trip No</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Trip_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Invoice No</label>
                        <p className="text-sm text-gray-900">{selectedRecord.INVOICE_NO || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Created At</label>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.CreatedAt ? new Date(selectedRecord.CreatedAt).toLocaleString() : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Vehicle & Location Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">VIN Number</label>
                        <p className="text-sm text-gray-900">{selectedRecord.VIN_Number || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Production Model</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Production_Model || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Sales Model</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Sales_Model || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Dealer Name</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Dealer_Name || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Destination City</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Destination_City || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Location</label>
                        <p className="text-sm text-gray-900">{selectedRecord.LOCATION || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Invoice Date</label>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.Invoice_Date ? new Date(selectedRecord.Invoice_Date).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">GR Number</label>
                        <p className="text-sm text-gray-900">{selectedRecord.GR_Number || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Engine No</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Engine_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">E-Way Bill</label>
                        <p className="text-sm text-gray-900">{selectedRecord.EWAY_BILL || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Valid Till</label>
                        <p className="text-sm text-gray-900">{selectedRecord.VALID_TILL || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Dealer Trip Details - ID: {selectedRecord.ID}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRecord(null);
                    setEditFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rake No
                      </label>
                      <input
                        type="text"
                        value={editFormData.Rake_NO || ""}
                        onChange={(e) => setEditFormData({...editFormData, Rake_NO: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Load No
                      </label>
                      <input
                        type="text"
                        value={editFormData.Load_No || ""}
                        onChange={(e) => setEditFormData({...editFormData, Load_No: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trip No
                      </label>
                      <input
                        type="text"
                        value={editFormData.Trip_No || ""}
                        onChange={(e) => setEditFormData({...editFormData, Trip_No: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice No
                      </label>
                      <input
                        type="text"
                        value={editFormData.INVOICE_NO || ""}
                        onChange={(e) => setEditFormData({...editFormData, INVOICE_NO: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date
                      </label>
                      <input
                        type="date"
                        value={editFormData.Invoice_Date ? new Date(editFormData.Invoice_Date).toISOString().split('T')[0] : ""}
                        onChange={(e) => setEditFormData({...editFormData, Invoice_Date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination City
                      </label>
                      <input
                        type="text"
                        value={editFormData.Destination_City || ""}
                        onChange={(e) => setEditFormData({...editFormData, Destination_City: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Production Model
                      </label>
                      <input
                        type="text"
                        value={editFormData.Production_Model || ""}
                        onChange={(e) => setEditFormData({...editFormData, Production_Model: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VIN Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.VIN_Number || ""}
                        onChange={(e) => setEditFormData({...editFormData, VIN_Number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sales Model
                      </label>
                      <input
                        type="text"
                        value={editFormData.Sales_Model || ""}
                        onChange={(e) => setEditFormData({...editFormData, Sales_Model: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dealer Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.Dealer_Name || ""}
                        onChange={(e) => setEditFormData({...editFormData, Dealer_Name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editFormData.LOCATION || ""}
                        onChange={(e) => setEditFormData({...editFormData, LOCATION: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GR Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.GR_Number || ""}
                        onChange={(e) => setEditFormData({...editFormData, GR_Number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Engine No
                      </label>
                      <input
                        type="text"
                        value={editFormData.Engine_No || ""}
                        onChange={(e) => setEditFormData({...editFormData, Engine_No: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-Way Bill
                      </label>
                      <input
                        type="text"
                        value={editFormData.EWAY_BILL || ""}
                        onChange={(e) => setEditFormData({...editFormData, EWAY_BILL: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid Till
                      </label>
                      <input
                        type="text"
                        value={editFormData.VALID_TILL || ""}
                        onChange={(e) => setEditFormData({...editFormData, VALID_TILL: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedRecord(null);
                        setEditFormData({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Update Dealer Trip Details
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerReport;
