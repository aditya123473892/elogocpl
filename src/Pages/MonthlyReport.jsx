import React, { useState, useMemo } from "react";
import {
  Calendar,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Truck,
  MapPin,
  Package,
} from "lucide-react";

const MonthlyReport = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const itemsPerPage = 10;

  // Dummy data for the monthly report
  const dummyData = useMemo(() => [
    {
      sno: 1,
      dealer: "D001",
      for: "OEM",
      dealerName: "Maruti Suzuki India Ltd",
      loadNo: "LD202403001",
      tripNo: "TR202403001",
      regnNo: "MH01AB1234",
      invoiceDate: "2024-03-01",
      destinationCity: "Mumbai",
      route: "Pune-Mumbai",
      exclusiveGroup: "EG-A",
      mode: "Road",
      deliveryDateTT: "2024-03-05",
      deliveryDateTAT: "2024-03-06",
      tripFreight: "15000.00",
      duicNo: "DUIC202403001",
      grNumber: "GR202403001",
      engineNo: "ENG123456789",
      vinNumber: "VIN1HGBH41JXM109186",
      salesModel: "Swift VXI",
      productionModel: "Swift 2024",
      invoiceNo: "INV2024030001",
    },
    {
      sno: 2,
      dealer: "D002",
      for: "Dealer",
      dealerName: "Hyundai Motor India Ltd",
      loadNo: "LD202403002",
      tripNo: "TR202403002",
      regnNo: "MH02CD5678",
      invoiceDate: "2024-03-02",
      destinationCity: "Delhi",
      route: "Chennai-Delhi",
      exclusiveGroup: "EG-B",
      mode: "Rail",
      deliveryDateTT: "2024-03-08",
      deliveryDateTAT: "2024-03-09",
      tripFreight: "25000.00",
      duicNo: "DUIC202403002",
      grNumber: "GR202403002",
      engineNo: "ENG987654321",
      vinNumber: "VIN2KMHJT41LDM234567",
      salesModel: "i20 Asta",
      productionModel: "i20 2024",
      invoiceNo: "INV2024030002",
    },
    {
      sno: 3,
      dealer: "D003",
      for: "OEM",
      dealerName: "Tata Motors Ltd",
      loadNo: "LD202403003",
      tripNo: "TR202403003",
      regnNo: "MH03EF9012",
      invoiceDate: "2024-03-03",
      destinationCity: "Bangalore",
      route: "Pune-Bangalore",
      exclusiveGroup: "EG-A",
      mode: "Road",
      deliveryDateTT: "2024-03-07",
      deliveryDateTAT: "2024-03-08",
      tripFreight: "18000.00",
      duicNo: "DUIC202403003",
      grNumber: "GR202403003",
      engineNo: "ENG456789123",
      vinNumber: "VIN3MATC641MDN345678",
      salesModel: "Nexon EV",
      productionModel: "Nexon 2024",
      invoiceNo: "INV2024030003",
    },
    {
      sno: 4,
      dealer: "D004",
      for: "Dealer",
      dealerName: "Mahindra & Mahindra Ltd",
      loadNo: "LD202403004",
      tripNo: "TR202403004",
      regnNo: "MH04GH3456",
      invoiceDate: "2024-03-04",
      destinationCity: "Kolkata",
      route: "Mumbai-Kolkata",
      exclusiveGroup: "EG-C",
      mode: "Road",
      deliveryDateTT: "2024-03-10",
      deliveryDateTAT: "2024-03-11",
      tripFreight: "22000.00",
      duicNo: "DUIC202403004",
      grNumber: "GR202403004",
      engineNo: "ENG789123456",
      vinNumber: "VIN4MAHND41KLP456789",
      salesModel: "Thar ROX",
      productionModel: "Thar 2024",
      invoiceNo: "INV2024030004",
    },
    {
      sno: 5,
      dealer: "D005",
      for: "OEM",
      dealerName: "Honda Cars India Ltd",
      loadNo: "LD202403005",
      tripNo: "TR202403005",
      regnNo: "MH05IJ7890",
      invoiceDate: "2024-03-05",
      destinationCity: "Chennai",
      route: "Delhi-Chennai",
      exclusiveGroup: "EG-B",
      mode: "Rail",
      deliveryDateTT: "2024-03-12",
      deliveryDateTAT: "2024-03-13",
      tripFreight: "28000.00",
      duicNo: "DUIC202403005",
      grNumber: "GR202403005",
      engineNo: "ENG234567890",
      vinNumber: "VIN5HOND41MNO567890",
      salesModel: "City ZX",
      productionModel: "City 2024",
      invoiceNo: "INV2024030005",
    },
    {
      sno: 6,
      dealer: "D006",
      for: "Dealer",
      dealerName: "Toyota Kirloskar Motor",
      loadNo: "LD202403006",
      tripNo: "TR202403006",
      regnNo: "MH06KL2345",
      invoiceDate: "2024-03-06",
      destinationCity: "Hyderabad",
      route: "Bangalore-Hyderabad",
      exclusiveGroup: "EG-A",
      mode: "Road",
      deliveryDateTT: "2024-03-09",
      deliveryDateTAT: "2024-03-10",
      tripFreight: "16500.00",
      duicNo: "DUIC202403006",
      grNumber: "GR202403006",
      engineNo: "ENG345678901",
      vinNumber: "VIN6TOYT41PQR678901",
      salesModel: "Innova Crysta",
      productionModel: "Innova 2024",
      invoiceNo: "INV2024030006",
    },
    {
      sno: 7,
      dealer: "D007",
      for: "OEM",
      dealerName: "Kia Motors India",
      loadNo: "LD202403007",
      tripNo: "TR202403007",
      regnNo: "MH07MN6789",
      invoiceDate: "2024-03-07",
      destinationCity: "Pune",
      route: "Mumbai-Pune",
      exclusiveGroup: "EG-C",
      mode: "Road",
      deliveryDateTT: "2024-03-09",
      deliveryDateTAT: "2024-03-10",
      tripFreight: "12000.00",
      duicNo: "DUIC202403007",
      grNumber: "GR202403007",
      engineNo: "ENG456789012",
      vinNumber: "VIN7KIA41STU789012",
      salesModel: "Seltos GTX",
      productionModel: "Seltos 2024",
      invoiceNo: "INV2024030007",
    },
    {
      sno: 8,
      dealer: "D008",
      for: "Dealer",
      dealerName: "MG Motor India",
      loadNo: "LD202403008",
      tripNo: "TR202403008",
      regnNo: "MH08OP0123",
      invoiceDate: "2024-03-08",
      destinationCity: "Jaipur",
      route: "Delhi-Jaipur",
      exclusiveGroup: "EG-B",
      mode: "Road",
      deliveryDateTT: "2024-03-11",
      deliveryDateTAT: "2024-03-12",
      tripFreight: "13500.00",
      duicNo: "DUIC202403008",
      grNumber: "GR202403008",
      engineNo: "ENG567890123",
      vinNumber: "VIN8MGMG41VWX890123",
      salesModel: "Hector Plus",
      productionModel: "Hector 2024",
      invoiceNo: "INV2024030008",
    },
    {
      sno: 9,
      dealer: "D009",
      for: "OEM",
      dealerName: "Skoda Auto India",
      loadNo: "LD202403009",
      tripNo: "TR202403009",
      regnNo: "MH09QR4567",
      invoiceDate: "2024-03-09",
      destinationCity: "Ahmedabad",
      route: "Mumbai-Ahmedabad",
      exclusiveGroup: "EG-A",
      mode: "Road",
      deliveryDateTT: "2024-03-13",
      deliveryDateTAT: "2024-03-14",
      tripFreight: "14500.00",
      duicNo: "DUIC202403009",
      grNumber: "GR202403009",
      engineNo: "ENG678901234",
      vinNumber: "VIN9SKOD41YZA901234",
      salesModel: "Kodiaq L&K",
      productionModel: "Kodiaq 2024",
      invoiceNo: "INV2024030009",
    },
    {
      sno: 10,
      dealer: "D010",
      for: "Dealer",
      dealerName: "Volkswagen India",
      loadNo: "LD202403010",
      tripNo: "TR202403010",
      regnNo: "MH10ST8901",
      invoiceDate: "2024-03-10",
      destinationCity: "Lucknow",
      route: "Delhi-Lucknow",
      exclusiveGroup: "EG-C",
      mode: "Road",
      deliveryDateTT: "2024-03-14",
      deliveryDateTAT: "2024-03-15",
      tripFreight: "17500.00",
      duicNo: "DUIC202403010",
      grNumber: "GR202403010",
      engineNo: "ENG789012345",
      vinNumber: "VIN10VW41BCD012345",
      salesModel: "Taigun GT",
      productionModel: "Taigun 2024",
      invoiceNo: "INV2024030010",
    },
    {
      sno: 11,
      dealer: "D011",
      for: "OEM",
      dealerName: "Nissan India",
      loadNo: "LD202403011",
      tripNo: "TR202403011",
      regnNo: "MH11UV2345",
      invoiceDate: "2024-03-11",
      destinationCity: "Kochi",
      route: "Bangalore-Kochi",
      exclusiveGroup: "EG-B",
      mode: "Road",
      deliveryDateTT: "2024-03-16",
      deliveryDateTAT: "2024-03-17",
      tripFreight: "19500.00",
      duicNo: "DUIC202403011",
      grNumber: "GR202403011",
      engineNo: "ENG890123456",
      vinNumber: "VIN11NISS41EFG123456",
      salesModel: "Magnite Turbo",
      productionModel: "Magnite 2024",
      invoiceNo: "INV2024030011",
    },
    {
      sno: 12,
      dealer: "D012",
      for: "Dealer",
      dealerName: "Jeep India",
      loadNo: "LD202403012",
      tripNo: "TR202403012",
      regnNo: "MH12WX6789",
      invoiceDate: "2024-03-12",
      destinationCity: "Goa",
      route: "Pune-Goa",
      exclusiveGroup: "EG-A",
      mode: "Road",
      deliveryDateTT: "2024-03-15",
      deliveryDateTAT: "2024-03-16",
      tripFreight: "13000.00",
      duicNo: "DUIC202403012",
      grNumber: "GR202403012",
      engineNo: "ENG901234567",
      vinNumber: "VIN12JEEP41HIJ234567",
      salesModel: "Compass Trailhawk",
      productionModel: "Compass 2024",
      invoiceNo: "INV2024030012",
    },
  ], []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return dummyData;
    
    return dummyData.filter(item => 
      Object.values(item).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dummyData, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleExport = () => {
    alert("Export functionality would be implemented here");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
              <p className="text-sm text-gray-500">Vehicle transportation monthly summary</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by dealer, vehicle, route, or any field..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredData.length} records found</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  For
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Load No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regn No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination City
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exclusive Group
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date TT
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date TAT
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Freight
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DUIC No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GR Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engine No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIN Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item, index) => (
                <tr key={item.sno} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.dealer}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.for === 'OEM' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.for}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.dealerName}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.loadNo}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.tripNo}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.regnNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.invoiceDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.destinationCity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.route}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.exclusiveGroup}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.mode === 'Road' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.deliveryDateTT}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.deliveryDateTAT}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{item.tripFreight}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.duicNo}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.grNumber}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 text-xs">{item.engineNo}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 text-xs">{item.vinNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.salesModel}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.productionModel}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.invoiceNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
              {filteredData.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Freight</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{filteredData.reduce((sum, item) => sum + parseFloat(item.tripFreight), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Routes</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredData.map(item => item.route)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
