import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, Edit, Trash2, Upload, Calendar, Clock, MapPin, Train } from 'lucide-react';
import { toast } from 'react-toastify';

const RailOperationsReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const [reportData, setReportData] = useState([
    {
      id: 1,
      typeOfRake: 'BCN',
      origin: 'Gurgaon',
      rakeNo: 'RAKE001',
      destination: 'Chennai',
      invoicingStartDate: '2024-03-01',
      invoicingEndDate: '2024-03-15',
      planningStatus: 'Completed',
      rakeCapacity: 45,
      noOfCarsInvoiced: 42,
      exitDone: 'Yes',
      pendingExit: 3,
      reasonForDelayExits: 'Manesar',
      indentPlacementDateTime: '2024-03-01 09:00',
      rakePlacementDateTime: '2024-03-02 14:30',
      rakeReleaseDateTime: '2024-03-03 08:15',
      rackETA: '2024-03-05 18:00',
      rakeDepartureDateTime: '2024-03-03 10:30',
      rakeArrivalDestination: '2024-03-06 16:45',
      noOfCarsDispatched: 40,
      pendingDispatch: 2,
      lmEndDateTime: '2024-03-07 12:00',
      invoicingToRakePlacement: 1,
      rakePlacementToRakeRelease: 18,
      rakeReleaseToRakeDeparture: 2,
      invoicingToDeparture: 2,
      departureToRakeDestination: 3,
      arrivalToLastMile: 1,
      invoicingToLastMile: 6,
      reasonForDelayRailOut: 'Weather',
      rrNumber: 'RR001',
      rrDateTime: '2024-03-03 09:00',
      fnrNumber: 'FNR001',
      status: 'active'
    },
    {
      id: 2,
      typeOfRake: 'BOXN',
      origin: 'Manesar',
      rakeNo: 'RAKE002',
      destination: 'Mumbai',
      invoicingStartDate: '2024-03-05',
      invoicingEndDate: '2024-03-20',
      planningStatus: 'In Progress',
      rakeCapacity: 40,
      noOfCarsInvoiced: 38,
      exitDone: 'No',
      pendingExit: 2,
      reasonForDelayExits: 'KHAR',
      indentPlacementDateTime: '2024-03-05 11:00',
      rakePlacementDateTime: '2024-03-06 16:00',
      rakeReleaseDateTime: '2024-03-07 09:30',
      rackETA: '2024-03-09 20:00',
      rakeDepartureDateTime: '2024-03-07 12:00',
      rakeArrivalDestination: '2024-03-10 14:30',
      noOfCarsDispatched: 35,
      pendingDispatch: 3,
      lmEndDateTime: '2024-03-11 15:00',
      invoicingToRakePlacement: 1,
      rakePlacementToRakeRelease: 17,
      rakeReleaseToRakeDeparture: 3,
      invoicingToDeparture: 2,
      departureToRakeDestination: 3,
      arrivalToLastMile: 1,
      invoicingToLastMile: 6,
      reasonForDelayRailOut: 'Track Maintenance',
      rrNumber: 'RR002',
      rrDateTime: '2024-03-07 08:00',
      fnrNumber: 'FNR002',
      status: 'pending'
    },
    {
      id: 3,
      typeOfRake: 'BCN',
      origin: 'SMG',
      rakeNo: 'RAKE003',
      destination: 'Kolkata',
      invoicingStartDate: '2024-03-10',
      invoicingEndDate: '2024-03-25',
      planningStatus: 'Delayed',
      rakeCapacity: 43,
      noOfCarsInvoiced: 40,
      exitDone: 'Partial',
      pendingExit: 3,
      reasonForDelayExits: 'SMG',
      indentPlacementDateTime: '2024-03-10 08:30',
      rakePlacementDateTime: '2024-03-11 15:45',
      rakeReleaseDateTime: '2024-03-12 10:15',
      rackETA: '2024-03-14 22:00',
      rakeDepartureDateTime: '2024-03-12 14:00',
      rakeArrivalDestination: '2024-03-15 18:20',
      noOfCarsDispatched: 38,
      pendingDispatch: 2,
      lmEndDateTime: '2024-03-16 10:00',
      invoicingToRakePlacement: 1,
      rakePlacementToRakeRelease: 18,
      rakeReleaseToRakeDeparture: 4,
      invoicingToDeparture: 2,
      departureToRakeDestination: 3,
      arrivalToLastMile: 1,
      invoicingToLastMile: 6,
      reasonForDelayRailOut: 'Port Congestion',
      rrNumber: 'RR003',
      rrDateTime: '2024-03-12 09:00',
      fnrNumber: 'FNR003',
      status: 'delayed'
    }
  ]);

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

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Data refreshed successfully');
    }, 1000);
  };

  const handleExport = () => {
    toast.info('Exporting rail operations report...');
  };

  const handleFileUpload = () => {
    toast.info('Upload functionality would be implemented here');
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
          <h1 className="text-3xl font-bold text-gray-900">Rail Operations Report</h1>
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
            Upload Data
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
            
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No records found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RailOperationsReport;
