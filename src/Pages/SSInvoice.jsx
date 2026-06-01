import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Printer,
  X,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  Save,
} from "lucide-react";
import { rateContractInvoiceAPI } from "../utils/Api";

const toDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const mapInvoiceItemFromApi = (item) => ({
  article: item.ArticleNo || item.ItemName || item.ItemDescription || "",
  service: item.ServiceName || item.ServiceDescription || "",
  qnty: Number(item.Quantity || 0),
  rate: Number(item.Rate || 0),
  amount: Number(item.Amount || 0),
  discount: Number(item.DiscountAmount || 0),
  taxable_amt: Number(item.TaxableAmount || 0),
  igst: Number(item.IGSTAmount || 0),
  sgst: Number(item.SGSTAmount || 0),
  cgst: Number(item.CGSTAmount || 0),
  tax_amount: Number(item.TaxAmount || 0),
  total_amount: Number(item.TotalAmount || 0),
});

const SSInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoice_no: "",
    invoice_date: "",
    invoice_to: "",
    cha: "",
    bill_party: "",
    address: "",
    state_code: "",
    state: "",
    payment_mode: "Cash",
    train_no: "",
    route: "",
    cus_inv_no: "",
    cus_inv_date: "",
    file: null,
    invoice_note: "",
    po_no: "",
  });

  const [articles, setArticles] = useState([
    {
      article: "",
      service: "",
      qnty: 0,
      rate: 0,
      amount: 0,
      discount: 0,
      taxable_amt: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      tax_amount: 0,
      total_amount: 0,
    },
  ]);
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const states = [
    "",
    "07-Delhi",
    "01-Jammu & Kashmir",
    "02-Himachal Pradesh",
    "03-Punjab",
    "06-Haryana",
    "08-Rajasthan",
    "09-Uttar Pradesh",
    "27-Maharashtra",
  ];
  const billingParties = useMemo(
    () => Array.from(new Set(["---Select---", "DSHCUST-DINESH", "DSHCUST-RAJAN", "DSHCUST-AMIT", "DSHCUST-PRIYA", ...invoices.map((i) => i.BillingPartyName).filter(Boolean)])),
    [invoices]
  );

  const loadInvoiceIntoForm = async (invoiceId) => {
    const response = await rateContractInvoiceAPI.getInvoiceById(invoiceId);
    const invoice = response.data;
    setInvoiceData((prev) => ({
      ...prev,
      invoice_no: invoice.InvoiceNumber || "",
      invoice_date: toDateInput(invoice.InvoiceDate),
      invoice_to: invoice.PartyName || "",
      cha: invoice.CHAName || "",
      bill_party: invoice.BillingPartyName || "---Select---",
      address: invoice.Address || "",
      state_code: invoice.StateCode || "",
      state: invoice.StateName || "",
      payment_mode: invoice.PaymentMode || "Credit",
      train_no: invoice.TrainNo || "",
      route: invoice.Route || "",
      cus_inv_no: invoice.CustomerInvoiceNo || "",
      cus_inv_date: toDateInput(invoice.CustomerInvoiceDate),
      invoice_note: invoice.InvoiceNote || invoice.Narration || "",
      po_no: invoice.PONumber || "",
    }));
    setArticles(invoice.items?.length ? invoice.items.map(mapInvoiceItemFromApi) : articles);
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await rateContractInvoiceAPI.getInvoices({
        instituteId: 1,
        academicYearId: 2025,
      });
      const list = response.data || [];
      setInvoices(list);
      if (list[0]) {
        await loadInvoiceIntoForm(list[0].InvoiceId);
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
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArticleChange = (index, field, value) => {
    const updated = [...articles];
    updated[index][field] = value;
    // Auto-calculate amount
    if (field === "qnty" || field === "rate") {
      const q = field === "qnty" ? Number(value) : Number(updated[index].qnty);
      const r = field === "rate" ? Number(value) : Number(updated[index].rate);
      updated[index].amount = q * r;
      updated[index].taxable_amt =
        updated[index].amount - Number(updated[index].discount);
      updated[index].total_amount =
        updated[index].taxable_amt +
        Number(updated[index].igst) +
        Number(updated[index].sgst) +
        Number(updated[index].cgst) +
        Number(updated[index].tax_amount);
    }
    if (field === "discount") {
      updated[index].taxable_amt = updated[index].amount - Number(value);
      updated[index].total_amount =
        updated[index].taxable_amt +
        Number(updated[index].igst) +
        Number(updated[index].sgst) +
        Number(updated[index].cgst) +
        Number(updated[index].tax_amount);
    }
    if (
      field === "igst" ||
      field === "sgst" ||
      field === "cgst" ||
      field === "tax_amount"
    ) {
      updated[index].total_amount =
        Number(updated[index].taxable_amt) +
        Number(field === "igst" ? value : updated[index].igst) +
        Number(field === "sgst" ? value : updated[index].sgst) +
        Number(field === "cgst" ? value : updated[index].cgst) +
        Number(field === "tax_amount" ? value : updated[index].tax_amount);
    }
    setArticles(updated);
  };

  const addArticle = () => {
    setArticles([
      ...articles,
      {
        article: "",
        service: "",
        qnty: 0,
        rate: 0,
        amount: 0,
        discount: 0,
        taxable_amt: 0,
        igst: 0,
        sgst: 0,
        cgst: 0,
        tax_amount: 0,
        total_amount: 0,
      },
    ]);
  };

  const removeArticle = (index) => {
    if (articles.length > 1) {
      setArticles(articles.filter((_, i) => i !== index));
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const selectClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white";

  const totals = articles.reduce(
    (acc, a) => ({
      qnty: acc.qnty + Number(a.qnty),
      amount: acc.amount + Number(a.amount),
      discount: acc.discount + Number(a.discount),
      taxable_amt: acc.taxable_amt + Number(a.taxable_amt),
      igst: acc.igst + Number(a.igst),
      sgst: acc.sgst + Number(a.sgst),
      cgst: acc.cgst + Number(a.cgst),
      tax_amount: acc.tax_amount + Number(a.tax_amount),
      total_amount: acc.total_amount + Number(a.total_amount),
    }),
    {
      qnty: 0,
      amount: 0,
      discount: 0,
      taxable_amt: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      tax_amount: 0,
      total_amount: 0,
    },
  );

  const handleSaveInvoice = async () => {
    if (!invoiceData.invoice_no.trim()) {
      setMessage({ type: "error", text: "Invoice No is required" });
      return;
    }

    try {
      await rateContractInvoiceAPI.createInvoice({
        invoiceData: {
          ...invoiceData,
          invoiceType: "SS",
          instituteId: 1,
          academicYearId: 2025,
          subTotalAmount: totals.amount,
          discountAmount: totals.discount,
          taxableAmount: totals.taxable_amt,
          igstAmount: totals.igst,
          sgstAmount: totals.sgst,
          cgstAmount: totals.cgst,
          taxAmount: totals.tax_amount,
          grandTotalAmount: totals.total_amount,
        },
        articles,
      });
      setMessage({ type: "success", text: "Invoice saved successfully" });
      await loadInvoices();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to save invoice" });
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <span className="text-blue-600 cursor-pointer hover:underline">
          Home
        </span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 font-medium">SS Invoice</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">SS Invoice</h1>
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Header Buttons */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600 text-sm">Create and manage SS invoices</p>
        <div className="flex items-center gap-2">
          <button onClick={loadInvoices} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Search className="w-4 h-4" /> Search
          </button>
          <button onClick={handleSaveInvoice} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <X className="w-4 h-4" /> Exit
          </button>
        </div>
      </div>

      {/* Invoice Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>
              Invoice No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="invoice_no"
              value={invoiceData.invoice_no}
              onChange={handleChange}
              className={inputClass}
              placeholder="INV-001"
            />
          </div>
          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              name="invoice_date"
              value={invoiceData.invoice_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Invoice To</label>
            <input
              type="text"
              name="invoice_to"
              value={invoiceData.invoice_to}
              onChange={handleChange}
              className={inputClass}
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className={labelClass}>CHA</label>
            <input
              type="text"
              name="cha"
              value={invoiceData.cha}
              onChange={handleChange}
              className={inputClass}
              placeholder="CHA details"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Bill Party</label>
            <select
              name="bill_party"
              value={invoiceData.bill_party}
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
            <label className={labelClass}>Address</label>
            <input
              type="text"
              name="address"
              value={invoiceData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Address"
            />
          </div>
          <div>
            <label className={labelClass}>State Code</label>
            <input
              type="text"
              name="state_code"
              value={invoiceData.state_code}
              onChange={handleChange}
              className={inputClass}
              placeholder="State code"
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <select
              name="state"
              value={invoiceData.state}
              onChange={handleChange}
              className={selectClass}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s || "---Select---"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Payment Mode</label>
            <select
              name="payment_mode"
              value={invoiceData.payment_mode}
              onChange={handleChange}
              className={selectClass}
            >
              <option>Cash</option>
              <option>Credit</option>
              <option>Advance</option>
              <option>On Delivery</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Train No.</label>
            <input
              type="text"
              name="train_no"
              value={invoiceData.train_no}
              onChange={handleChange}
              className={inputClass}
              placeholder="Train no"
            />
          </div>
          <div>
            <label className={labelClass}>Route</label>
            <input
              type="text"
              name="route"
              value={invoiceData.route}
              onChange={handleChange}
              className={inputClass}
              placeholder="Route"
            />
          </div>
          <div>
            <label className={labelClass}>Cus Inv. No.</label>
            <input
              type="text"
              name="cus_inv_no"
              value={invoiceData.cus_inv_no}
              onChange={handleChange}
              className={inputClass}
              placeholder="Customer invoice no"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Cus Inv. Date</label>
            <input
              type="date"
              name="cus_inv_date"
              value={invoiceData.cus_inv_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              File Location <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="file"
              onChange={(e) =>
                setInvoiceData((prev) => ({ ...prev, file: e.target.files[0] }))
              }
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className={labelClass}>Invoice Note</label>
            <input
              type="text"
              name="invoice_note"
              value={invoiceData.invoice_note}
              onChange={handleChange}
              className={inputClass}
              placeholder="Note"
            />
          </div>
          <div>
            <label className={labelClass}>PO No</label>
            <input
              type="text"
              name="po_no"
              value={invoiceData.po_no}
              onChange={handleChange}
              className={inputClass}
              placeholder="PO number"
            />
          </div>
        </div>
      </div>

      {/* Article Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Article Details
          </h3>
          <button
            onClick={addArticle}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  #
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Article
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Service
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Qnty
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Rate
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Amount
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Discount
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Taxable Amt.
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  IGST
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  SGST
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  CGST
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tax Amount
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Total Amount
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-500 text-xs">{i + 1}</td>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={a.article}
                      onChange={(e) =>
                        handleArticleChange(i, "article", e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={a.service}
                      onChange={(e) =>
                        handleArticleChange(i, "service", e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.qnty}
                      onChange={(e) =>
                        handleArticleChange(i, "qnty", e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.rate}
                      onChange={(e) =>
                        handleArticleChange(i, "rate", e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-1 text-right text-sm font-medium">
                    {Number(a.amount).toFixed(2)}
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.discount}
                      onChange={(e) =>
                        handleArticleChange(i, "discount", e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-1 text-right text-sm font-medium">
                    {Number(a.taxable_amt).toFixed(2)}
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.igst}
                      onChange={(e) =>
                        handleArticleChange(i, "igst", e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.sgst}
                      onChange={(e) =>
                        handleArticleChange(i, "sgst", e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.cgst}
                      onChange={(e) =>
                        handleArticleChange(i, "cgst", e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      value={a.tax_amount}
                      onChange={(e) =>
                        handleArticleChange(i, "tax_amount", e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-2 py-1 text-right text-sm font-semibold text-blue-700">
                    {Number(a.total_amount).toFixed(2)}
                  </td>
                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={() => removeArticle(i)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-blue-50 font-semibold">
                <td colSpan={3} className="px-2 py-2 text-right text-sm">
                  ---ALL---
                </td>
                <td className="px-2 py-2 text-right text-sm">{totals.qnty}</td>
                <td></td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.amount.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.discount.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.taxable_amt.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.igst.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.sgst.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.cgst.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm">
                  {totals.tax_amount.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right text-sm text-blue-700">
                  {totals.total_amount.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grand Total Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-end items-center gap-6">
          {loading && <span className="text-sm text-gray-500">Loading invoice...</span>}
          <span className="text-lg font-bold text-gray-800">Grand Total:</span>
          <span className="text-2xl font-bold text-blue-700">
            ₹ {totals.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SSInvoice;
