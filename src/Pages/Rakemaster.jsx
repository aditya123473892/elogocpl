import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const DUMMY_RAKES = [
  { id: 1, Rake_Name: "RAKE-001", Owner: "INDIAN RAILWAY", Operator: "INDIAN RAILWAY", Rake_Composition: "27", Max: "27", Purchase_Date: "2020-01-15", Comm_Date: "2020-03-01", ROH_Months: "12", POH_Months: "24", Lease_From: "2020-03-01", Lease_To: "2025-03-01", Lease_Loc: "CCH", Handover_At: "CCH", Exam_Date: "2024-06-01", Balance_KM: "15000", Status: "Active", Base_Depot: "CCH", Break_Van: "BV-01", Change_BV: "" },
  { id: 2, Rake_Name: "RAKE-002", Owner: "CONCOR", Operator: "CONCOR", Rake_Composition: "27", Max: "27", Purchase_Date: "2019-05-20", Comm_Date: "2019-07-10", ROH_Months: "12", POH_Months: "24", Lease_From: "2019-07-10", Lease_To: "2024-07-10", Lease_Loc: "BRC", Handover_At: "BRC", Exam_Date: "2024-01-15", Balance_KM: "8000", Status: "Inactive", Base_Depot: "BRC", Break_Van: "BV-02", Change_BV: "BRC" },
  { id: 3, Rake_Name: "RAKE-003", Owner: "PRIVATE", Operator: "PRIVATE OPERATOR", Rake_Composition: "24", Max: "24", Purchase_Date: "2021-08-10", Comm_Date: "2021-10-05", ROH_Months: "18", POH_Months: "36", Lease_From: "2021-10-05", Lease_To: "2026-10-05", Lease_Loc: "NDLS", Handover_At: "NDLS", Exam_Date: "2024-09-20", Balance_KM: "22000", Status: "Active", Base_Depot: "NDLS", Break_Van: "BV-03", Change_BV: "" },
  { id: 4, Rake_Name: "RAKE-004", Owner: "INDIAN RAILWAY", Operator: "INDIAN RAILWAY", Rake_Composition: "30", Max: "30", Purchase_Date: "2018-11-30", Comm_Date: "2019-01-20", ROH_Months: "12", POH_Months: "24", Lease_From: "2019-01-20", Lease_To: "2024-01-20", Lease_Loc: "MAS", Handover_At: "MAS", Exam_Date: "2023-12-10", Balance_KM: "3500", Status: "Under Maintenance", Base_Depot: "MAS", Break_Van: "BV-04", Change_BV: "CCH" },
  { id: 5, Rake_Name: "RAKE-005", Owner: "CONCOR", Operator: "CONCOR", Rake_Composition: "27", Max: "27", Purchase_Date: "2022-03-18", Comm_Date: "2022-05-01", ROH_Months: "12", POH_Months: "24", Lease_From: "2022-05-01", Lease_To: "2027-05-01", Lease_Loc: "BCT", Handover_At: "BCT", Exam_Date: "2025-01-05", Balance_KM: "31000", Status: "Active", Base_Depot: "BCT", Break_Van: "BV-05", Change_BV: "" },
  { id: 6, Rake_Name: "NMG004", Owner: "INDIAN RAILWAY", Operator: "INDIAN RAILWAY", Rake_Composition: "27", Max: "27", Purchase_Date: "2021-01-10", Comm_Date: "2021-02-15", ROH_Months: "12", POH_Months: "24", Lease_From: "2021-02-15", Lease_To: "2026-02-15", Lease_Loc: "CCH", Handover_At: "CCH", Exam_Date: "2024-08-01", Balance_KM: "18000", Status: "Active", Base_Depot: "CCH", Break_Van: "BV-06", Change_BV: "" },
  { id: 7, Rake_Name: "TWIL02", Owner: "CONCOR", Operator: "CONCOR", Rake_Composition: "27", Max: "27", Purchase_Date: "2020-06-15", Comm_Date: "2020-08-01", ROH_Months: "12", POH_Months: "24", Lease_From: "2020-08-01", Lease_To: "2025-08-01", Lease_Loc: "BRC", Handover_At: "BRC", Exam_Date: "2024-05-20", Balance_KM: "12000", Status: "Active", Base_Depot: "BRC", Break_Van: "BV-07", Change_BV: "" },
  { id: 8, Rake_Name: "NMG49WJ-FN4", Owner: "INDIAN RAILWAY", Operator: "INDIAN RAILWAY", Rake_Composition: "27", Max: "27", Purchase_Date: "2021-03-22", Comm_Date: "2021-05-10", ROH_Months: "12", POH_Months: "24", Lease_From: "2021-05-10", Lease_To: "2026-05-10", Lease_Loc: "CCH", Handover_At: "CCH", Exam_Date: "2024-11-15", Balance_KM: "20000", Status: "Active", Base_Depot: "CCH", Break_Van: "BV-08", Change_BV: "" },
  { id: 9, Rake_Name: "NMG001", Owner: "CONCOR", Operator: "CONCOR", Rake_Composition: "27", Max: "27", Purchase_Date: "2019-12-01", Comm_Date: "2020-01-20", ROH_Months: "12", POH_Months: "24", Lease_From: "2020-01-20", Lease_To: "2025-01-20", Lease_Loc: "BRC", Handover_At: "BRC", Exam_Date: "2024-07-30", Balance_KM: "14000", Status: "Active", Base_Depot: "BRC", Break_Van: "BV-09", Change_BV: "" },
  { id: 10, Rake_Name: "NMG49WJ-FN5", Owner: "PRIVATE", Operator: "PRIVATE OPERATOR", Rake_Composition: "24", Max: "24", Purchase_Date: "2022-02-14", Comm_Date: "2022-04-01", ROH_Months: "18", POH_Months: "36", Lease_From: "2022-04-01", Lease_To: "2027-04-01", Lease_Loc: "NDLS", Handover_At: "NDLS", Exam_Date: "2025-02-10", Balance_KM: "25000", Status: "Active", Base_Depot: "NDLS", Break_Van: "BV-10", Change_BV: "" },
];

const RakeMaster = () => {
  const [rakes, setRakes] = useState(DUMMY_RAKES);
  const [filteredRakes, setFilteredRakes] = useState(DUMMY_RAKES);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRake, setEditingRake] = useState(null);
  const [selectedRake, setSelectedRake] = useState(null);
  const [formData, setFormData] = useState({
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
    Break_Van: "",
    Change_BV: "",
  });
  const [wagons, setWagons] = useState(
    Array.from({ length: 27 }, (_, i) => ({
      wagon_no: String(i + 1),
      load_capacity: "10",
    }))
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const filtered = rakes.filter(
      (rake) =>
        rake.Rake_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rake.Owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rake.Status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRakes(filtered);
  }, [searchTerm, rakes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleWagonChange = (index, field, value) => {
    setWagons((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Rake_Name?.toString().trim()) newErrors.Rake_Name = "Required";
    if (!formData.Rake_Composition?.toString().trim()) newErrors.Rake_Composition = "Required";
    if (!formData.Max?.toString().trim()) newErrors.Max = "Required";
    if (!formData.Purchase_Date) newErrors.Purchase_Date = "Required";
    if (!formData.Comm_Date) newErrors.Comm_Date = "Required";
    if (!formData.ROH_Months?.toString().trim()) newErrors.ROH_Months = "Required";
    if (!formData.POH_Months?.toString().trim()) newErrors.POH_Months = "Required";
    if (!formData.Lease_From) newErrors.Lease_From = "Required";
    if (!formData.Lease_To) newErrors.Lease_To = "Required";
    if (!formData.Exam_Date) newErrors.Exam_Date = "Required";
    if (!formData.Balance_KM?.toString().trim()) newErrors.Balance_KM = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const payload = { ...formData, wagons };
    if (editingRake) {
      setRakes((prev) => prev.map((r) => (r.id === editingRake.id ? { ...r, ...payload } : r)));
    } else {
      const newRake = { ...payload, id: Date.now() };
      setRakes((prev) => [...prev, newRake]);
    }
    handleCancel();
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleExit = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({
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
      Break_Van: "",
      Change_BV: "",
    });
    setWagons(
      Array.from({ length: 27 }, (_, i) => ({
        wagon_no: String(i + 1),
        load_capacity: "10",
      }))
    );
    setErrors({});
    setEditingRake(null);
    setSelectedRake(null);
  };

  const handleEdit = (rake) => {
    setEditingRake(rake);
    setFormData({ ...rake });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this rake?")) {
      setRakes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleRakeSelect = (rake) => {
    setSelectedRake(rake);
    setFormData({ ...rake });
  };

  const locationOptions = ["CCH", "BRC", "BCT", "NDLS", "MAS"];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <span className="text-green-600">Home</span>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900">Rake Master</span>
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
        <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Rake Name */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Rake Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Rake_Name"
                value={formData.Rake_Name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Owner</label>
              <select
                name="Owner"
                value={formData.Owner}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>
                <option value="PRIVATE">PRIVATE</option>
                <option value="CONCOR">CONCOR</option>
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Operator</label>
              <select
                name="Operator"
                value={formData.Operator}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>
                <option value="PRIVATE OPERATOR">PRIVATE OPERATOR</option>
                <option value="CONCOR">CONCOR</option>
              </select>
            </div>

            {/* Rake Composition */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Rake Composition <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Rake_Composition"
                value={formData.Rake_Composition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Max */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Max <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Max"
                value={formData.Max}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="Purchase_Date"
                value={formData.Purchase_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Comm. Date */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Comm. Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="Comm_Date"
                value={formData.Comm_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* ROH (Months) */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                ROH (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ROH_Months"
                value={formData.ROH_Months}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* POH (Months) */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                POH (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="POH_Months"
                value={formData.POH_Months}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Lease From */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Lease From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="Lease_From"
                value={formData.Lease_From}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Lease To */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Lease To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="Lease_To"
                value={formData.Lease_To}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Lease Loc */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Lease Loc <span className="text-red-500">*</span>
              </label>
              <select
                name="Lease_Loc"
                value={formData.Lease_Loc}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* Handover At */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Handover At <span className="text-red-500">*</span>
              </label>
              <select
                name="Handover_At"
                value={formData.Handover_At}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="Exam_Date"
                value={formData.Exam_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Balance KM */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Balance KM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Balance_KM"
                value={formData.Balance_KM}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>

            {/* Base Depot */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Base Depot</label>
              <select
                name="Base_Depot"
                value={formData.Base_Depot}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* Break Van */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Break Van</label>
              <input
                type="text"
                name="Break_Van"
                value={formData.Break_Van}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                disabled
              />
            </div>

            {/* Change BV */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Change BV</label>
              <select
                name="Change_BV"
                value={formData.Change_BV}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              >
                <option value="">-- Select --</option>
                {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          {/* Wagon Table */}
          <div className="mt-6">
            <div className="border border-gray-300 rounded overflow-hidden" style={{ maxWidth: '600px' }}>
              <div className="grid grid-cols-2 bg-gray-700 text-white">
                <div className="px-4 py-2 text-sm font-medium border-r border-gray-600">Wagon No</div>
                <div className="px-4 py-2 text-sm font-medium">Load Capacity</div>
              </div>
              <div className="overflow-y-auto bg-white" style={{ maxHeight: "300px" }}>
                {wagons.map((wagon, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="px-2 py-1 border-r border-gray-200">
                      <input
                        type="text"
                        value={wagon.wagon_no}
                        onChange={(e) => handleWagonChange(index, "wagon_no", e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none text-sm"
                      />
                    </div>
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={wagon.load_capacity}
                        onChange={(e) => handleWagonChange(index, "load_capacity", e.target.value)}
                        className="w-full px-2 py-1 border-0 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rake List Sidebar - RIGHT SIDE */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 70px)' }}>
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
                New Rake
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {filteredRakes.map((rake) => (
              <div
                key={rake.id}
                className={`border-b border-gray-200 transition-colors ${
                  selectedRake?.id === rake.id
                    ? "bg-green-50 border-l-4 border-l-green-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div 
                  className="px-4 py-3 flex items-center justify-between cursor-pointer"
                >
                  <div 
                    onClick={() => handleRakeSelect(rake)}
                    className={`text-sm flex-1 ${selectedRake?.id === rake.id ? "text-green-700 font-semibold" : "text-gray-700"}`}
                  >
                    {rake.Rake_Name} - {rake.Status}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(rake.id);
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

export default RakeMaster;