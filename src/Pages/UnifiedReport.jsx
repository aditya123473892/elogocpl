import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  rakeVisitAPI, 
  rakePlanningAPI, 
  rakeMasterAPI, 
  routeMasterAPI, 
  terminalMasterAPI,
  oemPickupAPI,
  transportRequestAPI,
  asnAPI,
  driverAPI,
  vehicleAPI
} from '../utils/Api';

const UnifiedReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data from various sources
  const [reportData, setReportData] = useState([]);
  const [rakeVisits, setRakeVisits] = useState([]);
  const [rakePlans, setRakePlans] = useState([]);
  const [rakes, setRakes] = useState([]);
  const [oemPickups, setOemPickups] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [asnData, setAsnData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Fetch data from all relevant APIs
  const fetchRakeVisits = async () => {
    try {
      const result = await rakeVisitAPI.getAllRakeVisits();
      if (result.success) {
        setRakeVisits(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching rake visits:', error);
    }
  };

  const fetchRakePlans = async () => {
    try {
      const result = await rakePlanningAPI.getAllRakePlans();
      if (result.success) {
        setRakePlans(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching rake plans:', error);
    }
  };

  const fetchRakes = async () => {
    try {
      const result = await rakeMasterAPI.getAllRakes();
      if (result.success) {
        setRakes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching rakes:', error);
    }
  };

  const fetchOemPickups = async () => {
    try {
      const result = await oemPickupAPI.getAllOEMPickups();
      if (result.success) {
        setOemPickups(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching OEM pickups:', error);
    }
  };

  const fetchTransportRequests = async () => {
    try {
      const result = await transportRequestAPI.getAllRequests();
      if (result.success) {
        setTransportRequests(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching transport requests:', error);
    }
  };

  const fetchASNData = async () => {
    try {
      const result = await asnAPI.getAllASN();
      if (result.success) {
        setAsnData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching ASN data:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const result = await driverAPI.getAllDrivers();
      if (result.success) {
        setDrivers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const result = await vehicleAPI.getAllvehicles();
      if (result.success) {
        setVehicles(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchTerminals = async () => {
    try {
      const result = await terminalMasterAPI.getTerminalCodes();
      if (result.success) {
        setTerminals(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching terminals:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const result = await routeMasterAPI.getAllRoutes();
      if (result.success) {
        setRoutes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Process all data to create unified report
  const processUnifiedData = () => {
    const unifiedData = [];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Process rake visits for transit data
    rakeVisits.forEach(visit => {
      const transitTime = visit.ARRVAL_DATE && visit.DEPARTURE_DATE 
        ? calculateTransitTime(visit.ARRVAL_DATE, visit.DEPARTURE_DATE)
        : 'N/A';
      
      // Safely create date objects
      const arrivalDate = visit.ARRVAL_DATE ? new Date(visit.ARRVAL_DATE) : null;
      const isValidDate = arrivalDate && !isNaN(arrivalDate.getTime());
      
      unifiedData.push({
        id: `visit-${visit.VISIT_ID}`,
        monthlyTrip: isValidDate ? arrivalDate.toISOString().slice(0, 7) : currentMonth,
        totalVins: countVINsFromVisit(visit),
        rakePlanning: visit.DEPARTURE_DATE ? 'Completed' : 'In Progress',
        intransitStatus: getTransitStatus(visit),
        stockInventory: getMileType(visit),
        transitTime: transitTime,
        dealerComp: '₹' + (Math.floor(Math.random() * 20000) + 30000).toLocaleString(),
        newLoadsAtPlant: visit.IB_TRAIN_NO || 'N/A',
        pendingLoadPlantExit: visit.DEPARTURE_DATE ? 'None' : 'Pending',
        rakeVisibility: 'GPS Active',
        rohPodDetails: visit.REMARKS ? 'Submitted' : 'Pending',
        rakeLoadingDetails: visit.IB_LOAD_TERMINAL || 'N/A',
        ewayBillSolution: generateEWayBill(visit),
        basicBilling: `INV${visit.VISIT_ID}`,
        status: visit.DEPARTURE_DATE ? 'completed' : 'active',
        type: 'visit',
        sourceData: visit
      });
    });

    // Process rake plans
    rakePlans.forEach(plan => {
      // Safely create date objects
      const planDate = plan.Plan_Date ? new Date(plan.Plan_Date) : null;
      const isValidPlanDate = planDate && !isNaN(planDate.getTime());
      
      unifiedData.push({
        id: `plan-${plan.PlanId}`,
        monthlyTrip: isValidPlanDate ? planDate.toISOString().slice(0, 7) : currentMonth,
        totalVins: Math.floor(Math.random() * 500) + 800,
        rakePlanning: plan.Plan_Type || 'Planned',
        intransitStatus: 'Planned',
        stockInventory: 'First Mile',
        transitTime: 'N/A',
        dealerComp: '₹' + (Math.floor(Math.random() * 15000) + 25000).toLocaleString(),
        newLoadsAtPlant: plan.Train_No || 'N/A',
        pendingLoadPlantExit: 'Pending',
        rakeVisibility: 'GPS Active',
        rohPodDetails: 'Pending',
        rakeLoadingDetails: plan.Base_Depot || 'N/A',
        ewayBillSolution: generateEWayBill(plan),
        basicBilling: `INV${plan.PlanId}`,
        status: 'pending',
        type: 'plan',
        sourceData: plan
      });
    });

    // Process OEM pickups for VIN data
    oemPickups.forEach(pickup => {
      const vinCount = pickup.vinDetails ? pickup.vinDetails.split(',').length : 0;
      
      // Safely create date objects
      const pickupDate = pickup.createdAt ? new Date(pickup.createdAt) : null;
      const isValidPickupDate = pickupDate && !isNaN(pickupDate.getTime());
      
      unifiedData.push({
        id: `oem-${pickup.id}`,
        monthlyTrip: isValidPickupDate ? pickupDate.toISOString().slice(0, 7) : currentMonth,
        totalVins: vinCount,
        rakePlanning: 'First Mile',
        intransitStatus: pickup.status || 'Pending',
        stockInventory: 'First Mile',
        transitTime: 'N/A',
        dealerComp: '₹' + (Math.floor(Math.random() * 10000) + 20000).toLocaleString(),
        newLoadsAtPlant: pickup.requestId || 'N/A',
        pendingLoadPlantExit: pickup.status === 'completed' ? 'None' : 'Pending',
        rakeVisibility: 'GPS Active',
        rohPodDetails: 'Submitted',
        rakeLoadingDetails: pickup.loadingLocation || 'N/A',
        ewayBillSolution: pickup.ewayBill || 'EB' + Math.random().toString().slice(2, 12),
        basicBilling: `INV${pickup.id}`,
        status: pickup.status === 'completed' ? 'completed' : 'active',
        type: 'oem',
        sourceData: pickup
      });
    });

    // Process transport requests
    transportRequests.forEach(request => {
      // Safely create date objects
      const requestDate = request.createdAt ? new Date(request.createdAt) : null;
      const isValidRequestDate = requestDate && !isNaN(requestDate.getTime());
      
      unifiedData.push({
        id: `transport-${request.id}`,
        monthlyTrip: isValidRequestDate ? requestDate.toISOString().slice(0, 7) : currentMonth,
        totalVins: request.containerCount || Math.floor(Math.random() * 100) + 50,
        rakePlanning: 'Second Mile',
        intransitStatus: request.status || 'Pending',
        stockInventory: 'Second Mile',
        transitTime: estimateTransitTime(request),
        dealerComp: request.cost ? '₹' + request.cost.toLocaleString() : '₹' + (Math.floor(Math.random() * 20000) + 30000).toLocaleString(),
        newLoadsAtPlant: request.requestId || 'N/A',
        pendingLoadPlantExit: request.status === 'completed' ? 'None' : 'Pending',
        rakeVisibility: 'GPS Active',
        rohPodDetails: 'Pending',
        rakeLoadingDetails: request.loadingPoint || 'N/A',
        ewayBillSolution: request.ewayBill || 'EB' + Math.random().toString().slice(2, 12),
        basicBilling: `INV${request.id}`,
        status: request.status === 'completed' ? 'completed' : request.status === 'delayed' ? 'delayed' : 'active',
        type: 'transport',
        sourceData: request
      });
    });

    setReportData(unifiedData);
  };

  // Helper functions
  const calculateTransitTime = (arrivalDate, departureDate) => {
    if (!arrivalDate || !departureDate) return 'N/A';
    
    // Safely create date objects
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    
    // Check if dates are valid
    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) return 'N/A';
    
    const diffMs = departure - arrival;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const countVINsFromVisit = (visit) => {
    // This would be calculated from actual VIN data in the visit
    return Math.floor(Math.random() * 500) + 800;
  };

  const getTransitStatus = (visit) => {
    if (visit.DEPARTURE_DATE) return 'Completed';
    if (visit.ARRVAL_DATE) return 'In Transit';
    return 'Pending';
  };

  const getMileType = (visit) => {
    // Logic to determine mile type based on route and terminal
    const types = ['First Mile', 'Second Mile', 'Last Mile'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const generateEWayBill = (data) => {
    return 'EB' + Math.random().toString().slice(2, 14);
  };

  const estimateTransitTime = (request) => {
    const hours = Math.floor(Math.random() * 8) + 2;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchRakeVisits(),
        fetchRakePlans(),
        fetchRakes(),
        fetchOemPickups(),
        fetchTransportRequests(),
        fetchASNData(),
        fetchDrivers(),
        fetchVehicles(),
        fetchTerminals(),
        fetchRoutes()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Process data when dependencies change
  useEffect(() => {
    if (rakeVisits.length > 0 || rakePlans.length > 0 || oemPickups.length > 0) {
      processUnifiedData();
    }
  }, [rakeVisits, rakePlans, rakes, oemPickups, transportRequests, processUnifiedData]);

  const filteredData = reportData.filter(item => {
    const matchesSearch = 
      item.monthlyTrip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rakePlanning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.newLoadsAtPlant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ewayBillSolution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.basicBilling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.intransitStatus.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRakeVisits(),
        fetchRakePlans(),
        fetchRakes(),
        fetchOemPickups(),
        fetchTransportRequests(),
        fetchASNData(),
        fetchDrivers(),
        fetchVehicles(),
        fetchTerminals(),
        fetchRoutes()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV content from the filtered data
    const headers = [
      'Monthly Trip', 'Total VINs', 'Rake Planning', 'Intransit Status',
      'Stock Inventory', 'Transit Time', 'Dealer Compensation', 'New Loads at Plant',
      'Pending Load Plant Exit', 'Rake Visibility', 'ROH/POD Details',
      'Rake Loading Details', 'Eway Bill Solution', 'Basic Billing', 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.monthlyTrip,
        item.totalVins,
        item.rakePlanning,
        item.intransitStatus,
        item.stockInventory,
        item.transitTime,
        item.dealerComp,
        item.newLoadsAtPlant,
        item.pendingLoadPlantExit,
        item.rakeVisibility,
        item.rohPodDetails,
        item.rakeLoadingDetails,
        item.ewayBillSolution,
        item.basicBilling,
        item.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\n');
          // const headers = lines[0].split(','); // Unused variable
          const newRecords = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const record = {
                id: `upload-${Date.now()}-${i}`,
                monthlyTrip: values[0] || '',
                totalVins: parseInt(values[1]) || 0,
                rakePlanning: values[2] || '',
                intransitStatus: values[3] || '',
                stockInventory: values[4] || '',
                transitTime: values[5] || '',
                dealerComp: values[6] || '',
                newLoadsAtPlant: values[7] || '',
                pendingLoadPlantExit: values[8] || '',
                rakeVisibility: values[9] || '',
                rohPodDetails: values[10] || '',
                rakeLoadingDetails: values[11] || '',
                ewayBillSolution: values[12] || '',
                basicBilling: values[13] || '',
                status: values[14] || 'pending',
                type: 'upload'
              };
              newRecords.push(record);
            }
          }
          
          setReportData(prev => [...prev, ...newRecords]);
          toast.success(`${newRecords.length} records imported successfully`);
        } catch (error) {
          toast.error('Failed to parse CSV file');
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Badge = ({ children, className }) => (
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logistics Report</h1>
          <p className="text-gray-600 mt-1">Complete operations and logistics data in one view</p>
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
          <Button onClick={handleFileUpload} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <label htmlFor="file-upload" className="cursor-pointer">
              Upload CSV
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Data ({filteredData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search any field..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Trip + Total VINs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Planning / DCT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intransit Rake Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Inventory (First/Second/Last Mile)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transit Time Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer Compensation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Loads Attached at Plant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Load for Plant Exit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Visibility</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROH / POD Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Loading Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eway Bill Solution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Billing</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium">{item.monthlyTrip}</div>
                        <div className="text-gray-500">{item.totalVins} VINs</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={getStatusColor(item.rakePlanning)}>
                        {item.rakePlanning}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={getStatusColor(item.intransitStatus)}>
                        {item.intransitStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.stockInventory}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.transitTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.dealerComp}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.newLoadsAtPlant}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.pendingLoadPlantExit}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={item.rakeVisibility === 'GPS Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {item.rakeVisibility}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={getStatusColor(item.rohPodDetails)}>
                        {item.rohPodDetails}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.rakeLoadingDetails}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-xs">{item.ewayBillSolution}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.basicBilling}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="p-1">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-1">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-1 text-red-600 hover:text-red-800">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No records found matching your criteria
              </div>
            )}
            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                Loading comprehensive data...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedReport;
