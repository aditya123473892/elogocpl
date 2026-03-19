import React, { useState, useEffect } from "react";
import { Truck, MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

const OEMPickupStatusSummary = () => {
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    reachedPlant: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await oemPickupAPI.getAllOEMPickups();
      
      if (response.success) {
        const data = response.data || [];
        const total = data.length;
        const inTransit = data.filter(item => item.Status === 'IN-TRANSIT').length;
        const reachedPlant = data.filter(item => item.Status === 'REACHED PLANT').length;
        const active = data.filter(item => item.Status === 'ACTIVE' || item.Status === 'Active').length;
        
        setStats({ total, inTransit, reachedPlant, active });
      }
    } catch (error) {
      console.error("Error fetching OEM Pickup stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">OEM Pickup Status</h3>
        <Truck className="h-5 w-5 text-blue-500" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.inTransit}</div>
          <div className="text-sm text-gray-500">In Transit</div>
          <div className="mt-1">
            <StatusBadge status="IN-TRANSIT" />
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.reachedPlant}</div>
          <div className="text-sm text-gray-500">Reached Plant</div>
          <div className="mt-1">
            <StatusBadge status="REACHED PLANT" />
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Active</div>
          <div className="mt-1">
            <StatusBadge status="ACTIVE" />
          </div>
        </div>
      </div>
      
      {stats.total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Completion Rate</span>
            <span className="font-medium text-green-600">
              {Math.round((stats.reachedPlant / stats.total) * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(stats.reachedPlant / stats.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OEMPickupStatusSummary;
