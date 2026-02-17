import { useState, useRef } from "react";
import {
  ScanLine,
  MapPin,
  ClipboardCheck,
  AlertTriangle,
  Camera,
  Save,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  X,
  ImagePlus,
  FileSearch,
} from "lucide-react";

const yardTerminals = [
  "Yard Terminal 1 - Gate A",
  "Yard Terminal 2 - Gate B",
  "Yard Terminal 3 - Gate C",
  "Yard Terminal 4 - Gate D",
];

const surveyTypes = [
  "Pre-Dispatch Survey",
  "Post-Arrival Survey",
  "Damage Assessment",
  "Quality Inspection",
  "Insurance Survey",
];

const damageTypes = [
  "Scratch",
  "Dent",
  "Broken Glass",
  "Mechanical Damage",
  "Paint Damage",
  "Missing Parts",
  "Flood Damage",
  "Fire Damage",
];

const defaultForm = {
  vinDetails: "",
  yardTerminal: "",
  surveyType: "",
  damageType: "",
  damageRemarks: "",
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
      className={`${inputClass} appearance-none pr-9 ${
        !value ? "text-gray-400" : "text-gray-800"
      } ${hasError ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
  </div>
);

export default function VINSurveyPage() {
  const [form, setForm] = useState(defaultForm);
  const [photos, setPhotos] = useState([]);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const set = (field) => (val) =>
    setForm((prev) => ({ ...prev, [field]: typeof val === "string" ? val : val.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.vinDetails.trim()) errs.vinDetails = true;
    if (!form.damageType) errs.damageType = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleReset = () => {
    setForm(defaultForm);
    setPhotos([]);
    setErrors({});
    setSaved(false);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024).toFixed(1) + " KB",
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id));

  const fc = (key) =>
    `${inputClass} ${errors[key] ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`;

  const hasSummary = form.vinDetails || form.yardTerminal || form.damageType;

  return (
    <div className="p-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VIN Survey</h2>
          <p className="text-gray-600 mt-1">
            Record vehicle inspection, damage assessment and upload survey photos
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
            Save Survey
          </button>
        </div>
      </div>

      {/* ── Success Banner ──────────────────────────────────────────── */}
      {saved && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium">
            VIN Survey saved successfully. Damage report logged.
          </span>
        </div>
      )}

      {/* ── Main Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: VIN & Yard ───────────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={FileSearch} title="VIN & Yard Details" color="green" />
            <div className="grid grid-cols-2 gap-5">
              {/* VIN Details */}
              <div>
                <FieldLabel required>
                  VIN Details{" "}
                  <span className="ml-1 text-gray-400 normal-case tracking-normal font-normal text-xs">
                    (scan of VIN)
                  </span>
                </FieldLabel>
                <div className="relative">
                  <input
                    type="text"
                    value={form.vinDetails}
                    onChange={set("vinDetails")}
                    placeholder="Scan or enter VIN"
                    className={`${fc("vinDetails")} pr-10`}
                  />
                  <button
                    type="button"
                    title="Scan VIN"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <ScanLine className="h-4 w-4" />
                  </button>
                </div>
                {errors.vinDetails && (
                  <p className="text-xs text-red-500 mt-1">VIN details are required</p>
                )}
              </div>

              {/* Yard Terminal */}
              <div>
                <FieldLabel>Yard Terminal</FieldLabel>
                <SelectField
                  value={form.yardTerminal}
                  onChange={set("yardTerminal")}
                  options={yardTerminals}
                  placeholder="Please Select Yard Terminal"
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Survey & Damage ──────────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={AlertTriangle} title="Survey & Damage Details" color="blue" />
            <div className="grid grid-cols-2 gap-5">
              {/* Survey Type */}
              <div>
                <FieldLabel>Survey Type</FieldLabel>
                <SelectField
                  value={form.surveyType}
                  onChange={set("surveyType")}
                  options={surveyTypes}
                  placeholder="Please Select Survey Type"
                />
              </div>

              {/* Damage Type */}
              <div>
                <FieldLabel required>Damage Type</FieldLabel>
                <SelectField
                  value={form.damageType}
                  onChange={set("damageType")}
                  options={damageTypes}
                  placeholder="Please Select Damage Type"
                  hasError={!!errors.damageType}
                />
                {errors.damageType && (
                  <p className="text-xs text-red-500 mt-1">Damage type is required</p>
                )}
              </div>
            </div>

            {/* Damage Remarks — full width */}
            <div className="mt-5">
              <FieldLabel>Damage Remarks</FieldLabel>
              <textarea
                value={form.damageRemarks}
                onChange={set("damageRemarks")}
                placeholder="Enter Damage Remarks if any..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* ── Section 3: Upload Damage Photos ─────────────────────── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <SectionHeader icon={Camera} title="Upload Damage Photos" color="green" />

            <div className="grid grid-cols-2 gap-5">
              {/* Upload trigger */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
                >
                  <Camera className="h-4 w-4" />
                  Open Camera / Upload Photos
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Supports JPG, PNG · multiple files allowed
                </p>
              </div>

              {/* Upload summary */}
              <div className="flex items-center">
                {photos.length > 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg w-full">
                    <ImagePlus className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 font-medium">
                      {photos.length} photo{photos.length > 1 ? "s" : ""} uploaded
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full">
                    <ImagePlus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-400">No photos uploaded yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo grid preview */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="px-2 py-1 bg-white border-t border-gray-200">
                      <p className="text-xs text-gray-500 truncate">{photo.name}</p>
                      <p className="text-xs text-gray-400">{photo.size}</p>
                    </div>
                  </div>
                ))}
                {/* Add more */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full min-h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs">Add more</span>
                </button>
              </div>
            )}
          </div>

          {/* ── Live Summary ────────────────────────────────────────── */}
          {hasSummary && (
            <div className="mx-6 my-5 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">
                Survey Preview
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-1.5">
                {form.vinDetails && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">VIN:</span> {form.vinDetails}
                  </span>
                )}
                {form.yardTerminal && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Yard:</span> {form.yardTerminal}
                  </span>
                )}
                {form.surveyType && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Survey:</span> {form.surveyType}
                  </span>
                )}
                {form.damageType && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Damage:</span> {form.damageType}
                  </span>
                )}
                {photos.length > 0 && (
                  <span className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Photos:</span> {photos.length} attached
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Footer ─────────────────────────────────────────────── */}
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
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}