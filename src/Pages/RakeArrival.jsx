import React, { useState, useEffect } from "react";
import { Train, ArrowLeft, Edit2, X, Check, Clock, Calendar, Search, Plus, Trash2, Eye, MapPin } from "lucide-react";
import { rakePlanningAPI, rakeVisitAPI, locationMasterAPI } from "../utils/Api";
import { useAuth } from "../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MIN_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const LINE_OPTIONS = ["Line-1", "Line-2", "Line-3", "Line-4"];
const RAKE_OPTIONS = ["TWIL02", "TWIL03", "TWIL04", "TWIL05"];

const initTime = () => ({ date: "", hh: "00", mm: "00" });

const TimeInput = ({ value, onChange, disabled, required }) => (
  <div className="flex items-center gap-1">
    <input
      type="date"
      className={`flex-1 h-9 text-sm border rounded-md px-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors
        ${required && !value.date ? "border-red-400 bg-red-50" : "border-gray-300"}
        ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}
      `}
      value={value.date}
      onChange={(e) => onChange({ ...value, date: e.target.value })}
      disabled={disabled}
    />
    <select
      className={`h-9 text-sm border border-gray-300 rounded-md px-1 w-14 focus:ring-2 focus:ring-green-500 outline-none ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
      value={value.hh}
      onChange={(e) => onChange({ ...value, hh: e.target.value })}
      disabled={disabled}
    >
      {HOUR_OPTIONS.map((h) => <option key={h}>{h}</option>)}
    </select>
    <span className="text-gray-400 text-sm font-bold">:</span>
    <select
      className={`h-9 text-sm border border-gray-300 rounded-md px-1 w-14 focus:ring-2 focus:ring-green-500 outline-none ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
      value={value.mm}
      onChange={(e) => onChange({ ...value, mm: e.target.value })}
      disabled={disabled}
    >
      {MIN_OPTIONS.map((m) => <option key={m}>{m}</option>)}
    </select>
  </div>
);

const SectionField = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = (disabled) =>
  `w-full h-9 text-sm border rounded-md px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
    disabled ? "bg-gray-100 cursor-not-allowed text-gray-500 border-gray-200" : "bg-white border-gray-300"
  }`;

export default function RakeArrivalPage() {
  const { user, selectedLocation } = useAuth(); // Get logged-in user info and selected location
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plannedRakes, setPlannedRakes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filterInfo, setFilterInfo] = useState({ total: 0, filtered: 0, hidden: 0 });
  const [form, setForm] = useState({
    rakeName: "TWIL02",
    trainNumber: "",
    tripNo: "",
    lineTrack: "Line-1",
    rrNo: "",
    rrDate: "",
    rrAmount: "",
    // Only arrival-related fields
    arrivalDate: initTime(),
    placement_arr: initTime(),
    unloadingStart: initTime(),
    unloadingEnd: initTime(),
    stablingStart: initTime(),
    stablingEnd: initTime(),
    released: initTime(),
    deliveryDate: initTime(), // Added delivery date field
  });

  // Fetch planned rakes from rake planning and filter out completed arrivals
  const fetchPlannedRakes = async () => {
    try {
      setLoading(true);
      const [plansData, visitsData] = await Promise.all([
        rakePlanningAPI.getAllRakePlans(),
        rakeVisitAPI.getAllRakeVisits()
      ]);
      
      if (plansData.success) {
        const allPlans = plansData.data || [];
        let filteredPlans = allPlans;
        
        // Filter out plans that already have arrival records and don't belong to logged-in terminal
        if (visitsData.success && visitsData.data && visitsData.data.length > 0) {
          // Get all identifiers that have arrival records
          const arrivedTrainNos = new Set(
            visitsData.data
              .filter(visit => visit.ARRVAL_DATE) // Any visit with arrival date
              .map(visit => (visit.IB_TRAIN_NO || visit.OB_TRAIN_NO)?.trim())
              .filter(trainNo => trainNo) // Remove null/undefined
          );
          
          const arrivedTripNos = new Set(
            visitsData.data
              .filter(visit => visit.ARRVAL_DATE) // Any visit with arrival date
              .map(visit => visit.TRIP_NO?.trim())
              .filter(tripNo => tripNo) // Remove null/undefined
          );
          
          // Filter out plans that have any arrival record using multiple criteria
          // AND filter by logged-in terminal (Base_Depot)
          filteredPlans = allPlans.filter(plan => {
            const trainNoMatch = plan.Train_No && arrivedTrainNos.has(plan.Train_No.trim());
            const tripNoMatch = plan.Trip_No && arrivedTripNos.has(plan.Trip_No.trim());
            
            // Filter if either train number or trip number matches an arrived record
            const shouldFilter = trainNoMatch || tripNoMatch;
            
            // Filter by logged-in terminal - only show plans where Base_Depot matches selectedLocation
            const terminalMatch = selectedLocation && plan.Base_Depot === selectedLocation;
            
            // Return true if plan should NOT be filtered out (no arrival record) AND matches terminal
            return !shouldFilter && terminalMatch;
          });

          // Set filter info for display
          setFilterInfo({
            total: allPlans.length,
            filtered: filteredPlans.length,
            hidden: allPlans.length - filteredPlans.length
          });
        } else {
          // No visits data, but still filter by logged-in terminal
          filteredPlans = allPlans.filter(plan => {
            // Filter by logged-in terminal - only show plans where Base_Depot matches selectedLocation
            const terminalMatch = selectedLocation && plan.Base_Depot === selectedLocation;
            return terminalMatch;
          });
          
          setFilterInfo({
            total: allPlans.length,
            filtered: filteredPlans.length,
            hidden: allPlans.length - filteredPlans.length
          });
        }
        
        setPlannedRakes(filteredPlans);
      } else {
        console.error("Failed to fetch planned rakes:", plansData.message);
      }
    } catch (error) {
      console.error("Error fetching planned rakes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedRakes();
  }, [selectedLocation]); // Re-fetch when selectedLocation changes

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Handle plan selection
  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setForm((f) => ({
      ...f,
      rakeName: plan.Rake_Name || f.rakeName,
      trainNumber: plan.Train_No || "",
      tripNo: plan.Trip_No || "",
    }));
  };

  // Filter planned rakes based on search
  const filteredPlans = plannedRakes.filter(
    (plan) =>
      plan.Rake_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.Route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.Train_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.Trip_No?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert form data to API format - Map to RAKE_VISIT table structure
  const formatFormForAPI = () => {
    // Start with selected plan data (reference data from rake planning)
    const baseData = selectedPlan ? {
      PlanId: selectedPlan.PlanId,
      Rake_Name: selectedPlan.Rake_Name || form.rakeName,
      Base_Depot: selectedPlan.Base_Depot,
      Rake_Operator: selectedPlan.Rake_Operator || "INDIAN RAILWAY",
      Haulage_Paid_By: selectedPlan.Haulage_Paid_By || "Owner",
      Trip_No: selectedPlan.Trip_No || form.tripNo,
      Sub_Route: selectedPlan.Sub_Route || "Main Route",
      Journey_Id: selectedPlan.Journey_Id,
      IB_Train_No: selectedPlan.IB_Train_No,
      Rake_Owner: selectedPlan.Rake_Owner || "INDIAN RAILWAY",
      Plan_Type: selectedPlan.Plan_Type || "Back Loading",
      Device_ID: selectedPlan.Device_ID || "Select",
      Route: selectedPlan.Route,
      Train_No: selectedPlan.Train_No || form.trainNumber,
      Plan_Date: selectedPlan.Plan_Date,
    } : {};

    // Map to RAKE_VISIT table structure
    return {
      // Train and identification fields
      IB_TRAIN_NO: selectedPlan?.IB_Train_No || form.trainNumber || null,
      OB_TRAIN_NO: selectedPlan?.Train_No || form.trainNumber || null,
      TRIP_NO: form.tripNo || selectedPlan?.Trip_No || null,
      RR_NO: form.rrNo || null,
      RR_DATE: form.rrDate ? new Date(form.rrDate).toISOString() : null,
      RR_AMOUNT: form.rrAmount ? parseFloat(form.rrAmount) : null,
      
      // Terminal and route information
      TERMINAL_ID: selectedLocation || null,
      IB_LOAD_TERMINAL: selectedPlan?.Route || null,
      OB_DISCHARGE_TERMINAL: selectedPlan?.Route || null,
      IB_ROUTE_ID: selectedPlan?.Route_Id || null,
      OB_ROUTE_ID: selectedPlan?.Route_Id || null,
      SUB_ROUTE_ID: selectedPlan?.Sub_Route_Id || null,
      TERMINAL_OPERATOR_ID: 1, // Default operator ID
      RAILWAY_LINE_ID: selectedPlan?.Railway_Line || "RL001",
      
      // Rake information
      RAKE_ID: selectedPlan?.Rake_Id || null,
      DEST_VISIT_ID: null,
      NEXT_PORT: selectedPlan?.Next_Port || null,
      
      // Mail status flags
      DISPATCH_MAIL_STATUS: "N",
      ARRIVAL_MAIL_STATUS: "N",
      REROUTE_STATUS: "N",
      
      // Configuration flags
      DOUBLE_STACK: selectedPlan?.Double_Stack === "Y" ? "Y" : "N",
      POOLING: selectedPlan?.Pooling === "Y" ? "Y" : "N",
      HAULAGE_PAID_BY: selectedPlan?.Haulage_Paid_By === "Customer" ? "C" : "R",
      PLANE_TYPE: "N", // Default for rail operations
      
      // Distance and billing
      BILLABLE_DISTANCE: selectedPlan?.Distance || 0,
      
      // Arrival timing fields (A_ prefix for arrival operations)
      ARRVAL_DATE: form.arrivalDate.date ? 
        new Date(`${form.arrivalDate.date}T${form.arrivalDate.hh}:${form.arrivalDate.mm}:00`).toISOString() : null,
      A_PLACEMENT_DATE: form.placement_arr.date ? 
        new Date(`${form.placement_arr.date}T${form.placement_arr.hh}:${form.placement_arr.mm}:00`).toISOString() : null,
      UNLOAD_START_DATE: form.unloadingStart.date ? 
        new Date(`${form.unloadingStart.date}T${form.unloadingStart.hh}:${form.unloadingStart.mm}:00`).toISOString() : null,
      UNLOAD_COMPLETION_DATE: form.unloadingEnd.date ? 
        new Date(`${form.unloadingEnd.date}T${form.unloadingEnd.hh}:${form.unloadingEnd.mm}:00`).toISOString() : null,
      A_STABLING_START_DATE: form.stablingStart.date ? 
        new Date(`${form.stablingStart.date}T${form.stablingStart.hh}:${form.stablingStart.mm}:00`).toISOString() : null,
      A_STABLING_END_DATE: form.stablingEnd.date ? 
        new Date(`${form.stablingEnd.date}T${form.stablingEnd.hh}:${form.stablingEnd.mm}:00`).toISOString() : null,
      A_REMOVAL_DATE: form.released.date ? 
        new Date(`${form.released.date}T${form.released.hh}:${form.released.mm}:00`).toISOString() : null,
      
      // Departure timing fields (D_ prefix for departure operations - null for arrival)
      D_PLACEMENT_DATE: null,
      LOAD_START_DATE: null,
      LOAD_COMPLETION_DATE: null,
      D_STABLING_START_DATE: null,
      D_STABLING_END_DATE: null,
      D_REMOVAL_DATE: null,
      DEPARTURE_DATE: null,
      
      // Station and siding dates
      DEPARTURE_SIDDING: null,
      ARRIVAL_STATION: form.arrivalDate.date ? 
        new Date(`${form.arrivalDate.date}T${form.arrivalDate.hh}:${form.arrivalDate.mm}:00`).toISOString() : null,
      
      // Examination and remarks
      EXAM_NO: 1, // Default exam number
      REMARKS: `Rake arrival recorded - ${baseData.Rake_Name || form.rakeName}`,
      
      // User and system information
      CREATED_BY: user ? `${user.name} (ID: ${user.id})` : "Unknown User",
      DEVICE_ID: selectedPlan?.Device_ID || "WEB_APP",
      
      // Additional planning data for reference (not stored in RAKE_VISIT but useful for tracking)
      ...baseData
    };
  };

  // Validate required fields
  const validateForm = () => {
    // Check if a plan is selected
    if (!selectedPlan) {
      return "Please select a planned rake first";
    }

    // Check required form fields
    const required = ['rakeName', 'trainNumber', 'tripNo'];
    for (const field of required) {
      if (!form[field] || (typeof form[field] === 'string' && form[field].trim() === '')) {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    }
    
    // Check required timing fields
    const requiredTimes = ['arrivalDate', 'released'];
    for (const field of requiredTimes) {
      if (!form[field].date) {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} date is required`;
      }
      if (!form[field].hh || !form[field].mm) {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} time is required`;
      }
    }
    
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(`Validation Error: ${validationError}`);
      return;
    }

    try {
      setLoading(true);
      const apiData = formatFormForAPI();
      
      console.log('Saving rake visit data:', apiData);
      
      // Save to RAKE_VISIT table using the API
      const response = await rakeVisitAPI.createRakeVisit(apiData);
      
      if (response.success) {
        setSaved(true);
        setIsEditing(false);
        setTimeout(() => setSaved(false), 3000);
        
        // Show success message
        toast.success("Rake arrival data saved successfully to RAKE_VISIT table!");
        
        // Optionally refresh the planned rakes to get updated data
        fetchPlannedRakes();
        
        // Reset form after successful save
        setForm({
          rakeName: "TWIL02",
          trainNumber: "",
          tripNo: "",
          lineTrack: "Line-1",
          rrNo: "",
          rrDate: "",
          rrAmount: "",
          arrivalDate: initTime(),
          placement_arr: initTime(),
          unloadingStart: initTime(),
          unloadingEnd: initTime(),
          stablingStart: initTime(),
          stablingEnd: initTime(),
          released: initTime(),
          deliveryDate: initTime(),
        });
        setSelectedPlan(null);
      } else {
        alert(`Error: ${response.message || 'Failed to save rake arrival'}`);
      }
    } catch (error) {
      console.error('Error saving rake arrival:', error);
      alert(`Error: ${error.message || 'Failed to save rake arrival'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rake Arrival Management</h1>
              <p className="text-xs text-gray-500">Manage rake arrival operations and timings</p>
              {selectedLocation && (
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Location: {locations.find(loc => loc.LocationId === selectedLocation)?.LocationName || selectedLocation}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500 font-medium border border-red-200 bg-red-50 px-2 py-1 rounded">
              * mandatory fields
            </span>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-700 font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <Check className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Rake Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-600 px-6 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Train className="w-4 h-4" /> Rake Information
            </h2>
            <span className="text-green-100 text-xs font-medium">General Details</span>
          </div>
          <div className="p-6">
            {/* Planned Rakes Selection Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Train className="w-5 h-5 text-green-600" /> Available Rakes
                </h3>
                <span className="text-sm text-gray-600">Select a rake to record arrival</span>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by rake name, route, train or trip..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  />
                </div>
                
                {/* Filter Info Display */}
                {filterInfo.hidden > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-blue-800">
                        Filtering Active: {filterInfo.hidden} of {filterInfo.total} rakes hidden (already arrived)
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Rakes with completed arrivals are automatically hidden from this list and shown in the Departure page.
                    </div>
                  </div>
                )}
              </div>

              {/* Planned Rakes List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="mt-3 text-sm text-gray-600">Loading available rakes...</p>
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <Train className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      {searchTerm ? "No rakes found matching your search" : "No rakes available"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredPlans.map((plan) => (
                      <div
                        key={plan.PlanId}
                        onClick={() => handlePlanSelection(plan)}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedPlan?.PlanId === plan.PlanId
                            ? "bg-green-50 border-l-4 border-l-green-500"
                            : "hover:border-l-4 hover:border-l-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Train className={`w-6 h-6 ${
                              selectedPlan?.PlanId === plan.PlanId ? "text-green-600" : "text-gray-400"
                            }`} />
                            <div>
                              <div className={`font-semibold text-lg ${
                                selectedPlan?.PlanId === plan.PlanId ? "text-green-700" : "text-gray-900"
                              }`}>
                                {plan.Rake_Name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {plan.Route} • Train {plan.Train_No} • Trip {plan.Trip_No}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Plan: {plan.Plan_Type} • {plan.Base_Depot}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              selectedPlan?.PlanId === plan.PlanId
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {plan.Plan_Type}
                            </span>
                            {selectedPlan?.PlanId === plan.PlanId && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check className="w-5 h-5" />
                                <span className="text-sm font-medium">Selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedPlan && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">Selected Rake</div>
                      <div className="text-green-700">
                        {selectedPlan.Rake_Name} • Train {selectedPlan.Train_No} • Trip {selectedPlan.Trip_No}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Original Rake Information Fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <SectionField label="Rake Name">
                <select 
                  className={inputCls(!isEditing)} 
                  value={form.rakeName} 
                  onChange={(e) => {
                    setField("rakeName")(e);
                    // Auto-select corresponding plan when rake name is changed
                    const selectedRakePlan = plannedRakes.find(plan => plan.Rake_Name === e.target.value);
                    if (selectedRakePlan) {
                      handlePlanSelection(selectedRakePlan);
                    }
                  }} 
                  disabled={!isEditing}
                >
                  <option value="">Select Rake</option>
                  {plannedRakes.map((plan, index) => (
                    <option key={index} value={plan.Rake_Name}>
                      {plan.Rake_Name}
                    </option>
                  ))}
                  {RAKE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </SectionField>

              <SectionField label="Train Number" required>
                <input
                  type="text"
                  className={`w-full h-9 text-sm border rounded-md px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed text-gray-500 border-gray-200" : "bg-white border-gray-300"
                  }`}
                  value={form.trainNumber}
                  onChange={setField("trainNumber")}
                  disabled={!isEditing}
                  placeholder="e.g. 12345"
                />
              </SectionField>

              <SectionField label="Trip No" required>
                <input
                  type="text"
                  className={`w-full h-9 text-sm border rounded-md px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed text-gray-500 border-gray-200" : "bg-white border-gray-300"
                  }`}
                  value={form.tripNo}
                  onChange={setField("tripNo")}
                  disabled={!isEditing}
                  placeholder="e.g. T001"
                />
              </SectionField>

              <SectionField label="RR No">
                <input type="text" className={inputCls(false)} value={form.rrNo} onChange={setField("rrNo")} placeholder="RR Number" />
              </SectionField>

              <SectionField label="RR Date">
                <input type="date" className={inputCls(false)} value={form.rrDate} onChange={setField("rrDate")} />
              </SectionField>

              <SectionField label="RR Amount">
                <input type="number" className={inputCls(false)} value={form.rrAmount} onChange={setField("rrAmount")} placeholder="0.00" />
              </SectionField>
            </div>
          </div>
        </div>

        {/* Arrival Timings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-600 px-6 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" /> Arrival Timings
            </h2>
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Inbound Operations</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: "Arrival Date", key: "arrivalDate", required: true },
              { label: "Placement", key: "placement_arr" },
              { label: "Unloading Start", key: "unloadingStart" },
              { label: "Unloading End", key: "unloadingEnd" },
              { label: "Stabling Start", key: "stablingStart" },
              { label: "Stabling End", key: "stablingEnd" },
              { label: "Released", key: "released", required: true },
              { label: "Delivery Date", key: "deliveryDate" },
            ].map(({ label, key, required }, idx) => (
              <div key={key} className={`flex items-center gap-4 px-5 py-3 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <label className="text-sm font-medium text-gray-700 w-36 shrink-0 flex items-center gap-1">
                  {label}
                  {required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex-1">
                  <TimeInput value={form[key]} onChange={set(key)} required={required} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
            <button className="flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
