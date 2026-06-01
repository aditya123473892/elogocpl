import { useState, useRef, useEffect } from "react";
import {
  Warehouse,
  ScanLine,
  Save,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  ArrowRight,
  Package,
  X,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { loadingStageAPI } from "../utils/Api";
import * as XLSX from "xlsx";

const defaultForm = {
  loadingStation: "",
  operationType: "Yard Out",
  vinDetails: "",
  fnrNo: "",
  rakeIdAgainstFnrNo: "",
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
        <option key={o.value} value={o.value} disabled={o.disabled}>
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

const normalizeWagonNo = (wagonNo) =>
  String(wagonNo || "")
    .replace(/^\s*\d+\s*[.)-]?\s*/, "")
    .trim()
    .toUpperCase();

const parseWagonNumbers = (raw) => {
  if (!raw) return [];

  const normalizedText = String(raw).toUpperCase();
  const wagonMatches = normalizedText.match(/[A-Z]+[0-9]{6}/g);

  if (wagonMatches?.length) {
    return Array.from(new Set(wagonMatches));
  }

  const tokens = normalizedText.split(/[\s,;]+/).map(normalizeWagonNo).filter(Boolean);

  return Array.from(new Set(tokens));
};

export default function LoadingStagePage() {
  const [form, setForm] = useState(defaultForm);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  // Bulk upload states
  const [bulkMode, setBulkMode] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaved, setBulkSaved] = useState(false);
  const fileInputRef = useRef(null);
  const wagonFileInputRef = useRef(null);
  const [wagonText, setWagonText] = useState("");
  const [wagonOptions, setWagonOptions] = useState([]);
  const [wagonFileName, setWagonFileName] = useState("");
  const [submittedWagons, setSubmittedWagons] = useState([]);

  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const response = await fetch("https://elogivinbackend-1.onrender.com/api/terminal-master");
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

  useEffect(() => {
    const fetchSubmittedWagons = async () => {
      try {
        const response = await loadingStageAPI.getAllLoadingStages();
        const records = response.data || response || [];
        const used = records
          .filter((record) => record.Operation_Type === "Yard Out" && record.Status !== "Deleted")
          .map((record) => normalizeWagonNo(record.Wagon_No))
          .filter(Boolean);
        setSubmittedWagons(Array.from(new Set(used)));
      } catch (error) {
        console.error("Error fetching submitted wagons:", error);
      }
    };

    fetchSubmittedWagons();
  }, []);

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === "string" ? val : val.target.value }));

  const scannedVINs = parseVINs(form.vinDetails);
  const selectedWagonSubmitted =
    form.wagonNo && submittedWagons.includes(normalizeWagonNo(form.wagonNo));

  const validate = () => {
    const errs = {};
    if (!form.loadingStation) errs.loadingStation = true;
    if (!form.vinDetails.trim()) errs.vinDetails = true;
    if (!form.fnrNo.trim()) errs.fnrNo = true;
    if (!form.rakeIdAgainstFnrNo.trim()) errs.rakeIdAgainstFnrNo = true;
    if (!form.rakeNo.trim()) errs.rakeNo = true;
    if (selectedWagonSubmitted) errs.wagonNoSubmitted = true;
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
        operationType: "Yard Out",
        vinDetails: form.vinDetails,
        fnrNo: form.fnrNo,
        rakeIdAgainstFnrNo: form.rakeIdAgainstFnrNo,
        rakeNo: form.rakeNo,
        deckPosition: form.deckPosition,
        wagonNo: form.wagonNo,
      };

      const response = await loadingStageAPI.createLoadingStage(loadingStageData);
      
      if (response.success) {
        setSaved(true);
        setSubmittedWagons((prev) =>
          Array.from(new Set([...prev, normalizeWagonNo(form.wagonNo)].filter(Boolean)))
        );
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

  const applyWagonText = (text) => {
    const wagons = parseWagonNumbers(text);
    setWagonOptions(wagons);
    if (wagons.length > 0) {
      const firstOpenWagon = wagons.find((wagon) => !submittedWagons.includes(wagon));
      set("wagonNo")(firstOpenWagon || "");
    }
  };

  const handleWagonTextChange = (event) => {
    const value = event.target.value;
    setWagonText(value);
    applyWagonText(value);
  };

  const handleWagonFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setWagonFileName(file.name);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (["xlsx", "xls"].includes(extension)) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        const text = rows.flat().filter(Boolean).join("\n");
        setWagonText(text);
        applyWagonText(text);
        return;
      }

      const text = await file.text();
      setWagonText(text);
      applyWagonText(text);
    } catch (error) {
      console.error("Error reading wagon file:", error);
      alert("Could not read wagon file. Please upload an Excel, CSV, or text file.");
    }
  };

  const clearWagons = () => {
    setWagonText("");
    setWagonOptions([]);
    setWagonFileName("");
    set("wagonNo")("");
    if (wagonFileInputRef.current) {
      wagonFileInputRef.current.value = "";
    }
  };

  // CSV parsing function
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    return data;
  };

  // Handle CSV file upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const parsedData = parseCSV(csvText);
        setBulkData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const headers = ['LoadingStation', 'OperationType', 'VINDetails', 'FNRNo', 'RakeIdAgainstFNRNo', 'RakeNo', 'DeckPosition', 'WagonNo'];
    const sampleRow = ['1', 'Yard Out', 'VIN1,VIN2,VIN3', 'FNR001', 'RID001', 'RAKE001', 'DECK1', 'WAGON1'];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yard_out_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle bulk upload submission
  const handleBulkUpload = async () => {
    if (bulkData.length === 0) {
      alert('No data to upload. Please upload a CSV file first.');
      return;
    }

    setBulkSaving(true);
    try {
      const response = await loadingStageAPI.bulkUploadLoadingStage({ records: bulkData });
      
      if (response.success) {
        setBulkSaved(true);
        setCsvFile(null);
        setBulkData([]);
        setTimeout(() => setBulkSaved(false), 5000);
      } else {
        alert('Failed to bulk upload: ' + response.message);
      }
    } catch (error) {
      console.error('Error bulk uploading:', error);
      alert('Error bulk uploading: ' + (error.response?.data?.message || error.message));
    } finally {
      setBulkSaving(false);
    }
  };

  // Reset bulk upload
  const resetBulkUpload = () => {
    setCsvFile(null);
    setBulkData([]);
    setBulkSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Loading Stage - Yard Out</h2>
          <p className="text-gray-600 mt-1">
            Manage yard-out operations with VIN tracking at loading stations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setBulkMode(!bulkMode)}
            className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              bulkMode
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {bulkMode ? "Single Entry" : "Bulk Upload"}
          </button>
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

      {/* ── Bulk Upload Section ───────────────────────────────────────── */}
      {bulkMode && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Bulk Upload Yard Out Details</h3>
            </div>
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </button>
          </div>

          {/* Bulk Upload Success Banner */}
          {bulkSaved && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium">
                Bulk upload successful! Records have been processed.
              </span>
            </div>
          )}

          {/* File Upload Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleCSVUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {csvFile && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {csvFile.name}
                </span>
              )}
            </div>
          </div>

          {/* Data Preview Table */}
          {bulkData.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Preview ({bulkData.length} records)
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {Object.keys(bulkData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bulk Upload Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={bulkSaving || bulkData.length === 0}
              className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-sm"
            >
              {bulkSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {bulkData.length} Records
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetBulkUpload}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      )}

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

              {/* Operation Type - Fixed to Yard Out */}
              <div>
                <FieldLabel required>Operation Type</FieldLabel>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-blue-600 text-white border-blue-600 cursor-not-allowed"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Yard Out
                  </button>
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Yard Out selected
                  </span>
                </div>
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

                {/* Rake ID against FNR No. */}
                <div>
                  <FieldLabel required>Rake ID against FNR No.</FieldLabel>
                  <input
                    type="text"
                    value={form.rakeIdAgainstFnrNo}
                    onChange={set("rakeIdAgainstFnrNo")}
                    placeholder="Enter Rake ID against FNR No."
                    className={fc("rakeIdAgainstFnrNo")}
                  />
                  {errors.rakeIdAgainstFnrNo && (
                    <p className="text-xs text-red-500 mt-1">
                      Rake ID against FNR No. is required for Yard Out
                    </p>
                  )}
                </div>

                {/* Deck Position */}
                <div>
                  <FieldLabel>Deck Position</FieldLabel>
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
                  <FieldLabel>Wagon No.</FieldLabel>
                  {wagonOptions.length > 0 ? (
                    <SelectField
                      value={form.wagonNo}
                      onChange={set("wagonNo")}
                      options={wagonOptions.map((wagon) => ({
                        value: wagon,
                        label: submittedWagons.includes(wagon) ? `${wagon} (submitted)` : wagon,
                        disabled: submittedWagons.includes(wagon),
                      }))}
                      placeholder="Select Wagon number"
                      hasError={!!errors.wagonNo || !!errors.wagonNoSubmitted}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form.wagonNo}
                      onChange={(event) => set("wagonNo")(normalizeWagonNo(event.target.value))}
                      placeholder="Enter Wagon number"
                      className={fc("wagonNo")}
                    />
                  )}
                  {errors.wagonNo && (
                    <p className="text-xs text-red-500 mt-1">Wagon No. is required for Yard Out</p>
                  )}
                  {errors.wagonNoSubmitted && (
                    <p className="text-xs text-red-500 mt-1">
                      This wagon has already been submitted for Yard Out
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <FieldLabel>Upload or Paste Wagon Numbers</FieldLabel>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <input
                      type="file"
                      ref={wagonFileInputRef}
                      accept=".xlsx,.xls,.csv,.txt"
                      onChange={handleWagonFileUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {wagonFileName && (
                      <p className="mt-2 text-xs text-green-600 font-medium">
                        Loaded {wagonFileName}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Excel, CSV, or text. Values like 1.WCX971046 are supported.
                    </p>
                  </div>
                  <div>
                    <textarea
                      value={wagonText}
                      onChange={handleWagonTextChange}
                      rows={4}
                      placeholder={"1.WCX971046\n2.SRX924032\n3.NEX923470"}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
                {wagonOptions.length > 0 && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      {wagonOptions.length} wagon{wagonOptions.length !== 1 ? "s" : ""} available in dropdown,{" "}
                      {submittedWagons.filter((wagon) => wagonOptions.includes(wagon)).length} already submitted
                    </span>
                    <button
                      type="button"
                      onClick={clearWagons}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear wagon list
                    </button>
                  </div>
                )}
              </div>
            </div>

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
                <span className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Operation:</span> Yard Out
                </span>
                {scannedVINs.length > 0 && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">VINs:</span>{" "}
                    {scannedVINs.length} vehicle{scannedVINs.length !== 1 ? "s" : ""}
                  </span>
                )}
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
                    {form.rakeIdAgainstFnrNo && (
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">Rake ID against FNR No.:</span>{" "}
                        {form.rakeIdAgainstFnrNo}
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
