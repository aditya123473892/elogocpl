import { useState, useEffect, useCallback, useRef } from "react";
import {
  Truck,
  Calendar,
  User,
  RefreshCw,
  Save,
  ChevronDown,
  ScanLine,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { oemPickupAPI } from "../utils/Api";

const plants = [
  "Plant A - Mumbai",
  "Plant B - Pune",
  "Plant C - Delhi",
  "Plant D - Bangalore",
  "Plant E - Chennai",
];
const terminals = [
  "Yard Terminal 1 - Gate A",
  "Yard Terminal 2 - Gate B",
  "Yard Terminal 3 - Gate C",
  "Yard Terminal 4 - Gate D",
];
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
  driverName: "",
  remarks: "",
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

export default function OEMPickupPage() {
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableVINs, setAvailableVINs] = useState([]);
  const [vinValidation, setVinValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const debounceTimerRef = useRef(null);

  // Toast notification function
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Debounced VIN validation - stops API calls while typing
  const validateVINsDebounced = useCallback(async (vinDetails) => {
    if (!vinDetails.trim()) {
      setVinValidation(null);
      return;
    }

    // Parse VINs from textarea to array for validation
    const vinArray = vinDetails.split(/[,\\s\\n]+/).map((vin) => vin.trim().toUpperCase()).filter((vin) => vin.length > 0);

    try {
      const validation = await oemPickupAPI.validateVINs(vinArray);
      setVinValidation(validation.data);

      // Clear VIN-related errors if validation passes
      if (validation.data.isValid) {
        setErrors((prev) => ({ ...prev, vinDetails: null }));
      }
    } catch (error) {
      console.error("Error validating VINs:", error);
      // Don't show toast for validation errors to avoid spamming
    }
  }, []);

  // Handle VIN change - NO API CALLS WHILE TYPING
  const handleVINChange = (vinDetails) => {
    setForm((prev) => ({ ...prev, vinDetails }));
    
    // Clear any existing validation while typing
    setVinValidation(null);
    setErrors((prev) => ({ ...prev, vinDetails: null }));
    
    // Clear existing timer if any
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

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
    ];
    const errs = {};
    required.forEach((f) => {
      if (!form[f] || !form[f].trim()) errs[f] = true;
    });

    // Additional VIN validation
    if (vinValidation && !vinValidation.isValid) {
      errs.vinDetails = true;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      
      await oemPickupAPI.createOEMPickup(form);
      setSaved(true);
      showToast("OEM Pickup created successfully!", 'success');
      setTimeout(() => {
        setSaved(false);
        setLoading(false);
      }, 3500);
    } catch (error) {
      console.error("Error creating OEM Pickup:", error);
      
      // Show detailed error message from backend
      const errorMessage = error.response?.data?.error || error.message || "Failed to create OEM Pickup record";
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
  };

  const fc = (key) =>
    `${inputClass} ${errors[key] ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;

  return (
    <div className="p-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">OEM Pickup Entry</h2>
          <p className="text-gray-600 mt-1">
            Register a new vehicle pickup with dispatch and driver details
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
            Pickup entry saved successfully. Vehicle dispatched and logged.
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

      {/* ── Main Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Assignment ───────────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={ClipboardList} title="Assignment Details" color="green" />
            <div className="grid grid-cols-3 gap-5">
              <div>
                <FieldLabel required>Plant</FieldLabel>
                <SelectField
                  value={form.plant}
                  onChange={set("plant")}
                  options={plants}
                  placeholder="Select Plant"
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
                  options={terminals}
                  placeholder="Select Terminal"
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
                    (Only VINs from delivery reports allowed)
                  </span>
                </FieldLabel>
                <div className="relative">
                  <textarea
                    value={form.vinDetails}
                    onChange={(e) => handleVINChange(e.target.value)}
                    placeholder="Enter or scan VIN numbers (use commas or spaces to separate)"
                    rows={3}
                    className={`${fc("vinDetails")} resize-none pr-10`}
                  />
                  <button
                    type="button"
                    title="Scan VIN"
                    className="absolute right-3 top-3 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <ScanLine className="h-4 w-4" />
                  </button>
                </div>

                {/* VIN Validation Feedback */}
                {vinValidation && (
                  <div className="mt-2 p-2 rounded-md border">
                    {vinValidation.isValid ? (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 border-green-200 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          {vinValidation.validVINs.length} valid VIN(s):{" "}
                          {vinValidation.validVINs.join(", ")}
                        </span>
                      </div>
                    ) : (
                      <div className="text-red-700 bg-red-50 border-red-200 p-2 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm font-medium">Invalid VINs detected:</p>
                        </div>
                        <p className="text-xs">{vinValidation.invalidVINs.join(", ")}</p>
                        <p className="text-xs mt-2">
                          Available VINs from delivery reports:{" "}
                          {vinValidation.availableVINs.slice(0, 10).join(", ")}
                          {vinValidation.availableVINs.length > 10 && "..."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  Alphanumeric, any length — use commas or spaces to separate
                </p>

                {errors.vinDetails && (
                  <p className="text-xs text-red-500 mt-1">Valid VIN details are required</p>
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
                <FieldLabel required>Delivery Date</FieldLabel>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={set("deliveryDate")}
                  className={fc("deliveryDate")}
                />
                {errors.deliveryDate && (
                  <p className="text-xs text-red-500 mt-1">Delivery date is required</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 4: Driver Details ───────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={User} title="Driver Details" color="green" />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Driver Name</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.driverName}
                    onChange={set("driverName")}
                    placeholder="Enter driver name"
                    className={`${fc("driverName")} pl-9`}
                  />
                </div>
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all transform ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-3 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}