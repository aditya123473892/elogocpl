import { useNavigate } from "react-router-dom";
import {
  FileText,
  Truck,
  MapPin,
  Camera,
  Package,
  Train,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const workflowSteps = [
  {
    step: 1,
    title: "ASN Upload",
    description: "Upload Advance Shipping Notice documents with vehicle details",
    icon: FileText,
    path: "ASN",
    color: "blue",
  },
  {
    step: 2,
    title: "OEM Pickup",
    description: "Register vehicle pickup from OEM plant with dispatch details",
    icon: Truck,
    path: "oem-pickup",
    color: "green",
  },
  {
    step: 3,
    title: "Vehicle Arrival",
    description: "Log vehicle arrival at plant yard for processing",
    icon: MapPin,
    path: "arrival-plant",
    color: "purple",
  },
  {
    step: 4,
    title: "VIN Survey",
    description: "Conduct vehicle inspection and damage survey",
    icon: Camera,
    path: "vin-survey",
    color: "orange",
  },
  {
    step: 5,
    title: "Loading Stage",
    description: "Manage vehicle loading operations onto rail wagons",
    icon: Package,
    path: "loading-stage",
    color: "teal",
  },
  {
    step: 6,
    title: "Rake Planning",
    description: "Plan and schedule rake operations and routes",
    icon: Train,
    path: "rakeplanning",
    color: "indigo",
  },
  {
    step: 7,
    title: "Last Mile Departure",
    description: "Final vehicle delivery and departure from destination",
    icon: Truck,
    path: "last-mile-departure",
    color: "red",
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "bg-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badge: "bg-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badge: "bg-orange-600",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    badge: "bg-teal-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    badge: "bg-indigo-600",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    badge: "bg-red-600",
  },
};

export default function Workflow() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(`/customer/${path}`);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Application Workflow</h1>
        <p className="text-gray-600 mt-2">
          Complete overview of the vehicle logistics process from ASN upload to final delivery
        </p>
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => {
          const colors = colorClasses[step.color];
          const Icon = step.icon;
          const isLast = index === workflowSteps.length - 1;

          return (
            <div key={step.step} className="relative">
              {/* Step Card */}
              <div
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                onClick={() => handleNavigate(step.path)}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number Badge */}
                  <div
                    className={`${colors.badge} text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-md`}
                  >
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className={`${colors.iconBg} ${colors.iconColor} p-3 rounded-lg flex-shrink-0`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              {!isLast && (
                <div className="flex justify-center py-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Workflow Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Step 1-2:</strong> Document upload and vehicle pickup initiation from OEM
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Step 3-4:</strong> Vehicle arrival processing and quality inspection
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Step 5-6:</strong> Loading operations and rail transportation planning
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Step 7:</strong> Final delivery and completion of logistics cycle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
