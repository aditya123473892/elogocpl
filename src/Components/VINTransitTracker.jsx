import React, { useState, useEffect } from "react";
import { Truck, MapPin, CheckCircle, Clock, AlertCircle, Search, Filter } from "lucide-react";
import { oemPickupAPI, dealerTripDetailsAPI } from "../utils/Api";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    "in-transit": { color: "bg-orange-100 text-orange-800", icon: "🚚" },
    "reached plant": { color: "bg-green-100 text-green-800", icon: "🏭" },
    "active": { color: "bg-blue-100 text-blue-800", icon: "📋" },
    "not picked": { color: "bg-gray-100 text-gray-800", icon: "⏳" },
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

const VINTransitTracker = () => {
  const [vinData, setVinData] = useState([]);
  const [oemData, setOemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalUploaded: 0,
    inTransit: 0,
    reachedPlant: 0,
    notPicked: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both dealer trip details and OEM pickup data
      const [dealerResponse, oemResponse] = await Promise.all([
        dealerTripDetailsAPI.getAllDealerTripDetails(),
        oemPickupAPI.getAllOEMPickups()
      ]);

      const dealerVINs = dealerResponse.data || [];
      const oemPickups = oemResponse.data || [];

      // Create a map of OEM pickups by VIN for quick lookup
      const oemMap = new Map();
      oemPickups.forEach(pickup => {
        if (pickup.VIN_Number) {
          oemMap.set(pickup.VIN_Number.toUpperCase(), pickup);
        }
      });

      // Combine data to show VIN status
      const combinedData = dealerVINs.map(dealer => {
        const vin = dealer.VIN_Number?.toUpperCase();
        const oemPickup = oemMap.get(vin);
        
        return {
          ...dealer,
          oemStatus: oemPickup ? oemPickup.Status : 'NOT PICKED',
          truckNumber: oemPickup ? oemPickup.Truck_Number : null,
          pickupDate: oemPickup ? oemPickup.Pickup_Date : null,
          arrivalDate: oemPickup ? oemPickup.Arrival_Date : null,
          plant: oemPickup ? oemPickup.Plant : null,
          driverName: oemPickup ? oemPickup.Driver_Name : null,
        };
      });

      setVinData(combinedData);
      setOemData(oemPickups);

      // Calculate statistics
      const totalUploaded = combinedData.length;
      const inTransit = combinedData.filter(item => item.oemStatus === 'IN-TRANSIT').length;
      const reachedPlant = combinedData.filter(item => item.oemStatus === 'REACHED PLANT').length;
      const notPicked = combinedData.filter(item => item.oemStatus === 'NOT PICKED').length;

      setStats({ totalUploaded, inTransit, reachedPlant, notPicked });
    } catch (error) {
      console.error("Error fetching VIN tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter data based on search and status
  const filteredData = vinData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.VIN_Number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Dealer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.truckNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.oemStatus === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading VIN tracking data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUploaded}</p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-blue-600">📋</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">In Transit</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inTransit}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.totalUploaded > 0 ? Math.round((stats.inTransit / stats.totalUploaded) * 100) : 0}%
              </p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-orange-600">🚚</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Reached Plant</p>
              <p className="text-2xl font-bold text-green-600">{stats.reachedPlant}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.totalUploaded > 0 ? Math.round((stats.reachedPlant / stats.totalUploaded) * 100) : 0}%
              </p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-green-600">🏭</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Not Picked</p>
              <p className="text-2xl font-bold text-gray-600">{stats.notPicked}</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.totalUploaded > 0 ? Math.round((stats.notPicked / stats.totalUploaded) * 100) : 0}%
              </p>
            </div>
            <div className="h-8 w-8 flex items-center justify-center text-gray-600">⏳</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by VIN, Dealer, or Truck Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="NOT PICKED">Not Picked</option>
              <option value="IN-TRANSIT">In Transit</option>
              <option value="REACHED PLANT">Reached Plant</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIN Tracking Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">VIN Transit Tracking</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track individual VIN numbers from upload to delivery
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIN Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Truck
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(0, 20).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.VIN_Number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.Dealer_Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {item.Destination_City}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.truckNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.pickupDate ? new Date(item.pickupDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.arrivalDate ? new Date(item.arrivalDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.oemStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length > 20 && (
            <div className="text-center py-4 text-sm text-gray-500">
              Showing first 20 of {filteredData.length} VINs
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VINTransitTracker;
