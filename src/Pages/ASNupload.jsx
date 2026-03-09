import React, { useState, useRef, useEffect } from "react";
import { Check, X, Upload, FileText, Download, ClipboardPaste } from "lucide-react";
import { dealerTripDetailsAPI, asnAPI } from "../utils/Api"; // Adjust the import path as necessary
import * as XLSX from "xlsx";

const DealerTripDetailsManagement = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState({
    Rake_NO: "",
    Load_No: "",
    Trip_No: "",
    INVOICE_NO: "",
    Invoice_Date: "",
    Destination_City: "",
    Production_Model: "",
    GR_Number: "",
    Engine_No: "",
    VIN_Number: "",
    Sales_Model: "",
    Dealer_Name: "",
    LOCATION: "",
    EWAY_BILL: "",
    VALID_TILL: "",
    For_Code: "",
    BVEH_Code: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvPreview, setCsvPreview] = useState("");
  const [pastedData, setPastedData] = useState("");
  const [duplicateVINs, setDuplicateVINs] = useState([]);
  const fileInputRef = useRef(null);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (message.type === "success" && message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    console.log("Current formData:", formData);
    const newErrors = {};
    if (!formData.Rake_NO || !formData.Rake_NO.toString().trim()) {
      newErrors.Rake_NO = "Rake No is required";
    }
    if (!formData.Load_No || !formData.Load_No.toString().trim()) {
      newErrors.Load_No = "Load No is required";
    }
    if (!formData.Trip_No || !formData.Trip_No.toString().trim()) {
      newErrors.Trip_No = "Trip No is required";
    }
    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      console.log("Submitting formData:", formData);
      const result = await dealerTripDetailsAPI.createDealerTripDetails(formData);
      console.log("API Response:", result);
      setMessage({
        type: "success",
        text: result.message || "Dealer Trip Details record created successfully!",
      });

      setFormData({
        Rake_NO: "",
        Load_No: "",
        Trip_No: "",
        INVOICE_NO: "",
        Invoice_Date: "",
        Destination_City: "",
        Production_Model: "",
        GR_Number: "",
        Engine_No: "",
        VIN_Number: "",
        Sales_Model: "",
        Dealer_Name: "",
        LOCATION: "",
        EWAY_BILL: "",
        VALID_TILL: "",
        For_Code: "",
        BVEH_Code: "",
      });
    } catch (error) {
      console.error("Error creating Dealer Trip Details:", error);

      if (error.duplicateVINs && error.duplicateVINs.length > 0) {
        setDuplicateVINs(error.duplicateVINs);
        setMessage({
          type: "error",
          text: `Duplicate VINs found: ${error.duplicateVINs.join(", ")}`,
        });
      } else {
        setDuplicateVINs([]);
        setMessage({
          type: "error",
          text: error.message || "Failed to create Dealer Trip Details record",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const csvContent = jsonData
            .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
            .join("\n");

          resolve(csvContent);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parsePastedExcel = (text) => {
    try {
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error("Data must have at least a header row and one data row");
      }

      const csvContent = lines
        .map((line) => {
          if (line.includes("\t")) {
            return line
              .split("\t")
              .map((cell) => `"${cell.trim()}"`)
              .join(",");
          }
          return line;
        })
        .join("\n");

      return csvContent;
    } catch (error) {
      throw new Error(`Failed to parse pasted data: ${error.message}`);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];
    const errors = [];

    const headerMap = {};
    headers.forEach((header, index) => {
      const cleanHeader = header
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, "_");
      const mappings = {
        rake_no: "Rake_NO",
        rakeno: "Rake_NO",
        load_no: "Load_No",
        loadno: "Load_No",
        trip_no: "Trip_No",
        tripno: "Trip_No",
        invoice_no: "INVOICE_NO",
        invoiceno: "INVOICE_NO",
        invoice_date: "Invoice_Date",
        invoicedate: "Invoice_Date",
        destination_city: "Destination_City",
        destinationcity: "Destination_City",
        production_model: "Production_Model",
        productionmodel: "Production_Model",
        gr_number: "GR_Number",
        grnumber: "GR_Number",
        engine_no: "Engine_No",
        engineno: "Engine_No",
        vin_number: "VIN_Number",
        vinnumber: "VIN_Number",
        sales_model: "Sales_Model",
        salesmodel: "Sales_Model",
        dealer_name: "Dealer_Name",
        location: "LOCATION",
        eway_bill: "EWAY_BILL",
        ewaybill: "EWAY_BILL",
        valid_till: "VALID_TILL",
        validtill: "VALID_TILL",
      };

      if (mappings[cleanHeader]) {
        headerMap[index] = mappings[cleanHeader];
      }
    });

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const rowData = {
        Rake_NO: "",
        Load_No: "",
        Trip_No: "",
        INVOICE_NO: "",
        Invoice_Date: "",
        Destination_City: "",
        Production_Model: "",
        GR_Number: "",
        Engine_No: "",
        VIN_Number: "",
        Sales_Model: "",
        Dealer_Name: "",
        LOCATION: "",
        EWAY_BILL: "",
        VALID_TILL: "",
      };

      values.forEach((value, index) => {
        if (headerMap[index]) {
          rowData[headerMap[index]] = value;
        }
      });

      const rowErrors = [];
      if (!rowData.Rake_NO) rowErrors.push(`Row ${i}: Rake No is required`);
      if (!rowData.Load_No) rowErrors.push(`Row ${i}: Load No is required`);
      if (!rowData.Trip_No) rowErrors.push(`Row ${i}: Trip No is required`);

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        data.push(rowData);
      }
    }

    return { data, errors };
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isCSV = file.name.toLowerCase().endsWith(".csv");
    const isExcel =
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls");

    if (!isCSV && !isExcel) {
      setMessage({
        type: "error",
        text: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
      });
      return;
    }

    setCsvFile(file);
    setCsvErrors([]);
    setMessage({ type: "", text: "" });

    try {
      let text;

      if (isExcel) {
        text = await parseExcel(file);
      } else {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("Failed to read CSV file"));
          reader.readAsText(file);
        });
      }

      const { data: parsedData, errors: parseErrors } = parseCSV(text);
      setCsvData(parsedData);
      setCsvErrors(parseErrors);

      if (parseErrors.length > 0) {
        setMessage({
          type: "error",
          text: `Found ${parseErrors.length} validation errors. Please fix them before uploading.`,
        });
      } else {
        setMessage({
          type: "success",
          text: `Successfully parsed ${parsedData.length} records from ${
            isExcel ? "Excel" : "CSV"
          } file.`,
        });

        const headers = Object.keys(parsedData[0] || {});
        const previewLines = [headers.join(",")];
        parsedData.slice(0, 5).forEach((row) => {
          const values = headers.map((header) => `"${row[header] || ""}"`);
          previewLines.push(values.join(","));
        });
        setCsvPreview(previewLines.join("\n"));
      }
    } catch (error) {
      console.error("CSV parsing error:", error);
      setMessage({
        type: "error",
        text: `CSV parsing failed: ${error.message}`,
      });
    }
  };

  const handlePastedDataChange = (e) => {
    setPastedData(e.target.value);
    if (csvData.length > 0) {
      setCsvData([]);
      setCsvErrors([]);
      setCsvPreview("");
    }
  };

  const handleParsePastedData = () => {
    if (!pastedData.trim()) {
      setMessage({ type: "error", text: "Please paste some data first" });
      return;
    }

    setCsvErrors([]);
    setMessage({ type: "", text: "" });

    try {
      const csvContent = parsePastedExcel(pastedData);
      const { data: parsedData, errors: parseErrors } = parseCSV(csvContent);
      setCsvData(parsedData);
      setCsvErrors(parseErrors);

      if (parseErrors.length > 0) {
        setMessage({
          type: "error",
          text: `Found ${parseErrors.length} validation errors. Please fix them before submitting.`,
        });
      } else {
        setMessage({
          type: "success",
          text: `Successfully parsed ${parsedData.length} records from pasted data.`,
        });

        const headers = Object.keys(parsedData[0] || {});
        const previewLines = [headers.join(",")];
        parsedData.slice(0, 5).forEach((row) => {
          const values = headers.map((header) => `"${row[header] || ""}"`);
          previewLines.push(values.join(","));
        });
        setCsvPreview(previewLines.join("\n"));
      }
    } catch (error) {
      console.error("Paste parsing error:", error);
      setMessage({
        type: "error",
        text: `Failed to parse pasted data: ${error.message}`,
      });
    }
  };

  const handleBulkSubmit = async () => {
    if (csvData.length === 0) {
      setMessage({ type: "error", text: "No data to submit" });
      return;
    }

    if (csvErrors.length > 0) {
      setMessage({
        type: "error",
        text: "Please fix validation errors before submitting",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await dealerTripDetailsAPI.createBulkDealerTripDetails(csvData);
      console.log("Bulk API Response:", response);
      setMessage({
        type: "success",
        text:
          response.message ||
          `Successfully created ${response.count || csvData.length} Dealer Trip Details records!`,
      });

      setCsvFile(null);
      setCsvData([]);
      setCsvPreview("");
      setCsvErrors([]);
      setPastedData("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Bulk submit error:", error);

      if (error.duplicateVINs && error.duplicateVINs.length > 0) {
        setDuplicateVINs(error.duplicateVINs);
        setMessage({
          type: "error",
          text: `Duplicate VINs found: ${error.duplicateVINs.join(", ")}`,
        });
      } else {
        setDuplicateVINs([]);
        setMessage({
          type: "error",
          text: error.message || "Failed to create bulk Dealer Trip Details records",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Rake_NO",
      "Load_No",
      "Trip_No",
      "INVOICE_NO",
      "Invoice_Date",
      "Destination_City",
      "Production_Model",
      "GR_Number",
      "Engine_No",
      "VIN_Number",
      "Sales_Model",
      "Dealer_Name",
      "LOCATION",
      "EWAY_BILL",
      "VALID_TILL",
    ];

    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ASN_UPLOAD_FORMAT.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advance Shipping Note Management
        </h1>
        <p className="text-gray-600">
          Create Dealer Trip Details records manually or via CSV/Excel upload
        </p>
      </div>

      {/* ── Message Banner ── */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("manual")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "manual"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "csv"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              CSV/Excel Upload
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "paste"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Paste Excel Data
            </button>
          </nav>
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "manual" ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rake No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rake No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Rake_NO"
                value={formData.Rake_NO}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Rake_NO ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Rake Number"
              />
              {errors.Rake_NO && (
                <p className="mt-1 text-sm text-red-600">{errors.Rake_NO}</p>
              )}
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice No
              </label>
              <input
                type="text"
                name="INVOICE_NO"
                value={formData.INVOICE_NO}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Invoice Number"
              />
            </div>

            {/* Load No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Load_No"
                value={formData.Load_No}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Load_No ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Load Number"
              />
              {errors.Load_No && (
                <p className="mt-1 text-sm text-red-600">{errors.Load_No}</p>
              )}
            </div>

            {/* Trip No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Trip_No"
                value={formData.Trip_No}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Trip_No ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Trip Number"
              />
              {errors.Trip_No && (
                <p className="mt-1 text-sm text-red-600">{errors.Trip_No}</p>
              )}
            </div>

            {/* Production Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production Model
              </label>
              <input
                type="text"
                name="Production_Model"
                value={formData.Production_Model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Production Model"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date
              </label>
              <input
                type="date"
                name="Invoice_Date"
                value={formData.Invoice_Date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Destination City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination City
              </label>
              <input
                type="text"
                name="Destination_City"
                value={formData.Destination_City}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Destination City"
              />
            </div>

            {/* GR Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GR Number
              </label>
              <input
                type="text"
                name="GR_Number"
                value={formData.GR_Number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="GR Number"
              />
            </div>

            {/* Engine No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engine No
              </label>
              <input
                type="text"
                name="Engine_No"
                value={formData.Engine_No}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Engine Number"
              />
            </div>

            {/* VIN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VIN Number
              </label>
              <input
                type="text"
                name="VIN_Number"
                value={formData.VIN_Number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VIN Number"
              />
            </div>

            {/* Sales Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Model
              </label>
              <input
                type="text"
                name="Sales_Model"
                value={formData.Sales_Model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sales Model"
              />
            </div>

            {/* Dealer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer Name
              </label>
              <input
                type="text"
                name="Dealer_Name"
                value={formData.Dealer_Name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dealer Name"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="LOCATION"
                value={formData.LOCATION}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Location"
              />
            </div>

            {/* E-Way Bill */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Way Bill
              </label>
              <input
                type="text"
                name="EWAY_BILL"
                value={formData.EWAY_BILL}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="E-Way Bill"
              />
            </div>

            {/* Valid Till */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Till
              </label>
              <input
                type="date"
                name="VALID_TILL"
                value={formData.VALID_TILL}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* For Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                For Code
              </label>
              <input
                type="text"
                name="For_Code"
                value={formData.For_Code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="For Code"
              />
            </div>

            {/* BVEH Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BVEH Code
              </label>
              <input
                type="text"
                name="BVEH_Code"
                value={formData.BVEH_Code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="BVEH Code"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating..." : "Create Dealer Trip Details Record"}
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === "csv" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                CSV/Excel Upload
              </h2>
              <button
                onClick={downloadTemplate}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="flex flex-col items-center">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-gray-900">
                    Upload CSV/Excel File
                  </span>
                  <p className="mt-2 text-sm text-gray-500">
                    Select a CSV or Excel file with Dealer Trip Details data to
                    upload multiple records
                  </p>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={loading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Choose File
                </button>
              </div>
            </div>

            {csvFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)}{" "}
                    KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {csvErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Validation Errors ({csvErrors.length})
              </h3>
              <div className="text-sm text-red-700 max-h-40 overflow-y-auto">
                {csvErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="mb-1">
                    • {typeof error === "string" ? error : error.message}
                  </div>
                ))}
                {csvErrors.length > 10 && (
                  <div className="text-red-600 font-medium mt-2">
                    ... and {csvErrors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {csvPreview && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Data Preview ({csvData.length} records)
                </h2>
                {csvData.length > 0 && csvErrors.length === 0 && (
                  <button
                    onClick={handleBulkSubmit}
                    disabled={loading}
                    className={`px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Submitting..." : `Submit ${csvData.length} Records`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {csvData.length > 0 &&
                        Object.keys(csvData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header.replace(/_/g, " ")}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {value || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Showing first 10 of {csvData.length} records
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Paste Excel Data
              </h2>
              <button
                onClick={downloadTemplate}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-start mb-2">
                  <ClipboardPaste className="w-5 h-5 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paste Excel Data Here
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Copy cells from Excel (Ctrl+C) and paste them here.
                      Include the header row.
                    </p>
                  </div>
                </div>
                <textarea
                  value={pastedData}
                  onChange={handlePastedDataChange}
                  placeholder={
                    "Paste your Excel data here... (with headers)\n\nExample:\nDealer\tFor\tLoad_No\tTrip_No\tRegn_No...\nDEALER001\tFOR\t1001\t2001\tREG123..."
                  }
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleParsePastedData}
                  disabled={loading || !pastedData.trim()}
                  className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading || !pastedData.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Parse Data
                </button>
              </div>
            </div>
          </div>

          {csvErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Validation Errors ({csvErrors.length})
              </h3>
              <div className="text-sm text-red-700 max-h-40 overflow-y-auto">
                {csvErrors.slice(0, 10).map((error, index) => (
                  <div key={index} className="mb-1">
                    • {typeof error === "string" ? error : error.message}
                  </div>
                ))}
                {csvErrors.length > 10 && (
                  <div className="text-red-600 font-medium mt-2">
                    ... and {csvErrors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {csvPreview && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Data Preview ({csvData.length} records)
                </h2>
                {csvData.length > 0 && csvErrors.length === 0 && (
                  <button
                    onClick={handleBulkSubmit}
                    disabled={loading}
                    className={`px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Submitting..." : `Submit ${csvData.length} Records`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {csvData.length > 0 &&
                        Object.keys(csvData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header.replace(/_/g, " ")}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {value || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Showing first 10 of {csvData.length} records
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DealerTripDetailsManagement;