import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Package, ArrowRight, Calendar, FileText, Truck, X } from "lucide-react";
import { loadingStageAPI } from "../utils/Api";
import { toast } from "react-toastify";

const YardOutReport = () => {
  const [yardOutRecords, setYardOutRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load Yard Out records
  useEffect(() => {
    loadYardOutRecords();
  }, []);

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = yardOutRecords;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.VIN_Number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.FNR_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Rake_ID_Against_FNR_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Rake_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Deck_Position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Wagon_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Dealer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Destination_City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.INVOICE_NO?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(record => {
        if (!record.Yard_Out_Date) return false;
        const recordDate = new Date(record.Yard_Out_Date);
        if (isNaN(recordDate.getTime())) return false;
        return recordDate.toISOString().split('T')[0] === dateFilter;
      });
    }

    setFilteredRecords(filtered);
  }, [yardOutRecords, searchTerm, dateFilter]);

  const loadYardOutRecords = async () => {
    try {
      setLoading(true);
      const data = await loadingStageAPI.getYardOutReport();
      setYardOutRecords(data.data || data || []);
      setFilteredRecords(data.data || data || []);
    } catch (error) {
      console.error("Error loading Yard Out records:", error);
      toast.error("Failed to load Yard Out records");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "VIN Number", "FNR No", "Rake ID against FNR No", "Rake No", "Deck Position", "Wagon No",
      "Loading Station", "Terminal Code", "Yard Out Date", "Load No", "Trip No",
      "Invoice No", "Invoice Date", "Destination City", "Production Model",
      "GR Number", "Engine No", "Sales Model", "Dealer Name", "Location",
      "E-Way Bill", "Valid Till", "For Code", "BVEH Code"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(record => [
        record.VIN_Number || "",
        record.FNR_No || "",
        record.Rake_ID_Against_FNR_No || "",
        record.Rake_No || "",
        record.Deck_Position || "",
        record.Wagon_No || "",
        record.Loading_Station || "",
        record.Terminal_Code || "",
        record.Yard_Out_Date ? (() => {
          const date = new Date(record.Yard_Out_Date);
          return !isNaN(date.getTime()) ? date.toLocaleString() : "";
        })() : "",
        record.Load_No || "",
        record.Trip_No || "",
        record.INVOICE_NO || "",
        record.Invoice_Date ? (() => {
          const date = new Date(record.Invoice_Date);
          return !isNaN(date.getTime()) ? date.toLocaleDateString() : "";
        })() : "",
        record.Destination_City || "",
        record.Production_Model || "",
        record.GR_Number || "",
        record.Engine_No || "",
        record.Sales_Model || "",
        record.Dealer_Name || "",
        record.LOCATION || "",
        record.EWAY_BILL || "",
        record.VALID_TILL ? (() => {
          const date = new Date(record.VALID_TILL);
          return !isNaN(date.getTime()) ? date.toLocaleDateString() : "";
        })() : "",
        record.For_Code || "",
        record.BVEH_Code || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `YARD_OUT_REPORT_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Yard Out records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Yard Out Report
        </h1>
        <p className="text-gray-600">
          View all yard out VINs with ASN upload details and rake information
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Search by VIN, FNR, Rake, Dealer, City..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yard Out Date
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
              Showing {filteredRecords.length} of {yardOutRecords.length} yard out records
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIN Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FNR No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rake No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rake ID against FNR No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deck Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wagon No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loading Station
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yard Out Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination City
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No Yard Out records found</p>
                    <p className="text-sm">
                      {searchTerm || dateFilter
                        ? "Try adjusting your filters"
                        : "No yard out records have been created yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={`${record.VIN_Number}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.VIN_Number || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.FNR_No || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Rake_No || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Rake_ID_Against_FNR_No || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Deck_Position || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Wagon_No || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Loading_Station || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Yard_Out_Date ? (() => {
                          const date = new Date(record.Yard_Out_Date);
                          return !isNaN(date.getTime()) ? date.toLocaleDateString() : "-";
                        })() : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Dealer_Name || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {record.Destination_City || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
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
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Yard Out Details - VIN: {selectedRecord.VIN_Number}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Rake Details Section */}
                  <div className="md:col-span-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <ArrowRight className="w-4 h-4 mr-2 text-blue-600" />
                      Rake Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500">FNR No</label>
                        <p className="text-sm text-gray-900 font-semibold">{selectedRecord.FNR_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Rake No</label>
                        <p className="text-sm text-gray-900 font-semibold">{selectedRecord.Rake_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Rake ID against FNR No</label>
                        <p className="text-sm text-gray-900 font-semibold">{selectedRecord.Rake_ID_Against_FNR_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Deck Position</label>
                        <p className="text-sm text-gray-900 font-semibold">{selectedRecord.Deck_Position || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Wagon No</label>
                        <p className="text-sm text-gray-900 font-semibold">{selectedRecord.Wagon_No || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Yard Out Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Yard Out Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">VIN Number</label>
                        <p className="text-sm text-gray-900 font-semibold">{selectedRecord.VIN_Number || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Loading Station</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Loading_Station || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Terminal Code</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Terminal_Code || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Yard Out Date</label>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.Yard_Out_Date ? (() => {
                            const date = new Date(selectedRecord.Yard_Out_Date);
                            return !isNaN(date.getTime()) ? date.toLocaleString() : "-";
                          })() : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* ASN Upload Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">ASN Upload Details</h4>
                    <div className="space-y-3">
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
                        <label className="text-xs font-medium text-gray-500">Invoice Date</label>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.Invoice_Date ? (() => {
                            const date = new Date(selectedRecord.Invoice_Date);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString() : "-";
                          })() : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Dealer Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Vehicle & Dealer Details</h4>
                    <div className="space-y-3">
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
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Additional Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">GR Number</label>
                        <p className="text-sm text-gray-900">{selectedRecord.GR_Number || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Engine No</label>
                        <p className="text-sm text-gray-900">{selectedRecord.Engine_No || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Location</label>
                        <p className="text-sm text-gray-900">{selectedRecord.LOCATION || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">E-Way Bill</label>
                        <p className="text-sm text-gray-900">{selectedRecord.EWAY_BILL || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Validity & Codes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Validity & Codes</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Valid Till</label>
                        <p className="text-sm text-gray-900">
                          {selectedRecord.VALID_TILL ? (() => {
                            const date = new Date(selectedRecord.VALID_TILL);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString() : "-";
                          })() : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">For Code</label>
                        <p className="text-sm text-gray-900">{selectedRecord.For_Code || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">BVEH Code</label>
                        <p className="text-sm text-gray-900">{selectedRecord.BVEH_Code || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YardOutReport;
