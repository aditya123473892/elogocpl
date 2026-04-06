import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { rakeExamAPI, examTypeAPI, equipmentAPI } from "../utils/Api";

const RakeExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rake_id: "",
    exam_id: "",
    visit_id: ""
  });

  const [formData, setFormData] = useState({
    rake_id: "",
    exam_id: "",
    arrival_date: "",
    memo_date: "",
    exam_start_date: "",
    exam_end_date: "",
    remarks: "",
    txr_type: "",
    exam_terminal: "",
    created_by: "admin",
    visit_id: "",
    bpc_no: "",
    exam_flag: "",
    bpc_date: "",
    exam_details: []
  });

  // Fetch all exams
  const fetchExams = async () => {
    setLoading(true);
    try {
      console.log("Fetching exams...");
      const activeFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          activeFilters[key] = filters[key];
        }
      });
      
      const data = await rakeExamAPI.getAllExams(activeFilters);
      console.log("API response:", data);
      
      if (data.success) {
        console.log("Setting exams data:", data.data);
        setAllExams(data.data);
        setExams(data.data);
      } else {
        console.error("API error:", data.message);
        toast.error(data.message || "Failed to fetch exams");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam types
  const fetchExamTypes = async () => {
    try {
      const data = await examTypeAPI.getAllExamTypes();
      if (data.success) {
        setExamTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching exam types:", error);
    }
  };

  // Fetch equipment
  const fetchEquipment = async () => {
    try {
      const data = await equipmentAPI.getAllEquipment();
      if (data.success) {
        setEquipment(data.data);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  // Create or update exam
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rake_id || !formData.exam_id) {
      toast.error("RAKE ID and Exam Type are required");
      return;
    }

    // Validate exam details
    if (formData.exam_details.length === 0) {
      toast.error("At least one equipment detail is required");
      return;
    }

    for (const detail of formData.exam_details) {
      if (!detail.equipment_id || !detail.total_unit) {
        toast.error("Equipment ID and Total Unit are required for each detail");
        return;
      }
      if (isNaN(detail.total_unit) || detail.total_unit <= 0) {
        toast.error("Total Unit must be a positive number");
        return;
      }
    }

    setLoading(true);
    try {
      const examData = {
        ...formData,
        rake_id: parseInt(formData.rake_id),
        exam_id: parseInt(formData.exam_id),
        exam_terminal: formData.exam_terminal ? parseInt(formData.exam_terminal) : null,
        visit_id: formData.visit_id ? parseInt(formData.visit_id) : null,
        exam_details: formData.exam_details.map(detail => ({
          ...detail,
          equipment_id: parseInt(detail.equipment_id),
          total_unit: parseInt(detail.total_unit),
          unit_ref_id: detail.unit_ref_id ? parseInt(detail.unit_ref_id) : null
        }))
      };

      const data = editingExam 
        ? await rakeExamAPI.updateExam(editingExam.EXAM_NO, examData)
        : await rakeExamAPI.createExam(examData);
      
      if (data.success) {
        toast.success(
          editingExam ? "Exam updated successfully" : "Exam created successfully"
        );
        setShowModal(false);
        resetForm();
        fetchExams();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete exam
  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This will also delete all associated equipment details.")) {
      return;
    }

    setLoading(true);
    try {
      const data = await rakeExamAPI.deleteExam(examId);
      
      if (data.success) {
        toast.success("Exam deleted successfully");
        fetchExams();
      } else {
        toast.error(data.message || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    } finally {
      setLoading(false);
    }
  };

  // View exam details
  const handleViewDetails = async (exam) => {
    try {
      const data = await rakeExamAPI.getExamById(exam.EXAM_NO);
      if (data.success) {
        setViewingExam(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching exam details:", error);
      toast.error("Failed to fetch exam details");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      rake_id: "",
      exam_id: "",
      arrival_date: "",
      memo_date: "",
      exam_start_date: "",
      exam_end_date: "",
      remarks: "",
      txr_type: "",
      exam_terminal: "",
      created_by: "admin",
      visit_id: "",
      bpc_no: "",
      exam_flag: "",
      bpc_date: "",
      exam_details: []
    });
    setEditingExam(null);
  };

  // Open modal for editing
  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      rake_id: exam.RAKE_ID || "",
      exam_id: exam.EXAM_ID || "",
      arrival_date: exam.ARRIVAL_DATE ? exam.ARRIVAL_DATE.split('T')[0] : "",
      memo_date: exam.MEMO_DATE ? exam.MEMO_DATE.split('T')[0] : "",
      exam_start_date: exam.EXAM_START_DATE ? exam.EXAM_START_DATE.split('T')[0] : "",
      exam_end_date: exam.EXAM_END_DATE ? exam.EXAM_END_DATE.split('T')[0] : "",
      remarks: exam.REMARKS || "",
      txr_type: exam.TXR_TYPE || "",
      exam_terminal: exam.EXAM_TERMINAL || "",
      created_by: exam.CREATED_BY || "admin",
      visit_id: exam.VISIT_ID || "",
      bpc_no: exam.BPC_NO || "",
      exam_flag: exam.EXAM_FLAG || "",
      bpc_date: exam.BPC_DATE ? exam.BPC_DATE.split('T')[0] : "",
      exam_details: exam.exam_details || []
    });
    setShowModal(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Add equipment detail
  const addEquipmentDetail = () => {
    setFormData({
      ...formData,
      exam_details: [
        ...formData.exam_details,
        { equipment_id: "", total_unit: "", unit_ref_id: "" }
      ]
    });
  };

  // Update equipment detail
  const updateEquipmentDetail = (index, field, value) => {
    const updatedDetails = [...formData.exam_details];
    updatedDetails[index][field] = value;
    setFormData({ ...formData, exam_details: updatedDetails });
  };

  // Remove equipment detail
  const removeEquipmentDetail = (index) => {
    const updatedDetails = formData.exam_details.filter((_, i) => i !== index);
    setFormData({ ...formData, exam_details: updatedDetails });
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  // Apply filters
  const applyFilters = () => {
    fetchExams();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      rake_id: "",
      exam_id: "",
      visit_id: ""
    });
    setSearchTerm("");
  };

  useEffect(() => {
    fetchExams();
    fetchExamTypes();
    fetchEquipment();
  }, [fetchExamTypes, fetchEquipment]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allExams.filter(exam => 
        exam.EXAM_NO?.toString().includes(searchTerm) ||
        exam.RAKE_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.EXAM_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.REMARKS?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setExams(filtered);
    } else {
      setExams(allExams);
    }
  }, [searchTerm, allExams]);

  return (
    <div className="p-6">
      <ToastContainer position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Rake Exam Management</h1>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="number"
            placeholder="Rake ID"
            value={filters.rake_id}
            onChange={(e) => handleFilterChange('rake_id', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.exam_id}
            onChange={(e) => handleFilterChange('exam_id', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Exam Types</option>
            {examTypes.map(type => (
              <option key={type.EXAM_ID} value={type.EXAM_ID}>{type.EXAM_NAME}</option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Visit ID"
            value={filters.visit_id}
            onChange={(e) => handleFilterChange('visit_id', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Apply Filters
          </button>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
          
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Exam
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rake ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment Count
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
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No exams found
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam.EXAM_NO} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exam.EXAM_NO}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.RAKE_ID} {exam.RAKE_NO && `(${exam.RAKE_NO})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.EXAM_NAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.ARRIVAL_DATE ? new Date(exam.ARRIVAL_DATE).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.EXAM_START_DATE && exam.EXAM_END_DATE ? 
                          `${new Date(exam.EXAM_START_DATE).toLocaleDateString()} - ${new Date(exam.EXAM_END_DATE).toLocaleDateString()}` 
                          : "-"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.exam_details ? exam.exam_details.length : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exam.EXAM_FLAG === 'A' ? 'bg-green-100 text-green-800' : 
                          exam.EXAM_FLAG === 'P' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exam.EXAM_FLAG === 'A' ? 'Active' : 
                           exam.EXAM_FLAG === 'P' ? 'Pending' : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(exam)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(exam)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exam.EXAM_NO)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingExam ? "Edit Exam" : "Create New Exam"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rake ID *
                  </label>
                  <input
                    type="number"
                    value={formData.rake_id}
                    onChange={(e) => setFormData({ ...formData, rake_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Exam Type *
                  </label>
                  <select
                    value={formData.exam_id}
                    onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map(type => (
                      <option key={type.EXAM_ID} value={type.EXAM_ID}>{type.EXAM_NAME}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Memo Date
                  </label>
                  <input
                    type="date"
                    value={formData.memo_date}
                    onChange={(e) => setFormData({ ...formData, memo_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Exam Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.exam_start_date}
                    onChange={(e) => setFormData({ ...formData, exam_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Exam End Date
                  </label>
                  <input
                    type="date"
                    value={formData.exam_end_date}
                    onChange={(e) => setFormData({ ...formData, exam_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Visit ID
                  </label>
                  <input
                    type="number"
                    value={formData.visit_id}
                    onChange={(e) => setFormData({ ...formData, visit_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Exam Terminal
                  </label>
                  <input
                    type="number"
                    value={formData.exam_terminal}
                    onChange={(e) => setFormData({ ...formData, exam_terminal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    BPC No
                  </label>
                  <input
                    type="text"
                    value={formData.bpc_no}
                    onChange={(e) => setFormData({ ...formData, bpc_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    BPC Date
                  </label>
                  <input
                    type="date"
                    value={formData.bpc_date}
                    onChange={(e) => setFormData({ ...formData, bpc_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    TXR Type
                  </label>
                  <select
                    value={formData.txr_type}
                    onChange={(e) => setFormData({ ...formData, txr_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="A">Type A</option>
                    <option value="B">Type B</option>
                    <option value="C">Type C</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Exam Flag
                  </label>
                  <select
                    value={formData.exam_flag}
                    onChange={(e) => setFormData({ ...formData, exam_flag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Flag</option>
                    <option value="A">Active</option>
                    <option value="P">Pending</option>
                    <option value="C">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              {/* Equipment Details Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Equipment Details</h3>
                  <button
                    type="button"
                    onClick={addEquipmentDetail}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Equipment
                  </button>
                </div>
                
                {formData.exam_details.map((detail, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Equipment *
                        </label>
                        <select
                          value={detail.equipment_id}
                          onChange={(e) => updateEquipmentDetail(index, 'equipment_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Equipment</option>
                          {equipment.map(eq => (
                            <option key={eq.EQUIPMENT_ID} value={eq.EQUIPMENT_ID}>
                              {eq.EQUIPMENT_NO}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Total Units *
                        </label>
                        <input
                          type="number"
                          value={detail.total_unit}
                          onChange={(e) => updateEquipmentDetail(index, 'total_unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Unit Ref ID
                        </label>
                        <input
                          type="number"
                          value={detail.unit_ref_id}
                          onChange={(e) => updateEquipmentDetail(index, 'unit_ref_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeEquipmentDetail(index)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.exam_details.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No equipment details added. Click "Add Equipment" to add equipment.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : (editingExam ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && viewingExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Exam Details - #{viewingExam.EXAM_NO}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <p><strong>Exam No:</strong> {viewingExam.EXAM_NO}</p>
                <p><strong>Rake ID:</strong> {viewingExam.RAKE_ID} {viewingExam.RAKE_NO && `(${viewingExam.RAKE_NO})`}</p>
                <p><strong>Exam Type:</strong> {viewingExam.EXAM_NAME}</p>
                <p><strong>Visit ID:</strong> {viewingExam.VISIT_ID || '-'}</p>
                <p><strong>Visit No:</strong> {viewingExam.VISIT_NO || '-'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Dates & Schedule</h3>
                <p><strong>Arrival Date:</strong> {viewingExam.ARRIVAL_DATE ? new Date(viewingExam.ARRIVAL_DATE).toLocaleDateString() : '-'}</p>
                <p><strong>Memo Date:</strong> {viewingExam.MEMO_DATE ? new Date(viewingExam.MEMO_DATE).toLocaleDateString() : '-'}</p>
                <p><strong>Exam Start:</strong> {viewingExam.EXAM_START_DATE ? new Date(viewingExam.EXAM_START_DATE).toLocaleDateString() : '-'}</p>
                <p><strong>Exam End:</strong> {viewingExam.EXAM_END_DATE ? new Date(viewingExam.EXAM_END_DATE).toLocaleDateString() : '-'}</p>
                <p><strong>Created On:</strong> {viewingExam.CREATED_ON ? new Date(viewingExam.CREATED_ON).toLocaleDateString() : '-'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Additional Details</h3>
                <p><strong>BPC No:</strong> {viewingExam.BPC_NO || '-'}</p>
                <p><strong>BPC Date:</strong> {viewingExam.BPC_DATE ? new Date(viewingExam.BPC_DATE).toLocaleDateString() : '-'}</p>
                <p><strong>Exam Terminal:</strong> {viewingExam.EXAM_TERMINAL || '-'}</p>
                <p><strong>TXR Type:</strong> {viewingExam.TXR_TYPE || '-'}</p>
                <p><strong>Exam Flag:</strong> {viewingExam.EXAM_FLAG || '-'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">System Information</h3>
                <p><strong>Created By:</strong> {viewingExam.CREATED_BY || '-'}</p>
                <p><strong>Remarks:</strong> {viewingExam.REMARKS || '-'}</p>
              </div>
            </div>
            
            {/* Equipment Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Equipment Details</h3>
              {viewingExam.exam_details && viewingExam.exam_details.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Units
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Ref ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingExam.exam_details.map((detail, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.EQUIPMENT_NAME}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.EQUIPMENT_CODE}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.TOTAL_UNIT}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {detail.UNIT_REF_ID || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No equipment details found for this exam.
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RakeExamManagement;
