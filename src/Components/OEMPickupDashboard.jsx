import React, { useState, useEffect } from "react";
import { Truck, MapPin, Calendar, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { oemPickupAPI } from "../utils/Api";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    "in-transit": { color: "bg-orange-100 text-orange-800", icon: "🚚" },
    "reached plant": { color: "bg-green-100 text-green-800", icon: "🏭" },
    "active": { color: "bg-blue-100 text-blue-800", icon: "📋" },
  };
  const config = statusConfig[status?.toLowerCase()] || { color: "bg-gray-100 text-gray-800", icon: "📋" };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <span>{config.icon}</span>
      {status}
    </span>
  );
};

const OEMPickupDashboard = () => {
  const [oempickups, setOempickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    reachedPlant: 0,
    active: 0,
  });

  const fetchOEMPickups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await oemPickupAPI.getAllOEMPickups();
      
      if (response.success) {
        const data = response.data || [];
        setOempickups(data);
        
        // Calculate statistics
        const total = data.length;
        const inTransit = data.filter(item => item.Status === 'IN-TRANSIT').length;
        const reachedPlant = data.filter(item => item.Status === 'REACHED PLANT').length;
        const active = data.filter(item => item.Status === 'ACTIVE' || item.Status === 'Active').length;
        
        setStats({ total, inTransit, reachedPlant, active });
      } else {
        throw new Error(response.message || "Failed to fetch OEM Pickup data");
      }
    } catch (err) {
      console.error("Error fetching OEM Pickup data:", err);
      setError(err.message || "Failed to fetch OEM Pickup data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOEMPickups();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading OEM Pickup data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">In Transit</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inTransit}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.inTransit / stats.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-orange-600">🚚</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Reached Plant</p>
              <p className="text-2xl font-bold text-green-600">{stats.reachedPlant}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.reachedPlant / stats.total) * 100) : 0}% completed
              </p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-green-600">🏭</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active
              </p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-blue-600">📋</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Progress Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Completed Deliveries</span>
              <span className="text-sm text-gray-500">
                {stats.reachedPlant} / {stats.total} vehicles
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.reachedPlant / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">In Transit</span>
              <span className="text-sm text-gray-500">
                {stats.inTransit} / {stats.total} vehicles
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.inTransit / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent OEM Pickups Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent OEM Pickups</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setOempickups(oempickups)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Truck Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrival Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {oempickups.slice(0, 10).map((pickup) => {
                const pickupDate = pickup.Pickup_Date ? new Date(pickup.Pickup_Date) : null;
                const arrivalDate = pickup.Arrival_Date ? new Date(pickup.Arrival_Date) : null;
                const duration = pickupDate && arrivalDate 
                  ? Math.ceil((arrivalDate - pickupDate) / (1000 * 60 * 60 * 24))
                  : pickupDate 
                    ? Math.ceil((new Date() - pickupDate) / (1000 * 60 * 60 * 24))
                    : 'N/A';
                
                return (
                  <tr key={pickup.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pickup.Truck_Number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {pickup.Plant}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pickup.Driver_Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {pickupDate ? pickupDate.toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {arrivalDate ? arrivalDate.toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={pickup.Status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof duration === 'number' ? `${duration} days` : duration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OEMPickupDashboard;
