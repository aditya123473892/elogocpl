import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Truck,
  Clock,
  AlertCircle,
  Package,
  Calendar,
  MapPin,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { intraInTransitAPI } from "../utils/Api";
import { toast } from "react-toastify";

/**
 * Intra-In-Transit Report page.
 *
 * Shows every VIN uploaded to the system together with all transit-
 * event timestamps recorded in the subsidiary data tables:
 *  Yard In, Yard Out, Arrival At Plant, Last Mile Departure, OEM
 * Pickup Arrival/Departure times.
 *
 * Transpose/group the row into logical sections in the detail modal.
 */
const IntraInTransitReport = () => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVin, setSelectedVin] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const normalizeReportRow = (row) => ({
    ...row,
    VINNumber: row.VINNumber || row.VIN || "",
    OEMStatus: row.OEMStatus || row.Status || "",
    InvoiceNo: row.InvoiceNo || row.Invoice || "",
    InvoiceDate: row.InvoiceDate || row.InvDate || "",
    GRNumber: row.GRNumber || row.GRNo || "",
  });

  // ── fetch all transit rows ───────────────────────────────────
  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await intraInTransitAPI.getIntraTransitReport();
      const rows = (res.data || res || []).map(normalizeReportRow);
      setReportData(rows);
      setFilteredData(rows);
    } catch (error) {
      console.error("Error loading intra-transit report:", error);
      toast.error(error.message || "Failed to load intra-transit report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // ── search filter ────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(reportData);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredData(
      reportData.filter((r) => {
        return (
          (r.VINNumber || "").toLowerCase().includes(q) ||
          (r.TruckNumber || "").toLowerCase().includes(q) ||
          (r.Plant || "").toLowerCase().includes(q) ||
          (r.VendorTransporter || "").toLowerCase().includes(q) ||
          (r.DealerName || "").toLowerCase().includes(q) ||
          (r.InvoiceNo || "").toLowerCase().includes(q) ||
          (r.LoadNo || "").toLowerCase().includes(q)
        );
      })
    );
  }, [searchTerm, reportData]);

  // ── export ───────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = [
      "VIN", "Status", "Plant", "Yard Location", "Transporter",
      "Truck No", "Pickup Date", "Arrival Date", "Arrival Time",
      "Pickup Departure Time", "Delivery Date",
      "Yard In Station", "Yard In Date",
      "Yard Out Station", "Yard Out Date",
      "Arrival At Plant Date", "Arrival At Plant Time",
      "Last Mile Yard Location", "Last Mile Departure Date",
      "Last Mile Arrival Time", "Last Mile Departure Time",
      "Last Mile Driver", "Load No", "Trip No", "Invoice No",
      "Invoice Date", "Destination", "Dealer", "GR No", "Engine No"
    ];

    const rows = filteredData.map((r) => [
      r.VINNumber || "",
      r.OEMStatus || "",
      r.Plant || "",
      r.YardLocation || "",
      r.VendorTransporter || "",
      r.TruckNumber || "",
      r.PickupDate || "",
      r.ArrivalDate || "",
      r.ArrivalTime || "",
      r.PickupDepartureTime || "",
      r.DeliveryDate || "",
      r.YardInStation || "",
      r.YardInDate || "",
      r.YardOutStation || "",
      r.YardOutDate || "",
      r.ArrivalDate || "",
      r.ArrivalTime || "",
      r.LastMileYardLocation || "",
      r.LastMileDepartureDate || "",
      r.LastMileArrivalTime || "",
      r.LastMileDepartureTime || "",
      r.LastMileDriverName || "",
      r.LoadNo || "",
      r.TripNo || "",
      r.InvoiceNo || "",
      r.InvoiceDate || "",
      r.DestinationCity || "",
      r.DealerName || "",
      r.GRNumber || "",
      r.EngineNo || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IntraTransitReport_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ── helpers ──────────────────────────────────────────────────
  const fmt = (val) => {
    if (!val) return "-";
    // Date strings from SQL: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(String(val))) {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-IN");
    }
    // Time strings – if longer, it is a date-time; short = time
    if (val.length <= 8 && val.includes(":")) return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-IN");
  };

  const fmtLong = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleString("en-IN");
  };

  const fmtBoth = (date, time) => {
    if (!date) return "-";
    return time
      ? `${fmt(date)} ${String(time).substring(0, 5)}`
      : fmt(date);
  };

  // ── detail modal ─────────────────────────────────────────────
  const openDetail = (row) => {
    setSelectedVin(row);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading intra-transit report…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[100vw] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Intra-In-Transit Report
        </h1>
        <p className="text-gray-600">
          Complete transit timeline for every VIN uploaded to the system —
          arrival, yard-in, yard-out, last-mile departure, plant arrival,
          and OEM pickup times.
        </p>
      </div>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by VIN, Truck, Plant, Transporter, Dealer…"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing…" : "Refresh"}
          </button>

          {/* Export */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Showing {filteredData.length} of {reportData.length} VINs
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

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                VIN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Truck / Plant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                OEM Pickup
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Yard In
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Yard Out
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Arrival At Plant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Mile Departure
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No VINs found</p>
                  <p className="text-sm">
                    {searchTerm
                      ? "Try clearing your search filters"
                      : "No VINs have been uploaded yet"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr
                  key={row.VINNumber + idx}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.VINNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        row.OEMStatus === "REACHED PLANT"
                          ? "bg-green-100 text-green-800"
                          : row.OEMStatus === "IN-TRANSIT"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {row.OEMStatus || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div>{row.TruckNumber || "-"}</div>
                    <div className="text-xs text-gray-400">
                      {row.Plant || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {fmtBoth(row.ArrivalDate, row.ArrivalTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {fmtLong(row.YardInDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {fmtLong(row.YardOutDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {fmtBoth(row.ArrivalDate, row.ArrivalTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {fmtBoth(
                      row.LastMileDepartureDate,
                      row.LastMileDepartureTime
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => openDetail(row)}
                      title="View full timeline"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────── */}
      {showDetailModal && selectedVin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  VIN Transit Timeline
                </h3>
                <p className="text-indigo-200 text-sm">
                  VIN: {selectedVin.VINNumber}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ① OEM Pickup */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-indigo-600" />
                    OEM Pickup
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Status",             selectedVin.OEMStatus],
                      ["Plant",              selectedVin.Plant],
                      ["Yard Location",      selectedVin.YardLocation],
                      ["Transporter",        selectedVin.VendorTransporter],
                      ["Truck No",           selectedVin.TruckNumber],
                      ["Pickup Date",        fmt(selectedVin.PickupDate)],
                      ["Arrival Date",       fmt(selectedVin.ArrivalDate)],
                      ["Arrival Time",       selectedVin.ArrivalTime || "-"],
                      ["Departure Time",     selectedVin.PickupDepartureTime || "-"],
                      ["Delivery Date",      fmt(selectedVin.DeliveryDate)],
                      ["Transport Mode",     selectedVin.TransportationType],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="text-gray-500">{lbl}:</span>
                        <span className="font-medium">{val || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ② Arrival At Plant */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    Arrival At Plant
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Arrival ID",        selectedVin.ArrivalAtPlantID || "-"],
                      ["Transport Mode",    selectedVin.ArrivalTransportMode || "-"],
                      ["Yard Location",     selectedVin.ArrivalYardLocation || "-"],
                      ["Arrival Date",      fmt(selectedVin.ArrivalDate)],
                      ["Arrival Time",      selectedVin.ArrivalTime || "-"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="text-gray-500">{lbl}:</span>
                        <span className="font-medium">{val || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ③ Yard In */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                    Yard In
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Station",       selectedVin.YardInStation || "-"],
                      ["Operation",     selectedVin.YardInOperationType || "-"],
                      ["FNR No",        selectedVin.YardInFNRNo || "-"],
                      ["Rake No",       selectedVin.YardInRakeNo || "-"],
                      ["Deck Position", selectedVin.YardInDeckPosition || "-"],
                      ["Wagon No",      selectedVin.YardInWagonNo || "-"],
                      ["Yard In Date",  fmtLong(selectedVin.YardInDate)],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="text-gray-500">{lbl}:</span>
                        <span className="font-medium">{val || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ④ Yard Out */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                    Yard Out
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Station",      selectedVin.YardOutStation || "-"],
                      ["Operation",    selectedVin.YardOutOperationType || "-"],
                      ["FNR No",       selectedVin.YardOutFNRNo || "-"],
                      ["Rake No",      selectedVin.YardOutRakeNo || "-"],
                      ["Deck Pos",     selectedVin.YardOutDeckPosition || "-"],
                      ["Wagon No",     selectedVin.YardOutWagonNo || "-"],
                      ["Yard Out Date",fmtLong(selectedVin.YardOutDate)],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="text-gray-500">{lbl}:</span>
                        <span className="font-medium">{val || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ⑤ Last Mile Departure */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    Last Mile Departure
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Yard Location",       selectedVin.LastMileYardLocation || "-"],
                      ["Transporter",         selectedVin.LastMileTransporter || "-"],
                      ["Truck No",            selectedVin.LastMileTruckNumber || "-"],
                      ["Driver",              selectedVin.LastMileDriverName || "-"],
                      ["Departure Date",      fmt(selectedVin.LastMileDepartureDate)],
                      ["Arrival Time",        selectedVin.LastMileArrivalTime || "-"],
                      ["Departure Time",      selectedVin.LastMileDepartureTime || "-"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="text-gray-500">{lbl}:</span>
                        <span className="font-medium">{val || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ⑥ ASN / Dealer Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    ASN / Dealer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Load No",         selectedVin.LoadNo || "-"],
                      ["Trip No",         selectedVin.TripNo || "-"],
                      ["Invoice No",      selectedVin.InvoiceNo || "-"],
                      ["Invoice Date",    fmt(selectedVin.InvoiceDate)],
                      ["GR No",           selectedVin.GRNumber || "-"],
                      ["Engine No",       selectedVin.EngineNo || "-"],
                      ["Model",           selectedVin.ProductionModel || "-"],
                      ["Dealer",          selectedVin.DealerName || "-"],
                      ["Destination",     selectedVin.DestinationCity || "-"],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="text-gray-500">{lbl}:</span>
                        <span className="font-medium">{val || "-"}</span>
                      </div>
                    ))}
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

export default IntraInTransitReport;
