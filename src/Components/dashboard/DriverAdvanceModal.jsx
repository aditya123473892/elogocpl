import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { driverAdvanceAPI } from "../../utils/Api";

const DriverAdvanceModal = ({
  isOpen,
  onClose,
  vehicleData,
  onAdvanceUpdate,
  transportRequestId,
}) => {
  const [advanceData, setAdvanceData] = useState({
    driverAdvance: "",
    advanceType: "initial",
    advanceNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicleData) {
      setAdvanceData({
        driverAdvance: vehicleData.driverAdvance || "",
        advanceType: vehicleData.advanceType || "initial",
        advanceNotes: vehicleData.advanceNotes || "",
      });
    }
  }, [vehicleData]);

  const handleInputChange = (field, value) => {
    setAdvanceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !advanceData.driverAdvance ||
      parseFloat(advanceData.driverAdvance) <= 0
    ) {
      toast.error("Please enter a valid advance amount greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create advance record via API
      const advancePayload = {
        request_id: transportRequestId,
        driver_name: vehicleData.driverName,
        driver_contact: vehicleData.driverContact,
        vehicle_number: vehicleData.vehicleNumber,
        advance_amount: parseFloat(advanceData.driverAdvance),
        advance_type: advanceData.advanceType,
        notes: advanceData.advanceNotes?.trim() || null,
      };

      await driverAdvanceAPI.createAdvance(advancePayload);

      // Update the vehicle data with advance information locally
      onAdvanceUpdate(vehicleData.vehicleIndex - 1, {
        driverAdvance: advanceData.driverAdvance,
        advanceType: advanceData.advanceType,
        advanceNotes: advanceData.advanceNotes,
      });

      toast.success("Driver advance created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating advance:", error);
      toast.error(error.message || "Failed to create driver advance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setAdvanceData({
      driverAdvance: "",
      advanceType: "initial",
      advanceNotes: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-green-600"
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
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Add Driver Advance
                  </h3>

                  {vehicleData && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium text-gray-900 mb-1">
                          Vehicle:{" "}
                          {vehicleData.vehicleNumber ||
                            `Vehicle ${vehicleData.vehicleIndex}`}
                        </div>
                        <div>Driver: {vehicleData.driverName}</div>
                        <div>Contact: {vehicleData.driverContact}</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Amount (INR) *
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={advanceData.driverAdvance}
                        onChange={(e) =>
                          handleInputChange("driverAdvance", e.target.value)
                        }
                        placeholder="Enter advance amount"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Type
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={advanceData.advanceType}
                        onChange={(e) =>
                          handleInputChange("advanceType", e.target.value)
                        }
                      >
                        <option value="initial">Initial Advance</option>
                        <option value="additional">Additional Advance</option>
                        <option value="settlement">Settlement Advance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes/Remarks
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={advanceData.advanceNotes}
                        onChange={(e) =>
                          handleInputChange("advanceNotes", e.target.value)
                        }
                        placeholder="Enter any notes or remarks about this advance"
                        rows="3"
                        maxLength="200"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {advanceData.advanceNotes.length}/200 characters
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                  isSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Advance"
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverAdvanceModal;
