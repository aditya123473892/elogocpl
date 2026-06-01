import React, { useEffect, useState } from "react";
import {
  Search,
  Printer,
  X,
  ChevronRight,
  ChevronsRight,
  Check,
  FileText,
} from "lucide-react";
import { rateContractInvoiceAPI } from "../utils/Api";

const toDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const InvoiceGeneration = () => {
  const [formData, setFormData] = useState({
    state: "07-Delhi",
    booking_no: "",
    booking_list: "Pending List",
    booking_date: "",
    invoice_no: "",
    train_no: "",
    departure_date: "",
    invoice_date: "",
    billing_party: "DSHCUST-DINESH",
    rake_no: "",
    payment_mode: "Immediate",
    service_request: "",
    non_taxable: false,
    naration: "",
    category: "",
    description: "",
    from_location: "",
    to_location: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [invoiceList, setInvoiceList] = useState([]);
  const [articleRows, setArticleRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const states = [
    "07-Delhi",
    "01-Jammu & Kashmir",
    "02-Himachal Pradesh",
    "03-Punjab",
    "06-Haryana",
    "08-Rajasthan",
    "09-Uttar Pradesh",
    "27-Maharashtra",
  ];
  const bookingLists = ["Pending List", "All", "Completed"];
  const billingParties = [
    "DSHCUST-DINESH",
    "DSHCUST-RAJAN",
    "DSHCUST-AMIT",
    "DSHCUST-PRIYA",
    "XYZ Billing Services",
  ];
  const paymentModes = ["Immediate", "Credit", "Advance", "On Delivery"];
  const serviceRequests = [
    "",
    "Road Transport",
    "Rail Transport",
    "Multimodal",
    "Warehousing",
    "Rail Transportation",
  ];
  const trainNos = ["", "12301", "12302", "12303", "12304", "12305", "12951"];

  const loadInvoiceDetails = async (invoiceId) => {
    const response = await rateContractInvoiceAPI.getInvoiceById(invoiceId);
    const invoice = response.data;
    setFormData((prev) => ({
      ...prev,
      state: invoice.StateName || invoice.StateCode || prev.state,
      booking_no: invoice.BookingNo || "",
      booking_list: invoice.BookingList || "Pending List",
      booking_date: toDateInput(invoice.BookingDate),
      invoice_no: invoice.InvoiceNumber || "",
      train_no: invoice.TrainNo || "",
      departure_date: toDateInput(invoice.DepartureDate),
      invoice_date: toDateInput(invoice.InvoiceDate),
      billing_party: invoice.BillingPartyName || prev.billing_party,
      rake_no: invoice.RakeNo || "",
      payment_mode: invoice.PaymentMode || prev.payment_mode,
      service_request: invoice.ServiceRequest || invoice.ServiceName || "",
      non_taxable: Boolean(invoice.IsNonTaxable),
      naration: invoice.Narration || "",
      category: invoice.Category || "",
      description: invoice.Description || "",
      from_location: invoice.FromLocation || "",
      to_location: invoice.ToLocation || "",
    }));
    setArticleRows(invoice.items || []);
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await rateContractInvoiceAPI.getInvoices({
        instituteId: 1,
        academicYearId: 2025,
      });
      const list = response.data || [];
      setInvoiceList(list);
      if (list[0]) {
        await loadInvoiceDetails(list[0].InvoiceId);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to load invoices" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50";
  const readonlyClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed";
  const selectClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <span className="text-blue-600 cursor-pointer hover:underline">
              Home
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-700 font-medium">
              Invoice Generation
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice Generation
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and manage invoices for bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadInvoices} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium">
            <Search className="w-4 h-4" />
            {loading ? "Loading" : "Search"}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium">
            <Printer className="w-4 h-4" />
            Print Summary
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium">
            <X className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Form */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 space-y-6">
              {/* Section: Booking Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Booking Information
                </h4>

                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Booking No <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="booking_no"
                        value={formData.booking_no}
                        onChange={handleChange}
                        className={`${inputClass} flex-1`}
                        placeholder="Enter booking no"
                      />
                      <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Booking List</label>
                    <select
                      name="booking_list"
                      value={formData.booking_list}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {bookingLists.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Booking Date</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.booking_date}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Invoice No</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.invoice_no}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Train No</label>
                    <select
                      name="train_no"
                      value={formData.train_no}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {trainNos.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Departure Date</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.departure_date}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Invoice Date</label>
                    <input
                      type="date"
                      name="invoice_date"
                      value={formData.invoice_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Billing Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Billing Information
                </h4>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Billing Party</label>
                    <select
                      name="billing_party"
                      value={formData.billing_party}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {billingParties.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Rake No.</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.rake_no}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Payment Mode</label>
                    <select
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      {paymentModes.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Service Request</label>
                    <div className="flex flex-col gap-2">
                      <select
                        name="service_request"
                        value={formData.service_request}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        {serviceRequests.map((s) => (
                          <option key={s} value={s}>
                            {s || "--Select--"}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          name="non_taxable"
                          checked={formData.non_taxable}
                          onChange={handleChange}
                          className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                        />
                        Non Taxable Bill
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Naration</label>
                    <input
                      type="text"
                      name="naration"
                      value={formData.naration}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.category}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.description}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className={labelClass}>From Location</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.from_location}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className={labelClass}>To Location</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.to_location}
                      className={readonlyClass}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              {/* Article Table */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Article Details
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {[
                          "Article No",
                          "Service",
                          "Rate",
                          "Amount",
                          "IGST Rate",
                          "IGST Amount",
                          "CGST Rate",
                          "CGST Amount",
                          "SGST Rate",
                          "SGST Amount",
                          "Tax Amount",
                          "Bill Amount",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {articleRows.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="px-6 py-10 text-center">
                            <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm">
                              No article details found. Search a booking to load
                              data.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        articleRows.map((row) => (
                          <tr key={row.InvoiceItemId}>
                            <td className="px-3 py-2 whitespace-nowrap">{row.ArticleNo || row.ItemName || "-"}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.ServiceName || row.ServiceDescription || "-"}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.Rate || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.Amount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.IGSTRate || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.IGSTAmount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.CGSTRate || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.CGSTAmount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.SGSTRate || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.SGSTAmount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{Number(row.TaxAmount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap font-semibold">{Number(row.TotalAmount || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-end items-center gap-4 pt-2 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-700">
                  Grand Total (in Rs.)
                </span>
                <input
                  type="text"
                  readOnly
                  className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 text-right cursor-not-allowed"
                  placeholder="0.00"
                  value={articleRows.reduce((sum, row) => sum + Number(row.TaxableAmount || 0), 0).toFixed(2)}
                />
                <input
                  type="text"
                  readOnly
                  className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 text-right cursor-not-allowed"
                  placeholder="0.00"
                  value={articleRows.reduce((sum, row) => sum + Number(row.TotalAmount || 0), 0).toFixed(2)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                Invoice Generation List
              </h3>
            </div>
            <div className="p-4">
              {invoiceList.length === 0 ? (
                <div className="py-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">
                    No invoices generated yet
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {invoiceList.map((inv) => (
                    <li
                      key={inv.InvoiceId}
                      onClick={() => loadInvoiceDetails(inv.InvoiceId)}
                      className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 cursor-pointer hover:bg-blue-50"
                    >
                      <div className="font-semibold">{inv.InvoiceNumber}</div>
                      <div className="text-xs text-gray-500">{inv.PartyName || inv.BillingPartyName || "-"} - Rs. {Number(inv.GrandTotalAmount || 0).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGeneration;
