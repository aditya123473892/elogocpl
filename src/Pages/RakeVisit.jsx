import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Train, X, Check, Filter, Calendar } from "lucide-react";
import { rakeVisitAPI, rakeMasterAPI, routeMasterAPI, terminalMasterAPI } from "../utils/Api";

const OPERATOR_OPTIONS = [
  "INDIAN RAILWAY", "PRIVATE OPERATOR", "CONCOR", "CONTAINER CORPORATION"
];

const HAULAGE_OPTIONS = [
  "Owner", "Railway", "Customer"
];

const PLAN_TYPE_OPTIONS = [
  "Back Loading", "Forward Loading", "Empty Return", "Special Movement"
];

const DEFAULT_FORM = {
  IB_TRAIN_NO: "",
  OB_TRAIN_NO: "",
  TERMINAL_ID: "",
  IB_LOAD_TERMINAL: "",
  OB_DISCHARGE_TERMINAL: "",
  ARRVAL_DATE: "",
  DEPARTURE_DATE: "",
  IB_ROUTE_ID: "",
  OB_ROUTE_ID: "",
  TERMINAL_OPERATOR_ID: "",
  RAILWAY_LINE_ID: "",
  DEST_VISIT_ID: "",
  RAKE_ID: "",
  NEXT_PORT: "",
  DISPATCH_MAIL_STATUS: "N",
  ARRIVAL_MAIL_STATUS: "N",
  REROUTE_STATUS: "N",
  CREATED_BY: "",
  DOUBLE_STACK: "N",
  POOLING: "N",
  HAULAGE_PAID_BY: "C",
  MAIN_OB_TRAIN_NO: "",
  SUB_ROUTE_ID: "",
  PLANE_TYPE: "N",
  BILLABLE_DISTANCE: "",
  A_PLACEMENT_DATE: "",
  UNLOAD_START_DATE: "",
  UNLOAD_COMPLETION_DATE: "",
  A_STABLING_START_DATE: "",
  A_STABLING_END_DATE: "",
  A_REMOVAL_DATE: "",
  D_PLACEMENT_DATE: "",
  LOAD_START_DATE: "",
  LOAD_COMPLETION_DATE: "",
  D_STABLING_START_DATE: "",
  D_STABLING_END_DATE: "",
  D_REMOVAL_DATE: "",
  EXAM_NO: "",
  REMARKS: "",
  DEPARTURE_SIDDING: "",
  ARRIVAL_STATION: "",
  TRIP_NO: "",
  RR_NO: "",
  RR_DATE: "",
  RR_AMOUNT: "",
  DEVICE_ID: "",
};

const RakeVisit = () => {
  const [rakeVisits, setRakeVisits] = useState([]);
  const [filteredRakeVisits, setFilteredRakeVisits] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRakeVisit, setEditingRakeVisit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filterTerminal, setFilterTerminal] = useState("");
  const [filterRakeId, setFilterRakeId] = useState("");

  // Rakes data for dropdown
  const [rakes, setRakes] = useState([]);
  
  // Routes data for dropdown
  const [routes, setRoutes] = useState([]);

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

  // Fetch rakes following RakeMaster pattern
  const fetchRakes = async () => {
    try {
      const response = await rakeMasterAPI.getAllRakes();
      setRakes(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch rakes",
      });
    }
  };

  // Fetch routes following same pattern
  const fetchRoutes = async () => {
    try {
      const response = await routeMasterAPI.getAllRoutes();
      setRoutes(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch routes",
      });
    }
  };

  // API functions
  const fetchRakeVisits = async () => {
    try {
      setLoading(true);
      const result = await rakeVisitAPI.getAllRakeVisits();
      if (result.success) {
        setRakeVisits(result.data);
        setFilteredRakeVisits(result.data);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to fetch rake visits" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  const createRakeVisit = async (rakeVisitData) => {
    try {
      const result = await rakeVisitAPI.createRakeVisit(rakeVisitData);
      if (result.success) {
        setMessage({ type: "success", text: "Rake visit created successfully" });
        fetchRakeVisits();
        return true;
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create rake visit" });
        return false;
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to create rake visit" });
      return false;
    }
  };

  const updateRakeVisit = async (id, rakeVisitData) => {
    try {
      const result = await rakeVisitAPI.updateRakeVisit(id, rakeVisitData);
      if (result.success) {
        setMessage({ type: "success", text: "Rake visit updated successfully" });
        fetchRakeVisits();
        return true;
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update rake visit" });
        return false;
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update rake visit" });
      return false;
    }
  };

  const deleteRakeVisit = async (id) => {
    try {
      const result = await rakeVisitAPI.deleteRakeVisit(id);
      if (result.success) {
        setMessage({ type: "success", text: "Rake visit deleted successfully" });
        fetchRakeVisits();
        return true;
      } else {
        setMessage({ type: "error", text: result.message || "Failed to delete rake visit" });
        return false;
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to delete rake visit" });
      return false;
    }
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Auto-populate fields based on RAKE_ID selection
    if (name === "RAKE_ID" && value) {
      const selectedRake = rakes.find(rake => rake.RakeId === parseInt(value));
      if (selectedRake) {
        setFormData(prev => ({
          ...prev,
          RAKE_ID: value,
          IB_LOAD_TERMINAL: selectedRake.Base_Depot || prev.IB_LOAD_TERMINAL,
          OB_DISCHARGE_TERMINAL: selectedRake.Base_Depot || prev.OB_DISCHARGE_TERMINAL,
          TERMINAL_ID: prev.TERMINAL_ID || selectedRake.Base_Depot
        }));
      }
    }

    // Auto-populate fields based on IB_ROUTE_ID selection
    if (name === "IB_ROUTE_ID" && value) {
      const selectedRoute = routes.find(route => (route.RouteId || route.id) === parseInt(value));
      if (selectedRoute) {
        setFormData(prev => ({
          ...prev,
          IB_ROUTE_ID: value,
          IB_LOAD_TERMINAL: selectedRoute.From_Terminal || prev.IB_LOAD_TERMINAL,
          TERMINAL_ID: prev.TERMINAL_ID || selectedRoute.From_Terminal
        }));
      }
    }

    // Auto-populate fields based on OB_ROUTE_ID selection
    if (name === "OB_ROUTE_ID" && value) {
      const selectedRoute = routes.find(route => (route.RouteId || route.id) === parseInt(value));
      if (selectedRoute) {
        setFormData(prev => ({
          ...prev,
          OB_ROUTE_ID: value,
          OB_DISCHARGE_TERMINAL: selectedRoute.To_Terminal || prev.OB_DISCHARGE_TERMINAL,
          TERMINAL_ID: prev.TERMINAL_ID || selectedRoute.To_Terminal
        }));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.IB_TRAIN_NO) newErrors.IB_TRAIN_NO = "IB Train No is required";
    if (!formData.TERMINAL_ID) newErrors.TERMINAL_ID = "Terminal ID is required";
    if (!formData.RAKE_ID) newErrors.RAKE_ID = "Rake ID is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    let success;
    
    if (editingRakeVisit) {
      success = await updateRakeVisit(editingRakeVisit.VISIT_ID, formData);
    } else {
      success = await createRakeVisit(formData);
    }
    
    if (success) {
      setShowModal(false);
      setFormData(DEFAULT_FORM);
      setEditingRakeVisit(null);
      setErrors({});
    }
    setLoading(false);
  };

  const handleEdit = (rakeVisit) => {
    setEditingRakeVisit(rakeVisit);
    setFormData({
      ...rakeVisit,
      ARRVAL_DATE: rakeVisit.ARRVAL_DATE ? new Date(rakeVisit.ARRVAL_DATE).toISOString().split('T')[0] : '',
      DEPARTURE_DATE: rakeVisit.DEPARTURE_DATE ? new Date(rakeVisit.DEPARTURE_DATE).toISOString().split('T')[0] : '',
      A_PLACEMENT_DATE: rakeVisit.A_PLACEMENT_DATE ? new Date(rakeVisit.A_PLACEMENT_DATE).toISOString().split('T')[0] : '',
      UNLOAD_START_DATE: rakeVisit.UNLOAD_START_DATE ? new Date(rakeVisit.UNLOAD_START_DATE).toISOString().split('T')[0] : '',
      UNLOAD_COMPLETION_DATE: rakeVisit.UNLOAD_COMPLETION_DATE ? new Date(rakeVisit.UNLOAD_COMPLETION_DATE).toISOString().split('T')[0] : '',
      A_STABLING_START_DATE: rakeVisit.A_STABLING_START_DATE ? new Date(rakeVisit.A_STABLING_START_DATE).toISOString().split('T')[0] : '',
      A_STABLING_END_DATE: rakeVisit.A_STABLING_END_DATE ? new Date(rakeVisit.A_STABLING_END_DATE).toISOString().split('T')[0] : '',
      A_REMOVAL_DATE: rakeVisit.A_REMOVAL_DATE ? new Date(rakeVisit.A_REMOVAL_DATE).toISOString().split('T')[0] : '',
      D_PLACEMENT_DATE: rakeVisit.D_PLACEMENT_DATE ? new Date(rakeVisit.D_PLACEMENT_DATE).toISOString().split('T')[0] : '',
      LOAD_START_DATE: rakeVisit.LOAD_START_DATE ? new Date(rakeVisit.LOAD_START_DATE).toISOString().split('T')[0] : '',
      LOAD_COMPLETION_DATE: rakeVisit.LOAD_COMPLETION_DATE ? new Date(rakeVisit.LOAD_COMPLETION_DATE).toISOString().split('T')[0] : '',
      D_STABLING_START_DATE: rakeVisit.D_STABLING_START_DATE ? new Date(rakeVisit.D_STABLING_START_DATE).toISOString().split('T')[0] : '',
      D_STABLING_END_DATE: rakeVisit.D_STABLING_END_DATE ? new Date(rakeVisit.D_STABLING_END_DATE).toISOString().split('T')[0] : '',
      D_REMOVAL_DATE: rakeVisit.D_REMOVAL_DATE ? new Date(rakeVisit.D_REMOVAL_DATE).toISOString().split('T')[0] : '',
      RR_DATE: rakeVisit.RR_DATE ? new Date(rakeVisit.RR_DATE).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rake visit?")) {
      setLoading(true);
      await deleteRakeVisit(id);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setEditingRakeVisit(null);
    setErrors({});
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
    fetchRakes(); // Load rakes when modal opens
    fetchRoutes(); // Load routes when modal opens
  };

  // Filter functionality
  useEffect(() => {
    let filtered = rakeVisits;

    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.IB_TRAIN_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.OB_TRAIN_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.TRIP_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.RR_NO?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTerminal) {
      filtered = filtered.filter(visit =>
        visit.TERMINAL_ID === parseInt(filterTerminal)
      );
    }

    if (filterRakeId) {
      filtered = filtered.filter(visit =>
        visit.RAKE_ID === parseInt(filterRakeId)
      );
    }

    setFilteredRakeVisits(filtered);
  }, [rakeVisits, searchTerm, filterTerminal, filterRakeId]);

  useEffect(() => {
    fetchRakeVisits();
    fetchTerminals();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Train className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Rake Visit Management</h1>
            </div>
            <button
              onClick={openModal}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Rake Visit</span>
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage({ type: "", text: "" })}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by train no, trip no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terminal</label>
              <select
                value={filterTerminal}
                onChange={(e) => setFilterTerminal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Terminals</option>
                {terminals.map((terminal) => (
                  <option key={terminal.TerminalCode} value={terminal.TerminalCode}>{terminal.TerminalCode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rake ID</label>
              <input
                type="number"
                placeholder="Filter by Rake ID"
                value={filterRakeId}
                onChange={(e) => setFilterRakeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterTerminal("");
                  setFilterRakeId("");
                }}
                className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IB Train No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OB Train No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terminal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rake ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRakeVisits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No rake visits found
                    </td>
                  </tr>
                ) : (
                  filteredRakeVisits.map((visit) => (
                    <tr key={visit.VISIT_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {visit.VISIT_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.IB_TRAIN_NO || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.OB_TRAIN_NO || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.TERMINAL_ID || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.RAKE_ID || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visit.ARRVAL_DATE)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visit.DEPARTURE_DATE)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(visit)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(visit.VISIT_ID)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRakeVisit ? 'Edit Rake Visit' : 'Add New Rake Visit'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IB Train No *
                      </label>
                      <input
                        type="text"
                        name="IB_TRAIN_NO"
                        value={formData.IB_TRAIN_NO}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.IB_TRAIN_NO ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.IB_TRAIN_NO && (
                        <p className="mt-1 text-sm text-red-600">{errors.IB_TRAIN_NO}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OB Train No
                      </label>
                      <input
                        type="text"
                        name="OB_TRAIN_NO"
                        value={formData.OB_TRAIN_NO}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terminal ID *
                      </label>
                      <input
                        type="number"
                        name="TERMINAL_ID"
                        value={formData.TERMINAL_ID}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.TERMINAL_ID ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.TERMINAL_ID && (
                        <p className="mt-1 text-sm text-red-600">{errors.TERMINAL_ID}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rake ID *
                      </label>
                      <select
                        name="RAKE_ID"
                        value={formData.RAKE_ID}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.RAKE_ID ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Select Rake</option>
                        {rakes.map(rake => (
                          <option key={rake.RakeId} value={rake.RakeId}>
                            {rake.Rake_Name} (ID: {rake.RakeId})
                          </option>
                        ))}
                      </select>
                      {errors.RAKE_ID && (
                        <p className="mt-1 text-sm text-red-600">{errors.RAKE_ID}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IB Load Terminal
                      </label>
                      <select
                        name="IB_LOAD_TERMINAL"
                        value={formData.IB_LOAD_TERMINAL}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Terminal</option>
                        {terminals.map((terminal) => (
                          <option key={terminal.TerminalCode} value={terminal.TerminalCode}>{terminal.TerminalCode}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OB Discharge Terminal
                      </label>
                      <select
                        name="OB_DISCHARGE_TERMINAL"
                        value={formData.OB_DISCHARGE_TERMINAL}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Terminal</option>
                        {terminals.map((terminal) => (
                          <option key={terminal.TerminalCode} value={terminal.TerminalCode}>{terminal.TerminalCode}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arrival Date
                      </label>
                      <input
                        type="datetime-local"
                        name="ARRVAL_DATE"
                        value={formData.ARRVAL_DATE}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure Date
                      </label>
                      <input
                        type="datetime-local"
                        name="DEPARTURE_DATE"
                        value={formData.DEPARTURE_DATE}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trip No
                      </label>
                      <input
                        type="text"
                        name="TRIP_NO"
                        value={formData.TRIP_NO}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Route Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IB Route
                      </label>
                      <select
                        name="IB_ROUTE_ID"
                        value={formData.IB_ROUTE_ID}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select IB Route</option>
                        {routes.map(route => (
                          <option key={route.RouteId || route.id} value={route.RouteId || route.id}>
                            {route.Route_Name || route.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OB Route
                      </label>
                      <select
                        name="OB_ROUTE_ID"
                        value={formData.OB_ROUTE_ID}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select OB Route</option>
                        {routes.map(route => (
                          <option key={route.RouteId || route.id} value={route.RouteId || route.id}>
                            {route.Route_Name || route.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billable Distance
                      </label>
                      <input
                        type="number"
                        name="BILLABLE_DISTANCE"
                        value={formData.BILLABLE_DISTANCE}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Status Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Double Stack
                      </label>
                      <select
                        name="DOUBLE_STACK"
                        value={formData.DOUBLE_STACK}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pooling
                      </label>
                      <select
                        name="POOLING"
                        value={formData.POOLING}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Haulage Paid By
                      </label>
                      <select
                        name="HAULAGE_PAID_BY"
                        value={formData.HAULAGE_PAID_BY}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="C">Customer</option>
                        <option value="R">Railway</option>
                        <option value="O">Other</option>
                      </select>
                    </div>

                    {/* RR Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RR No
                      </label>
                      <input
                        type="text"
                        name="RR_NO"
                        value={formData.RR_NO}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RR Date
                      </label>
                      <input
                        type="date"
                        name="RR_DATE"
                        value={formData.RR_DATE}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RR Amount
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        name="RR_AMOUNT"
                        value={formData.RR_AMOUNT}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        name="REMARKS"
                        value={formData.REMARKS}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter any additional remarks..."
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : (editingRakeVisit ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RakeVisit;
