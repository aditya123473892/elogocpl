import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, Calendar, FileText, X, Check } from "lucide-react";

const RateContractMaster = () => {
  const [contracts, setContracts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dealer");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    contract_code: "",
    billing_condition: "",
    rate_type: "Public",
    service: "",
    customer: "",
  });

  const [rateDetails, setRateDetails] = useState([
    {
      id: 1,
      from_date: "",
      to_date: "",
      service_mode: "---ALL---",
      wagon_type: "---Select---",
      from_location: "---ALL---",
      from_terminal: "---ALL---",
      to_terminal: "---ALL---",
      article: "---ALL---",
      load_factor: "",
      base_rate: "",
      contd: "NONE",
      dic: "",
      rate: "",
    },
  ]);

  const billingConditions = ["Prepaid", "Postpaid", "Credit", "To Pay"];
  const rateTypes = ["Public", "Private", "Contract"];
  const services = ["Road Transport", "Rail Transport", "Multimodal", "Warehousing"];
  const customers = ["Customer A", "Customer B", "Customer C", "Customer D"];
  const serviceModes = ["---ALL---", "FTL", "LTL", "Parcel", "Express"];
  const wagonTypes = ["---Select---", "Box", "Flat", "Tanker", "Open", "Covered"];
  const contdOptions = ["NONE", "Yes", "No"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRateDetailChange = (index, field, value) => {
    const updatedDetails = [...rateDetails];
    updatedDetails[index][field] = value;
    setRateDetails(updatedDetails);
  };

  const addRateDetailRow = () => {
    setRateDetails([
      ...rateDetails,
      {
        id: Date.now(),
        from_date: "",
        to_date: "",
        service_mode: "---ALL---",
        wagon_type: "---Select---",
        from_location: "---ALL---",
        from_terminal: "---ALL---",
        to_terminal: "---ALL---",
        article: "---ALL---",
        load_factor: "",
        base_rate: "",
        contd: "NONE",
        dic: "",
        rate: "",
      },
    ]);
  };

  const removeRateDetailRow = (index) => {
    if (rateDetails.length > 1) {
      const updatedDetails = rateDetails.filter((_, i) => i !== index);
      setRateDetails(updatedDetails);
    }
  };

  const resetForm = () => {
    setFormData({
      contract_code: "",
      billing_condition: "",
      rate_type: "Public",
      service: "",
      customer: "",
    });
    setRateDetails([
      {
        id: 1,
        from_date: "",
        to_date: "",
        service_mode: "---ALL---",
        wagon_type: "---Select---",
        from_location: "---ALL---",
        from_terminal: "---ALL---",
        to_terminal: "---ALL---",
        article: "---ALL---",
        load_factor: "",
        base_rate: "",
        contd: "NONE",
        dic: "",
        rate: "",
      },
    ]);
    setEditingContract(null);
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!formData.contract_code.trim()) {
      setMessage({ type: "error", text: "Contract Code is required" });
      return;
    }
    if (!formData.billing_condition) {
      setMessage({ type: "error", text: "Billing Condition is required" });
      return;
    }
    if (!formData.service) {
      setMessage({ type: "error", text: "Service is required" });
      return;
    }
    if (!formData.customer) {
      setMessage({ type: "error", text: "Customer is required" });
      return;
    }

    const contractData = {
      ...formData,
      rate_details: rateDetails,
    };

    if (editingContract) {
      setContracts(contracts.map(c => c.id === editingContract.id ? contractData : c));
      setMessage({ type: "success", text: "Rate Contract updated successfully" });
    } else {
      setContracts([...contracts, { ...contractData, id: Date.now() }]);
      setMessage({ type: "success", text: "Rate Contract created successfully" });
    }

    resetForm();
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setFormData({
      contract_code: contract.contract_code,
      billing_condition: contract.billing_condition,
      rate_type: contract.rate_type,
      service: contract.service,
      customer: contract.customer,
    });
    setRateDetails(contract.rate_details || []);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this rate contract?")) {
      setContracts(contracts.filter(c => c.id !== id));
      setMessage({ type: "success", text: "Rate Contract deleted successfully" });
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.contract_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rate Contract Master
        </h1>
        <p className="text-gray-600">
          Manage rate contracts, billing conditions, and rate details
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
                placeholder="Search contracts by code, customer, or service..."
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
              Add Rate Contract
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredContracts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No contracts found matching your search" : "No rate contracts found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Details
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {contract.contract_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contract.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contract.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {contract.rate_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contract.billing_condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contract.rate_details?.length || 0} rows
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contract.id)}
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
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingContract ? "Edit Rate Contract" : "Add New Rate Contract"}
                </h3>
                <button
                  onClick={resetForm}
                  className="bg-white border-gray-200 rounded-md p-2 hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contract Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contract_code"
                        value={formData.contract_code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter contract code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Condition <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="billing_condition"
                        value={formData.billing_condition}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">--Select--</option>
                        {billingConditions.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Type
                      </label>
                      <select
                        name="rate_type"
                        value={formData.rate_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {rateTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">--Select--</option>
                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="customer"
                        value={formData.customer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">--Select--</option>
                        {customers.map((customer) => (
                          <option key={customer} value={customer}>
                            {customer}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    {[
                      { id: "dealer", label: "Dealer List" },
                      { id: "terminal", label: "Terminal List" },
                      { id: "article", label: "Article List" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Rate Details Table */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Rate Details</h4>
                    <button
                      type="button"
                      onClick={addRateDetailRow}
                      className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">From Date</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">To Date</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service Mode</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wagon Type</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">From Location</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">From Terminal</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">To Terminal</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Load Factor</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Base Rate</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contd</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dic</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rateDetails.map((detail, index) => (
                          <tr key={detail.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="relative">
                                <input
                                  type="date"
                                  value={detail.from_date}
                                  onChange={(e) => handleRateDetailChange(index, "from_date", e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="date"
                                value={detail.to_date}
                                onChange={(e) => handleRateDetailChange(index, "to_date", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.service_mode}
                                onChange={(e) => handleRateDetailChange(index, "service_mode", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {serviceModes.map((mode) => (
                                  <option key={mode} value={mode}>
                                    {mode}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.wagon_type}
                                onChange={(e) => handleRateDetailChange(index, "wagon_type", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {wagonTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.from_location}
                                onChange={(e) => handleRateDetailChange(index, "from_location", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="---ALL---">---ALL---</option>
                                <option value="Location A">Location A</option>
                                <option value="Location B">Location B</option>
                                <option value="Location C">Location C</option>
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.from_terminal}
                                onChange={(e) => handleRateDetailChange(index, "from_terminal", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="---ALL---">---ALL---</option>
                                <option value="Terminal 1">Terminal 1</option>
                                <option value="Terminal 2">Terminal 2</option>
                                <option value="Terminal 3">Terminal 3</option>
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.to_terminal}
                                onChange={(e) => handleRateDetailChange(index, "to_terminal", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="---ALL---">---ALL---</option>
                                <option value="Terminal 1">Terminal 1</option>
                                <option value="Terminal 2">Terminal 2</option>
                                <option value="Terminal 3">Terminal 3</option>
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.article}
                                onChange={(e) => handleRateDetailChange(index, "article", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="---ALL---">---ALL---</option>
                                <option value="Article 1">Article 1</option>
                                <option value="Article 2">Article 2</option>
                                <option value="Article 3">Article 3</option>
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={detail.load_factor}
                                onChange={(e) => handleRateDetailChange(index, "load_factor", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={detail.base_rate}
                                onChange={(e) => handleRateDetailChange(index, "base_rate", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <select
                                value={detail.contd}
                                onChange={(e) => handleRateDetailChange(index, "contd", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {contdOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={detail.dic}
                                onChange={(e) => handleRateDetailChange(index, "dic", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={detail.rate}
                                onChange={(e) => handleRateDetailChange(index, "rate", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              {rateDetails.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRateDetailRow(index)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Remove row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingContract ? "Update Contract" : "Save Contract"}
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

export default RateContractMaster;
