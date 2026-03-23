import React from "react";
import {
  Menu,
  User,
  ChevronDown,
  Settings,
  LogOut,
  X,
  MapPin,
} from "lucide-react";

const Header = ({
  toggleMobileMenu,
  mobileMenuOpen,
  showUserMenu,
  toggleUserMenu,
  user,
  handleLogout,
  collapsed,
  toggleSidebar,
  selectedLocation,
  terminals,
}) => {
  // Debug logging
  console.log('Header - selectedLocation:', selectedLocation);
  console.log('Header - terminals:', terminals);
  
  return (
    // Change the header class to adjust z-index and ensure proper positioning
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Location Display - Always Visible */}
          {true && ( // Always show for testing
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                {(() => {
                  console.log('Header - terminals array:', terminals);
                  console.log('Header - selectedLocation:', selectedLocation);
                  console.log('Header - terminals length:', terminals?.length);
                  
                  if (!selectedLocation) return 'No Terminal Selected';
                  
                  if (!terminals || terminals.length === 0) {
                    console.log('Header - No terminals loaded');
                    return `Terminal ${selectedLocation}`;
                  }
                  
                  // Log all terminal IDs to see what we have
                  console.log('Header - All terminal IDs:', terminals.map(terminal => ({
                    TerminalId: terminal.TerminalId,
                    terminalId: terminal.terminalId,
                    id: terminal.id,
                    name: terminal.TerminalName || terminal.terminalName || terminal.name
                  })));
                  
                  // Try multiple ways to find the terminal name
                  const terminal = terminals?.find(terminal => 
                    terminal.TerminalId == selectedLocation || 
                    terminal.terminalId == selectedLocation ||
                    terminal.id == selectedLocation
                  );
                  
                  console.log('Header - found terminal:', terminal);
                  
                  return terminal?.TerminalName || 
                         terminal?.terminalName || 
                         terminal?.name || 
                         `Terminal ${selectedLocation}`;
                })()}
              </span>
            </div>
          )}
          
          {/* Debug: Show selectedLocation and locations */}
          {process.env.NODE_ENV === 'development' && (
            <div className="hidden md:flex items-center space-x-2 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
              <span className="text-gray-600">
                Loc: {selectedLocation ? (terminals?.find(terminal => terminal.TerminalId === selectedLocation)?.TerminalName || selectedLocation) : 'None'}
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                {user?.name ? (
                  <span className="text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium max-w-24 truncate">
                {user?.name || "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={toggleUserMenu} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                  {/* User Info */}
                  <div className="py-3 px-4 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@fleet.com"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center space-x-3 transition-colors duration-150">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Profile</span>
                    </button>
                    <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center space-x-3 transition-colors duration-150">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center space-x-3 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
