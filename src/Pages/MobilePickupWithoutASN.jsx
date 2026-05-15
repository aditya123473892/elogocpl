import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  RefreshCw,
  Save,
  Truck,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  driverMasterAPI,
  locationMasterAPI,
  pickupWithoutASNAPI,
} from "../utils/Api";
import {
  getCurrentDate,
  getCurrentDateTimeText,
  getCurrentTime,
} from "../utils/dateTimeDefaults";

const transporters = [
  "Transporter A Ltd.",
  "Transporter B Pvt.",
  "FastHaul Logistics",
  "Prime Carriers",
  "Blue Dart Transport",
];

const createDefaultForm = () => ({
  plant: "",
  yardLocation: "",
  vendorTransporter: "",
  truckNumber: "",
  vinDetails: "",
  pickupDate: getCurrentDate(),
  deliveryDate: getCurrentDate(),
  arrivalTime: getCurrentTime(),
  departureTime: getCurrentTime(),
  driverName: "",
  remarks: getCurrentDateTimeText(),
  transportationType: "TRUCK",
});

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100";

const Field = ({ label, required, children, error }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

const SelectField = ({ value, onChange, options, placeholder, error }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${inputClass} ${!value ? "text-slate-400" : ""} ${
      error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
    }`}
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export default function MobilePickupWithoutASN() {
  const navigate = useNavigate();
  const [form, setForm] = useState(createDefaultForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [plants, setPlants] = useState([]);
  const [yards, setYards] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [allDriversData, setAllDriversData] = useState([]);
  const [driverDetails, setDriverDetails] = useState(null);

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [locationResponse, driverResponse] = await Promise.all([
          locationMasterAPI.getAllLocations(),
          driverMasterAPI.getActiveDrivers(),
        ]);

        const allLocations = locationResponse.data || [];
        const activeLocations = allLocations
          .filter((location) => location.IsActive)
          .map((location) => location.LocationName);
        const yardLocations = allLocations
          .filter((location) => location.LocationType === "YARD" && location.IsActive)
          .map((location) => location.LocationName);

        const activeDrivers = driverResponse.data || [];
        setPlants(activeLocations);
        setYards(yardLocations);
        setAllDriversData(activeDrivers);
        setDrivers(activeDrivers.map((driver) => driver.driver_name));
      } catch (error) {
        console.error("Error loading mobile pickup options:", error);
        showToast("Failed to load locations or drivers");
      }
    };

    loadOptions();
  }, [showToast]);

  const set = (field) => (value) => {
    const nextValue =
      value && typeof value === "object" && "target" in value
        ? value.target.value
        : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDriverSelection = (driverName) => {
    set("driverName")(driverName);
    const selectedDriver = allDriversData.find(
      (driver) => driver.driver_name === driverName,
    );
    setDriverDetails(selectedDriver || null);
  };

  const validate = () => {
    const requiredFields = [
      "plant",
      "yardLocation",
      "vendorTransporter",
      "transportationType",
      "truckNumber",
      "vinDetails",
      "pickupDate",
      "deliveryDate",
      "driverName",
    ];
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(form[field] || "").trim()) {
        nextErrors[field] = "Required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await pickupWithoutASNAPI.createPickupWithoutASN({
        plant: form.plant,
        yardLocation: form.yardLocation,
        vendorTransporter: form.vendorTransporter,
        truckNumber: form.truckNumber,
        vinDetails: form.vinDetails,
        pickupDate: form.pickupDate,
        deliveryDate: form.deliveryDate,
        arrivalTime: form.arrivalTime,
        departureTime: form.departureTime,
        driverName: form.driverName,
        remarks: form.remarks,
        transportationType: form.transportationType,
      });
      showToast("Pickup without ASN saved successfully", "success");
      setForm(createDefaultForm());
      setDriverDetails(null);
      setErrors({});
    } catch (error) {
      console.error("Error saving mobile pickup without ASN:", error);
      showToast(
        error?.error || error?.message || "Failed to save pickup without ASN",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(createDefaultForm());
    setDriverDetails(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-700"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-slate-950">
              Pickup Without ASN
            </h1>
            <p className="truncate text-xs text-slate-500">Mobile entry</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-700"
            aria-label="Reset form"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed left-4 right-4 top-16 z-30">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="min-w-0 flex-1 text-sm font-medium">{toast.message}</span>
            <button type="button" onClick={() => setToast(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4 pb-28">
        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Truck className="h-4 w-4 text-green-700" />
            Assignment
          </div>
          <Field label="Sideing" required error={errors.plant}>
            <SelectField
              value={form.plant}
              onChange={set("plant")}
              options={plants}
              placeholder="Select Sideing"
              error={errors.plant}
            />
          </Field>
          <Field label="Yard Location" required error={errors.yardLocation}>
            <SelectField
              value={form.yardLocation}
              onChange={set("yardLocation")}
              options={yards}
              placeholder="Select Yard"
              error={errors.yardLocation}
            />
          </Field>
          <Field label="Vendor / Transporter" required error={errors.vendorTransporter}>
            <SelectField
              value={form.vendorTransporter}
              onChange={set("vendorTransporter")}
              options={transporters}
              placeholder="Select Transporter"
              error={errors.vendorTransporter}
            />
          </Field>
          <Field label="Transportation Type" required error={errors.transportationType}>
            <SelectField
              value={form.transportationType}
              onChange={set("transportationType")}
              options={["TRUCK", "SELF_DRIVEN"]}
              placeholder="Select Type"
              error={errors.transportationType}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Truck className="h-4 w-4 text-blue-700" />
            Vehicle
          </div>
          <Field label="Truck Number" required error={errors.truckNumber}>
            <input
              value={form.truckNumber}
              onChange={(event) => set("truckNumber")(event.target.value.toUpperCase())}
              placeholder="DL6CV7887"
              className={`${inputClass} ${
                errors.truckNumber ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
              }`}
            />
          </Field>
          <Field label="VIN Details" required error={errors.vinDetails}>
            <textarea
              value={form.vinDetails}
              onChange={set("vinDetails")}
              rows={4}
              placeholder="Enter VIN numbers separated by comma or space"
              className={`${inputClass} resize-none ${
                errors.vinDetails ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
              }`}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Save className="h-4 w-4 text-green-700" />
            Dispatch
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pickup Date" required error={errors.pickupDate}>
              <input
                type="date"
                value={form.pickupDate}
                onChange={set("pickupDate")}
                className={inputClass}
              />
            </Field>
            <Field label="Dispatch Date" required error={errors.deliveryDate}>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={set("deliveryDate")}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pickup Time">
              <input
                type="time"
                value={form.arrivalTime}
                onChange={set("arrivalTime")}
                className={inputClass}
              />
            </Field>
            <Field label="Dispatch Time">
              <input
                type="time"
                value={form.departureTime}
                onChange={set("departureTime")}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <User className="h-4 w-4 text-green-700" />
            Driver
          </div>
          <Field label="Driver Name" required error={errors.driverName}>
            <SelectField
              value={form.driverName}
              onChange={handleDriverSelection}
              options={drivers}
              placeholder="Select Driver"
              error={errors.driverName}
            />
          </Field>
          {driverDetails && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
              <div className="font-semibold text-blue-900">
                {driverDetails.driver_name}
              </div>
              <div className="mt-1 text-blue-800">
                ID: {driverDetails.driver_id || "N/A"} | Phone:{" "}
                {driverDetails.driver_contact || "N/A"}
              </div>
            </div>
          )}
          <Field label="Remarks">
            <textarea
              value={form.remarks}
              onChange={set("remarks")}
              rows={3}
              placeholder="Optional remarks"
              className={`${inputClass} resize-none`}
            />
          </Field>
        </section>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-green-600 text-sm font-bold text-white shadow-sm transition active:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Entry
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
