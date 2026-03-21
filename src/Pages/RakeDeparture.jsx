import React, { useState, useEffect } from "react";
import { Train, ArrowLeft, Edit2, X, Check, Clock, Calendar, Search, Plus, Trash2, Eye, MapPin } from "lucide-react";
import { rakePlanningAPI, rakeVisitAPI, locationMasterAPI } from "../utils/Api";
import { useAuth } from "../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MIN_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const LINE_OPTIONS = ["Line-1", "Line-2", "Line-3", "Line-4"];

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
  const { user, selectedLocation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [arrivedRakes, setArrivedRakes] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    rakeName: "",
    trainNumber: "",
    tripNo: "",
    lineTrack: "Line-1",
    rrNo: "",
    rrDate: "",
    rrAmount: "",
    // Departure timings
    placement_dep: initTime(),
    loadingStart: initTime(),
    loadingEnd: initTime(),
    stablingStart_dep: initTime(),
    stablingEnd_dep: initTime(),
    removal: initTime(),
    departureDate: initTime(),
  });

  // Fetch rakes that have arrived but not departed
  const fetchArrivedRakes = async () => {
    try {
      setLoading(true);
      const data = await rakeVisitAPI.getAllRakeVisits();
      if (data.success) {
        // Filter rakes that have arrival date but no departure date
        const arrivedNotDeparted = data.data.filter(visit => 
          visit.ARRVAL_DATE && !visit.DEPARTURE_DATE
        );
        setArrivedRakes(arrivedNotDeparted);
      } else {
        console.error("Failed to fetch arrived rakes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching arrived rakes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivedRakes();
  }, []);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Handle visit selection
  const handleVisitSelection = (visit) => {
    setSelectedVisit(visit);
    setForm((f) => ({
      ...f,
      rakeName: visit.RAKE_ID ? `RAKE-${visit.RAKE_ID}` : "",
      trainNumber: visit.IB_TRAIN_NO || visit.OB_TRAIN_NO || "",
      tripNo: visit.TRIP_NO || "",
      rrNo: visit.RR_NO || "",
      rrDate: visit.RR_DATE ? new Date(visit.RR_DATE).toISOString().split('T')[0] : "",
      rrAmount: visit.RR_AMOUNT || "",
    }));
  };

  // Filter arrived rakes based on search
  const filteredRakes = arrivedRakes.filter(
    (visit) =>
      visit.IB_TRAIN_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.OB_TRAIN_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.TRIP_NO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.RAKE_ID?.toString().includes(searchTerm.toLowerCase())
  );

  // Convert form data to API format - Update existing visit with departure data
  const formatFormForAPI = () => {
    if (!selectedVisit) return null;

    return {
      // Keep existing arrival data
      IB_TRAIN_NO: selectedVisit.IB_TRAIN_NO,
      OB_TRAIN_NO: selectedVisit.OB_TRAIN_NO,
      TERMINAL_ID: selectedVisit.TERMINAL_ID,
      IB_LOAD_TERMINAL: selectedVisit.IB_LOAD_TERMINAL,
      OB_DISCHARGE_TERMINAL: selectedVisit.OB_DISCHARGE_TERMINAL,
      ARRVAL_DATE: selectedVisit.ARRVAL_DATE,
      IB_ROUTE_ID: selectedVisit.IB_ROUTE_ID,
      OB_ROUTE_ID: selectedVisit.OB_ROUTE_ID,
      TERMINAL_OPERATOR_ID: selectedVisit.TERMINAL_OPERATOR_ID,
      RAILWAY_LINE_ID: selectedVisit.RAILWAY_LINE_ID,
      DEST_VISIT_ID: selectedVisit.DEST_VISIT_ID,
      RAKE_ID: selectedVisit.RAKE_ID,
      NEXT_PORT: selectedVisit.NEXT_PORT,
      DISPATCH_MAIL_STATUS: selectedVisit.DISPATCH_MAIL_STATUS,
      ARRIVAL_MAIL_STATUS: selectedVisit.ARRIVAL_MAIL_STATUS,
      REROUTE_STATUS: selectedVisit.REROUTE_STATUS,
      CREATED_BY: selectedVisit.CREATED_BY,
      CREATED_ON: selectedVisit.CREATED_ON,
      DOUBLE_STACK: selectedVisit.DOUBLE_STACK,
      POOLING: selectedVisit.POOLING,
      HAULAGE_PAID_BY: selectedVisit.HAULAGE_PAID_BY,
      MAIN_OB_TRAIN_NO: selectedVisit.MAIN_OB_TRAIN_NO,
      SUB_ROUTE_ID: selectedVisit.SUB_ROUTE_ID,
      PLANE_TYPE: selectedVisit.PLANE_TYPE,
      BILLABLE_DISTANCE: selectedVisit.BILLABLE_DISTANCE,
      
      // Keep existing arrival timing fields
      A_PLACEMENT_DATE: selectedVisit.A_PLACEMENT_DATE,
      UNLOAD_START_DATE: selectedVisit.UNLOAD_START_DATE,
      UNLOAD_COMPLETION_DATE: selectedVisit.UNLOAD_COMPLETION_DATE,
      A_STABLING_START_DATE: selectedVisit.A_STABLING_START_DATE,
      A_STABLING_END_DATE: selectedVisit.A_STABLING_END_DATE,
      A_REMOVAL_DATE: selectedVisit.A_REMOVAL_DATE,
      EXAM_NO: selectedVisit.EXAM_NO,
      DEPARTURE_SIDDING: selectedVisit.DEPARTURE_SIDDING,
      ARRIVAL_STATION: selectedVisit.ARRIVAL_STATION,
      TRIP_NO: form.tripNo || selectedVisit.TRIP_NO,
      RR_NO: form.rrNo || selectedVisit.RR_NO,
      RR_DATE: form.rrDate ? new Date(form.rrDate).toISOString() : selectedVisit.RR_DATE,
      RR_AMOUNT: form.rrAmount ? parseFloat(form.rrAmount) : selectedVisit.RR_AMOUNT,
      DEVICE_ID: selectedVisit.DEVICE_ID,
      
      // NEW: Add departure timing fields (D_ prefix for departure operations)
      D_PLACEMENT_DATE: form.placement_dep.date ? 
        new Date(`${form.placement_dep.date}T${form.placement_dep.hh}:${form.placement_dep.mm}:00`).toISOString() : null,
      LOAD_START_DATE: form.loadingStart.date ? 
        new Date(`${form.loadingStart.date}T${form.loadingStart.hh}:${form.loadingStart.mm}:00`).toISOString() : null,
      LOAD_COMPLETION_DATE: form.loadingEnd.date ? 
        new Date(`${form.loadingEnd.date}T${form.loadingEnd.hh}:${form.loadingEnd.mm}:00`).toISOString() : null,
      D_STABLING_START_DATE: form.stablingStart_dep.date ? 
        new Date(`${form.stablingStart_dep.date}T${form.stablingStart_dep.hh}:${form.stablingStart_dep.mm}:00`).toISOString() : null,
      D_STABLING_END_DATE: form.stablingEnd_dep.date ? 
        new Date(`${form.stablingEnd_dep.date}T${form.stablingEnd_dep.hh}:${form.stablingEnd_dep.mm}:00`).toISOString() : null,
      D_REMOVAL_DATE: form.removal.date ? 
        new Date(`${form.removal.date}T${form.removal.hh}:${form.removal.mm}:00`).toISOString() : null,
      
      // MOST IMPORTANT: Set departure date
      DEPARTURE_DATE: form.departureDate.date ? 
        new Date(`${form.departureDate.date}T${form.departureDate.hh}:${form.departureDate.mm}:00`).toISOString() : null,
      
      // Update remarks to include departure
      REMARKS: `${selectedVisit.REMARKS || ''} | Departure completed - ${new Date().toLocaleDateString()}`,
    };
  };

  // Validate required fields
  const validateForm = () => {
    // Check if a visit is selected
    if (!selectedVisit) {
      return "Please select a rake that has arrived";
    }

    // Check required timing fields
    const requiredTimes = ['departureDate'];
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
      
      console.log('Saving rake departure data:', apiData);
      
      // Update existing visit with departure data
      const response = await rakeVisitAPI.updateRakeVisit(selectedVisit.VISIT_ID, apiData);
      
      if (response.success) {
        setSaved(true);
        setIsEditing(false);
        setTimeout(() => setSaved(false), 3000);
        
        // Show success message
        toast.success("Rake departure data saved successfully! Complete record created.");
        
        // Refresh the arrived rakes list
        fetchArrivedRakes();
        
        // Reset form after successful save
        setForm({
          rakeName: "",
          trainNumber: "",
          tripNo: "",
          lineTrack: "Line-1",
          rrNo: "",
          rrDate: "",
          rrAmount: "",
          placement_dep: initTime(),
          loadingStart: initTime(),
          loadingEnd: initTime(),
          stablingStart_dep: initTime(),
          stablingEnd_dep: initTime(),
          removal: initTime(),
          departureDate: initTime(),
        });
        setSelectedVisit(null);
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
              <h1 className="text-xl font-bold text-gray-900">Rake Departure Management</h1>
              <p className="text-xs text-gray-500">Complete rake operations with departure timings</p>
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
        {/* Arrived Rakes Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-600 px-6 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Train className="w-4 h-4" /> Arrived Rakes
            </h2>
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Ready for Departure</span>
          </div>
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by train number, trip, or rake ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
              </div>
            </div>

            {/* Arrived Rakes List */}
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-3 text-sm text-gray-600">Loading arrived rakes...</p>
                </div>
              ) : filteredRakes.length === 0 ? (
                <div className="text-center py-8">
                  <Train className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    {searchTerm ? "No rakes found matching your search" : "No rakes ready for departure"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredRakes.map((visit) => (
                    <div
                      key={visit.VISIT_ID}
                      onClick={() => handleVisitSelection(visit)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        selectedVisit?.VISIT_ID === visit.VISIT_ID
                          ? "bg-green-50 border-l-4 border-l-green-500"
                          : "hover:border-l-4 hover:border-l-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Train className={`w-6 h-6 ${
                            selectedVisit?.VISIT_ID === visit.VISIT_ID ? "text-green-600" : "text-gray-400"
                          }`} />
                          <div>
                            <div className={`font-semibold text-lg ${
                              selectedVisit?.VISIT_ID === visit.VISIT_ID ? "text-green-700" : "text-gray-900"
                            }`}>
                              {visit.IB_TRAIN_NO} → {visit.OB_TRAIN_NO}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              RAKE ID: {visit.RAKE_ID} • Trip {visit.TRIP_NO}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Arrived: {visit.ARRVAL_DATE ? new Date(visit.ARRVAL_DATE).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            Arrived
                          </span>
                          {selectedVisit?.VISIT_ID === visit.VISIT_ID && (
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
            
            {selectedVisit && (
              <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">Selected Rake for Departure</div>
                    <div className="text-green-700">
                      {selectedVisit.IB_TRAIN_NO} → {selectedVisit.OB_TRAIN_NO} • RAKE ID: {selectedVisit.RAKE_ID}
                    </div>
                    <div className="text-green-600 text-sm">
                      Arrived: {selectedVisit.ARRVAL_DATE ? new Date(selectedVisit.ARRVAL_DATE).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Departure Timings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-600 px-6 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" /> Departure Timings
            </h2>
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Outbound Operations</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: "Placement", key: "placement_dep" },
              { label: "Loading Start", key: "loadingStart" },
              { label: "Loading End", key: "loadingEnd" },
              { label: "Stabling Start", key: "stablingStart_dep" },
              { label: "Stabling End", key: "stablingEnd_dep" },
              { label: "Removal", key: "removal" },
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
                      <Check className="w-4 h-4" /> Complete Departure
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
