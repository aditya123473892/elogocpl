import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Train,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { rakeMasterAPI } from "../utils/Api";

const LOCATION_OPTIONS = ["CCH", "BRC", "BCT", "NDLS", "MAS"];

const DEFAULT_FORM = {
  Rake_Name: "",
  Owner: "INDIAN RAILWAY",
  Operator: "INDIAN RAILWAY",
  Rake_Composition: "27",
  Max: "27",
  Purchase_Date: "",
  Comm_Date: "",
  ROH_Months: "",
  POH_Months: "",
  Lease_From: "",
  Lease_To: "",
  Lease_Loc: "CCH",
  Handover_At: "CCH",
  Exam_Date: "",
  Balance_KM: "",
  Status: "Active",
  Base_Depot: "CCH",
};

const DEFAULT_WAGONS = Array.from({ length: 27 }, (_, i) => ({
  wagon_no: String(i + 1),
  load_capacity: "10",
}));

const RakeMaster = () => {
  const [rakes, setRakes] = useState([]);
  const [filteredRakes, setFilteredRakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRake, setEditingRake] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [wagons, setWagons] = useState(DEFAULT_WAGONS);
  const [errors, setErrors] = useState({});
  const [showWagons, setShowWagons] = useState(false);

  useEffect(() => {
    fetchRakes();
  }, []);

  useEffect(() => {
    const filtered = rakes.filter(
      (rake) =>
        rake.Rake_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rake.Owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rake.Status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredRakes(filtered);
  }, [searchTerm, rakes]);

  const fetchRakes = async () => {
    try {
      setLoading(true);
      const response = await rakeMasterAPI.getAllRakes();
      setRakes(response.data || []);
      setFilteredRakes(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch rakes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleWagonChange = (index, field, value) => {
    setWagons((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w)),
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Rake_Name?.toString().trim())
      newErrors.Rake_Name = "Required";
    if (!formData.Rake_Composition?.toString().trim())
      newErrors.Rake_Composition = "Required";
    if (!formData.Max?.toString().trim()) newErrors.Max = "Required";
    if (!formData.Purchase_Date) newErrors.Purchase_Date = "Required";
    if (!formData.Comm_Date) newErrors.Comm_Date = "Required";
    if (!formData.ROH_Months?.toString().trim())
      newErrors.ROH_Months = "Required";
    if (!formData.POH_Months?.toString().trim())
      newErrors.POH_Months = "Required";
    if (!formData.Lease_From) newErrors.Lease_From = "Required";
    if (!formData.Lease_To) newErrors.Lease_To = "Required";
    if (!formData.Exam_Date) newErrors.Exam_Date = "Required";
    if (!formData.Balance_KM?.toString().trim())
      newErrors.Balance_KM = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const payload = { ...formData, wagons };

      if (editingRake) {
        await rakeMasterAPI.updateRake(editingRake.RakeId, payload);
        setMessage({ type: "success", text: "Rake updated successfully" });
      } else {
        await rakeMasterAPI.createRake(payload);
        setMessage({ type: "success", text: "Rake created successfully" });
      }

      resetForm();
      fetchRakes();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save rake",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rake) => {
    setEditingRake(rake);
    setFormData({
      Rake_Name: rake.Rake_Name,
      Owner: rake.Owner,
      Operator: rake.Operator,
      Rake_Composition: String(rake.Rake_Composition),
      Max: String(rake.Max_Composition),
      Purchase_Date: rake.Purchase_Date ? rake.Purchase_Date.split("T")[0] : "",
      Comm_Date: rake.Comm_Date ? rake.Comm_Date.split("T")[0] : "",
      ROH_Months: String(rake.ROH_Months),
      POH_Months: String(rake.POH_Months),
      Lease_From: rake.Lease_From ? rake.Lease_From.split("T")[0] : "",
      Lease_To: rake.Lease_To ? rake.Lease_To.split("T")[0] : "",
      Lease_Loc: rake.Lease_Loc,
      Handover_At: rake.Handover_At,
      Exam_Date: rake.Exam_Date ? rake.Exam_Date.split("T")[0] : "",
      Balance_KM: String(rake.Balance_KM),
      Status: rake.Status,
      Base_Depot: rake.Base_Depot,
    });
    if (rake.wagons && rake.wagons.length > 0) {
      setWagons(
        rake.wagons.map((w) => ({
          wagon_no: w.Wagon_No,
          load_capacity: String(w.Load_Capacity),
        })),
      );
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rake?")) return;
    try {
      setLoading(true);
      await rakeMasterAPI.deleteRake(id);
      setMessage({ type: "success", text: "Rake deleted successfully" });
      fetchRakes();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete rake",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setWagons(DEFAULT_WAGONS);
    setErrors({});
    setEditingRake(null);
    setShowModal(false);
    setShowWagons(false);
  };

  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-700",
    "Under Maintenance": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rake Master Management
        </h1>
        <p className="text-gray-600">
          Manage rakes, wagon compositions, and lease information
        </p>
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
                placeholder="Search rakes..."
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
              Add Rake
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading rakes...</p>
            </div>
          ) : filteredRakes.length === 0 ? (
            <div className="p-8 text-center">
              <Train className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No rakes found matching your search"
                  : "No rakes found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rake Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Composition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Depot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lease Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRakes.map((rake) => (
                  <tr key={rake.RakeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Train className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {rake.Rake_Name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rake.Owner}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rake.Operator}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rake.Rake_Composition} / {rake.Max_Composition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rake.Base_Depot}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rake.Lease_From && rake.Lease_To
                          ? `${rake.Lease_From.split("T")[0]} → ${rake.Lease_To.split("T")[0]}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[rake.Status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {rake.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(rake)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rake.RakeId)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRake ? "Edit Rake" : "Add New Rake"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rake Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rake Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Rake_Name"
                    value={formData.Rake_Name}
                    onChange={handleInputChange}
                    disabled={!!editingRake}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Rake_Name ? "border-red-300" : "border-gray-300"} ${editingRake ? "bg-gray-100" : ""}`}
                    placeholder="Enter rake name"
                  />
                  {errors.Rake_Name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Rake_Name}
                    </p>
                  )}
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner
                  </label>
                  <select
                    name="Owner"
                    value={formData.Owner}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>
                    <option value="PRIVATE">PRIVATE</option>
                    <option value="CONCOR">CONCOR</option>
                  </select>
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operator
                  </label>
                  <select
                    name="Operator"
                    value={formData.Operator}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>
                    <option value="PRIVATE OPERATOR">PRIVATE OPERATOR</option>
                    <option value="CONCOR">CONCOR</option>
                  </select>
                </div>

                {/* Rake Composition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rake Composition <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="Rake_Composition"
                    value={formData.Rake_Composition}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Rake_Composition ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Rake_Composition && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Rake_Composition}
                    </p>
                  )}
                </div>

                {/* Max */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="Max"
                    value={formData.Max}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Max ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Max && (
                    <p className="mt-1 text-sm text-red-600">{errors.Max}</p>
                  )}
                </div>

                {/* Balance KM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Balance KM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="Balance_KM"
                    value={formData.Balance_KM}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Balance_KM ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Balance_KM && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Balance_KM}
                    </p>
                  )}
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="Purchase_Date"
                    value={formData.Purchase_Date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Purchase_Date ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Purchase_Date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Purchase_Date}
                    </p>
                  )}
                </div>

                {/* Comm Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comm. Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="Comm_Date"
                    value={formData.Comm_Date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Comm_Date ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Comm_Date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Comm_Date}
                    </p>
                  )}
                </div>

                {/* Exam Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="Exam_Date"
                    value={formData.Exam_Date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Exam_Date ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Exam_Date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Exam_Date}
                    </p>
                  )}
                </div>

                {/* ROH Months */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ROH (Months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="ROH_Months"
                    value={formData.ROH_Months}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ROH_Months ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.ROH_Months && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.ROH_Months}
                    </p>
                  )}
                </div>

                {/* POH Months */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    POH (Months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="POH_Months"
                    value={formData.POH_Months}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.POH_Months ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.POH_Months && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.POH_Months}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="Status"
                    value={formData.Status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>

                {/* Lease From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="Lease_From"
                    value={formData.Lease_From}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Lease_From ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Lease_From && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Lease_From}
                    </p>
                  )}
                </div>

                {/* Lease To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="Lease_To"
                    value={formData.Lease_To}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Lease_To ? "border-red-300" : "border-gray-300"}`}
                  />
                  {errors.Lease_To && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.Lease_To}
                    </p>
                  )}
                </div>

                {/* Lease Loc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Location
                  </label>
                  <select
                    name="Lease_Loc"
                    value={formData.Lease_Loc}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Handover At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handover At
                  </label>
                  <select
                    name="Handover_At"
                    value={formData.Handover_At}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Depot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Depot
                  </label>
                  <select
                    name="Base_Depot"
                    value={formData.Base_Depot}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Wagon Table - Collapsible */}
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowWagons(!showWagons)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700"
                >
                  <span>Wagon Details ({wagons.length} wagons)</span>
                  {showWagons ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showWagons && (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700 text-white sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium">
                            Wagon No
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium">
                            Load Capacity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {wagons.map((wagon, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                value={wagon.wagon_no}
                                onChange={(e) =>
                                  handleWagonChange(
                                    index,
                                    "wagon_no",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded text-sm"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                value={wagon.load_capacity}
                                onChange={(e) =>
                                  handleWagonChange(
                                    index,
                                    "load_capacity",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                  {loading
                    ? "Saving..."
                    : editingRake
                      ? "Update Rake"
                      : "Create Rake"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RakeMaster;
