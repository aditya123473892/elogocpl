import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, User, X, Check, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { customerMasterAPI } from "../utils/Api";

const CustomerMaster = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    CustomerName: "",
    CustomerType: "",
    ContactPerson: "",
    Email: "",
    Phone: "",
    AddressLine1: "",
    City: "",
    State: "",
    PostalCode: "",
    Country: "",
    IsConsigner: false,
    IsConsignee: false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const customerTypes = ["dealer", "customer"];

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.CustomerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.ContactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.Phone?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerMasterAPI.getAllCustomers();
      setCustomers(response || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch customers"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.CustomerName.trim()) {
      newErrors.CustomerName = "Customer name is required";
    }
    if (!formData.CustomerType) {
      newErrors.CustomerType = "Customer type is required";
    }
    if (formData.Email && !/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Invalid email format";
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
        IsConsigner: formData.IsConsigner ? 1 : 0,
        IsConsignee: formData.IsConsignee ? 1 : 0,
      };

      if (editingCustomer) {
        await customerMasterAPI.updateCustomer(editingCustomer.CustomerID, submitData);
        setMessage({
          type: "success",
          text: "Customer updated successfully"
        });
      } else {
        await customerMasterAPI.createCustomer(submitData);
        setMessage({
          type: "success",
          text: "Customer created successfully"
        });
      }

      resetForm();
      fetchCustomers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Failed to save customer"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      CustomerName: customer.CustomerName,
      CustomerType: customer.CustomerType,
      ContactPerson: customer.ContactPerson || "",
      Email: customer.Email || "",
      Phone: customer.Phone || "",
      AddressLine1: customer.AddressLine1 || "",
      City: customer.City || "",
      State: customer.State || "",
      PostalCode: customer.PostalCode || "",
      Country: customer.Country || "",
      IsConsigner: customer.IsConsigner === 1 || customer.IsConsigner === true,
      IsConsignee: customer.IsConsignee === 1 || customer.IsConsignee === true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      setLoading(true);
      await customerMasterAPI.deleteCustomer(id);
      setMessage({
        type: "success",
        text: "Customer deleted successfully"
      });
      fetchCustomers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete customer"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      CustomerName: "",
      CustomerType: "",
      ContactPerson: "",
      Email: "",
      Phone: "",
      AddressLine1: "",
      City: "",
      State: "",
      PostalCode: "",
      Country: "",
      IsConsigner: false,
      IsConsignee: false,
    });
    setEditingCustomer(null);
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
          Customer Master Management
        </h1>
        <p className="text-gray-600">
          Manage customers, their contact information, and consignment roles
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
                placeholder="Search customers by name, type, contact, email, or phone..."
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
              Add Customer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No customers found matching your search" : "No customers found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.CustomerID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {customer.CustomerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.CustomerType?.toLowerCase() === 'dealer' 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {customer.CustomerType || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.ContactPerson || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.Email ? (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          {customer.Email}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.Phone ? (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {customer.Phone}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        {customer.IsConsigner && (
                          <span className="text-xs text-green-600">Consigner</span>
                        )}
                        {customer.IsConsignee && (
                          <span className="text-xs text-blue-600">Consignee</span>
                        )}
                        {!customer.IsConsigner && !customer.IsConsignee && "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.City || customer.State ? (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {customer.City}{customer.City && customer.State ? ", " : ""}{customer.State}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.CustomerID)}
                          className="text-red-600 hover:text-red-900"
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
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
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
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="CustomerName"
                      value={formData.CustomerName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.CustomerName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter customer name"
                    />
                    {errors.CustomerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.CustomerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="CustomerType"
                      value={formData.CustomerType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.CustomerType ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select customer type</option>
                      {customerTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.CustomerType && (
                      <p className="mt-1 text-sm text-red-600">{errors.CustomerType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="ContactPerson"
                      value={formData.ContactPerson}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.Email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.Email && (
                      <p className="mt-1 text-sm text-red-600">{errors.Email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="Phone"
                      value={formData.Phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="Country"
                      value={formData.Country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="AddressLine1"
                      value={formData.AddressLine1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="City"
                      value={formData.City}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="State"
                      value={formData.State}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="PostalCode"
                      value={formData.PostalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="IsConsigner"
                        id="IsConsigner"
                        checked={formData.IsConsigner}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="IsConsigner" className="ml-2 text-sm text-gray-700">
                        Is Consigner
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="IsConsignee"
                        id="IsConsignee"
                        checked={formData.IsConsignee}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="IsConsignee" className="ml-2 text-sm text-gray-700">
                        Is Consignee
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                    {loading ? "Saving..." : editingCustomer ? "Update Customer" : "Add Customer"}
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

export default CustomerMaster;
