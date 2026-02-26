import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2 } from "lucide-react";

const DUMMY_ROUTES = [
  { id: 1, From_Terminal: "CCH", To_Terminal: "ICOD", Route_Type: "GENERAL", Billable_Distance: "1409", Actual_Distance: "1409", Route_Name: "CCH-ICOD", Train_No_Prefix: "CCH-ICOD", Begining_Number: "0", AverageTime: "25", sub_routes: [] },
  { id: 2, From_Terminal: "CCH", To_Terminal: "PLHW", Route_Type: "GENERAL", Billable_Distance: "1200", Actual_Distance: "1200", Route_Name: "CCH-PLHW", Train_No_Prefix: "CCH-PLHW", Begining_Number: "0", AverageTime: "22", sub_routes: [] },
  { id: 3, From_Terminal: "CCH", To_Terminal: "PLPC", Route_Type: "GENERAL", Billable_Distance: "980", Actual_Distance: "980", Route_Name: "CCH-PLPC", Train_No_Prefix: "CCH-PLPC", Begining_Number: "0", AverageTime: "18", sub_routes: [] },
  { id: 4, From_Terminal: "CE", To_Terminal: "FN", Route_Type: "GENERAL", Billable_Distance: "850", Actual_Distance: "850", Route_Name: "CE-FN", Train_No_Prefix: "CE-FN", Begining_Number: "0", AverageTime: "16", sub_routes: [] },
  { id: 5, From_Terminal: "CE", To_Terminal: "ICOD", Route_Type: "GENERAL", Billable_Distance: "1150", Actual_Distance: "1150", Route_Name: "CE-ICOD", Train_No_Prefix: "CE-ICOD", Begining_Number: "0", AverageTime: "20", sub_routes: [] },
  { id: 6, From_Terminal: "CE", To_Terminal: "PLHW", Route_Type: "GENERAL", Billable_Distance: "1050", Actual_Distance: "1050", Route_Name: "CE-PLHW", Train_No_Prefix: "CE-PLHW", Begining_Number: "0", AverageTime: "19", sub_routes: [] },
  { id: 7, From_Terminal: "DETR", To_Terminal: "FN", Route_Type: "GENERAL", Billable_Distance: "720", Actual_Distance: "720", Route_Name: "DETR-FN", Train_No_Prefix: "DETR-FN", Begining_Number: "0", AverageTime: "14", sub_routes: [] },
  { id: 8, From_Terminal: "DETR", To_Terminal: "GDGH", Route_Type: "GENERAL", Billable_Distance: "890", Actual_Distance: "890", Route_Name: "DETR-GDGH", Train_No_Prefix: "DETR-GDGH", Begining_Number: "0", AverageTime: "17", sub_routes: [] },
  { id: 9, From_Terminal: "DETR", To_Terminal: "HYDE", Route_Type: "GENERAL", Billable_Distance: "950", Actual_Distance: "950", Route_Name: "DETR-HYDE", Train_No_Prefix: "DETR-HYDE", Begining_Number: "0", AverageTime: "18", sub_routes: [] },
  { id: 10, From_Terminal: "DETR", To_Terminal: "NDV", Route_Type: "GENERAL", Billable_Distance: "1100", Actual_Distance: "1100", Route_Name: "DETR-NDV", Train_No_Prefix: "DETR-NDV", Begining_Number: "0", AverageTime: "21", sub_routes: [] },
  { id: 11, From_Terminal: "DETR", To_Terminal: "SVMS", Route_Type: "GENERAL", Billable_Distance: "820", Actual_Distance: "820", Route_Name: "DETR-SVMS", Train_No_Prefix: "DETR-SVMS", Begining_Number: "0", AverageTime: "15", sub_routes: [] },
  { id: 12, From_Terminal: "DLIB", To_Terminal: "FN", Route_Type: "GENERAL", Billable_Distance: "680", Actual_Distance: "680", Route_Name: "DLIB-FN", Train_No_Prefix: "DLIB-FN", Begining_Number: "0", AverageTime: "13", sub_routes: [] },
  { id: 13, From_Terminal: "FN", To_Terminal: "DETR", Route_Type: "GENERAL", Billable_Distance: "720", Actual_Distance: "720", Route_Name: "FN-DETR", Train_No_Prefix: "FN-DETR", Begining_Number: "0", AverageTime: "14", sub_routes: [] },
];

const RouteMaster = () => {
  const [routes, setRoutes] = useState(DUMMY_ROUTES);
  const [filteredRoutes, setFilteredRoutes] = useState(DUMMY_ROUTES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    From_Terminal: "CCH",
    To_Terminal: "CCH",
    Route_Type: "GENERAL",
    Billable_Distance: "",
    Actual_Distance: "",
    Route_Name: "",
    Train_No_Prefix: "",
    Begining_Number: "0",
    AverageTime: "",
  });
  const [subRoutes, setSubRoutes] = useState(["", "", "", ""]);

  useEffect(() => {
    const filtered = routes.filter(
      (route) =>
        route.Route_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.From_Terminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.To_Terminal.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoutes(filtered);
  }, [searchTerm, routes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubRouteChange = (index, value) => {
    setSubRoutes((prev) =>
      prev.map((route, i) => (i === index ? value : route))
    );
  };

  const handleSave = () => {
    const payload = { ...formData, sub_routes: subRoutes.filter(Boolean) };
    if (selectedRoute) {
      setRoutes((prev) =>
        prev.map((r) => (r.id === selectedRoute.id ? { ...r, ...payload } : r))
      );
    } else {
      const newRoute = { ...payload, id: Date.now() };
      setRoutes((prev) => [...prev, newRoute]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      From_Terminal: "CCH",
      To_Terminal: "CCH",
      Route_Type: "GENERAL",
      Billable_Distance: "",
      Actual_Distance: "",
      Route_Name: "",
      Train_No_Prefix: "",
      Begining_Number: "0",
      AverageTime: "",
    });
    setSubRoutes(["", "", "", ""]);
    setSelectedRoute(null);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setFormData({ ...route });
    const subRoutesArray = route.sub_routes || [];
    setSubRoutes([
      subRoutesArray[0] || "",
      subRoutesArray[1] || "",
      subRoutesArray[2] || "",
      subRoutesArray[3] || "",
    ]);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      if (selectedRoute?.id === id) {
        resetForm();
      }
    }
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
            <span className="text-gray-600">Home</span>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Route Master</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {}}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-white0 text-white rounded hover:bg-gray-600 transition-colors font-medium"
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
          {/* Main Form Fields */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* From Terminal */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">From Terminal</label>
              <select
                name="From_Terminal"
                value={formData.From_Terminal}
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

            {/* To Terminal */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">To Terminal</label>
              <select
                name="To_Terminal"
                value={formData.To_Terminal}
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

            {/* Route Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Route Type</label>
              <select
                name="Route_Type"
                value={formData.Route_Type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="EXPRESS">EXPRESS</option>
                <option value="SPECIAL">SPECIAL</option>
              </select>
            </div>

            {/* Billable Distance */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Billable Distance <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Billable_Distance"
                value={formData.Billable_Distance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                placeholder="1409"
              />
            </div>

            {/* Actual Distance */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Actual Distance <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Actual_Distance"
                value={formData.Actual_Distance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                placeholder="1409"
              />
            </div>

            {/* Route Name */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Route Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Route_Name"
                value={formData.Route_Name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                placeholder="CCH-ICOD"
              />
            </div>

            {/* Train No. Prefix */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Train No. Prefix <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Train_No_Prefix"
                value={formData.Train_No_Prefix}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                placeholder="CCH-ICOD"
              />
            </div>

            {/* Begining Number */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Begining Number</label>
              <input
                type="text"
                name="Begining_Number"
                value={formData.Begining_Number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                placeholder="0"
              />
            </div>

            {/* Average Time */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">AverageTime (Hours)</label>
              <input
                type="text"
                name="AverageTime"
                value={formData.AverageTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                placeholder="25"
              />
            </div>

            {/* Connect to RBS Button */}
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium">
                Connect to RBS
              </button>
            </div>
          </div>

          {/* Sub Route Mapping Section */}
          <div className="mt-8">
            <div className="bg-green-600 text-white text-center py-3 font-medium rounded-t">
              Sub Route Mapping
            </div>
            <div className="bg-white border border-gray-300 rounded-b p-4">
              <div className="space-y-3">
                {subRoutes.map((route, index) => (
                  <select
                    key={index}
                    value={route}
                    onChange={(e) => handleSubRouteChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                  >
                    <option value="">----Select----</option>
                    {filteredRoutes.map((r) => (
                      <option key={r.id} value={r.Route_Name}>
                        {r.Route_Name}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Route List Sidebar - RIGHT SIDE */}
        <div
          className="w-80 bg-white border-l border-gray-200 overflow-hidden flex flex-col"
          style={{ maxHeight: "calc(100vh - 70px)" }}
        >
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 py-4">
            <div className="text-center font-semibold mb-3 text-green-800">Route List</div>
            <div className="px-3 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search routes..."
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
                New Route
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className={`border-b border-gray-200 transition-colors ${
                  selectedRoute?.id === route.id
                    ? "bg-green-50 border-l-4 border-l-green-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="px-4 py-3 flex items-center justify-between cursor-pointer">
                  <div
                    onClick={() => handleRouteSelect(route)}
                    className={`text-sm flex-1 ${
                      selectedRoute?.id === route.id
                        ? "text-green-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {route.Route_Name}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(route.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors ml-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMaster;