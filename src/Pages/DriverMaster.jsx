import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, Check, User, Upload, Download, QrCode,Phone } from "lucide-react";
import { driverMasterAPI } from "../utils/Api";

const DriverMaster = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    driver_id: "DE01",  // Default starting ID
    driver_name: "",
    driver_contact: "",
    driver_license: "",
    aadhaar_number: "",
    pan_number: "",
    license_expiry_date: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [licenseImageFile, setLicenseImageFile] = useState(null);
  const [aadhaarImageFile, setAadhaarImageFile] = useState(null);
  const [panImageFile, setPanImageFile] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(driver =>
      driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driver_contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.driver_license && driver.driver_license.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverMasterAPI.getAllDrivers();
      setDrivers(response.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch drivers"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.driver_id.trim()) {
      newErrors.driver_id = "Driver ID is required";
    }
    if (!formData.driver_name.trim()) {
      newErrors.driver_name = "Driver name is required";
    }
    if (!formData.driver_contact.trim()) {
      newErrors.driver_contact = "Driver contact is required";
    } else if (!/^\d{10}$/.test(formData.driver_contact.replace(/\D/g, ''))) {
      newErrors.driver_contact = "Please enter a valid 10-digit mobile number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = { ...formData };
      
      if (editingDriver) {
        await driverMasterAPI.updateDriver(editingDriver.driver_id, submitData);
        setMessage({ type: "success", text: "Driver updated successfully!" });
      } else {
        await driverMasterAPI.createDriver(submitData);
        setMessage({ type: "success", text: "Driver created successfully!" });
      }
      
      // Upload images separately to avoid clearing other files
      const driverId = editingDriver ? editingDriver.driver_id : submitData.driver_id;
      
      if (licenseImageFile) {
        await handleLicenseImageUpload(driverId, licenseImageFile);
        setLicenseImageFile(null); // Clear only this file after upload
      }
      if (aadhaarImageFile) {
        await handleAadhaarImageUpload(driverId, aadhaarImageFile);
        setAadhaarImageFile(null); // Clear only this file after upload
      }
      if (panImageFile) {
        await handlePanImageUpload(driverId, panImageFile);
        setPanImageFile(null); // Clear only this file after upload
      }
      
      resetForm();
      fetchDrivers();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving driver:", error);
      setMessage({ type: "error", text: error.message || "Failed to save driver" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      driver_id: driver.driver_id,
      driver_name: driver.driver_name,
      driver_contact: driver.driver_contact,
      driver_license: driver.driver_license,
      aadhaar_number: driver.aadhaar_number || "",
      pan_number: driver.pan_number || "",
      license_expiry_date: driver.license_expiry_date ? new Date(driver.license_expiry_date).toISOString().split('T')[0] : "",
      is_active: driver.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;

    try {
      setLoading(true);
      await driverMasterAPI.deleteDriver(id);
      setMessage({
        type: "success",
        text: "Driver deleted successfully"
      });
      fetchDrivers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete driver"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await driverMasterAPI.toggleDriverStatus(id);
      setMessage({
        type: "success",
        text: "Driver status updated successfully"
      });
      fetchDrivers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update driver status"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (driverId, driverName) => {
    try {
      const response = await driverMasterAPI.generateQRCode(driverId);
      
      // The response is now a blob (image), so create a download link
      const blob = new Blob([response], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      
      // Download the QR code
      const link = document.createElement('a');
      link.download = `QR_${driverName.replace(/\s+/g, '_')}_${driverId}.png`;
      link.href = url;
      link.click();
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: "success", text: "QR code downloaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      setMessage({ type: "error", text: "Failed to generate QR code" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleLicenseImageUpload = async (driverId, file) => {
    try {
      await driverMasterAPI.uploadLicenseImage(driverId, file);
      setMessage({ type: "success", text: "License image uploaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      fetchDrivers(); // Refresh the list
    } catch (error) {
      console.error("Error uploading license image:", error);
      setMessage({ type: "error", text: "Failed to upload license image" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleAadhaarImageUpload = async (driverId, file) => {
    try {
      await driverMasterAPI.uploadAadhaarImage(driverId, file);
      setMessage({ type: "success", text: "Aadhaar image uploaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      fetchDrivers(); // Refresh the list
    } catch (error) {
      console.error("Error uploading Aadhaar image:", error);
      setMessage({ type: "error", text: "Failed to upload Aadhaar image" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handlePanImageUpload = async (driverId, file) => {
    try {
      await driverMasterAPI.uploadPanImage(driverId, file);
      setMessage({ type: "success", text: "PAN image uploaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      fetchDrivers(); // Refresh the list
    } catch (error) {
      console.error("Error uploading PAN image:", error);
      setMessage({ type: "error", text: "Failed to upload PAN image" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleDownloadLicenseImage = async (driverId, driverName) => {
    try {
      const response = await driverMasterAPI.getLicenseImage(driverId);
      
      // Create download link for license image
      const blob = new Blob([response], { type: 'image/jpeg' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `License_${driverName.replace(/\s+/g, '_')}_${driverId}.jpg`;
      link.href = url;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: "success", text: "License image downloaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      
    } catch (error) {
      console.error("Error downloading license image:", error);
      setMessage({ type: "error", text: "Failed to download license image" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleDownloadAadhaarImage = async (driverId, driverName) => {
    try {
      const response = await driverMasterAPI.getAadhaarImage(driverId);
      
      // Create download link for Aadhaar image
      const blob = new Blob([response], { type: 'image/jpeg' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `Aadhaar_${driverName.replace(/\s+/g, '_')}_${driverId}.jpg`;
      link.href = url;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: "success", text: "Aadhaar image downloaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      
    } catch (error) {
      console.error("Error downloading Aadhaar image:", error);
      setMessage({ type: "error", text: "Failed to download Aadhaar image" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleDownloadPanImage = async (driverId, driverName) => {
    try {
      const response = await driverMasterAPI.getPanImage(driverId);
      
      // Create download link for PAN image
      const blob = new Blob([response], { type: 'image/jpeg' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `PAN_${driverName.replace(/\s+/g, '_')}_${driverId}.jpg`;
      link.href = url;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: "success", text: "PAN image downloaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      
    } catch (error) {
      console.error("Error downloading PAN image:", error);
      setMessage({ type: "error", text: "Failed to download PAN image" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      driver_id: "",
      driver_name: "",
      driver_contact: "",
      driver_license: "",
      aadhaar_number: "",
      pan_number: "",
      license_expiry_date: "",
      is_active: true,
    });
    setEditingDriver(null);
    setErrors({});
    setLicenseImageFile(null);
    setAadhaarImageFile(null);
    setPanImageFile(null);
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

  const handleFileChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: "Please select an image file" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }
      
      // Set the appropriate file state based on image type
      switch (imageType) {
        case 'license':
          setLicenseImageFile(file);
          break;
        case 'aadhaar':
          setAadhaarImageFile(file);
          break;
        case 'pan':
          setPanImageFile(file);
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Driver Master Management
        </h1>
        <p className="text-gray-600">
          Manage fleet drivers, generate QR codes and track assignments
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
                placeholder="Search drivers by name, contact, or license..."
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
              Add Driver
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading drivers...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No drivers found matching your search" : "No drivers found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aadhaar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aadhaar Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAN Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.driver_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {driver.driver_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {driver.driver_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {driver.driver_contact}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {driver.driver_license || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {driver.aadhaar_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {driver.pan_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {driver.license_expiry_date ? new Date(driver.license_expiry_date).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.has_license_image ? (
                        <button
                          onClick={() => handleDownloadLicenseImage(driver.driver_id, driver.driver_name)}
                          className="text-green-600 hover:text-green-900"
                          title="Download License Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.has_aadhaar_image ? (
                        <button
                          onClick={() => handleDownloadAadhaarImage(driver.driver_id, driver.driver_name)}
                          className="text-green-600 hover:text-green-900"
                          title="Download Aadhaar Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.has_pan_image ? (
                        <button
                          onClick={() => handleDownloadPanImage(driver.driver_id, driver.driver_name)}
                          className="text-green-600 hover:text-green-900"
                          title="Download PAN Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No Image</span>
                      )}
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleGenerateQR(driver.driver_id, driver.driver_name)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Generate QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(driver)}
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
                  {editingDriver ? "Edit Driver" : "Add New Driver"}
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
                      Driver ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="driver_id"
                      value={formData.driver_id}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.driver_id ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., DE01"
                      required
                    />
                    {errors.driver_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.driver_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="driver_name"
                      value={formData.driver_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.driver_name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., John Doe"
                    />
                    {errors.driver_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.driver_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="driver_contact"
                      value={formData.driver_contact}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.driver_contact ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 9876543210"
                    />
                    {errors.driver_contact && (
                      <p className="mt-1 text-sm text-red-600">{errors.driver_contact}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="driver_license"
                      value={formData.driver_license}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., DL-1234567890123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      name="aadhaar_number"
                      value={formData.aadhaar_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12-digit Aadhaar number"
                      maxLength={12}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      value={formData.pan_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      name="license_expiry_date"
                      value={formData.license_expiry_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'license')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {licenseImageFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {licenseImageFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'aadhaar')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {aadhaarImageFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {aadhaarImageFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'pan')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {panImageFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {panImageFile.name}
                      </p>
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
                    {loading ? "Saving..." : editingDriver ? "Update Driver" : "Add Driver"}
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

export default DriverMaster;
