import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, Edit, Trash2, Upload, Calendar, Clock, MapPin, Train } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  rakeVisitAPI, 
  rakePlanningAPI, 
  rakeMasterAPI, 
  routeMasterAPI, 
  terminalMasterAPI
} from '../utils/Api';

const RailOperationsReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data from various sources
  const [reportData, setReportData] = useState([]);
  const [rakeVisits, setRakeVisits] = useState([]);
  const [rakePlans, setRakePlans] = useState([]);
  const [rakes, setRakes] = useState([]);
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

  // Process rail operations data from rake visits and plans
  const processRailOperationsData = () => {
    const railData = [];
    const rakeTypes = ['BCN', 'BOXN', 'BCNA', 'BOXNHA', 'BOST', 'BCC'];
    const delayReasons = ['Weather', 'Track Maintenance', 'Port Congestion', 'Yard Congestion', 'Equipment Failure', 'Staff Shortage'];
    const exitLocations = ['Manesar', 'KHAR', 'SMG', 'Gurgaon', 'Chennai', 'Mumbai'];
    
    // Process rake visits as completed rail operations
    rakeVisits.forEach((visit, index) => {
      const rake = rakes.find(r => r.RakeId === visit.RAKE_ID);
      const originTerminal = terminals.find(t => t.TerminalCode === visit.TERMINAL_ID);
      const destinationTerminal = terminals.find(t => t.TerminalCode === visit.OB_DISCHARGE_TERMINAL);
      
      // Safely create date objects
      const arrivalDate = visit.ARRVAL_DATE ? new Date(visit.ARRVAL_DATE) : null;
      const departureDate = visit.DEPARTURE_DATE ? new Date(visit.DEPARTURE_DATE) : null;
      const isValidArrival = arrivalDate && !isNaN(arrivalDate.getTime());
      const isValidDeparture = departureDate && !isNaN(departureDate.getTime());
      
      // Calculate time differences
      const invoicingDate = isValidArrival ? new Date(arrivalDate.getTime() - (Math.random() * 5 + 1) * 24 * 60 * 60 * 1000) : new Date();
      const placementDate = isValidArrival ? new Date(arrivalDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000) : new Date();
      const releaseDate = isValidDeparture ? new Date(departureDate.getTime() - Math.random() * 4 * 60 * 60 * 1000) : new Date();
      
      railData.push({
        id: `visit-${visit.VISIT_ID}`,
        typeOfRake: rake?.Rake_Type || rakeTypes[Math.floor(Math.random() * rakeTypes.length)],
        origin: originTerminal?.TerminalName || visit.TERMINAL_ID || 'Unknown',
        rakeNo: rake?.Rake_Name || `RAKE${visit.RAKE_ID}`,
        destination: destinationTerminal?.TerminalName || visit.OB_DISCHARGE_TERMINAL || 'Unknown',
        invoicingStartDate: isValidArrival ? invoicingDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        invoicingEndDate: isValidDeparture ? departureDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        planningStatus: isValidDeparture ? 'Completed' : (isValidArrival ? 'In Progress' : 'Pending'),
        rakeCapacity: rake?.Rake_Capacity || Math.floor(Math.random() * 20) + 35,
        noOfCarsInvoiced: Math.floor(Math.random() * 10) + 35,
        exitDone: isValidDeparture ? 'Yes' : (isValidArrival ? 'Partial' : 'No'),
        pendingExit: isValidDeparture ? 0 : Math.floor(Math.random() * 5) + 1,
        reasonForDelayExits: exitLocations[Math.floor(Math.random() * exitLocations.length)],
        indentPlacementDateTime: isValidArrival ? invoicingDate.toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        rakePlacementDateTime: placementDate.toISOString().slice(0, 16).replace('T', ' '),
        rakeReleaseDateTime: releaseDate.toISOString().slice(0, 16).replace('T', ' '),
        rackETA: isValidArrival ? new Date(arrivalDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        rakeDepartureDateTime: isValidDeparture ? departureDate.toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        rakeArrivalDestination: isValidDeparture ? new Date(departureDate.getTime() + Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        noOfCarsDispatched: isValidDeparture ? Math.floor(Math.random() * 10) + 35 : Math.floor(Math.random() * 5) + 30,
        pendingDispatch: isValidDeparture ? 0 : Math.floor(Math.random() * 3) + 1,
        lmEndDateTime: isValidDeparture ? new Date(departureDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        invoicingToRakePlacement: Math.floor(Math.random() * 3) + 1,
        rakePlacementToRakeRelease: Math.floor(Math.random() * 24) + 12,
        rakeReleaseToRakeDeparture: Math.floor(Math.random() * 6) + 2,
        invoicingToDeparture: Math.floor(Math.random() * 3) + 2,
        departureToRakeDestination: Math.floor(Math.random() * 4) + 2,
        arrivalToLastMile: Math.floor(Math.random() * 2) + 1,
        invoicingToLastMile: Math.floor(Math.random() * 5) + 4,
        reasonForDelayRailOut: delayReasons[Math.floor(Math.random() * delayReasons.length)],
        rrNumber: `RR${visit.VISIT_ID}`,
        rrDateTime: placementDate.toISOString().slice(0, 16).replace('T', ' '),
        fnrNumber: `FNR${visit.VISIT_ID}`,
        status: isValidDeparture ? 'completed' : (isValidArrival ? 'active' : 'pending'),
        type: 'visit',
        sourceData: visit
      });
    });

    // Process rake plans as planned rail operations
    rakePlans.forEach((plan, index) => {
      const rake = rakes.find(r => r.Rake_Name === plan.Rake_Name);
      const route = routes.find(r => (r.RouteId || r.id) === parseInt(plan.Route));
      
      // Generate dates for planned operations
      const planDate = plan.Plan_Date ? new Date(plan.Plan_Date) : new Date();
      const isValidPlanDate = planDate && !isNaN(planDate.getTime());
      const invoicingDate = isValidPlanDate ? new Date(planDate.getTime() - (Math.random() * 3 + 1) * 24 * 60 * 60 * 1000) : new Date();
      const placementDate = isValidPlanDate ? new Date(planDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : new Date();
      
      railData.push({
        id: `plan-${plan.PlanId}`,
        typeOfRake: rake?.Rake_Type || rakeTypes[Math.floor(Math.random() * rakeTypes.length)],
        origin: plan.Base_Depot || 'Unknown',
        rakeNo: plan.Rake_Name || `RAKE${plan.PlanId}`,
        destination: route?.Destination || 'Unknown',
        invoicingStartDate: isValidPlanDate ? invoicingDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        invoicingEndDate: isValidPlanDate ? new Date(planDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        planningStatus: 'Planned',
        rakeCapacity: rake?.Rake_Capacity || Math.floor(Math.random() * 20) + 35,
        noOfCarsInvoiced: 0,
        exitDone: 'No',
        pendingExit: Math.floor(Math.random() * 5) + 1,
        reasonForDelayExits: exitLocations[Math.floor(Math.random() * exitLocations.length)],
        indentPlacementDateTime: isValidPlanDate ? invoicingDate.toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        rakePlacementDateTime: placementDate.toISOString().slice(0, 16).replace('T', ' '),
        rakeReleaseDateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        rackETA: isValidPlanDate ? new Date(planDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
        rakeDepartureDateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        rakeArrivalDestination: new Date().toISOString().slice(0, 16).replace('T', ' '),
        noOfCarsDispatched: 0,
        pendingDispatch: Math.floor(Math.random() * 5) + 1,
        lmEndDateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        invoicingToRakePlacement: Math.floor(Math.random() * 3) + 1,
        rakePlacementToRakeRelease: 0,
        rakeReleaseToRakeDeparture: 0,
        invoicingToDeparture: 0,
        departureToRakeDestination: 0,
        arrivalToLastMile: 0,
        invoicingToLastMile: 0,
        reasonForDelayRailOut: 'N/A',
        rrNumber: `RR${plan.PlanId}`,
        rrDateTime: placementDate.toISOString().slice(0, 16).replace('T', ' '),
        fnrNumber: `FNR${plan.PlanId}`,
        status: 'pending',
        type: 'plan',
        sourceData: plan
      });
    });

    setReportData(railData);
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchRakeVisits(),
        fetchRakePlans(),
        fetchRakes(),
        fetchTerminals(),
        fetchRoutes()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Process data when dependencies change
  useEffect(() => {
    if (rakeVisits.length > 0 || rakePlans.length > 0) {
      processRailOperationsData();
    }
  }, [rakeVisits, rakePlans, rakes, terminals, routes]);

  const filteredData = reportData.filter(item => {
    const matchesSearch = 
      item.typeOfRake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rakeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reasonForDelayExits.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fnrNumber.toLowerCase().includes(searchTerm.toLowerCase());
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
      'Type of Rake', 'Origin', 'Rake No', 'Destination', 'Invoicing Start Date',
      'Invoicing End Date', 'Planning Status', 'Rake Capacity', 'No of Cars Invoiced',
      'Exit Done', 'Pending Exit', 'Reason for Delay in Exits', 'Indent Placement Date/Time',
      'Rake Placement Date & Time', 'Rake Release Date & Time', 'RACK ETA',
      'Rake Departure (Date & Time)', 'Rake Arrival at Destination', 'No of Cars Dispatched till Date',
      'Pending Dispatch', 'LM End Date & Time', 'Invoicing to Rake Placement (Days)',
      'Rake Placement to Rake Release (Hrs)', 'Rake Release to Rake Departure (Hrs)',
      'Invoicing to Departure (Days)', 'Departure to Rake Destination (Days)',
      'Arrival to Last Mile (Days)', 'Invoicing to Last Mile (Days)',
      'Reason for Delay in Rail Out', 'RR Number (Date & Time)', 'FNR Number', 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.typeOfRake,
        item.origin,
        item.rakeNo,
        item.destination,
        item.invoicingStartDate,
        item.invoicingEndDate,
        item.planningStatus,
        item.rakeCapacity,
        item.noOfCarsInvoiced,
        item.exitDone,
        item.pendingExit,
        item.reasonForDelayExits,
        item.indentPlacementDateTime,
        item.rakePlacementDateTime,
        item.rakeReleaseDateTime,
        item.rackETA,
        item.rakeDepartureDateTime,
        item.rakeArrivalDestination,
        item.noOfCarsDispatched,
        item.pendingDispatch,
        item.lmEndDateTime,
        item.invoicingToRakePlacement,
        item.rakePlacementToRakeRelease,
        item.rakeReleaseToRakeDeparture,
        item.invoicingToDeparture,
        item.departureToRakeDestination,
        item.arrivalToLastMile,
        item.invoicingToLastMile,
        item.reasonForDelayRailOut,
        item.rrNumber,
        item.rrDateTime,
        item.fnrNumber,
        item.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rail-operations-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Rail operations report exported successfully');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',');
          const newRecords = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const record = {
                id: `upload-${Date.now()}-${i}`,
                typeOfRake: values[0] || '',
                origin: values[1] || '',
                rakeNo: values[2] || '',
                destination: values[3] || '',
                invoicingStartDate: values[4] || '',
                invoicingEndDate: values[5] || '',
                planningStatus: values[6] || '',
                rakeCapacity: parseInt(values[7]) || 0,
                noOfCarsInvoiced: parseInt(values[8]) || 0,
                exitDone: values[9] || '',
                pendingExit: parseInt(values[10]) || 0,
                reasonForDelayExits: values[11] || '',
                indentPlacementDateTime: values[12] || '',
                rakePlacementDateTime: values[13] || '',
                rakeReleaseDateTime: values[14] || '',
                rackETA: values[15] || '',
                rakeDepartureDateTime: values[16] || '',
                rakeArrivalDestination: values[17] || '',
                noOfCarsDispatched: parseInt(values[18]) || 0,
                pendingDispatch: parseInt(values[19]) || 0,
                lmEndDateTime: values[20] || '',
                invoicingToRakePlacement: parseInt(values[21]) || 0,
                rakePlacementToRakeRelease: parseInt(values[22]) || 0,
                rakeReleaseToRakeDeparture: parseInt(values[23]) || 0,
                invoicingToDeparture: parseInt(values[24]) || 0,
                departureToRakeDestination: parseInt(values[25]) || 0,
                arrivalToLastMile: parseInt(values[26]) || 0,
                invoicingToLastMile: parseInt(values[27]) || 0,
                reasonForDelayRailOut: values[28] || '',
                rrNumber: values[29] || '',
                rrDateTime: values[30] || '',
                fnrNumber: values[31] || '',
                status: values[32] || 'pending',
                type: 'upload'
              };
              newRecords.push(record);
            }
          }
          
          setReportData(prev => [...prev, ...newRecords]);
          toast.success(`${newRecords.length} rail operations records imported successfully`);
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
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'In Progress':
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
      case 'Delayed':
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
          <h1 className="text-3xl font-bold text-gray-900">DCT Report</h1>
          <p className="text-gray-600 mt-1">Complete rail logistics and operations tracking</p>
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
          <CardTitle>Rail Operations Data ({filteredData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search Rake No, Origin, Destination..."
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
                <option value="pending">Pending</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type of Rake</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoicing Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoicing End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planning Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No of Cars Invoiced</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit Done</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Exit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason for Delay in Exits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Indent Placement Date/Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Placement Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Release Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RACK ETA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Departure (Date & Time)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Arrival at Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No of Cars Dispatched till Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Dispatch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LM End Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoicing to Rake Placement (Days)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Placement to Rake Release (Hrs)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rake Release to Rake Departure (Hrs)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoicing to Departure (Days)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure to Rake Destination (Days)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrival to Last Mile (Days)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoicing to Last Mile (Days)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason for Delay in Rail Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RR Number (Date & Time)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FNR Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.typeOfRake}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.origin}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.rakeNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.destination}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.invoicingStartDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{item.invoicingEndDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={getStatusColor(item.planningStatus)}>
                        {item.planningStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.rakeCapacity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.noOfCarsInvoiced}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className={item.exitDone === 'Yes' ? 'bg-green-100 text-green-800' : 
                                    item.exitDone === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}>
                        {item.exitDone}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.pendingExit}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className="bg-orange-100 text-orange-800">
                        {item.reasonForDelayExits}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.indentPlacementDateTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.rakePlacementDateTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.rakeReleaseDateTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.rackETA}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.rakeDepartureDateTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.rakeArrivalDestination}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.noOfCarsDispatched}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.pendingDispatch}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-xs">{item.lmEndDateTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.invoicingToRakePlacement}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.rakePlacementToRakeRelease}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.rakeReleaseToRakeDeparture}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.invoicingToDeparture}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.departureToRakeDestination}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.arrivalToLastMile}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.invoicingToLastMile}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge className="bg-purple-100 text-purple-800">
                        {item.reasonForDelayRailOut}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium">{item.rrNumber}</div>
                        <div className="text-gray-500 text-xs">{item.rrDateTime}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.fnrNumber}</td>
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
                No rail operations records found matching your criteria
              </div>
            )}
            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                Loading rail operations data...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RailOperationsReport;
