import React, { useState, useEffect } from "react";

import { Search, Plus, Edit, Trash2, Train, X, Check } from "lucide-react";

import { rakePlanningAPI, rakeMasterAPI, routeMasterAPI, terminalMasterAPI, rakeVisitAPI } from "../utils/Api";
import { useAuth } from "../contexts/AuthContext";




const DEFAULT_FORM = {

  Rake_Name: "",

  Base_Depot: "",

  Rake_Operator: "INDIAN RAILWAY",

  Haulage_Paid_By: "Owner",

  Trip_No: "",

  Sub_Route: "Main Route",

  Journey_Id: "",

  IB_Train_No: "",

  Rake_Owner: "INDIAN RAILWAY",

  Plan_Type: "Back Loading",

  Device_ID: "Select",

  Route: "",

  Train_No: "",

  Plan_Date: "",

};



const RakePlanning = () => {

  const { user, selectedLocation } = useAuth(); // Get logged-in user info and selected location

  const [rakePlans, setRakePlans] = useState([]);
  const [availableRakes, setAvailableRakes] = useState([]);
  const [arrivedRakes, setArrivedRakes] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [availableTerminals, setAvailableTerminals] = useState([]);

  const [filteredPlans, setFilteredPlans] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM);

  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchRakePlans = async () => {
    try {
      setLoading(true);
      const [plansData, visitsData] = await Promise.all([
        rakePlanningAPI.getAllRakePlans(),
        rakeVisitAPI.getAllRakeVisits(),
      ]);

      if (plansData.success) {
        const allPlans = plansData.data || [];
        let filteredPlans = allPlans;

        if (visitsData.success && visitsData.data && visitsData.data.length > 0) {
          const arrivedTrainNos = new Set(
            visitsData.data
              .filter((visit) => visit.ARRVAL_DATE)
              .map((visit) => (visit.IB_TRAIN_NO || visit.OB_TRAIN_NO)?.trim())
              .filter((trainNo) => trainNo)
          );

          const arrivedTripNos = new Set(
            visitsData.data
              .filter((visit) => visit.ARRVAL_DATE)
              .map((visit) => visit.TRIP_NO?.trim())
              .filter((tripNo) => tripNo)
          );

          setArrivedRakes(visitsData.data.filter((visit) => visit.ARRVAL_DATE));

          // Filter by logged-in terminal (Base_Depot) and arrival status
          filteredPlans = allPlans.filter((plan) => {
            const trainNoMatch = plan.Train_No && arrivedTrainNos.has(plan.Train_No.trim());
            const tripNoMatch = plan.Trip_No && arrivedTripNos.has(plan.Trip_No.trim());

            const shouldShow = trainNoMatch || tripNoMatch;
            
            // Filter by logged-in terminal - only show plans where Base_Depot matches selectedLocation
            const terminalMatch = selectedLocation && plan.Base_Depot === selectedLocation;

            return shouldShow && terminalMatch;
          });
        } else {
          // No visits data, but still filter by logged-in terminal
          filteredPlans = allPlans.filter(plan => {
            // Filter by logged-in terminal - only show plans where Base_Depot matches selectedLocation
            const terminalMatch = selectedLocation && plan.Base_Depot === selectedLocation;
            return terminalMatch;
          });
          setArrivedRakes([]);
        }

        setRakePlans(filteredPlans);
      } else {
        setMessage({ type: "error", text: plansData.message || "Failed to fetch rake plans" });
      }
    } catch (error) {
      console.error("Error fetching rake plans:", error);
      setMessage({ type: "error", text: "Failed to fetch rake plans" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRakes = async () => {
    try {
      const data = await rakeMasterAPI.getAllRakes();
      if (data.success) {
        setAvailableRakes(data.data);
      }
    } catch (error) {
      console.error("Error fetching rakes:", error);
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      const data = await routeMasterAPI.getAllRoutes();
      if (data.success) {
        setAvailableRoutes(data.data);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const fetchAvailableTerminals = async () => {
    try {
      const data = await terminalMasterAPI.getTerminalCodes();
      if (data.success) {
        // Show all terminals from API without hardcoded filtering
        setAvailableTerminals(data.data);
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  const getRakesWithArrival = () => {
    if (arrivedRakes.length === 0 || availableRakes.length === 0) {
      return [];
    }

    const arrivedTrainNos = new Set(
      arrivedRakes
        .map((visit) => (visit.IB_TRAIN_NO || visit.OB_TRAIN_NO)?.trim())
        .filter((trainNo) => trainNo)
    );

    return availableRakes.filter((rake) => {
      return arrivedTrainNos.has(rake.Rake_Name?.trim()) ||
        arrivedRakes.some((visit) =>
          (visit.IB_TRAIN_NO || visit.OB_TRAIN_NO)?.trim() === rake.Rake_Name?.trim()
        );
    });
  };

  useEffect(() => {
    fetchRakePlans();
    fetchAvailableRakes();
    fetchAvailableRoutes();
    fetchAvailableTerminals();
  }, [selectedLocation]); // Re-fetch when selectedLocation changes

  useEffect(() => {
    const filtered = rakePlans.filter(
      (plan) =>
        plan.Rake_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.Route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.Plan_Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.Trip_No && plan.Trip_No.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredPlans(filtered);
  }, [searchTerm, rakePlans]);



  useEffect(() => {
    setFilteredPlans(rakePlans);
  }, [rakePlans]);



  const validateForm = () => {
    const newErrors = {};

    if (!formData.Rake_Name) newErrors.Rake_Name = "Rake name is required";

    if (!formData.Base_Depot) newErrors.Base_Depot = "Base depot is required";

    if (!formData.Rake_Operator) newErrors.Rake_Operator = "Rake operator is required";

    if (!formData.Haulage_Paid_By) newErrors.Haulage_Paid_By = "Haulage paid by is required";

    if (!formData.Trip_No.trim()) newErrors.Trip_No = "Trip number is required";

    if (!formData.Route) newErrors.Route = "Route is required";

    if (!formData.Plan_Type) newErrors.Plan_Type = "Plan type is required";

    if (!formData.Device_ID || formData.Device_ID === "Select") newErrors.Device_ID = "Device ID is required";

    if (!formData.Rake_Owner) newErrors.Rake_Owner = "Rake owner is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let data;
      if (editingPlan) {
        data = await rakePlanningAPI.updateRakePlan(editingPlan.PlanId, formData);
      } else {
        data = await rakePlanningAPI.createRakePlan(formData);
      }
      
      if (data.success) {
        setMessage({ 
          type: "success", 
          text: editingPlan ? "Rake plan updated successfully" : "Rake plan created successfully" 
        });
        fetchRakePlans();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save rake plan" });
      }
    } catch (error) {
      console.error("Error saving rake plan:", error);
      setMessage({ type: "error", text: "Failed to save rake plan" });
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setShowModal(true);
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rake plan?")) return;
    
    try {
      const data = await rakePlanningAPI.deleteRakePlan(id);
      
      if (data.success) {
        setMessage({ type: "success", text: "Rake plan deleted successfully" });
        fetchRakePlans();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete rake plan" });
      }
    } catch (error) {
      console.error("Error deleting rake plan:", error);
      setMessage({ type: "error", text: "Failed to delete rake plan" });
    }
  };



  const resetForm = () => {

    setFormData(DEFAULT_FORM);

    setEditingPlan(null);

    setErrors({});

    setShowModal(false);

  };



  const regenerateJourneyId = () => {
    if (formData.Route) {
      const baseDepot = formData.Base_Depot || "";
      const routeParts = formData.Route.split("-");
      const destination = routeParts[1] || routeParts[0];
      
      // Generate unique Journey ID with current timestamp
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY format
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, ''); // HHMMSS format
      const uniqueId = `${dateStr}${timeStr}`.slice(-8); // Take last 8 digits for uniqueness
      
      const journeyId = baseDepot && destination ? `${baseDepot}-${destination}-${uniqueId}` : `${destination}-${uniqueId}`;
      
      setFormData((prev) => ({ 
        ...prev, 
        Journey_Id: journeyId,
        Train_No: journeyId
      }));
    }
  };

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    // Auto-populate Base_Depot when Rake_Name is selected
    if (name === "Rake_Name" && value) {
      const selectedRake = availableRakes.find(rake => rake.Rake_Name === value);
      if (selectedRake && selectedRake.Base_Depot) {
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          Base_Depot: selectedRake.Base_Depot
        }));
      }
    }

    // Auto-populate Journey_Id, Train_No, and IB_Train_No when Route is selected
    if (name === "Route" && value) {
      const baseDepot = formData.Base_Depot || "";
      const routeParts = value.split("-");
      const destination = routeParts[1] || routeParts[0];
      
      // Generate unique Journey ID with timestamp
      const now = new Date();
      const timestamp = now.getTime(); // Get milliseconds since epoch
      const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY format
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, ''); // HHMMSS format
      const uniqueId = `${dateStr}${timeStr}`.slice(-8); // Take last 8 digits for uniqueness
      
      const journeyId = baseDepot && destination ? `${baseDepot}-${destination}-${uniqueId}` : `${destination}-${uniqueId}`;
      
      // Generate IB Train No using route and current date/time
      const ibDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace(/\//g, '');
      const ibTimeStr = now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(/:/g, '');
      const ibTrainNo = `${value}-${ibDateStr}${ibTimeStr}`;
      
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        Journey_Id: journeyId,
        Train_No: journeyId, // Set Train_No to match Journey_Id
        IB_Train_No: ibTrainNo // Set IB_Train_No using route and current date/time
      }));
    }

    // Auto-generate Plan_Date when form is being submitted or when relevant fields change
    if ((name === "Route" || name === "Trip_No") && formData.Route && formData.Trip_No) {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + " " + currentDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      setFormData((prev) => ({ 
        ...prev, 
        Plan_Date: formattedDate
      }));
    }

  };



  const planTypeColors = {

    "Back Loading": "bg-blue-100 text-blue-800",

    "Forward Loading": "bg-green-100 text-green-800",

    "Empty Return": "bg-gray-100 text-gray-700",

  };


  return (

    <div className="p-6 max-w-7xl mx-auto">

      {/* Page Header */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rake Planning Management</h1>

        <p className="text-gray-600">Manage rake plans for rakes that have completed arrival operations</p>

      </div>



      {/* Message Banner */}

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



      {/* Main Card */}

      <div className="bg-white rounded-lg shadow-md">

        {/* Toolbar */}

        <div className="p-6 border-b border-gray-200">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

            <div className="relative flex-1 max-w-md">

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input

                type="text"

                placeholder="Search rake plans..."

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

              Add Rake Plan

            </button>

          </div>

        </div>



        {/* Table */}

        <div className="overflow-x-auto">

          {loading ? (

            <div className="p-8 text-center">

              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

              <p className="mt-2 text-gray-600">Loading rake plans...</p>

            </div>

          ) : filteredPlans.length === 0 ? (

            <div className="p-8 text-center">

              <Train className="mx-auto h-12 w-12 text-gray-400 mb-4" />

              <p className="text-gray-600">

                {searchTerm ? "No arrived rake plans found matching your search" : "No rake plans with completed arrivals found"}

              </p>

            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rake Name</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Type</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Depot</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip No</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Date</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>

                </tr>

              </thead>

              <tbody className="bg-white divide-y divide-gray-200">

                {filteredPlans.map((plan) => (

                  <tr key={plan.PlanId} className="hover:bg-gray-50">

                    <td className="px-6 py-4 whitespace-nowrap">

                      <div className="flex items-center">

                        <Train className="w-4 h-4 text-gray-400 mr-2" />

                        <span className="text-sm font-medium text-gray-900">{plan.Rake_Name}</span>

                      </div>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">

                        {plan.Route}

                      </span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${planTypeColors[plan.Plan_Type] || "bg-gray-100 text-gray-700"}`}>

                        {plan.Plan_Type}

                      </span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className="text-sm text-gray-600">{plan.Base_Depot || "-"}</span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className="text-sm text-gray-600">{plan.Rake_Operator || "-"}</span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className="text-sm text-gray-600">{plan.Trip_No || "-"}</span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span className="text-sm text-gray-600">{plan.Plan_Date || "-"}</span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                      <div className="flex items-center space-x-2">

                        <button

                          onClick={() => handleEdit(plan)}

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

          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-lg bg-white mb-10">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-lg font-medium text-gray-900">

                {editingPlan ? "Edit Rake Plan" : "Add New Rake Plan"}

              </h3>

              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">

                <X className="w-6 h-6" />

              </button>

            </div>



            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



                {/* Rake Name */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Rake Name (Arrived Only) <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Rake_Name"

                    value={formData.Rake_Name}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Rake_Name ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="">Select Rake</option>

                    {getRakesWithArrival().map((rake) => (

                      <option key={rake.RakeId} value={rake.Rake_Name}>{rake.Rake_Name}</option>

                    ))}

                  </select>

                  {errors.Rake_Name && <p className="mt-1 text-sm text-red-600">{errors.Rake_Name}</p>}

                </div>



                {/* Base Depot */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Base Depot <span className="text-red-500">*</span>

                  </label>

                  {formData.Rake_Name ? (
                    <input
                      type="text"
                      name="Base_Depot"
                      value={formData.Base_Depot}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    />
                  ) : (
                    <select
                      name="Base_Depot"
                      value={formData.Base_Depot}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Base_Depot ? "border-red-300" : "border-gray-300"}`}
                    >
                      {availableTerminals.map((terminal) => (
                        <option key={terminal.TerminalCode} value={terminal.TerminalCode}>{terminal.TerminalCode}</option>
                      ))}
                    </select>
                  )}

                  {errors.Base_Depot && <p className="mt-1 text-sm text-red-600">{errors.Base_Depot}</p>}

                </div>



                {/* Rake Operator */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Rake Operator <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Rake_Operator"

                    value={formData.Rake_Operator}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Rake_Operator ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>

                    <option value="CONCOR">CONCOR</option>

                    <option value="PRIVATE OPERATOR">PRIVATE OPERATOR</option>

                  </select>

                  {errors.Rake_Operator && <p className="mt-1 text-sm text-red-600">{errors.Rake_Operator}</p>}

                </div>



                {/* Haulage Paid By */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Haulage Paid By <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Haulage_Paid_By"

                    value={formData.Haulage_Paid_By}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Haulage_Paid_By ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="Owner">Owner</option>

                    <option value="Operator">Operator</option>

                    <option value="Customer">Customer</option>

                  </select>

                  {errors.Haulage_Paid_By && <p className="mt-1 text-sm text-red-600">{errors.Haulage_Paid_By}</p>}

                </div>



                {/* Trip No */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Trip No <span className="text-red-500">*</span>

                  </label>

                  <input

                    type="text"

                    name="Trip_No"

                    value={formData.Trip_No}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Trip_No ? "border-red-300" : "border-gray-300"}`}

                    placeholder="Enter Trip No"

                  />

                  {errors.Trip_No && <p className="mt-1 text-sm text-red-600">{errors.Trip_No}</p>}

                </div>



                {/* Sub Route */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Route</label>

                  <select

                    name="Sub_Route"

                    value={formData.Sub_Route}

                    onChange={handleInputChange}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  >

                    <option value="Main Route">Main Route</option>

                    <option value="Sub Route 1">Sub Route 1</option>

                    <option value="Sub Route 2">Sub Route 2</option>

                  </select>

                </div>



                {/* Rake Owner */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Rake Owner <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Rake_Owner"

                    value={formData.Rake_Owner}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Rake_Owner ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="INDIAN RAILWAY">INDIAN RAILWAY</option>

                    <option value="CONCOR">CONCOR</option>

                    <option value="PRIVATE">PRIVATE</option>

                  </select>

                  {errors.Rake_Owner && <p className="mt-1 text-sm text-red-600">{errors.Rake_Owner}</p>}

                </div>



                {/* Plan Type */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Plan Type <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Plan_Type"

                    value={formData.Plan_Type}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Plan_Type ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="Back Loading">Back Loading</option>

                    <option value="Forward Loading">Forward Loading</option>

                    <option value="Empty Return">Empty Return</option>

                  </select>

                  {errors.Plan_Type && <p className="mt-1 text-sm text-red-600">{errors.Plan_Type}</p>}

                </div>



                {/* Device ID */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Device ID <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Device_ID"

                    value={formData.Device_ID}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Device_ID ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="Select">Select</option>

                    <option value="Device-001">Device-001</option>

                    <option value="Device-002">Device-002</option>

                    <option value="Device-003">Device-003</option>

                  </select>

                  {errors.Device_ID && <p className="mt-1 text-sm text-red-600">{errors.Device_ID}</p>}

                </div>



                {/* Route */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Route <span className="text-red-500">*</span>

                  </label>

                  <select

                    name="Route"

                    value={formData.Route}

                    onChange={handleInputChange}

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Route ? "border-red-300" : "border-gray-300"}`}

                  >

                    <option value="">Select Route</option>

                    {availableRoutes.map((route) => (

                      <option key={route.RouteId || route.Route_Name} value={route.Route_Name || route.Route}>{route.Route_Name || route.Route}</option>

                    ))}

                  </select>

                  {errors.Route && <p className="mt-1 text-sm text-red-600">{errors.Route}</p>}

                </div>



                {/* Journey Id (read-only with regenerate) */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Journey Id</label>

                  <div className="flex space-x-2">

                    <input

                      type="text"

                      name="Journey_Id"

                      value={formData.Journey_Id}

                      readOnly

                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"

                    />

                    <button

                      type="button"

                      onClick={regenerateJourneyId}

                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

                      title="Regenerate Journey ID"

                    >

                      ↻

                    </button>

                  </div>

                </div>



                {/* IB Train No (read-only) */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">IB Train No</label>

                  <input

                    type="text"

                    name="IB_Train_No"

                    value={formData.IB_Train_No}

                    readOnly

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"

                  />

                </div>



                {/* Train No (read-only) */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Train No</label>

                  <input

                    type="text"

                    name="Train_No"

                    value={formData.Train_No}

                    readOnly

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"

                  />

                </div>



                {/* Plan Date (editable datetime) */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Date</label>

                  <input

                    type="datetime-local"

                    name="Plan_Date"

                    value={formData.Plan_Date ? new Date(formData.Plan_Date.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5')).toISOString().slice(0, 16) : ''}

                    onChange={handleInputChange}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  />

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

                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}

                >

                  {loading ? "Saving..." : editingPlan ? "Update Rake Plan" : "Create Rake Plan"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

};



export default RakePlanning;