import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { examTypeAPI } from "../utils/Api";

const ExamTypeManagement = () => {
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExamType, setEditingExamType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    exam_name: "",
    validity_days: "",
    validity_km: "",
  });

  
  // Fetch all exam types
  const fetchExamTypes = async () => {
    setLoading(true);
    try {
      const data = await examTypeAPI.getAllExamTypes();
      
      if (data.success) {
        setExamTypes(data.data);
      } else {
        toast.error(data.message || "Failed to fetch exam types");
      }
    } catch (error) {
      console.error("Error fetching exam types:", error);
      toast.error("Failed to fetch exam types");
    } finally {
      setLoading(false);
    }
  };

  // Search exam types
  const searchExamTypes = async (term) => {
    if (!term.trim()) {
      fetchExamTypes();
      return;
    }

    setLoading(true);
    try {
      const data = await examTypeAPI.searchExamTypes(term);
      
      if (data.success) {
        setExamTypes(data.data);
      } else {
        toast.error(data.message || "Failed to search exam types");
      }
    } catch (error) {
      console.error("Error searching exam types:", error);
      toast.error("Failed to search exam types");
    } finally {
      setLoading(false);
    }
  };

  // Create or update exam type
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.exam_name.trim()) {
      toast.error("Exam name is required");
      return;
    }

    setLoading(true);
    try {
      const examData = {
        exam_name: formData.exam_name,
        validity_days: formData.validity_days ? parseInt(formData.validity_days) : null,
        validity_km: formData.validity_km ? parseInt(formData.validity_km) : null,
      };

      const data = editingExamType 
        ? await examTypeAPI.updateExamType(editingExamType.EXAM_ID, examData)
        : await examTypeAPI.createExamType(examData);
      
      if (data.success) {
        toast.success(
          editingExamType ? "Exam type updated successfully" : "Exam type created successfully"
        );
        setShowModal(false);
        resetForm();
        fetchExamTypes();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting exam type:", error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete exam type
  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam type?")) {
      return;
    }

    setLoading(true);
    try {
      const data = await examTypeAPI.deleteExamType(examId);
      
      if (data.success) {
        toast.success("Exam type deleted successfully");
        fetchExamTypes();
      } else {
        toast.error(data.message || "Failed to delete exam type");
      }
    } catch (error) {
      console.error("Error deleting exam type:", error);
      toast.error("Failed to delete exam type");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      exam_name: "",
      validity_days: "",
      validity_km: "",
    });
    setEditingExamType(null);
  };

  // Open modal for editing
  const handleEdit = (examType) => {
    setEditingExamType(examType);
    setFormData({
      exam_name: examType.EXAM_NAME,
      validity_days: examType.VALIDITY_DAYS || "",
      validity_km: examType.VALIDITY_KM || "",
    });
    setShowModal(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchExamTypes(term);
  };

  useEffect(() => {
    fetchExamTypes();
  }, []);

  return (
    <div className="p-6">
      <ToastContainer position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Exam Type Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search exam types..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Exam Type
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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity (Days)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity (KM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examTypes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No exam types found
                    </td>
                  </tr>
                ) : (
                  examTypes.map((examType) => (
                    <tr key={examType.EXAM_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {examType.EXAM_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {examType.EXAM_NAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {examType.VALIDITY_DAYS || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {examType.VALIDITY_KM || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(examType)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(examType.EXAM_ID)}
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

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingExamType ? "Edit Exam Type" : "Add New Exam Type"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={formData.exam_name}
                  onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Validity Days
                </label>
                <input
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Optional"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Validity KM
                </label>
                <input
                  type="number"
                  value={formData.validity_km}
                  onChange={(e) => setFormData({ ...formData, validity_km: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Optional"
                />
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
                  {loading ? "Saving..." : (editingExamType ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTypeManagement;
