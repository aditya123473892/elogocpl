import { useState, useRef, useEffect } from "react";
import {
  Warehouse,
  ScanLine,
  Save,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  LogIn,
  ArrowRight,
  Package,
  X,
} from "lucide-react";
import { loadingStageAPI } from "../utils/Api";

const defaultForm = {
  loadingStation: "",
  operationType: "",
  vinDetails: "",
  fnrNo: "",
  rakeNo: "",
  deckPosition: "",
  wagonNo: "",
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

const SelectField = ({ value, onChange, options, placeholder, hasError, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${inputClass} appearance-none pr-9 ${
        !value ? "text-gray-400" : "text-gray-800"
      } ${hasError ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""} ${
        disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
      }`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
  </div>
);

const parseVINs = (raw) =>
  raw
    .split(/[\s,\n]+/)
    .map((v) => v.trim().toUpperCase())
    .filter((v) => v.length > 0);

export default function LoadingStagePage() {
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/terminal-master");
        const result = await response.json();

        if (result.success && result.data) {
          const terminalOptions = result.data.map((t) => ({
            value: t.TerminalId,
            label: `${t.TerminalName} (${t.TerminalCode})`,
          }));
          setTerminals(terminalOptions);
        } else {
          setFetchError(true);
        }
      } catch (error) {
        console.error("Error fetching terminals:", error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminals();
  }, []);

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === "string" ? val : val.target.value }));

  const scannedVINs = parseVINs(form.vinDetails);

  const validate = () => {
    const errs = {};
    if (!form.loadingStation) errs.loadingStation = true;
    if (!form.operationType) errs.operationType = true;
    if (!form.vinDetails.trim()) errs.vinDetails = true;
    if (form.operationType === "Yard Out") {
      if (!form.fnrNo.trim()) errs.fnrNo = true;
      if (!form.rakeNo.trim()) errs.rakeNo = true;
      if (!form.deckPosition.trim()) errs.deckPosition = true;
      if (!form.wagonNo.trim()) errs.wagonNo = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    try {
      const loadingStageData = {
        loadingStation: form.loadingStation,
        operationType: form.operationType,
        vinDetails: form.vinDetails,
        ...(form.operationType === "Yard Out" && {
          fnrNo: form.fnrNo,
          rakeNo: form.rakeNo,
          deckPosition: form.deckPosition,
          wagonNo: form.wagonNo,
        }),
      };

      const response = await loadingStageAPI.createLoadingStage(loadingStageData);
      
      if (response.success) {
        setSaved(true);
        setForm(defaultForm);
        setErrors({});
        setTimeout(() => setSaved(false), 5000);
      } else {
        alert("Failed to save loading stage: " + response.message);
      }
    } catch (error) {
      console.error("Error saving loading stage:", error);
      alert("Error saving loading stage: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setErrors({});
    setSaved(false);
  };

  const removeVIN = (indexToRemove) => {
    const vins = parseVINs(form.vinDetails);
    vins.splice(indexToRemove, 1);
    set("vinDetails")(vins.join("\n"));
  };

  const fc = (key) =>
    `${inputClass} ${errors[key] ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;

  const selectedTerminalLabel =
    terminals.find((t) => String(t.value) === String(form.loadingStation))?.label || "";

  const hasSummary = form.loadingStation || form.operationType || scannedVINs.length > 0;

  return (
    <div className="p-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loading Stage</h2>
          <p className="text-gray-600 mt-1">
            Manage yard-in and yard-out operations with VIN tracking at loading stations
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
            disabled={saving}
            className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Loading Stage
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Success Banner ──────────────────────────────────────────── */}
      {saved && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium">
            Loading stage saved successfully.{" "}
            {scannedVINs.length} VIN{scannedVINs.length !== 1 ? "s" : ""} recorded for{" "}
            {form.operationType} at {selectedTerminalLabel || form.loadingStation}.
          </span>
        </div>
      )}

      {/* ── Fetch Error Banner ──────────────────────────────────────── */}
      {fetchError && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <X className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-sm font-medium">
            Failed to load terminals from the server. Please refresh and try again.
          </span>
        </div>
      )}

      {/* ── Main Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Station & Operation ──────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Warehouse} title="Station & Operation" color="green" />
            <div className="grid grid-cols-2 gap-5">

              {/* Loading Station */}
              <div>
                <FieldLabel required>Loading Station Name</FieldLabel>
                <SelectField
                  value={form.loadingStation}
                  onChange={set("loadingStation")}
                  options={terminals}
                  placeholder={
                    loading
                      ? "Loading terminals..."
                      : fetchError
                      ? "Failed to load terminals"
                      : "Select Loading Station"
                  }
                  hasError={!!errors.loadingStation}
                  disabled={loading || fetchError}
                />
                {errors.loadingStation && (
                  <p className="text-xs text-red-500 mt-1">Loading station is required</p>
                )}
              </div>

              {/* Operation Type */}
              <div>
                <FieldLabel required>Operation Type</FieldLabel>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  {[
                    { label: "Yard In", value: "Yard In", icon: LogIn },
                    { label: "Yard Out", value: "Yard Out", icon: ArrowRight },
                  ].map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("operationType")(value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                        form.operationType === value
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      } ${value === "Yard In" ? "border-r border-gray-300" : ""}`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
                {errors.operationType && (
                  <p className="text-xs text-red-500 mt-1">Operation type is required</p>
                )}
                {form.operationType && (
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        form.operationType === "Yard In"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {form.operationType} selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: VIN Details ───────────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={ScanLine} title="VIN Details" color="blue" />
            <div className="grid grid-cols-2 gap-5">

              {/* VIN Input */}
              <div>
                <FieldLabel required>Enter or Scan VIN Numbers</FieldLabel>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={form.vinDetails}
                    onChange={set("vinDetails")}
                    placeholder={"Enter or scan VIN numbers\n(use commas, spaces or new lines to separate)"}
                    rows={5}
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
                <p className="text-xs text-gray-400 mt-1.5">
                  VINs scanned:{" "}
                  <span
                    className={`font-semibold ${
                      scannedVINs.length > 0 ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {scannedVINs.length}
                  </span>
                </p>
                {errors.vinDetails && (
                  <p className="text-xs text-red-500 mt-0.5">VIN details are required</p>
                )}
              </div>

              {/* VIN Tag Preview */}
              <div>
                <FieldLabel>Scanned VIN List</FieldLabel>
                {scannedVINs.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-green-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-700">
                        {scannedVINs.length} VIN{scannedVINs.length !== 1 ? "s" : ""} detected
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 font-semibold">
                        Live Preview
                      </span>
                    </div>
                    <div className="p-3 max-h-40 overflow-y-auto divide-y divide-gray-50">
                      {scannedVINs.map((vin, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 group">
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs font-mono text-gray-700">{vin}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVIN(i)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg h-full min-h-[120px] flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-6 w-6 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-400">
                        VIN list will appear as you type or scan
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 3: Yard Out Details ──────────────────────────── */}
          {form.operationType === "Yard Out" && (
            <div className="px-6 pt-6 pb-5 border-b border-gray-100">
              <SectionHeader icon={ArrowRight} title="Yard Out Details" color="blue" />
              <div className="grid grid-cols-2 gap-5">

                {/* FNR No. */}
                <div>
                  <FieldLabel required>FNR No.</FieldLabel>
                  <input
                    type="text"
                    value={form.fnrNo}
                    onChange={set("fnrNo")}
                    placeholder="Enter FNR number"
                    className={fc("fnrNo")}
                  />
                  {errors.fnrNo && (
                    <p className="text-xs text-red-500 mt-1">FNR No. is required for Yard Out</p>
                  )}
                </div>

                {/* Rake No. */}
                <div>
                  <FieldLabel required>Rake No.</FieldLabel>
                  <input
                    type="text"
                    value={form.rakeNo}
                    onChange={set("rakeNo")}
                    placeholder="Enter Rake number"
                    className={fc("rakeNo")}
                  />
                  {errors.rakeNo && (
                    <p className="text-xs text-red-500 mt-1">Rake No. is required for Yard Out</p>
                  )}
                </div>

                {/* Deck Position */}
                <div>
                  <FieldLabel required>Deck Position</FieldLabel>
                  <input
                    type="text"
                    value={form.deckPosition}
                    onChange={set("deckPosition")}
                    placeholder="Enter Deck position"
                    className={fc("deckPosition")}
                  />
                  {errors.deckPosition && (
                    <p className="text-xs text-red-500 mt-1">
                      Deck Position is required for Yard Out
                    </p>
                  )}
                </div>

                {/* Wagon No. */}
                <div>
                  <FieldLabel required>Wagon No.</FieldLabel>
                  <input
                    type="text"
                    value={form.wagonNo}
                    onChange={set("wagonNo")}
                    placeholder="Enter Wagon number"
                    className={fc("wagonNo")}
                  />
                  {errors.wagonNo && (
                    <p className="text-xs text-red-500 mt-1">Wagon No. is required for Yard Out</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Live Summary ────────────────────────────────────────── */}
          {hasSummary && (
            <div className="mx-6 my-5 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">
                Entry Preview
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-1.5">
                {form.loadingStation && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Station:</span>{" "}
                    {selectedTerminalLabel || form.loadingStation}
                  </span>
                )}
                {form.operationType && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Operation:</span>{" "}
                    {form.operationType}
                  </span>
                )}
                {scannedVINs.length > 0 && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">VINs:</span>{" "}
                    {scannedVINs.length} vehicle{scannedVINs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {form.operationType === "Yard Out" && (
                  <>
                    {form.fnrNo && (
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">FNR No.:</span> {form.fnrNo}
                      </span>
                    )}
                    {form.rakeNo && (
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">Rake No.:</span> {form.rakeNo}
                      </span>
                    )}
                    {form.deckPosition && (
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">Deck Position:</span>{" "}
                        {form.deckPosition}
                      </span>
                    )}
                    {form.wagonNo && (
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">Wagon No.:</span>{" "}
                        {form.wagonNo}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────────────── */}
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
                type="submit"
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Loading Stage
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}