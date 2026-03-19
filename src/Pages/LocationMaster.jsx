import React, { useState, useEffect } from "react";
import { Search, Plus, Edit,  MapPin, ToggleLeft, ToggleRight, X, Check, Camera, Crosshair } from "lucide-react";
import { locationMasterAPI } from "../utils/Api";

const LocationMaster = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    LocationName: "",
    LocationType: "",
    Address: "",
    IsActive: true,
    Image: "",
    Latitude: "",
    Longitude: "",
    imageFile: null,
    locationLoading: false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const locationTypes = [
    "Sideing",
    "YARD",
    "DEALER"
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(location =>
      location.LocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.LocationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.Address && location.Address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationMasterAPI.getAllLocations();
      setLocations(response.data || []);
      setFilteredLocations(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch locations"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.LocationName.trim()) {
      newErrors.LocationName = "Location name is required";
    }
    if (!formData.LocationType) {
      newErrors.LocationType = "Location type is required";
    }
    if (formData.Latitude && (isNaN(formData.Latitude) || formData.Latitude < -90 || formData.Latitude > 90)) {
      newErrors.Latitude = "Latitude must be between -90 and 90";
    }
    if (formData.Longitude && (isNaN(formData.Longitude) || formData.Longitude < -180 || formData.Longitude > 180)) {
      newErrors.Longitude = "Longitude must be between -180 and 180";
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
        Latitude: formData.Latitude ? parseFloat(formData.Latitude) : null,
        Longitude: formData.Longitude ? parseFloat(formData.Longitude) : null,
      };

      if (editingLocation) {
        await locationMasterAPI.updateLocation(editingLocation.LocationId, submitData);
        setMessage({
          type: "success",
          text: "Location updated successfully"
        });
      } else {
        await locationMasterAPI.createLocation(submitData);
        setMessage({
          type: "success",
          text: "Location created successfully"
        });
      }

      resetForm();
      fetchLocations();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save location"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      LocationName: location.LocationName,
      LocationType: location.LocationType,
      Address: location.Address || "",
      IsActive: location.IsActive,
      Image: location.Image || "",
      Latitude: location.Latitude || "",
      Longitude: location.Longitude || "",
      imageFile: null,
      locationLoading: false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;

    try {
      setLoading(true);
      await locationMasterAPI.deleteLocation(id);
      setMessage({
        type: "success",
        text: "Location deleted successfully"
      });
      fetchLocations();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete location"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await locationMasterAPI.toggleLocationStatus(id);
      setMessage({
        type: "success",
        text: "Location status updated successfully"
      });
      fetchLocations();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update location status"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Clean up blob URL if exists
    if (formData.Image && formData.Image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.Image);
    }
    
    setFormData({
      LocationName: "",
      LocationType: "",
      Address: "",
      IsActive: true,
      Image: "",
      Latitude: "",
      Longitude: "",
      imageFile: null,
      locationLoading: false,
    });
    setEditingLocation(null);
    setErrors({});
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size should be less than 5MB"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage({
          type: "error",
          text: "Please select an image file"
        });
        return;
      }

      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        Image: imageUrl,
        imageFile: file
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser"
      });
      return;
    }

    setFormData(prev => ({ ...prev, locationLoading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          Latitude: latitude.toFixed(6),
          Longitude: longitude.toFixed(6),
          locationLoading: false
        }));
        setMessage({
          type: "success",
          text: "Location fetched successfully!"
        });
      },
      (error) => {
        setFormData(prev => ({ ...prev, locationLoading: false }));
        let errorMessage = "Failed to fetch location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
            break;
        }
        
        setMessage({
          type: "error",
          text: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const removeImage = () => {
    if (formData.Image && formData.Image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.Image);
    }
    setFormData(prev => ({
      ...prev,
      Image: "",
      imageFile: null
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Location Master Management
        </h1>
        <p className="text-gray-600">
          Manage warehouse, factory, office, and other locations
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
                placeholder="Search locations..."
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
              Add Location
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading locations...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No locations found matching your search" : "No locations found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLocations.map((location) => (
                  <tr key={location.LocationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {location.LocationName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {location.LocationType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 max-w-xs truncate block">
                        {location.Address || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {location.Image ? (
                        <img
                          src={location.Image}
                          alt={location.LocationName}
                          className="h-10 w-10 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='8' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {location.Latitude && location.Longitude
                          ? `${location.Latitude}, ${location.Longitude}`
                          : "-"}
                      </span>
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(location)}
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
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="LocationName"
                    value={formData.LocationName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.LocationName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter location name"
                  />
                  {errors.LocationName && (
                    <p className="mt-1 text-sm text-red-600">{errors.LocationName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="LocationType"
                    value={formData.LocationType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.LocationType ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select type</option>
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.LocationType && (
                    <p className="mt-1 text-sm text-red-600">{errors.LocationType}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordinates
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={formData.locationLoading}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg border ${
                          formData.locationLoading
                            ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {formData.locationLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <Crosshair className="w-4 h-4 mr-2" />
                            Get Current Location
                          </>
                        )}
                      </button>
                      <span className="text-xs text-gray-500">
                        Uses your device's GPS
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          name="Latitude"
                          value={formData.Latitude}
                          onChange={handleInputChange}
                          step="any"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors.Latitude ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="Latitude"
                        />
                        {errors.Latitude && (
                          <p className="mt-1 text-sm text-red-600">{errors.Latitude}</p>
                        )}
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          name="Longitude"
                          value={formData.Longitude}
                          onChange={handleInputChange}
                          step="any"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors.Longitude ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="Longitude"
                        />
                        {errors.Longitude && (
                          <p className="mt-1 text-sm text-red-600">{errors.Longitude}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Image
                  </label>
                  <div className="space-y-3">
                    {/* Image Upload */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Image
                      </label>
                      {formData.Image && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {/* Image Preview */}
                    {formData.Image && (
                      <div className="mt-2">
                        <img
                          src={formData.Image}
                          alt="Location preview"
                          className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    {/* Alternative URL input */}
                    <div className="text-xs text-gray-500">
                      Or enter image URL:
                    </div>
                    <input
                      type="text"
                      name="Image"
                      value={formData.Image}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="IsActive"
                    id="IsActive"
                    checked={formData.IsActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="IsActive" className="ml-2 text-sm text-gray-700">
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
                  {loading ? "Saving..." : editingLocation ? "Update Location" : "Create Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMaster;
