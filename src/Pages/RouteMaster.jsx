import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Route, X, Check } from "lucide-react";
import { routeMasterAPI, terminalMasterAPI } from "../utils/Api";

const DEFAULT_FORM = {
  From_Terminal: "",
  To_Terminal: "",
  Route_Type: "GENERAL",
  Billable_Distance: "",
  Actual_Distance: "",
  Route_Name: "",
  Train_No_Prefix: "",
  Begining_Number: "0",
  AverageTime: "",
};

const RouteMaster = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [subRoutes, setSubRoutes] = useState([""]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchTerminals = async () => {
    try {
      const data = await terminalMasterAPI.getTerminalCodes();
      if (data.success) {
        // Show all terminals from API without hardcoded filtering
        setTerminals(data.data);
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  // API functions
  const fetchRoutes = async () => {
    try {
      const result = await routeMasterAPI.getAllRoutes();
      if (result.success) {
        setRoutes(result.data);
        setFilteredRoutes(result.data);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to fetch routes" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    }
  };

  const createRoute = async (routeData) => {
    try {
      const result = await routeMasterAPI.createRoute(routeData);
      if (result.success) {
        await fetchRoutes();
        setMessage({ type: "success", text: "Route created successfully" });
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create route" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    }
  };

  const updateRoute = async (id, routeData) => {
    try {
      const result = await routeMasterAPI.updateRoute(id, routeData);
      if (result.success) {
        await fetchRoutes();
        setMessage({ type: "success", text: "Route updated successfully" });
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update route" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    }
  };

  const deleteRoute = async (id) => {
    try {
      const result = await routeMasterAPI.deleteRoute(id);
      if (result.success) {
        await fetchRoutes();
        setMessage({ type: "success", text: "Route deleted successfully" });
      } else {
        setMessage({ type: "error", text: result.message || "Failed to delete route" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchTerminals();
  }, []);

  useEffect(() => {
    const filtered = routes.filter(
      (route) =>
        route.Route_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.From_Terminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.To_Terminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.Route_Type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoutes(filtered);
  }, [searchTerm, routes]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Route_Name.trim()) newErrors.Route_Name = "Route name is required";
    if (!formData.Billable_Distance.trim()) newErrors.Billable_Distance = "Billable distance is required";
    if (!formData.Actual_Distance.trim()) newErrors.Actual_Distance = "Actual distance is required";
    if (!formData.Train_No_Prefix.trim()) newErrors.Train_No_Prefix = "Train no. prefix is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = { ...formData, sub_routes: subRoutes.filter(Boolean) };
    
    try {
      if (editingRoute) {
        await updateRoute(editingRoute.RouteId, payload);
      } else {
        await createRoute(payload);
      }
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({ ...route });
    const sr = route.sub_routes || [];
    setSubRoutes([sr[0] || ""]);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    deleteRoute(id);
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setSubRoutes([""]);
    setEditingRoute(null);
    setErrors({});
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    
    // Auto-populate Route_Name and Train_No_Prefix when both terminals are selected
    if (name === "From_Terminal" || name === "To_Terminal") {
      const newFormData = { ...formData, [name]: value };
      if (newFormData.From_Terminal && newFormData.To_Terminal) {
        const routeName = `${newFormData.From_Terminal}-${newFormData.To_Terminal}`;
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          Route_Name: routeName,
          Train_No_Prefix: routeName
        }));
      }
    }
  };

  const handleSubRouteChange = (index, value) => {
    setSubRoutes((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const routeTypeColors = {
    GENERAL: "bg-blue-100 text-blue-800",
    EXPRESS: "bg-green-100 text-green-800",
    SPECIAL: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Master Management</h1>
        <p className="text-gray-600">Manage terminal routes, distances, and sub-route mappings</p>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Route
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredRoutes.length === 0 ? (
            <div className="p-8 text-center">
              <Route className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No routes found matching your search" : "No routes found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From → To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billable Dist.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Dist.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time (hrs)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train No. Prefix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <tr key={route.RouteId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Route className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{route.Route_Name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {route.From_Terminal} → {route.To_Terminal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${routeTypeColors[route.Route_Type] || "bg-gray-100 text-gray-700"}`}>
                        {route.Route_Type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{route.Billable_Distance || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{route.Actual_Distance || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{route.AverageTime || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{route.Train_No_Prefix || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-lg bg-white mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRoute ? "Edit Route" : "Add New Route"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* From Terminal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Terminal</label>
                  <select
                    name="From_Terminal"
                    value={formData.From_Terminal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {terminals.map((terminal) => <option key={terminal.TerminalCode} value={terminal.TerminalCode}>{terminal.TerminalCode}</option>)}
                  </select>
                </div>

                {/* To Terminal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Terminal</label>
                  <select
                    name="To_Terminal"
                    value={formData.To_Terminal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {terminals.map((terminal) => <option key={terminal.TerminalCode} value={terminal.TerminalCode}>{terminal.TerminalCode}</option>)}
                  </select>
                </div>

                {/* Route Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Route_Name"
                    value={formData.Route_Name}
                    onChange={handleInputChange}
                    disabled={formData.From_Terminal && formData.To_Terminal}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.Route_Name ? "border-red-300" : 
                      formData.From_Terminal && formData.To_Terminal ? "border-gray-200 bg-gray-50" : "border-gray-300"
                    }`}
                    placeholder="e.g. CCH-ICOD"
                  />
                  {errors.Route_Name && <p className="mt-1 text-sm text-red-600">{errors.Route_Name}</p>}
                  {formData.From_Terminal && formData.To_Terminal && (
                    <p className="mt-1 text-sm text-gray-500">Auto-generated from terminal selection</p>
                  )}
                </div>

                {/* Route Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route Type/Carrying Capacity (RBS)</label>
                  <select
                    name="Route_Type"
                    value={formData.Route_Type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="EXPRESS">CC+8</option>
                    <option value="SPECIAL">CC+3</option>
                    <option value="SPECIAL">25 t Axle</option>
                  </select>
                </div>

                {/* Billable Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billable Distance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Billable_Distance"
                    value={formData.Billable_Distance}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Billable_Distance ? "border-red-300" : "border-gray-300"}`}
                    placeholder="e.g. 1409"
                  />
                  {errors.Billable_Distance && <p className="mt-1 text-sm text-red-600">{errors.Billable_Distance}</p>}
                </div>

                {/* Actual Distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Distance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Actual_Distance"
                    value={formData.Actual_Distance}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Actual_Distance ? "border-red-300" : "border-gray-300"}`}
                    placeholder="e.g. 1409"
                  />
                  {errors.Actual_Distance && <p className="mt-1 text-sm text-red-600">{errors.Actual_Distance}</p>}
                </div>

                {/* Train No. Prefix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Train No. Prefix <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Train_No_Prefix"
                    value={formData.Train_No_Prefix}
                    onChange={handleInputChange}
                    disabled={formData.From_Terminal && formData.To_Terminal}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.Train_No_Prefix ? "border-red-300" : 
                      formData.From_Terminal && formData.To_Terminal ? "border-gray-200 bg-gray-50" : "border-gray-300"
                    }`}
                    placeholder="e.g. CCH-ICOD"
                  />
                  {errors.Train_No_Prefix && <p className="mt-1 text-sm text-red-600">{errors.Train_No_Prefix}</p>}
                  {formData.From_Terminal && formData.To_Terminal && (
                    <p className="mt-1 text-sm text-gray-500">Auto-generated from terminal selection</p>
                  )}
                </div>

                {/* Beginning Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beginning Number</label>
                  <input
                    type="text"
                    name="Begining_Number"
                    value={formData.Begining_Number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Average Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Time (Hours)</label>
                  <input
                    type="text"
                    name="AverageTime"
                    value={formData.AverageTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 25"
                  />
                </div>

                {/* Connect to RBS */}
                <div className="flex items-end">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    Connect to RBS
                  </button>
                </div>
              </div>

              {/* Sub Route Mapping */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Route Mapping</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <select
                    value={subRoutes[0]}
                    onChange={(e) => handleSubRouteChange(0, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="">---- Select Sub Route ----</option>
                    {routes.map((r) => (
                      <option key={r.RouteId} value={r.Route_Name}>{r.Route_Name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Saving..." : editingRoute ? "Update Route" : "Create Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMaster;