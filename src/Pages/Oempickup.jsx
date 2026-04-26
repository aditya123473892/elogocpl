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
  QrCode,
  Camera,
} from "lucide-react";
import { oemPickupAPI, locationMasterAPI, driverMasterAPI } from "../utils/Api";
import QRCodeLib from "qrcode";
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
  transportationType: "TRUCK", // Default to truck
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
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableVINs, setAvailableVINs] = useState([]);
  const [vinValidation, setVinValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [locations, setLocations] = useState([]);
  const [Sideings, setSideings] = useState([]);
  const [yards, setYards] = useState([]);
  const [plants, setPlants] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [allDriversData, setAllDriversData] = useState([]);
  const [driverDetails, setDriverDetails] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingVINs, setPendingVINs] = useState([]);
  const [showPendingVINs, setShowPendingVINs] = useState(false);
  const [pendingVINsError, setPendingVINsError] = useState(null);
  const [pendingVINsSearch, setPendingVINsSearch] = useState("");
  const debounceTimerRef = useRef(null);

  // Toast notification function - moved before fetchLocations
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationMasterAPI.getAllLocations();
      const allLocations = response.data || [];
      setLocations(allLocations);
      
      // Separate locations by type
      const SideingLocations = allLocations
        .filter(loc => loc.LocationType === 'Sideing' && loc.IsActive)
        .map(loc => loc.LocationName);
      const yardLocations = allLocations
        .filter(loc => loc.LocationType === 'YARD' && loc.IsActive)
        .map(loc => loc.LocationName);
      
      setSideings(SideingLocations);
      setYards(yardLocations);
      // Use Sideing locations as plant options for OEM Pickup
      setPlants(SideingLocations);
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
      generateDriverQRCode(selectedDriver);
      setShowQRModal(true);
    } else {
      setDriverDetails(null);
      setQrCodeUrl("");
      setShowQRModal(false);
    }
  }, [allDriversData]);

  // Generate QR code for driver information
  const generateDriverQRCode = async (driver) => {
    try {
      const driverInfo = {
        driver_id: driver.driver_id,
        driver_name: driver.driver_name,
        driver_contact: driver.driver_contact || 'N/A',
        license_number: driver.license_number || 'N/A',
        transporter: form.vendorTransporter || 'N/A',
        truck_number: form.truckNumber || 'N/A'
      };
      
      const qrData = JSON.stringify(driverInfo);
      const qrUrl = await QRCodeLib.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Fetch pending VINs for OEM pickup
  const fetchPendingVINs = useCallback(async () => {
    try {
      const response = await oemPickupAPI.getAvailableVINs();
      setPendingVINs(response.data || []);
      setPendingVINsError(null);
    } catch (error) {
      console.error('Error fetching pending VINs:', error);
      setPendingVINsError('Backend endpoint not available. Please implement /oem-pickup/available-vins endpoint.');
      setPendingVINs([]);
    }
  }, []);

  // Fetch locations and drivers on component mount
  useEffect(() => {
    fetchLocations();
    fetchDrivers();
  }, [fetchLocations, fetchDrivers]);

  // Debounced VIN validation - stops API calls while typing
  const validateVINsDebounced = useCallback(async (vinDetails) => {
    if (!vinDetails.trim()) {
      setVinValidation(null);
      return;
    }

    // Parse VINs from textarea to array for validation
    const vinArray = vinDetails.split(/[,\s\n]+/).map((vin) => vin.trim().toUpperCase()).filter((vin) => vin.length > 0);

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
      "transportationType",
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
    console.log("Form data before validation:", form);
    if (!validate()) return;

    try {
      setLoading(true);
      console.log("Sending to API:", form);
      
      await oemPickupAPI.createOEMPickup(form);
      setSaved(true);
      showToast("OEM Pickup created successfully!", 'success');
      setTimeout(() => {
        setSaved(false);
        setLoading(false);
      }, 3500);
    } catch (error) {
      console.error("Error creating OEM Pickup:", error);
      console.error("Error response:", error.response);
      
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

  const handleAddVIN = (vin) => {
    const currentVINs = form.vinDetails.split(/[,\s\n]+/).map((v) => v.trim().toUpperCase()).filter((v) => v.length > 0);
    if (!currentVINs.includes(vin)) {
      const newVINs = [...currentVINs, vin].join(", ");
      setForm((prev) => ({ ...prev, vinDetails: newVINs }));
    }
  };

  const handleTogglePendingVINs = () => {
    setShowPendingVINs(!showPendingVINs);
    if (!showPendingVINs && pendingVINs.length === 0) {
      fetchPendingVINs();
    }
  };

  // Filter pending VINs based on search
  const filteredPendingVINs = pendingVINs.filter(vin =>
    vin.toLowerCase().includes(pendingVINsSearch.toLowerCase())
  );

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
                    (Only VINs from delivery reports allowed)
                  </span>
                </FieldLabel>
                
                {/* Toggle Button for Pending VINs */}
                <button
                  type="button"
                  onClick={handleTogglePendingVINs}
                  className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-300 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  {showPendingVINs ? 'Hide Pending VINs' : 'Show Pending VINs'}
                  {pendingVINs.length > 0 && !showPendingVINs && (
                    <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {pendingVINs.length}
                    </span>
                  )}
                </button>

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

                {/* Pending VINs Display */}
                {showPendingVINs && pendingVINs.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ScanLine className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                        Pending VINs for OEM Pickup ({pendingVINs.length})
                      </span>
                    </div>
                    {/* Search Input */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={pendingVINsSearch}
                        onChange={(e) => setPendingVINsSearch(e.target.value)}
                        placeholder="Search VINs..."
                        className="w-full px-3 py-2 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {pendingVINsSearch && (
                        <button
                          type="button"
                          onClick={() => setPendingVINsSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredPendingVINs.length > 0 ? (
                        filteredPendingVINs.map((vin) => {
                          const currentVINs = form.vinDetails.split(/[,\s\n]+/).map((v) => v.trim().toUpperCase()).filter((v) => v.length > 0);
                          const isAdded = currentVINs.includes(vin);
                          return (
                            <button
                              key={vin}
                              type="button"
                              onClick={() => handleAddVIN(vin)}
                              disabled={isAdded}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                isAdded
                                  ? "bg-green-100 text-green-600 cursor-not-allowed"
                                  : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-100 hover:border-blue-400"
                              }`}
                            >
                              {isAdded ? <Check className="h-3 w-3 inline mr-1" /> : null}
                              {vin}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500 italic">No VINs match your search</p>
                      )}
                    </div>
                  </div>
                )}

                {showPendingVINs && pendingVINs.length === 0 && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    {pendingVINsError ? (
                      <div className="flex items-center gap-2 justify-center text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-xs">{pendingVINsError}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No pending VINs available</p>
                    )}
                  </div>
                )}

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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-800">Driver Information</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Show QR Code
                  </button>
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
              type="button"
              onClick={() => navigate('/customer/vin-survey')}
              className="flex items-center px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-sm font-medium transition-colors"
            >
              <Camera className="h-4 w-4 mr-2" />
              VIN Survey
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

      {/* QR Code Modal */}
      {showQRModal && qrCodeUrl && driverDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Driver QR Code</h3>
            </div>
            
            <div className="flex flex-col items-center">
              <img 
                src={qrCodeUrl} 
                alt="Driver QR Code" 
                className="w-64 h-64 border-2 border-gray-200 rounded-lg mb-4"
              />
              
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver ID:</span>
                  <span className="font-medium">{driverDetails.driver_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{driverDetails.driver_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-medium">{driverDetails.driver_contact || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium">{driverDetails.license_number || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                Scan for driver information
              </div>
            </div>
          </div>
        </div>
      )}

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