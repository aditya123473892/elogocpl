import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2,
  Upload,
  FileText,
  Truck,
  Train,
  Package,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  MapPin,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'react-toastify';

const ComprehensiveReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('rake-report');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Monthly Trip + Total Vins Data
  const [monthlyTripData, setMonthlyTripData] = useState([
    { id: 1, month: '2024-03', totalTrips: 45, totalVins: 1250, avgVinsPerTrip: 27.8, completionRate: '95%' },
    { id: 2, month: '2024-02', totalTrips: 42, totalVins: 1180, avgVinsPerTrip: 28.1, completionRate: '92%' },
    { id: 3, month: '2024-01', totalTrips: 48, totalVins: 1320, avgVinsPerTrip: 27.5, completionRate: '98%' }
  ]);

  // Rake Planning / DCT Data
  const [rakePlanningData, setRakePlanningData] = useState([
    { id: 1, rakeNo: 'RAKE001', dctStatus: 'Planned', scheduledDate: '2024-03-31', priority: 'High', assignedVehicles: 12, status: 'active' },
    { id: 2, rakeNo: 'RAKE002', dctStatus: 'In Progress', scheduledDate: '2024-04-01', priority: 'Medium', assignedVehicles: 8, status: 'pending' },
    { id: 3, rakeNo: 'RAKE003', dctStatus: 'Completed', scheduledDate: '2024-03-30', priority: 'Low', assignedVehicles: 10, status: 'completed' }
  ]);

  // Intransit Rake Status Data
  const [intransitData, setIntransitData] = useState([
    { id: 1, rakeNo: 'RAKE004', currentLocation: 'Yard 2', origin: 'Plant A', destination: 'Dealer X', eta: '2024-03-31 18:00', delay: 'On Time', status: 'in-transit' },
    { id: 2, rakeNo: 'RAKE005', currentLocation: 'Highway NH-44', origin: 'Plant B', destination: 'Dealer Y', eta: '2024-04-01 10:00', delay: '2 hrs', status: 'delayed' }
  ]);

  // Stock Inventory Data
  const [stockData, setStockData] = useState([
    { id: 1, location: 'First Mile', available: 450, allocated: 320, inTransit: 130, total: 900 },
    { id: 2, location: 'Second Mile', available: 280, allocated: 195, inTransit: 85, total: 560 },
    { id: 3, location: 'Last Mile', available: 120, allocated: 85, inTransit: 35, total: 240 }
  ]);

  // Transit Time Data
  const [transitTimeData, setTransitTimeData] = useState([
    { id: 1, route: 'Plant A to Dealer X', actualTime: '4h 30m', plannedTime: '4h 00m', variance: '+30m', efficiency: '88%' },
    { id: 2, route: 'Plant B to Dealer Y', actualTime: '3h 45m', plannedTime: '4h 00m', variance: '-15m', efficiency: '106%' }
  ]);

  // Dealer Compensation Data
  const [dealerCompData, setDealerCompData] = useState([
    { id: 1, dealerName: 'Dealer X', trips: 15, totalComp: 45000, avgPerTrip: 3000, paymentStatus: 'Paid' },
    { id: 2, dealerName: 'Dealer Y', trips: 12, totalComp: 36000, avgPerTrip: 3000, paymentStatus: 'Pending' }
  ]);

  // New Loads at Plant Data
  const [newLoadsData, setNewLoadsData] = useState([
    { id: 1, loadId: 'LOAD001', vinCount: 25, plant: 'Plant A', attachedDate: '2024-03-31', status: 'Ready', priority: 'High' },
    { id: 2, loadId: 'LOAD002', vinCount: 18, plant: 'Plant B', attachedDate: '2024-03-31', status: 'Processing', priority: 'Medium' }
  ]);

  // Pending Load for Plant Exit Data
  const [pendingLoadData, setPendingLoadData] = useState([
    { id: 1, loadId: 'LOAD003', vinCount: 30, plant: 'Plant A', pendingSince: '2 hours', reason: 'Vehicle Allocation', urgency: 'High' },
    { id: 2, loadId: 'LOAD004', vinCount: 22, plant: 'Plant B', pendingSince: '1 hour', reason: 'Documentation', urgency: 'Medium' }
  ]);

  // Rake Visibility Data
  const [rakeVisibilityData, setRakeVisibilityData] = useState([
    { id: 1, rakeNo: 'RAKE006', lastSeen: '2024-03-31 14:30', location: 'GPS Active', speed: '45 km/h', driver: 'John Doe', contact: '9876543210' },
    { id: 2, rakeNo: 'RAKE007', lastSeen: '2024-03-31 13:45', location: 'GPS Lost', speed: 'N/A', driver: 'Jane Smith', contact: '9876543211' }
  ]);

  // ROH / POD Details Data
  const [rohPodData, setRohPodData] = useState([
    { id: 1, rakeNo: 'RAKE008', rohStatus: 'Submitted', podStatus: 'Pending', rohDate: '2024-03-31', podDate: 'N/A', documents: 2 },
    { id: 2, rakeNo: 'RAKE009', rohStatus: 'Approved', podStatus: 'Submitted', rohDate: '2024-03-30', podDate: '2024-03-31', documents: 3 }
  ]);

  // Rake Loading Details Data
  const [rakeLoadingData, setRakeLoadingData] = useState([
    { id: 1, rakeNo: 'RAKE010', loadingStartTime: '2024-03-31 08:00', loadingEndTime: '2024-03-31 11:30', totalVins: 45, loadingBay: 'Bay 3', operator: 'Operator A' },
    { id: 2, rakeNo: 'RAKE011', loadingStartTime: '2024-03-31 12:00', loadingEndTime: '2024-03-31 14:00', totalVins: 32, loadingBay: 'Bay 1', operator: 'Operator B' }
  ]);

  // Eway Bill Data
  const [ewayBillData, setEwayBillData] = useState([
    { id: 1, ewayBillNo: 'EB001234567890', validUntil: '2024-04-02', status: 'Active', rakeNo: 'RAKE012', generatedOn: '2024-03-31' },
    { id: 2, ewayBillNo: 'EB001234567891', validUntil: '2024-04-01', status: 'Expiring Soon', rakeNo: 'RAKE013', generatedOn: '2024-03-30' }
  ]);

  // Basic Billing Data
  const [billingData, setBillingData] = useState([
    { id: 1, invoiceNo: 'INV001', rakeNo: 'RAKE014', amount: 15000, dueDate: '2024-04-15', status: 'Paid', paymentDate: '2024-04-10' },
    { id: 2, invoiceNo: 'INV002', rakeNo: 'RAKE015', amount: 12000, dueDate: '2024-04-20', status: 'Pending', paymentDate: 'N/A' }
  ]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Data refreshed successfully');
    }, 1000);
  };

  const handleExport = (section) => {
    toast.info(`Exporting ${section} data...`);
  };

  const handleFileUpload = (section) => {
    toast.info(`Upload functionality for ${section} would be implemented here`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'Paid':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'Pending':
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
      case 'Expiring Soon':
        return 'bg-orange-100 text-orange-800';
      case 'maintenance':
      case 'GPS Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Badge = ({ children, className, variant = 'default' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
      {children}
    </span>
  );

  const Button = ({ children, onClick, className, variant = 'default', size = 'md', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none ring-offset-background
        ${
          variant === 'outline'
            ? 'border border-gray-300 hover:bg-gray-50'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        ${
          size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 py-2'
        }
        ${className || ''}
      `}
    >
      {children}
    </button>
  );

  const Input = ({ className, ...props }) => (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    />
  );

  const Card = ({ children, className }) => (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className || ''}`}>
      {children}
    </div>
  );

  const CardHeader = ({ children, className }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
      {children}
    </div>
  );

  const CardTitle = ({ children, className }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>
      {children}
    </h3>
  );

  const CardContent = ({ children, className }) => (
    <div className={`p-6 pt-0 ${className || ''}`}>
      {children}
    </div>
  );

  const tabs = [
    { id: 'rake-report', name: 'Rake Report', icon: Train },
    { id: 'monthly-trip', name: 'Monthly Trip + VINs', icon: TrendingUp },
    { id: 'rake-planning', name: 'Rake Planning / DCT', icon: Calendar },
    { id: 'intransit', name: 'Intransit Status', icon: MapPin },
    { id: 'stock-inventory', name: 'Stock Inventory', icon: Package },
    { id: 'transit-time', name: 'Transit Time', icon: Clock },
    { id: 'dealer-comp', name: 'Dealer Compensation', icon: DollarSign },
    { id: 'new-loads', name: 'New Loads at Plant', icon: Truck },
    { id: 'pending-loads', name: 'Pending Plant Exit', icon: AlertCircle },
    { id: 'rake-visibility', name: 'Rake Visibility', icon: Eye },
    { id: 'roh-pod', name: 'ROH / POD Details', icon: FileText },
    { id: 'rake-loading', name: 'Rake Loading Details', icon: Package },
    { id: 'eway-bill', name: 'Eway Bill Solution', icon: Receipt },
    { id: 'billing', name: 'Basic Billing', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'rake-report':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rake Operations Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 text-sm">Total Rakes</div>
                    <div className="text-2xl font-bold text-blue-800">24</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 text-sm">Active</div>
                    <div className="text-2xl font-bold text-green-800">18</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-yellow-600 text-sm">Delayed</div>
                    <div className="text-2xl font-bold text-yellow-800">4</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-red-600 text-sm">Maintenance</div>
                    <div className="text-2xl font-bold text-red-800">2</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RAKE NO</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TPT NAME</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading Terminal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">REMARK</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TXR DUE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PLANNING</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { rakeNo: 'RAKE001', plant: 'MSIL/SMG', tptName: 'TPT-001', loadingTerminal: 'Terminal A', currentLocation: 'Yard 3', distance: '25 km', eta: '2024-03-31 14:30', remark: 'On schedule', txrDue: '2024-03-31 16:00', planning: 'Yes', status: 'active' },
                        { rakeNo: 'RAKE002', plant: 'MSIL/SMG', tptName: 'TPT-002', loadingTerminal: 'Terminal B', currentLocation: 'Yard 1', distance: '12 km', eta: '2024-03-31 15:45', remark: 'Delayed by weather', txrDue: '2024-03-31 17:00', planning: 'No', status: 'delayed' },
                        { rakeNo: 'RAKE003', plant: 'MSIL/SMG', tptName: 'TPT-003', loadingTerminal: 'Terminal C', currentLocation: 'In Transit', distance: '45 km', eta: '2024-03-31 18:00', remark: 'Maintenance required', txrDue: '2024-03-31 19:30', planning: 'Yes', status: 'maintenance' }
                      ].map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plant}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.tptName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingTerminal}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.currentLocation}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.distance}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.eta}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.remark}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.txrDue}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Badge variant={item.planning === 'Yes' ? 'default' : 'secondary'}>
                              {item.planning}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'monthly-trip':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Monthly Trip + Total VINs Report</CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-auto"
                  />
                  <Button size="sm" onClick={() => handleFileUpload('monthly-trip')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button size="sm" onClick={() => handleExport('monthly-trip')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trips</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total VINs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg VINs/Trip</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyTripData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.month}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.totalTrips}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.totalVins}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.avgVinsPerTrip}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800">{item.completionRate}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'rake-planning':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Rake Planning / DCT</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleExport('rake-planning')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DCT Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Vehicles</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rakePlanningData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.dctStatus}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.scheduledDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={
                              item.priority === 'High' ? 'bg-red-100 text-red-800' :
                              item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>{item.priority}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.assignedVehicles}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'intransit':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Intransit Rake Status</CardTitle>
                <Button size="sm" onClick={() => handleExport('intransit')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delay</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {intransitData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.currentLocation}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.origin}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.destination}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.eta}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.delay}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'stock-inventory':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Stock Inventory (First Mile / Second Mile / Last Mile)</CardTitle>
                <Button size="sm" onClick={() => handleExport('stock-inventory')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Transit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.location}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.available}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.allocated}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.inTransit}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'transit-time':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Transit Time Data</CardTitle>
                <Button size="sm" onClick={() => handleExport('transit-time')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planned Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transitTimeData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.route}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.actualTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plannedTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Badge className={item.variance.startsWith('+') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {item.variance}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={parseInt(item.efficiency) >= 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {item.efficiency}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'dealer-comp':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Dealer Compensation</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleFileUpload('dealer-comp')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Input
                  </Button>
                  <Button size="sm" onClick={() => handleExport('dealer-comp')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Compensation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Per Trip</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dealerCompData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.dealerName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.trips}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">₹{item.totalComp.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">₹{item.avgPerTrip.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.paymentStatus)}>{item.paymentStatus}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'new-loads':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>New Loads Attached at Plant</CardTitle>
                <Button size="sm" onClick={() => handleExport('new-loads')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attached Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newLoadsData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.loadId}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.vinCount}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plant}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.attachedDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={
                              item.priority === 'High' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>{item.priority}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'pending-loads':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Pending Load for Plant Exit</CardTitle>
                <Button size="sm" onClick={() => handleExport('pending-loads')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Since</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingLoadData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.loadId}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.vinCount}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plant}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.pendingSince}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.reason}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={
                              item.urgency === 'High' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>{item.urgency}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'rake-visibility':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Rake Visibility</CardTitle>
                <Button size="sm" onClick={() => handleExport('rake-visibility')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speed</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rakeVisibilityData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.lastSeen}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.location)}>{item.location}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.speed}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.driver}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.contact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'roh-pod':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>ROH / POD Details</CardTitle>
                <Button size="sm" onClick={() => handleExport('roh-pod')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROH Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">POD Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROH Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">POD Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rohPodData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.rohStatus)}>{item.rohStatus}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.podStatus)}>{item.podStatus}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rohDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.podDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.documents}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'rake-loading':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Rake Loading Details</CardTitle>
                <Button size="sm" onClick={() => handleExport('rake-loading')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading Start</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading End</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total VINs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading Bay</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rakeLoadingData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingStartTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingEndTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.totalVins}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingBay}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.operator}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'eway-bill':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Eway Bill Solution</CardTitle>
                <Button size="sm" onClick={() => handleExport('eway-bill')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eway Bill No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated On</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ewayBillData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.ewayBillNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.validUntil}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.generatedOn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Basic Billing</CardTitle>
                <Button size="sm" onClick={() => handleExport('billing')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {billingData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.invoiceNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rakeNo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">₹{item.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.dueDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{item.paymentDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Logistics Report</h1>
          <p className="text-gray-600 mt-1">Complete operations and logistics reporting</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExport('comprehensive')} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Monthly Trip + Total VINs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Trip + Total VINs (Input File)
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-auto"
            />
            <Button size="sm" onClick={() => handleFileUpload('monthly-trip')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Input File
            </Button>
            <Button size="sm" onClick={() => handleExport('monthly-trip')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trips</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total VINs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg VINs/Trip</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyTripData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.month}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.totalTrips}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.totalVins}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.avgVinsPerTrip}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className="bg-green-100 text-green-800">{item.completionRate}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rake Planning / DCT Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Rake Planning / DCT
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('rake-planning')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DCT Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Vehicles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rakePlanningData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.dctStatus}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.scheduledDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>{item.priority}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.assignedVehicles}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Intransit Rake Status Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Intransit Rake Status
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('intransit')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intransitData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.currentLocation}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.origin}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.destination}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.eta}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.delay}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Inventory Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Stock Inventory (First Mile / Second Mile / Last Mile)
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('stock-inventory')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Transit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.available}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.allocated}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.inTransit}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transit Time Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Transit Time Data
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('transit-time')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planned Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transitTimeData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.route}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.actualTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plannedTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={item.variance.startsWith('+') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {item.variance}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={parseInt(item.efficiency) >= 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {item.efficiency}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dealer Compensation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Dealer Compensation (different input will be provided)
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleFileUpload('dealer-comp')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Input
            </Button>
            <Button size="sm" onClick={() => handleExport('dealer-comp')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Compensation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Per Trip</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dealerCompData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.dealerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.trips}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">₹{item.totalComp.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">₹{item.avgPerTrip.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.paymentStatus)}>{item.paymentStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Loads Attached at Plant Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            New Loads Attached at Plant
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('new-loads')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attached Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newLoadsData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.loadId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.vinCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plant}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.attachedDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>{item.priority}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Load for Plant Exit Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pending Load for Plant Exit
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('pending-loads')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Since</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingLoadData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.loadId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.vinCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.plant}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.pendingSince}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.reason}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={
                        item.urgency === 'High' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>{item.urgency}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rake Visibility Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Rake Visibility
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('rake-visibility')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rakeVisibilityData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.lastSeen}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.location)}>{item.location}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.speed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.driver}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ROH / POD Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            ROH / POD Details
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('roh-pod')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROH Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">POD Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROH Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">POD Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rohPodData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.rohStatus)}>{item.rohStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.podStatus)}>{item.podStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rohDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.podDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.documents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rake Loading Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Rake Loading Details
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('rake-loading')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading End</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total VINs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loading Bay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rakeLoadingData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingStartTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingEndTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.totalVins}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.loadingBay}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Eway Bill Solution Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Eway Bill Solution
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('eway-bill')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eway Bill No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ewayBillData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.ewayBillNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.validUntil}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.generatedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Basic Billing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Basic Billing
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleExport('billing')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billingData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.invoiceNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">₹{item.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.dueDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReport;
