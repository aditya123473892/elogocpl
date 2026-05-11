import { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Calendar,
  User,
  RefreshCw,
  Save,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { pickupWithoutASNAPI, locationMasterAPI, driverMasterAPI } from "../utils/Api";
import { useNavigate } from "react-router-dom";

const transporters = [
  "Transporter A Ltd.",
  "Transporter B Pvt.",
  "FastHaul Logistics",
  "Prime Carriers",
  "Blue Dart Transport",
];

const today = new Date().toISOString().split("T")[0];

const defaultForm = {
  plant: "",
  yardLocation: "",
  vendorTransporter: "",
  truckNumber: "",
  vinDetails: "",
  pickupDate: today,
  deliveryDate: today,
  arrivalTime: "",
  departureTime: "",
  driverName: "",
  remarks: "",
  transportationType: "TRUCK",
};

const SectionHeader = ({ icon: Icon, title, color = "green" }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    <div className={`p-1.5 rounded-md ${color === "green" ? "bg-green-100" : "bg-blue-100"}`}>
      <Icon className={`h-4 w-4 ${color === "green" ? "text-green-700" : "text-blue-700"}`} />
    </div>
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="ml-1 text-red-400">*</span>}
  </label>
);

const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-400";

const SelectField = ({ value, onChange, options, placeholder, hasError }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} appearance-none pr-9 ${!value ? "text-gray-400" : "text-gray-800"} ${
        hasError ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""
      }`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
  </div>
);

export default function PickupWithoutASN() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [locations, setLocations] = useState([]);
  const [Sideings, setSideings] = useState([]);
  const [yards, setYards] = useState([]);
  const [plants, setPlants] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [allDriversData, setAllDriversData] = useState([]);
  const [driverDetails, setDriverDetails] = useState(null);

  // Toast notification function
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationMasterAPI.getAllLocations();
      const allLocations = response.data || [];
      setLocations(allLocations);
      
      // Get all active locations for Sideing field
      const allActiveLocations = allLocations
        .filter(loc => loc.IsActive)
        .map(loc => loc.LocationName);
      const yardLocations = allLocations
        .filter(loc => loc.LocationType === 'YARD' && loc.IsActive)
        .map(loc => loc.LocationName);
      
      setSideings(allActiveLocations);
      setYards(yardLocations);
      // Use all active locations as plant options for Pickup Without ASN
      setPlants(allActiveLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast('Failed to fetch locations', 'error');
    }
  }, [showToast]);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await driverMasterAPI.getActiveDrivers();
      const allDrivers = response.data || [];
      // Store full driver data for details lookup
      setAllDriversData(allDrivers);
      // Extract driver names for dropdown
      const driverNames = allDrivers.map(driver => driver.driver_name);
      setDrivers(driverNames);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast('Failed to fetch drivers', 'error');
    }
  }, [showToast]);

  const handleDriverSelection = useCallback((driverName) => {
    setForm(prev => ({ ...prev, driverName }));
    
    // Find driver details from stored data
    const selectedDriver = allDriversData.find(driver => driver.driver_name === driverName);
    
    if (selectedDriver) {
      setDriverDetails(selectedDriver);
    } else {
      setDriverDetails(null);
    }
  }, [allDriversData]);

  // Fetch locations and drivers on component mount
  useEffect(() => {
    fetchLocations();
    fetchDrivers();
  }, [fetchLocations, fetchDrivers]);

  const set = (field) => (val) =>
    setForm((prev) => ({
      ...prev,
      [field]: typeof val === "string" ? val : val.target.value,
    }));

  const validate = () => {
    const required = [
      "plant",
      "yardLocation",
      "vendorTransporter",
      "truckNumber",
      "pickupDate",
      "deliveryDate",
      "vinDetails",
      "driverName",
      "transportationType",
    ];
    const errs = {};
    required.forEach((f) => {
      if (!form[f] || !form[f].trim()) errs[f] = true;
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data before validation:", form);
    if (!validate()) return;

    try {
      setLoading(true);
      console.log("Sending to API:", form);
      
      await pickupWithoutASNAPI.createPickupWithoutASN(form);
      setSaved(true);
      showToast("Pickup without ASN created successfully!", 'success');
      setTimeout(() => {
        setSaved(false);
        setLoading(false);
      }, 3500);
    } catch (error) {
      console.error("Error creating pickup without ASN:", error);
      console.error("Error response:", error.response);
      
      // Show detailed error message from backend
      const errorMessage = error.response?.data?.error || error.message || "Failed to create pickup without ASN";
      showToast(errorMessage, 'error');
      
      // Set general error for banner display
      setErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setErrors({});
    setSaved(false);
    setDriverDetails(null);
  };

  const fc = (key) =>
    `${inputClass} ${errors[key] ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;

  return (
    <div className="p-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pickup Without ASN</h2>
          <p className="text-gray-600 mt-1">
            Register a vehicle pickup without requiring ASN upload
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </button>
        </div>
      </div>

      {/* ── Success Banner ──────────────────────────────────────────── */}
      {saved && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium">
            Pickup entry saved successfully without ASN.
          </span>
        </div>
      )}

      {/* ── Error Banner ────────────────────────────────────────────── */}
      {errors.general && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errors.general}</span>
        </div>
      )}

      {/* ── Toast Notification ───────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Main Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} noValidate>
          {/* ── Section 1: Assignment Details ─────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Truck} title="Assignment Details" color="green" />
            <div className="grid grid-cols-4 gap-5">
              <div>
                <FieldLabel required>Sideing</FieldLabel>
                <SelectField
                  value={form.plant}
                  onChange={set("plant")}
                  options={plants}
                  placeholder="Select Sideing"
                  hasError={!!errors.plant}
                />
                {errors.plant && (
                  <p className="text-xs text-red-500 mt-1">Plant is required</p>
                )}
              </div>
              <div>
                <FieldLabel required>Yard Location</FieldLabel>
                <SelectField
                  value={form.yardLocation}
                  onChange={set("yardLocation")}
                  options={yards}
                  placeholder="Select Yard"
                  hasError={!!errors.yardLocation}
                />
                {errors.yardLocation && (
                  <p className="text-xs text-red-500 mt-1">Yard location is required</p>
                )}
              </div>
              <div>
                <FieldLabel required>Vendor / Transporter</FieldLabel>
                <SelectField
                  value={form.vendorTransporter}
                  onChange={set("vendorTransporter")}
                  options={transporters}
                  placeholder="Select Transporter"
                  hasError={!!errors.vendorTransporter}
                />
                {errors.vendorTransporter && (
                  <p className="text-xs text-red-500 mt-1">Transporter is required</p>
                )}
              </div>
              <div>
                <FieldLabel required>Transportation Type</FieldLabel>
                <SelectField
                  value={form.transportationType}
                  onChange={set("transportationType")}
                  options={["TRUCK", "SELF_DRIVEN"]}
                  placeholder="Select Transportation Type"
                  hasError={!!errors.transportationType}
                />
                {errors.transportationType && (
                  <p className="text-xs text-red-500 mt-1">Transportation type is required</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Vehicle Details ──────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Truck} title="Vehicle Details" color="blue" />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Truck Number</FieldLabel>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.truckNumber}
                    onChange={(e) => set("truckNumber")(e.target.value.toUpperCase())}
                    placeholder="e.g., DL6CV7887"
                    className={`${fc("truckNumber")} pl-9`}
                  />
                </div>
                {errors.truckNumber && (
                  <p className="text-xs text-red-500 mt-1">Truck number is required</p>
                )}
              </div>

              <div>
                <FieldLabel required>
                  VIN Details
                  <span className="ml-1 text-gray-400 normal-case tracking-normal font-normal text-xs">
                    (Enter VIN numbers separated by commas or spaces)
                  </span>
                </FieldLabel>
                <textarea
                  value={form.vinDetails}
                  onChange={(e) => set("vinDetails")(e.target.value)}
                  placeholder="Enter VIN numbers (use commas or spaces to separate)"
                  rows={3}
                  className={`${fc("vinDetails")} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Alphanumeric, any length — use commas or spaces to separate
                </p>

                {errors.vinDetails && (
                  <p className="text-xs text-red-500 mt-1">VIN details are required</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 3: Dispatch Details ─────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Calendar} title="Dispatch Details" color="green" />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Pickup Date</FieldLabel>
                <input
                  type="date"
                  value={form.pickupDate}
                  onChange={set("pickupDate")}
                  className={fc("pickupDate")}
                />
                {errors.pickupDate && (
                  <p className="text-xs text-red-500 mt-1">Pickup date is required</p>
                )}
              </div>
              <div>
                <FieldLabel required>Dispatch Date</FieldLabel>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={set("deliveryDate")}
                  className={fc("deliveryDate")}
                />
                {errors.deliveryDate && (
                  <p className="text-xs text-red-500 mt-1">Dispatch date is required</p>
                )}
              </div>
            </div>
            
            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-5 mt-5">
              <div>
                <FieldLabel>Pickup Time</FieldLabel>
                <input
                  type="time"
                  value={form.arrivalTime}
                  onChange={set("arrivalTime")}
                  className={inputClass}
                  placeholder="e.g., 09:30"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional - Vehicle arrival time at plant
                </p>
              </div>
              <div>
                <FieldLabel>Dispatch Time</FieldLabel>
                <input
                  type="time"
                  value={form.departureTime}
                  onChange={set("departureTime")}
                  className={inputClass}
                  placeholder="e.g., 14:45"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional - Vehicle departure time from plant
                </p>
              </div>
            </div>
          </div>

          {/* ── Section 4: Driver Details ───────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={User} title="Driver Details" color="green" />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Driver Name</FieldLabel>
                <SelectField
                  value={form.driverName}
                  onChange={handleDriverSelection}
                  options={drivers}
                  placeholder="Select Driver"
                  hasError={!!errors.driverName}
                />
                {errors.driverName && (
                  <p className="text-xs text-red-500 mt-1">Driver name is required</p>
                )}
              </div>
              <div>
                <FieldLabel>Remarks</FieldLabel>
                <textarea
                  value={form.remarks}
                  onChange={set("remarks")}
                  placeholder="Optional remarks..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Driver Details Display */}
            {driverDetails && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-800">Driver Information</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Driver ID:</span>
                    <p className="font-medium text-gray-900">{driverDetails.driver_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900">{driverDetails.driver_contact || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Form Actions ────────────────────────────────────────── */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
