import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Truck, ToggleLeft, ToggleRight, X, Check, User, Package } from "lucide-react";
import { vehicleMasterAPI, driverMasterAPI } from "../utils/Api";

const VehicleMaster = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [drivers, setDrivers] = useState([]); // FIX 1: Added missing drivers state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: "",
    vehicle_type: "",
    transporter_id: "",
    is_active: true,
    capacity_tonnes: "",
    current_driver_id: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const vehicleTypes = [
    "TRUCK",
    "TRAILER",
    "TANKER",
    "FLATBED",
    "REFRIGERATED",
    "CONTAINER",
    "PICKUP",
    "VAN",
    "OTHER"
  ];

  useEffect(() => {
    fetchVehicles();
    fetchTransporters();
    fetchDriversForDropdown();
  }, []);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  // FIX 2: Removed duplicate fetchVehicles — kept only this single, complete version
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleMasterAPI.getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch vehicles"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransporters = async () => {
    try {
      const response = await vehicleMasterAPI.getTransporters();
      setTransporters(response.data || []);
    } catch (error) {
      console.error("Error fetching transporters:", error);
    }
  };

  const fetchDriversForDropdown = async () => {
    try {
      const response = await driverMasterAPI.getActiveDrivers();
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle_number.trim()) {
      newErrors.vehicle_number = "Vehicle number is required";
    }
    if (!formData.vehicle_type.trim()) {
      newErrors.vehicle_type = "Vehicle type is required";
    }
    if (!formData.capacity_tonnes || isNaN(parseFloat(formData.capacity_tonnes))) {
      newErrors.capacity_tonnes = "Capacity must be a valid number";
    }
    if (parseFloat(formData.capacity_tonnes) <= 0) {
      newErrors.capacity_tonnes = "Capacity must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const submitData = {
        ...formData,
        transporter_id: formData.transporter_id ? parseInt(formData.transporter_id) : null,
        capacity_tonnes: parseFloat(formData.capacity_tonnes),
        current_driver_id: formData.current_driver_id || null,  // Fixed: Removed parseInt for manual driver IDs
      };

      if (editingVehicle) {
        await vehicleMasterAPI.updateVehicle(editingVehicle.vehicle_id, submitData);
        setMessage({
          type: "success",
          text: "Vehicle updated successfully"
        });
      } else {
        await vehicleMasterAPI.createVehicle(submitData);
        setMessage({
          type: "success",
          text: "Vehicle created successfully"
        });
      }

      resetForm();
      fetchVehicles();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save vehicle"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      transporter_id: vehicle.transporter_id || "",
      is_active: vehicle.is_active,
      capacity_tonnes: vehicle.capacity_tonnes,
      current_driver_id: vehicle.current_driver_id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      setLoading(true);
      await vehicleMasterAPI.deleteVehicle(id);
      setMessage({
        type: "success",
        text: "Vehicle deleted successfully"
      });
      fetchVehicles();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete vehicle"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await vehicleMasterAPI.toggleVehicleStatus(id);
      setMessage({
        type: "success",
        text: "Vehicle status updated successfully"
      });
      fetchVehicles();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update vehicle status"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_number: "",
      vehicle_type: "",
      transporter_id: "",
      is_active: true,
      capacity_tonnes: "",
      current_driver_id: "",
    });
    setEditingVehicle(null);
    setErrors({});
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vehicle Master Management
        </h1>
        <p className="text-gray-600">
          Manage fleet vehicles, assign vehicles and track capacity
        </p>
      </div>

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

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vehicles by number, type, transporter, or driver..."
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
              Add Vehicle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-8 text-center">
              <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No vehicles found matching your search" : "No vehicles found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
               
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity (Tonnes)
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
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.vehicle_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vehicle.vehicle_type}
                      </span>
                    </td>
                 
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {vehicle.current_driver_id ? `ID: ${vehicle.current_driver_id}` : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.capacity_tonnes}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(vehicle.vehicle_id)}
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {vehicle.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
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
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </h3>
                <button
                  onClick={resetForm}
                  className="bg-white border-gray-200 rounded-md p-2 hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicle_number"
                      value={formData.vehicle_number}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vehicle_number ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., MH-12-AB-1234"
                    />
                    {errors.vehicle_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicle_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vehicle_type ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select vehicle type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.vehicle_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>
                    )}
                  </div>

              

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Driver
                    </label>
                    <select
                      name="current_driver_id"
                      value={formData.current_driver_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select driver</option>
                      {/* FIX 3: Changed from vehicles to drivers with correct field names */}
                      {drivers.map((driver) => (
                        <option key={driver.driver_id} value={driver.driver_id}>
                          {driver.driver_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity (Tonnes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity_tonnes"
                      value={formData.capacity_tonnes}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.capacity_tonnes ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 10.5"
                    />
                    {errors.capacity_tonnes && (
                      <p className="mt-1 text-sm text-red-600">{errors.capacity_tonnes}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
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
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleMaster;