import { useState, useEffect, useCallback, useRef } from "react";
import {
  Truck,
  Navigation,
  MapPin,
  Calendar,
  Clock,
  RefreshCw,
  Save,
  ChevronDown,
  CheckCircle,
  Package,
  AlertCircle,
  X,
  Check,
  Camera,
} from "lucide-react";
import { arrivalAtPlantAPI, locationMasterAPI } from "../utils/Api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const today = new Date().toISOString().split("T")[0];

const defaultForm = {
  transportMode: "",
  yardLocation: "",
  SideingLocation: "",
  arrivalDate: today,
  arrivalTime: "",
  departureTime: "",
  remarks: "",
  selectedTruck: "",
  vehicleDetails: null,
};

// ── Searchable Select Component ──────────────────────────────────────────────
const SearchableSelect = ({ value, onChange, options, placeholder, hasError }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Sync input display when value changes externally (e.g. reset)
  useEffect(() => {
    if (!open) setQuery(value || "");
  }, [value, open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value || "");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    inputRef.current?.focus();
    setOpen(true);
  };

  const highlight = (text) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-green-100 text-green-800 rounded-sm font-semibold px-px not-italic">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const inputBase =
    "w-full px-3 py-2.5 border rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-all placeholder-gray-400";

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(""); // clear confirmed selection while typing
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputBase} pr-16 ${
            hasError
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-gray-300 focus:ring-green-500 focus:border-green-500"
          }`}
        />

        {/* Clear button — only shown when there is text */}
        {query && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                onMouseDown={() => handleSelect(opt)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  opt === value
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Truck className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                <span className="flex-1">{highlight(opt)}</span>
                {opt === value && (
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Shared UI primitives ─────────────────────────────────────────────────────
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

// Plain select (kept for non-truck fields like Siding / Yard)
const SelectField = ({ value, onChange, options, placeholder, hasError }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} appearance-none pr-9 ${
        !value ? "text-gray-400" : "text-gray-800"
      } ${hasError ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
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

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ArrivalAtPlantPage() {
  const { selectedLocation } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [vinData, setVinData] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [availableSelfDriven, setAvailableSelfDriven] = useState([]);
  const [Sideings, setSideings] = useState([]);
  const [yards, setYards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Fetch vehicles & locations on mount
  useEffect(() => {
    const fetchAvailableVehicles = async () => {
      try {
        const response = await arrivalAtPlantAPI.getOEMPickupVehicles();
        const allVehicles = response.data || [];
        setAvailableTrucks(allVehicles.filter((v) => v.transportationType === "TRUCK"));
        setAvailableSelfDriven(allVehicles.filter((v) => v.transportationType === "SELF_DRIVEN"));
      } catch (error) {
        console.error("Error fetching available vehicles:", error);
        showToast("Failed to load available vehicles", "error");
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await locationMasterAPI.getAllLocations();
        const allLocations = response.data || [];
        setSideings(
          allLocations
            .filter((loc) => loc.LocationType === "Sideing" && loc.IsActive)
            .map((loc) => loc.LocationName)
        );
        setYards(
          allLocations
            .filter((loc) => loc.LocationType === "YARD" && loc.IsActive)
            .map((loc) => loc.LocationName)
        );
      } catch (error) {
        console.error("Error fetching locations:", error);
        showToast("Failed to fetch locations", "error");
      }
    };

    fetchAvailableVehicles();
    fetchLocations();
  }, [showToast]);

  // Generic field setter
  const set = (field) => async (val) => {
    const value = typeof val === "string" ? val : val.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "selectedTruck") {
      if (value) {
        await fetchVehicleDetails(value);
      } else {
        setForm((prev) => ({ ...prev, vehicleDetails: null }));
        setVinData([]);
      }
    }

    if (field === "transportMode") {
      // Clear truck selection when mode switches
      setForm((prev) => ({
        ...prev,
        selectedTruck: "",
        vehicleDetails: null,
        SideingLocation: "",
        yardLocation: "",
      }));
      setVinData([]);
    }
  };

  const fetchVehicleDetails = async (truckNumber) => {
    try {
      setLoading(true);
      const response = await arrivalAtPlantAPI.getVehicleDetailsByTruck(truckNumber);
      const vehicleDetails = response.data;

      setForm((prev) => ({ ...prev, vehicleDetails }));

      if (vehicleDetails?.vinDetails) {
        const vinArray = vehicleDetails.vinDetails
          .split(/[,\s\n]+/)
          .map((vin) => vin.trim().toUpperCase())
          .filter((vin) => vin.length > 0);
        setVinData(vinArray);
      } else {
        setVinData([]);
      }

      if (vehicleDetails) {
        if (!form.transportMode) {
          setForm((prev) => ({ ...prev, transportMode: "Truck" }));
        }
        if (vehicleDetails.sideing || vehicleDetails.sidingLocation || vehicleDetails.plant) {
          setForm((prev) => ({
            ...prev,
            SideingLocation: vehicleDetails.sideing || vehicleDetails.sidingLocation || vehicleDetails.plant,
          }));
        }
        if (vehicleDetails.yard || vehicleDetails.yardLocation) {
          setForm((prev) => ({
            ...prev,
            yardLocation: vehicleDetails.yard || vehicleDetails.yardLocation,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      showToast("Failed to load vehicle details", "error");
      setVinData([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const required = ["selectedTruck", "arrivalDate"];
    const errs = {};
    required.forEach((f) => {
      if (!form[f] || !String(form[f]).trim()) errs[f] = true;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const arrivalData = {
        truckNumber: form.selectedTruck,
        arrivalDate: form.arrivalDate,
        arrivalTime: form.arrivalTime,
        departureTime: form.departureTime,
        remarks: form.remarks,
      };
      await arrivalAtPlantAPI.createArrival(arrivalData);
      setSaved(true);
      showToast("Arrival date and remarks updated successfully!", "success");
      setTimeout(() => {
        setSaved(false);
        setLoading(false);
        handleReset();
      }, 3500);
    } catch (error) {
      console.error("Error updating arrival:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to update arrival date and remarks";
      showToast(errorMessage, "error");
      setErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setErrors({});
    setSaved(false);
    setVinData([]);
    setToast(null);
  };

  const fc = (key) =>
    `${inputClass} ${errors[key] ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;

  const hasSummary = form.transportMode || form.yardLocation || form.selectedTruck;

  // Options for the searchable dropdowns
  const truckOptions = availableTrucks.map((t) => t.truckNumber);
  const selfDrivenOptions = availableSelfDriven.map((v) => v.vehicleNumber || v.truckNumber);
  const vehicleOptions = form.transportMode === "Self-Driven" ? selfDrivenOptions : truckOptions;

  return (
    <div className="p-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Siding At Plant</h2>
          <p className="text-gray-600 mt-1">
            Log vehicle arrival details at the plant with yard and timing info
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
            className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </button>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {errors.general && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errors.general}</span>
        </div>
      )}

      {/* ── Success Banner ───────────────────────────────────────── */}
      {saved && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium">
            Arrival logged successfully. Vehicle entry recorded at plant.
          </span>
        </div>
      )}

      {/* ── Main Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} noValidate>

          {/* Section 1: Transport Mode */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Truck} title="Transport Mode" color="green" />
            <div>
              <FieldLabel required>Select Mode</FieldLabel>
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                {["Self-Driven", "Truck"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set("transportMode")(mode)}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.transportMode === mode
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {mode === "Self-Driven" ? (
                      <Navigation className="h-4 w-4" />
                    ) : (
                      <Truck className="h-4 w-4" />
                    )}
                    {mode}
                  </button>
                ))}
              </div>
              {errors.transportMode && (
                <p className="text-xs text-red-500 mt-2">Transport mode is required</p>
              )}
              {form.transportMode && (
                <div className="mt-3">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      form.transportMode === "Truck"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {form.transportMode} selected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 1.5: Vehicle Selection — searchable dropdown */}
          {form.transportMode && (
            <div className="px-6 pt-6 pb-5 border-b border-gray-100">
              <SectionHeader icon={Truck} title="Vehicle Selection" color="blue" />
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>
                    Select{" "}
                    {form.transportMode === "Self-Driven" ? "Self-Driven Vehicle" : "Truck"}
                  </FieldLabel>
                  <SearchableSelect
                    value={form.selectedTruck}
                    onChange={set("selectedTruck")}
                    options={vehicleOptions}
                    placeholder={`Search ${
                      form.transportMode === "Self-Driven" ? "vehicle" : "truck"
                    } number...`}
                    hasError={!!errors.selectedTruck}
                  />
                  {errors.selectedTruck && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.transportMode === "Self-Driven" ? "Vehicle" : "Truck"} selection is
                      required
                    </p>
                  )}
                  {vehicleOptions.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      No{" "}
                      {form.transportMode === "Self-Driven"
                        ? "self-driven vehicles"
                        : "trucks"}{" "}
                      available from OEM Pickup
                    </p>
                  )}
                </div>

                <div>
                  {form.vehicleDetails && (
                    <div className="mt-6">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <span className="font-semibold">Plant:</span>{" "}
                          {form.vehicleDetails.plant}
                        </div>
                        <div>
                          <span className="font-semibold">Driver:</span>{" "}
                          {form.vehicleDetails.driverName}
                        </div>
                        <div>
                          <span className="font-semibold">Pickup Date:</span>{" "}
                          {form.vehicleDetails.pickupDate}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Location & VIN */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={MapPin} title="Location & VIN Details" color="blue" />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Siding Location</FieldLabel>
                {form.vehicleDetails &&
                (form.vehicleDetails.sideing || form.vehicleDetails.sidingLocation || form.vehicleDetails.plant) ? (
                  <>
                    <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-700">
                      {form.vehicleDetails.sideing || form.vehicleDetails.sidingLocation || form.vehicleDetails.plant}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Siding location auto-populated from OEM pickup data
                    </p>
                  </>
                ) : (
                  <SelectField
                    value={form.SideingLocation}
                    onChange={set("SideingLocation")}
                    options={Sideings}
                    placeholder="Select Siding Location"
                    hasError={!!errors.SideingLocation}
                  />
                )}
                {errors.SideingLocation && (
                  <p className="text-xs text-red-500 mt-1">Siding location is required</p>
                )}
              </div>

              <div>
                <FieldLabel required>VIN Details</FieldLabel>
                {form.selectedTruck && Array.isArray(vinData) && vinData.length > 0 ? (
                  <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <div className="px-3 py-2 bg-green-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-700">
                        {vinData.length} VINs loaded from {form.selectedTruck}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 font-semibold">
                        Auto-populated
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-36 overflow-y-auto">
                      {vinData.map((vin, i) => (
                        <div key={i} className="flex items-center px-3 py-2 gap-3">
                          <Package className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs font-mono text-gray-700">{vin}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : form.transportMode && !form.selectedTruck ? (
                  <div className="w-full px-3 py-4 border border-gray-300 rounded-lg bg-yellow-50 text-sm text-yellow-600 text-center min-h-[88px] flex items-center justify-center">
                    <div>
                      <Truck className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs">
                        Search and select a{" "}
                        {form.transportMode === "Self-Driven" ? "vehicle" : "truck"} to load VIN
                        data
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-3 py-4 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-400 text-center min-h-[88px] flex items-center justify-center">
                    <div>
                      <Package className="h-5 w-5 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs">
                        VIN data will appear here after selecting{" "}
                        {form.transportMode === "Self-Driven" ? "vehicle" : "truck"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Arrival Details */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Calendar} title="Arrival Details" color="green" />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Arrival Date</FieldLabel>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={form.arrivalDate}
                    onChange={set("arrivalDate")}
                    className={`${fc("arrivalDate")} pl-9`}
                  />
                </div>
                {errors.arrivalDate && (
                  <p className="text-xs text-red-500 mt-1">Arrival date is required</p>
                )}
              </div>
              <div>
                <FieldLabel>Arrival Time</FieldLabel>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={form.arrivalTime}
                    onChange={set("arrivalTime")}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Optional — vehicle arrival time at plant</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mt-5">
              <div>
                <FieldLabel>Departure Time</FieldLabel>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={form.departureTime}
                    onChange={set("departureTime")}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Optional — vehicle departure time from plant</p>
              </div>
              <div>
                <FieldLabel>Remarks</FieldLabel>
                <textarea
                  value={form.remarks}
                  onChange={set("remarks")}
                  placeholder="Enter remarks if any... (e.g. RMK ARRIVAL_DATE_TIME)"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Live Summary */}
          {hasSummary && (
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">
                  Entry Preview
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-1.5">
                  {form.selectedTruck && (
                    <span className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">
                        {form.transportMode === "Self-Driven" ? "Vehicle" : "Truck"}:
                      </span>{" "}
                      {form.selectedTruck}
                    </span>
                  )}
                  {vinData.length > 0 && (
                    <span className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">VINs:</span>{" "}
                      {vinData.length} vehicles
                    </span>
                  )}
                  {form.arrivalDate && (
                    <span className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">Arrival Date:</span>{" "}
                      {new Date(form.arrivalDate).toLocaleDateString("en-IN")}
                    </span>
                  )}
                  {form.arrivalTime && (
                    <span className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">Arrival Time:</span>{" "}
                      {form.arrivalTime}
                    </span>
                  )}
                  {form.departureTime && (
                    <span className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">Departure Time:</span>{" "}
                      {form.departureTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Fields marked <span className="text-red-400 font-semibold">*</span> are required
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
              >
                Clear
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
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