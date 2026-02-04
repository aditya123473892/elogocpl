import React from "react";

const VehicleChargesTable = ({
  vehicleDataList,
  servicesData, // Pass the full services array from API
  updateVehicleData,
  onAdvanceClick, // Add callback for advance button
}) => {
  // Filter services to only show those with APPLICABLE_FLAG = "N"
  const applicableServices = React.useMemo(() => {
    if (!servicesData || !Array.isArray(servicesData)) {
      return [];
    }
    return servicesData.filter((service) => service.APPLICABLE_FLAG === "N");
  }, [servicesData]);

  // Add deduplication function for charges table
  const getUniqueVehicles = (vehicles) => {
    // If no vehicles or empty array, return at least one empty vehicle
    if (!vehicles || vehicles.length === 0) {
      return [
        {
          vehicleIndex: 1,
          vehicleNumber: "",
          serviceCharges: {},
          additionalCharges: 0,
          totalCharge: 0,
        },
      ];
    }

    const seenVehicleNumbers = new Set();
    const uniqueVehicles = [];

    vehicles.forEach((vehicle, index) => {
      const vehicleNumber = vehicle.vehicleNumber?.trim().toUpperCase();

      // For empty vehicle numbers, always include them (for new entries)
      if (!vehicleNumber) {
        uniqueVehicles.push(vehicle);
        return;
      }

      // If vehicle number is already seen, skip it
      if (seenVehicleNumbers.has(vehicleNumber)) {
        console.log(
          `Skipping duplicate vehicle number in charges: ${vehicleNumber} at index ${index}`
        );
        return;
      }

      // Add to seen set and unique vehicles array
      seenVehicleNumbers.add(vehicleNumber);
      uniqueVehicles.push(vehicle);
    });

    // Ensure at least one row is always shown
    if (uniqueVehicles.length === 0) {
      uniqueVehicles.push({
        vehicleIndex: 1,
        vehicleNumber: "",
        serviceCharges: {},
        additionalCharges: 0,
        totalCharge: 0,
      });
    }

    console.log(
      `Charges table: Filtered ${vehicles.length} vehicles down to ${uniqueVehicles.length} unique vehicles`
    );
    return uniqueVehicles;
  };

  // Filter the vehicle data list to show only unique vehicle numbers
  const uniqueVehicleDataList = getUniqueVehicles(vehicleDataList);

  const handleServiceChargeChange = (index, serviceId, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    const vehicle = vehicleDataList[originalIndex];
    const updatedCharges = {
      ...vehicle.serviceCharges,
      [serviceId]: value,
    };

    updateVehicleData(originalIndex, "serviceCharges", updatedCharges);

    const serviceTotal = Object.values(updatedCharges).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );

    updateVehicleData(originalIndex, "totalCharge", serviceTotal);
  };

  const handleAdditionalChargeChange = (index, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, "additionalCharges", value);
  };

  const handleDriverAdvanceChange = (index, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, "driverAdvance", value);
  };

  const handleAdvanceTypeChange = (index, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, "advanceType", value);
  };

  const handleAdvanceNotesChange = (index, value) => {
    // Find the original index in vehicleDataList for this unique vehicle
    const originalIndex = vehicleDataList.findIndex(
      (v) => v.vehicleIndex === uniqueVehicleDataList[index].vehicleIndex
    );

    updateVehicleData(originalIndex, "advanceNotes", value);
  };

  // Show message if no applicable services
  if (applicableServices.length === 0) {
    return (
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Vehicle Charges Paid To Vendor
        </h4>
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No applicable services found with APPLICABLE_FLAG = "N"
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Vehicle Charges
      </h4>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Vehicle Number
              </th>

              {applicableServices.map((service) => (
                <th
                  key={service.SERVICE_ID}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]"
                >
                  <div className="flex flex-col">
                    <span>{service.SERVICE_NAME}</span>
                    <span className="text-xs text-gray-400 font-normal">
                      ({service.SERVICE_CODE})
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                Additional Charges (INR)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Driver Advance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                Total Charge (INR)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uniqueVehicleDataList.map((vehicle, index) => (
              <tr
                key={`charges-${vehicle.vehicleIndex || index}`}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {vehicle.vehicleNumber ||
                      `Vehicle ${vehicle.vehicleIndex || index + 1}`}
                  </span>
                </td>

                {applicableServices.map((service) => (
                  <td
                    key={service.SERVICE_ID}
                    className="px-4 py-4 whitespace-nowrap"
                  >
                    <input
                      type="number"
                      className="min-w-[140px] border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={vehicle.serviceCharges?.[service.SERVICE_ID] || ""}
                      onChange={(e) =>
                        handleServiceChargeChange(
                          index,
                          service.SERVICE_ID,
                          e.target.value
                        )
                      }
                      placeholder={`Enter amount`}
                      min="0"
                      step="0.01"
                    />
                  </td>
                ))}
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    className="min-w-[140px] border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={vehicle.additionalCharges || ""}
                    onChange={(e) =>
                      handleAdditionalChargeChange(index, e.target.value)
                    }
                    placeholder="Additional charges"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => onAdvanceClick(vehicle)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.driverAdvance &&
                        parseFloat(vehicle.driverAdvance) > 0
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } transition-colors duration-200`}
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      {vehicle.driverAdvance &&
                      parseFloat(vehicle.driverAdvance) > 0
                        ? `₹${parseFloat(vehicle.driverAdvance).toLocaleString(
                            "en-IN"
                          )}`
                        : "Add Advance"}
                    </button>
                    {vehicle.advanceType &&
                      vehicle.advanceType !== "initial" && (
                        <span className="text-xs text-gray-500 capitalize">
                          {vehicle.advanceType}
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="min-w-[160px] border border-gray-300 rounded-md p-2 text-sm bg-gray-50 cursor-not-allowed font-medium text-gray-900"
                    value={`₹${(vehicle.totalCharge || 0).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleChargesTable;
