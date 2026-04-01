import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { rakeVisitAPI, rakePlanningAPI, rakeMasterAPI, routeMasterAPI, terminalMasterAPI } from '../utils/Api';

const RakeReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [rakeData, setRakeData] = useState([]);
  const [rakeVisits, setRakeVisits] = useState([]);
  const [rakePlans, setRakePlans] = useState([]);
  const [rakes, setRakes] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Fetch all necessary data
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

  // Process data to combine visits and plans
  const processRakeData = () => {
    const combinedData = [];

    // Process rake visits
    rakeVisits.forEach(visit => {
      const rake = rakes.find(r => r.RakeId === visit.RAKE_ID);
      const terminal = terminals.find(t => t.TerminalCode === visit.TERMINAL_ID);
      
      combinedData.push({
        id: visit.VISIT_ID,
        rakeNo: rake?.Rake_Name || visit.RAKE_ID?.toString() || 'Unknown',
        plant: terminal?.TerminalCode || visit.TERMINAL_ID?.toString() || 'Unknown',
        tptName: rake?.Rake_Operator || 'INDIAN RAILWAY',
        loadingTerminal: visit.IB_LOAD_TERMINAL || visit.OB_DISCHARGE_TERMINAL || 'Unknown',
        currentLocation: visit.ARRIVAL_STATION || 'Terminal',
        distanceFromLoading: 'N/A',
        rakeETA: visit.ARRVAL_DATE ? new Date(visit.ARRVAL_DATE).toLocaleString() : 'N/A',
        remarks: visit.REMARKS || 'No remarks',
        txrDue: visit.DEPARTURE_DATE ? new Date(visit.DEPARTURE_DATE).toLocaleString() : 'N/A',
        planningInitiated: 'Yes',
        status: visit.DEPARTURE_DATE ? 'completed' : 'active',
        type: 'visit',
        trainNo: visit.IB_TRAIN_NO || visit.OB_TRAIN_NO
      });
    });

    // Process rake plans
    rakePlans.forEach(plan => {
      const rake = rakes.find(r => r.Rake_Name === plan.Rake_Name);
      const route = routes.find(r => (r.RouteId || r.id) === parseInt(plan.Route));
      
      combinedData.push({
        id: plan.PlanId,
        rakeNo: plan.Rake_Name || 'Unknown',
        plant: plan.Base_Depot || 'Unknown',
        tptName: plan.Rake_Operator || 'INDIAN RAILWAY',
        loadingTerminal: plan.Route || 'Unknown',
        currentLocation: 'Planned',
        distanceFromLoading: route?.Billable_Distance || 'N/A',
        rakeETA: plan.Plan_Date || 'N/A',
        remarks: `${plan.Plan_Type} - ${plan.Sub_Route || 'Main Route'}`,
        txrDue: 'N/A',
        planningInitiated: 'Yes',
        status: 'planned',
        type: 'plan',
        trainNo: plan.Train_No || plan.IB_Train_No
      });
    });

    setRakeData(combinedData);
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
      processRakeData();
    }
  }, [rakeVisits, rakePlans, rakes, terminals, routes]);

  const filteredData = rakeData.filter(item => {
    const matchesSearch = item.rakeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.plant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.trainNo && item.trainNo.toLowerCase().includes(searchTerm.toLowerCase()));
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
    toast.info('Export functionality would be implemented here');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rake Transit Report</h1>
          <p className="text-gray-600 mt-1">Monitor and manage rake operations</p>
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
          <Button
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by RAKE NO, Plant, or TPT Name..."
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
                <option value="delayed">Delayed</option>
                <option value="maintenance">Maintenance</option>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rake Details ({filteredData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RAKE NO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TPT NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loading Terminal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance from Loading Terminal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rake ETA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REMARK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TXR DUE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PLANNING INITIATED
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.trainNo || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.rakeNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.plant}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.tptName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.loadingTerminal}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.currentLocation}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.distanceFromLoading}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.rakeETA}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.remarks}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.txrDue}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <Badge variant={item.planningInitiated === 'Yes' ? 'default' : 'secondary'}>
                        {item.planningInitiated}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
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
                    Loading data...
                  </div>
                )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RakeReport;
