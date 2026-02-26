import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2 } from "lucide-react";

const DUMMY_RAKES = [
  "NMG49WJ-FN5",
  "NMG49WJ-FN4",
  "RAKE-001",
  "RAKE-002",
  "RAKE-003",
];

const DUMMY_ROUTES = [
  "CCH-ICOD",
  "CCH-PLHW",
  "CCH-PLPC",
  "CE-FN",
  "CE-ICOD",
];

const RakePlanning = () => {
  const [rakes] = useState(DUMMY_RAKES);
  const [routes] = useState(DUMMY_ROUTES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRake, setSelectedRake] = useState(null);
  const [formData, setFormData] = useState({
    Rake_Name: "NMG49WJ-FN5",
    Base_Depot: "CCH",
    Rake_Operator: "INDIAN RAILWAY",
    Haulage_Paid_By: "Owner",
    Trip_No: "",
    Sub_Route: "Main Route",
    Journey_Id: "CCH-ICOD17",
    IB_Train_No: "NMG49WJ-FN5",
    Rake_Owner: "INDIAN RAILWAY",
    Plan_Type: "Back Loading",
    Device_ID: "Select",
    Route: "CCH-ICOD",
    Train_No: "CCH-ICOD17",
    Plan_Date: "23/02/2026 19:09",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving rake planning:", formData);
    // Handle save logic here
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleExit = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      Rake_Name: "NMG49WJ-FN5",
      Base_Depot: "CCH",
      Rake_Operator: "INDIAN RAILWAY",
      Haulage_Paid_By: "Owner",
      Trip_No: "",
      Sub_Route: "Main Route",
      Journey_Id: "CCH-ICOD17",
      IB_Train_No: "NMG49WJ-FN5",
      Rake_Owner: "INDIAN RAILWAY",
      Plan_Type: "Back Loading",
      Device_ID: "Select",
      Route: "CCH-ICOD",
      Train_No: "CCH-ICOD17",
      Plan_Date: "23/02/2026 19:09",
    });
    setSelectedRake(null);
  };

  const handleRakeSelect = (rake) => {
    setSelectedRake(rake);
    setFormData((prev) => ({ ...prev, Rake_Name: rake }));
  };

  const terminalOptions = [
    "CCH",
    "ICOD",
    "PLHW",
    "PLPC",
    "CE",
    "FN",
    "DETR",
    "GDGH",
    "HYDE",
    "NDV",
    "SVMS",
    "DLIB",
    "BRC",
    "BCT",
    "NDLS",
    "MAS",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <span className="text-green-600">Home</span>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Rake Planning</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExit}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Form Section - LEFT SIDE */}
        <div className="flex-1 p-6 overflow-y-auto bg-white" style={{ maxHeight: "calc(100vh - 70px)" }}>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Rake Name */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Rake Name <span className="text-red-500">*</span>
              </label>
              <select
                name="Rake_Name"
                value={formData.Rake_Name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                {DUMMY_RAKES.map((rake) => (
                  <option key={rake} value={rake}>
                    {rake}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Depot */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Base Depot <span className="text-red-500">*</span>
              </label>
              <select
                name="Base_Depot"
                value={formData.Base_Depot}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                {terminalOptions.map((terminal) => (
                  <option key={terminal} value={terminal}>
                    {terminal}
                  </option>
                ))}
              </select>
            </div>

            {/* Rake Operator */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Rake Operator <span className="text-red-500">*</span>
              </label>
              <select
                name="Rake_Operator"
                value={formData.Rake_Operator}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>
                <option value="CONCOR">CONCOR</option>
                <option value="PRIVATE OPERATOR">PRIVATE OPERATOR</option>
              </select>
            </div>

            {/* Haulage Paid By */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Haulage Paid By <span className="text-red-500">*</span>
              </label>
              <select
                name="Haulage_Paid_By"
                value={formData.Haulage_Paid_By}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="Owner">Owner</option>
                <option value="Operator">Operator</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Trip No */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Trip No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Trip_No"
                value={formData.Trip_No}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter Trip No"
              />
            </div>

            {/* Sub Route */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sub Route</label>
              <select
                name="Sub_Route"
                value={formData.Sub_Route}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="Main Route">Main Route</option>
                <option value="Sub Route 1">Sub Route 1</option>
                <option value="Sub Route 2">Sub Route 2</option>
              </select>
            </div>

            {/* Journey Id */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Journey Id</label>
              <input
                type="text"
                name="Journey_Id"
                value={formData.Journey_Id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                readOnly
              />
            </div>

            {/* IB Train No */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">IB Train No</label>
              <input
                type="text"
                name="IB_Train_No"
                value={formData.IB_Train_No}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                readOnly
              />
            </div>

            {/* Rake Owner */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Rake Owner <span className="text-red-500">*</span>
              </label>
              <select
                name="Rake_Owner"
                value={formData.Rake_Owner}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>
                <option value="CONCOR">CONCOR</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </div>

            {/* Plan Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Plan Type <span className="text-red-500">*</span>
              </label>
              <select
                name="Plan_Type"
                value={formData.Plan_Type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="Back Loading">Back Loading</option>
                <option value="Forward Loading">Forward Loading</option>
                <option value="Empty Return">Empty Return</option>
              </select>
            </div>

            {/* Device ID */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Device ID <span className="text-red-500">*</span>
              </label>
              <select
                name="Device_ID"
                value={formData.Device_ID}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="Select">Select</option>
                <option value="Device-001">Device-001</option>
                <option value="Device-002">Device-002</option>
                <option value="Device-003">Device-003</option>
              </select>
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                name="Route"
                value={formData.Route}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                {DUMMY_ROUTES.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>

            {/* Train No */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Train No</label>
              <input
                type="text"
                name="Train_No"
                value={formData.Train_No}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                readOnly
              />
            </div>

            {/* Plan Date */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Plan Date</label>
              <input
                type="text"
                name="Plan_Date"
                value={formData.Plan_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Rake List Sidebar - RIGHT SIDE */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 70px)" }}>
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 py-4">
            <div className="text-center font-semibold mb-3 text-green-800">Rake List</div>
            <div className="px-3 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rakes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 placeholder-green-600 text-sm"
                />
              </div>
            </div>
            <div className="px-3">
              <button
                onClick={resetForm}
                className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Rake Plan
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {rakes
              .filter((rake) => rake.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((rake, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-200 transition-colors ${
                    selectedRake === rake
                      ? "bg-green-50 border-l-4 border-l-green-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="px-4 py-3 flex items-center justify-between cursor-pointer">
                    <div
                      onClick={() => handleRakeSelect(rake)}
                      className={`text-sm flex-1 ${
                        selectedRake === rake
                          ? "text-green-700 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {rake}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RakePlanning;