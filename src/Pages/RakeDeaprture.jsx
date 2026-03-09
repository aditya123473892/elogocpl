import React, { useState, useEffect } from "react";
import { Train, ArrowLeft, Edit2, X, Check, Clock, Calendar, Search, Plus, Trash2, Eye } from "lucide-react";
import { rakePlanningAPI, rakeDepartureAPI } from "../utils/Api";
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

export default function RakeDeparturePage() {
  const { user } = useAuth(); // Get logged-in user info
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plannedRakes, setPlannedRakes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
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
    placement_dep: initTime(),
    loadingStart: initTime(),
    loadingEnd: initTime(),
    removal: initTime(),
    powerDemand: initTime(),
    powerArrival: initTime(),
    departureDate: initTime(),
  });

  // Fetch planned rakes from rake planning
  const fetchPlannedRakes = async () => {
    try {
      setLoading(true);
      const data = await rakePlanningAPI.getAllRakePlans();
      if (data.success) {
        setPlannedRakes(data.data);
      } else {
        console.error("Failed to fetch planned rakes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching planned rakes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedRakes();
  }, []);

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

  // Convert form data to API format
  const formatFormForAPI = () => {
    return {
      RakeName: form.rakeName,
      TrainNumber: form.trainNumber,
      TripNo: form.tripNo,
      LineTrack: form.lineTrack,
      RRNo: form.rrNo || null,
      RRDate: form.rrDate || null,
      RRAmount: form.rrAmount ? parseFloat(form.rrAmount) : null,
      
      // Arrival timings
      ArrivalDate: form.arrivalDate.date,
      ArrivalHour: parseInt(form.arrivalDate.hh),
      ArrivalMinute: parseInt(form.arrivalDate.mm),
      
      // Optional arrival timings
      PlacementArrDate: form.placement_arr.date || null,
      PlacementArrHour: form.placement_arr.date ? parseInt(form.placement_arr.hh) : null,
      PlacementArrMinute: form.placement_arr.date ? parseInt(form.placement_arr.mm) : null,
      
      UnloadingStartDate: form.unloadingStart.date || null,
      UnloadingStartHour: form.unloadingStart.date ? parseInt(form.unloadingStart.hh) : null,
      UnloadingStartMinute: form.unloadingStart.date ? parseInt(form.unloadingStart.mm) : null,
      
      UnloadingEndDate: form.unloadingEnd.date || null,
      UnloadingEndHour: form.unloadingEnd.date ? parseInt(form.unloadingEnd.hh) : null,
      UnloadingEndMinute: form.unloadingEnd.date ? parseInt(form.unloadingEnd.mm) : null,
      
      StablingStartDate: form.stablingStart.date || null,
      StablingStartHour: form.stablingStart.date ? parseInt(form.stablingStart.hh) : null,
      StablingStartMinute: form.stablingStart.date ? parseInt(form.stablingStart.mm) : null,
      
      StablingEndDate: form.stablingEnd.date || null,
      StablingEndHour: form.stablingEnd.date ? parseInt(form.stablingEnd.hh) : null,
      StablingEndMinute: form.stablingEnd.date ? parseInt(form.stablingEnd.mm) : null,
      
      // Released timing (required)
      ReleasedDate: form.released.date,
      ReleasedHour: parseInt(form.released.hh),
      ReleasedMinute: parseInt(form.released.mm),
      
      // Departure timings
      PlacementDepDate: form.placement_dep.date || null,
      PlacementDepHour: form.placement_dep.date ? parseInt(form.placement_dep.hh) : null,
      PlacementDepMinute: form.placement_dep.date ? parseInt(form.placement_dep.mm) : null,
      
      LoadingStartDate: form.loadingStart.date || null,
      LoadingStartHour: form.loadingStart.date ? parseInt(form.loadingStart.hh) : null,
      LoadingStartMinute: form.loadingStart.date ? parseInt(form.loadingStart.mm) : null,
      
      LoadingEndDate: form.loadingEnd.date || null,
      LoadingEndHour: form.loadingEnd.date ? parseInt(form.loadingEnd.hh) : null,
      LoadingEndMinute: form.loadingEnd.date ? parseInt(form.loadingEnd.mm) : null,
      
      RemovalDate: form.removal.date || null,
      RemovalHour: form.removal.date ? parseInt(form.removal.hh) : null,
      RemovalMinute: form.removal.date ? parseInt(form.removal.mm) : null,
      
      PowerDemandDate: form.powerDemand.date || null,
      PowerDemandHour: form.powerDemand.date ? parseInt(form.powerDemand.hh) : null,
      PowerDemandMinute: form.powerDemand.date ? parseInt(form.powerDemand.mm) : null,
      
      PowerArrivalDate: form.powerArrival.date || null,
      PowerArrivalHour: form.powerArrival.date ? parseInt(form.powerArrival.hh) : null,
      PowerArrivalMinute: form.powerArrival.date ? parseInt(form.powerArrival.mm) : null,
      
      // Departure timing (required)
      DepartureDate: form.departureDate.date,
      DepartureHour: parseInt(form.departureDate.hh),
      DepartureMinute: parseInt(form.departureDate.mm),
      
      // User info - use logged-in user information
      CreatedBy: user ? `${user.name} (ID: ${user.id})` : "Unknown User",
      UpdatedBy: user ? `${user.name} (ID: ${user.id})` : "Unknown User"
    };
  };

  // Validate required fields
  const validateForm = () => {
    const required = ['rakeName', 'trainNumber', 'tripNo'];
    const requiredTimes = ['arrivalDate', 'released', 'departureDate'];
    
    for (const field of required) {
      if (!form[field] || form[field].trim() === '') {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    }
    
    for (const field of requiredTimes) {
      if (!form[field].date) {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} date is required`;
      }
      // Also validate that hour and minute are selected
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
      
      // For now, we'll create a new record. You can modify this to update if needed
      const response = await rakeDepartureAPI.createRakeDeparture(apiData);
      
      if (response.success) {
        setSaved(true);
        setIsEditing(false);
        setTimeout(() => setSaved(false), 3000);
        
        // Optionally reset form or redirect
        // setForm(initialFormState);
      } else {
        alert(`Error: ${response.message || 'Failed to save rake departure'}`);
      }
    } catch (error) {
      console.error('Error saving rake departure:', error);
      alert(`Error: ${error.message || 'Failed to save rake departure'}`);
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
              <h1 className="text-xl font-bold text-gray-900">Rake Departure</h1>
              <p className="text-xs text-gray-500">Manage rake departure details and timings</p>
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
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <Train className="w-4 h-4" /> Select Planned Rake
                </h3>
                <span className="text-xs text-blue-700 font-medium">From Rake Planning</span>
              </div>
              
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search planned rakes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Planned Rakes List */}
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="mt-1 text-xs text-gray-600">Loading planned rakes...</p>
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div className="text-center py-4">
                    <Train className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600">
                      {searchTerm ? "No planned rakes found" : "No planned rakes available"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPlans.map((plan) => (
                      <div
                        key={plan.PlanId}
                        onClick={() => handlePlanSelection(plan)}
                        className={`p-2 border rounded cursor-pointer transition-colors text-xs ${
                          selectedPlan?.PlanId === plan.PlanId
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Train className="w-3 h-3 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{plan.Rake_Name}</div>
                              <div className="text-gray-500">
                                {plan.Route} | {plan.Train_No} | {plan.Trip_No}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-1 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {plan.Plan_Type}
                            </span>
                            {selectedPlan?.PlanId === plan.PlanId && (
                              <Check className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedPlan && (
                <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-xs">
                  <div className="font-medium text-blue-900">Selected: {selectedPlan.Rake_Name} | {selectedPlan.Train_No} | {selectedPlan.Trip_No}</div>
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

        {/* Arrival & Departure Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Arrival Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-600 px-6 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4" /> Arrival Timings
              </h2>
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Inbound</span>
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

          {/* Departure Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-700 px-6 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Departure Timings
              </h2>
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Outbound</span>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "Placement", key: "placement_dep" },
                { label: "Loading Start", key: "loadingStart" },
                { label: "Loading End", key: "loadingEnd" },
                { label: "Removal", key: "removal" },
                { label: "Power Demand", key: "powerDemand" },
                { label: "Power Arrival", key: "powerArrival" },
                { label: "Departure Date", key: "departureDate", required: true },
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