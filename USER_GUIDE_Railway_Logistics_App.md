# Railway Logistics App - User Guide

**A simple guide to help you use the Railway Logistics Management System**

---

## 🚂 Getting Started

### How to Log In
1. Open the app in your web browser
2. Enter your username and password
3. Click the "Login" button
4. You'll see the main dashboard

### Understanding the Main Screen
- **Left Menu**: All main features are here
- **Top Bar**: Shows your name and logout button
- **Main Area**: Where you do your work
- **Messages**: Green messages mean success, red means error

---

## 📝 VIN Management

### What is a VIN?
A VIN (Vehicle Identification Number) is like a unique ID for each vehicle.

### How to Add New VINs
1. Go to **VIN Management** in the left menu
2. Click the **"Add New VIN"** button
3. Fill in the form:
   - **VIN Number**: Type the vehicle ID (must be unique)
   - **Vehicle Type**: Choose from dropdown (Tr-6, Tr-8, Ven)
   - **Dealer**: Select the dealer name
   - **Trip Number**: Enter the trip ID
   - **Destination**: Where the vehicle is going
4. Click **"Save"** to add the VIN

### How to Upload Multiple VINs
1. Click **"Upload VIN File"** button
2. Choose your Excel file
3. Make sure your file has these columns:
   - VIN_Number
   - Dealer
   - Trip_No
   - Destination_City
4. Click **"Upload"** and wait for success message

### How to Search VINs
1. Type in the search box at the top
2. You can search by:
   - VIN number
   - Dealer name
   - Trip number
3. Results appear automatically as you type

---

## 🚚 OEM Pickup Operations

### What is OEM Pickup?
OEM (Original Equipment Manufacturer) Pickup is the process of collecting vehicles from the manufacturing plant and transporting them to the railway yard for loading onto trains. This is the first step in getting vehicles from the factory to their destination.

### Understanding the Pickup Process
1. **Vehicles are manufactured** at the plant
2. **VINs are assigned** to each vehicle
3. **Pickup request is created** for transport
4. **Truck arrives** at the plant
5. **VINs are loaded** onto the truck
6. **Truck transports** to railway yard
7. **Vehicles are unloaded** for train loading

### How to Create New Pickup - Detailed Steps

#### Step 1: Start New Pickup
1. Go to **OEM Pickup** in the left menu
2. Click the big **"Create New Pickup"** button at the top
3. A form will appear with empty fields

#### Step 2: Fill Basic Pickup Information
1. **Plant Selection**:
   - Click the dropdown menu
   - Select your plant from the list (e.g., "Plant A", "Plant B")
   - This is where the pickup will happen

2. **Yard Location**:
   - Choose the specific area within the plant
   - Examples: "Main Yard", "Loading Dock 1", "Storage Area B"
   - This helps the truck driver find the exact location

3. **Transporter Selection**:
   - Select the transport company
   - Options include: "Transporter A Ltd.", "FastHaul Logistics", etc.
   - This is the company that owns the truck

4. **Truck Details**:
   - **Truck Number**: Enter the truck registration (e.g., "MH12AB1234")
   - **Driver Name**: Type the driver's full name (e.g., "Ramesh Kumar")
   - Make sure the driver name is spelled correctly

5. **Date and Time**:
   - **Pickup Date**: Choose when the truck should arrive
   - **Delivery Date**: Choose when vehicles should reach railway yard
   - Click the calendar icon to select dates

6. **Remarks** (Optional but Recommended):
   - Add special instructions like:
     - "Call driver 30 minutes before arrival"
     - "Vehicles need special handling"
     - "Meet security at gate for access"
     - "Urgent pickup - customer waiting"

#### Step 3: Add VINs to the Pickup

##### Understanding Available VINs
- Only VINs that are not already picked up will show
- VINs come from the Dealer Trip Details upload
- Each VIN represents one vehicle

##### How to Add VINs - Method 1: Individual Selection
1. Click the **"Add VIN"** button
2. A list of available VINs will appear
3. Scroll through the list to find VINs you need
4. Click the checkbox next to each VIN you want
5. You can select multiple VINs
6. Click **"Add Selected VINs"** when done

##### How to Add VINs - Method 2: Search and Add
1. In the VIN search box, type part of a VIN number
2. The list will filter as you type
3. Click the **"+"** button next to each VIN you want
4. The VIN will be added immediately

##### How to Add VINs - Method 3: Bulk Add
1. Click **"Bulk Add VINs"** button
2. Type or paste VIN numbers (one per line)
3. Click **"Validate VINs"** to check they're available
4. Click **"Add All Valid VINs"**

##### Understanding VIN Information
For each VIN, you'll see:
- **VIN Number**: The unique vehicle ID
- **Dealer**: Which dealer ordered the vehicle
- **Trip Number**: The trip this VIN belongs to
- **Destination**: Where the vehicle is going
- **Vehicle Model**: Type of vehicle

#### Step 4: Review Your Pickup
Before saving, check:
- ✅ Plant and yard location are correct
- ✅ Transporter and truck details are accurate
- ✅ Dates are correct
- ✅ All needed VINs are added
- ✅ VIN count matches what you expect
- ✅ Remarks include any special instructions

#### Step 5: Save the Pickup
1. Click the **"Save Pickup"** button at the bottom
2. Wait for the green success message
3. Your pickup will now appear in the pickup list
4. You'll get a pickup ID number for reference

### How to View and Manage Existing Pickups

#### Understanding the Pickup Table
The pickup table shows all your pickups with these columns:
- **ID**: Unique pickup number
- **Plant**: Where pickup happens
- **Transporter**: Who is doing the pickup
- **Truck Number**: Vehicle registration
- **Pickup Date**: When pickup is scheduled
- **VIN Count**: How many vehicles
- **Status**: Current pickup status
- **Actions**: What you can do

#### Pickup Statuses Explained
- **Active**: Pickup is planned but not started
- **In Progress**: Truck has arrived or is on the way
- **Completed**: All VINs successfully delivered
- **Cancelled**: Pickup was cancelled
- **Delayed**: Pickup is running late

#### How to Edit a Pickup
1. Find the pickup in the table
2. Click the **"Edit"** button (pencil icon)
3. Make your changes:
   - You can change dates, times, remarks
   - You can add or remove VINs (if not completed)
   - You can update truck or driver details
4. Click **"Update Pickup"** to save changes

#### How to Cancel a Pickup
1. Find the pickup you want to cancel
2. Click the **"Delete"** button (trash icon)
3. You'll see a confirmation message
4. Click **"Yes"** to confirm cancellation
5. The pickup status will change to "Cancelled"

### How to Track Pickup Progress

#### Real-Time Status Updates
- The status column updates automatically
- Green color means everything is on track
- Yellow means there might be delays
- Red means there are problems

#### Adding Updates to Pickup
1. Click on a pickup to see details
2. Click **"Add Update"** button
3. Type your update message
4. Examples:
   - "Truck has arrived at plant gate"
   - "Loading started - 5 of 8 VINs loaded"
   - "Truck departed for railway yard"
   - "Delayed by traffic - new ETA 2:30 PM"
5. Click **"Add Update"** to save

### Advanced Features

#### Duplicate Previous Pickup
If you regularly do similar pickups:
1. Find a similar pickup you did before
2. Click **"Duplicate"** button
3. Update the new pickup with current details
4. This saves time filling forms

#### Schedule Recurring Pickups
For regular daily/weekly pickups:
1. Click **"Schedule Recurring"** button
2. Set the pattern (daily, weekly, monthly)
3. Choose the time and days
4. Set how many times to repeat
5. System will create pickups automatically

#### Export Pickup Reports
1. Click **"Export"** button at the top
2. Choose what to include:
   - All pickups
   - Only active pickups
   - Pickups from specific date range
3. Choose format:
   - Excel spreadsheet
   - PDF report
4. File will download to your computer

### Common Problems and Solutions

#### Problem: Can't Find VINs in List
**Solution**: 
- Check if VINs were uploaded to Dealer Trip Details
- VINs might already be picked up
- Try searching with partial VIN numbers

#### Problem: Truck Number Already in Use
**Solution**:
- Check if truck is already assigned to another pickup
- Verify the truck number is correct
- Contact the transporter to confirm truck availability

#### Problem: Pickup Date is in the Past
**Solution**:
- System prevents past dates for pickups
- Choose today's date or a future date
- If urgent, contact system administrator

#### Problem: Too Many VINs for One Truck
**Solution**:
- Check truck capacity (usually 6-8 VINs)
- Create multiple pickups if needed
- Consider using a larger truck

### Best Practices for OEM Pickup

#### Before Creating Pickup
- ✅ Verify all VINs are available in system
- ✅ Confirm truck and driver availability
- ✅ Check plant operating hours
- ✅ Verify railway yard receiving capacity

#### During Pickup Creation
- ✅ Use clear, specific remarks
- ✅ Double-check VIN quantities
- ✅ Include contact phone numbers
- ✅ Set realistic pickup times

#### After Pickup Creation
- ✅ Monitor pickup status regularly
- ✅ Communicate with transporter
- ✅ Update status changes promptly
- ✅ Keep records for future reference

### Tips for Efficient Pickup Management

#### Time-Saving Tips
- Use **search** to quickly find specific pickups
- **Duplicate** similar pickups instead of creating from scratch
- **Schedule recurring** pickups for regular operations
- Use **keyboard shortcuts** (Tab to move between fields)

#### Communication Tips
- Include driver phone number in remarks
- Add special handling instructions clearly
- Update pickup status promptly
- Notify stakeholders of delays immediately

#### Quality Tips
- Always double-check VIN numbers
- Verify truck capacity matches VIN count
- Check that pickup dates don't conflict
- Keep pickup history for audit purposes

---

## 🚂 Rake Planning

### What is Rake Planning?
Rake Planning is the strategic process of scheduling and organizing train movements to transport vehicles between different locations. A "rake" is a complete train set with multiple wagons that carries vehicles from one railway terminal to another.

### Understanding the Planning Process
1. **Vehicles arrive** at railway yard from OEM pickup
2. **Rake is planned** to carry vehicles to destination
3. **Train is assigned** with specific number and route
4. **Schedule is created** with dates and timing
5. **Resources are allocated** (rake, crew, equipment)
6. **Plan is executed** when train departs
7. **Arrival is tracked** at destination terminal

### Key Planning Concepts

#### What is a Rake?
- A complete train formation with wagons
- Has a unique name (like RAKE-001, RAKE-002)
- Can carry multiple vehicles (usually 20-40)
- Operates on specific routes between terminals

#### What is a Trip?
- One complete journey from origin to destination
- Has a unique trip number (like TRIP-001, TRIP-002)
- Links to specific VINs and vehicles
- Tracks the complete movement

#### What are Routes?
- Predefined paths between terminals
- Include intermediate stations
- Have specific distances and timings
- Used for planning and billing

### How to Plan New Rake Movement - Detailed Steps

#### Step 1: Start New Plan
1. Go to **Rake Planning** in the left menu
2. Click the **"Create New Plan"** button
3. A comprehensive planning form will appear

#### Step 2: Basic Rake Information

##### Rake Name Assignment
1. **Rake Name**: Give a unique identifier
   - Format: RAKE-001, RAKE-002, etc.
   - Or use descriptive names like "MUM-DEL-RAKE-01"
   - Must be unique in the system
2. **Base Depot**: Where the rake normally operates from
   - Examples: "Mumbai Central", "Delhi Yard", "Chennai Terminal"
   - This is the home base for the rake

##### Operator and Ownership Details
1. **Rake Operator**: Who operates the rake
   - Usually "INDIAN RAILWAY" (default)
   - Can be "PRIVATE OPERATOR" for private rakes
   - "CONCOR" for container corporation rakes
2. **Rake Owner**: Who owns the rake
   - Usually "INDIAN RAILWAY" (default)
   - Can be private companies for owned rakes
3. **Haulage Paid By**: Who pays for traction
   - "Owner" - Rake owner pays
   - "Railway" - Railway pays
   - "Customer" - Customer pays

#### Step 3: Trip and Train Details

##### Trip Configuration
1. **Trip Number**: Assign unique trip ID
   - Format: TRIP-001, TRIP-002, etc.
   - Must be unique for each journey
   - Links to vehicle shipments
2. **Sub Route**: Route type selection
   - "Main Route" - Primary railway line
   - "Alternative Route" - Backup path
   - "Diversion Route" - Temporary path
3. **Journey ID**: Optional tracking number
   - Used for external tracking systems
   - Leave blank if not required

##### Train Assignment
1. **IB Train Number**: Inbound train number
   - Train coming to loading point
   - Format: Numbers only (e.g., 12345, 67890)
   - Must be valid railway train number
2. **Train Number**: Main train number for this trip
   - The train that will carry the vehicles
   - Different from IB train if separate
3. **Device ID**: Tracking device identifier
   - GPS or tracking system ID
   - "Select" if no tracking device

#### Step 4: Route and Schedule Planning

##### Route Selection
1. **Route**: Choose from predefined routes
   - Examples: "MUM-DEL-MAIN", "CHN-BLR-EXPRESS"
   - Shows origin and destination terminals
   - Includes intermediate stations
2. **Plan Type**: Type of movement
   - **Back Loading**: Empty rake going back
   - **Forward Loading**: Full rake going forward
   - **Empty Return**: Empty rake returning empty
   - **Special Movement**: Special purpose movement

##### Scheduling
1. **Plan Date**: When the movement should happen
   - Click calendar icon to select date
   - Cannot be in the past
   - Consider loading and transit times
2. **Timing Considerations**:
   - Loading time at origin (usually 4-6 hours)
   - Transit time between terminals
   - Unloading time at destination
   - Buffer time for delays

#### Step 5: Review and Validation

##### Before Saving - Check These Items
- ✅ Rake name is unique and follows naming convention
- ✅ Base depot is correct for this operation
- ✅ Trip number is unique and properly formatted
- ✅ Train numbers are valid and available
- ✅ Route covers correct origin and destination
- ✅ Plan type matches the movement purpose
- ✅ Plan date allows enough time for operations
- ✅ Operator and ownership details are correct

##### Understanding Plan Impact
- This plan will allocate the rake for the specified period
- Train resources will be reserved
- Terminal slots will be booked
- Vehicle loading will be scheduled

#### Step 6: Save the Plan
1. Click **"Save Plan"** button at the bottom
2. Wait for green success message
3. Your plan will appear in the planning table
4. Plan ID will be generated for reference

### How to View and Manage Existing Plans

#### Understanding the Planning Table
The planning table shows all rake plans with these columns:
- **PlanId**: Unique plan identifier
- **Rake Name**: Which rake is assigned
- **Base Depot**: Home location of rake
- **Trip Number**: Trip identifier
- **Train Number**: Assigned train
- **Route**: Origin to destination
- **Plan Type**: Movement type
- **Plan Date**: Scheduled date
- **Status**: Current plan status
- **Actions**: Available operations

#### Plan Statuses Explained
- **Planned**: Plan created but not yet active
- **Scheduled**: Resources allocated and scheduled
- **In Progress**: Train is currently running
- **Completed**: Journey finished successfully
- **Cancelled**: Plan was cancelled
- **Delayed**: Running behind schedule

#### How to Edit a Plan
1. Find the plan in the table
2. Click the **"Edit"** button (pencil icon)
3. You can modify:
   - Train numbers (if not started)
   - Plan dates (with proper justification)
   - Route (if alternative available)
   - Operator details
   - Remarks and notes
4. Click **"Update Plan"** to save changes

#### How to Cancel a Plan
1. Find the plan you want to cancel
2. Click the **"Delete"** button (trash icon)
3. You'll see a cancellation confirmation
4. Select cancellation reason:
   - "Vehicle shipment cancelled"
   - "Train not available"
   - "Route blocked"
   - "Other" (with explanation)
5. Click **"Confirm Cancellation"**
6. Resources will be freed up for other plans

### Advanced Planning Features

#### Copy Existing Plan
For similar movements:
1. Find a similar plan you did before
2. Click **"Copy Plan"** button
3. Update the new plan:
   - Change dates as needed
   - Update trip number
   - Modify train numbers if required
4. This saves time and ensures consistency

#### Plan Templates
For regular routes:
1. Click **"Save as Template"** on any plan
2. Give the template a descriptive name
3. Later use **"Create from Template"**
4. Templates save:
   - Route information
   - Default operators
   - Standard timings
   - Common remarks

#### Batch Planning
For multiple similar trips:
1. Click **"Batch Planning"** button
2. Set the pattern:
   - Number of trips
   - Frequency (daily, weekly, monthly)
   - Start and end dates
3. System creates multiple plans automatically
4. Review and adjust individual plans as needed

#### Route Optimization
1. Click **"Optimize Route"** button
2. System suggests:
   - Best routes based on distance
   - Alternative routes if primary blocked
   - Timing optimizations
   - Cost-effective options
3. Review suggestions and apply if suitable

### Planning Tools and Utilities

#### Availability Check
Before planning, check resource availability:
1. **Rake Availability**: See which rakes are free
2. **Train Availability**: Check train schedules
3. **Terminal Slots**: See loading/unloading availability
4. **Route Status**: Check if routes are operational

#### Conflict Detection
System automatically checks for:
- Double booking of same rake
- Train number conflicts
- Terminal slot overlaps
- Route scheduling conflicts

#### Planning Dashboard
1. **Overview**: See all plans in calendar view
2. **Resource Utilization**: How busy are resources
3. **Performance Metrics**: Plan success rates
4. **Alerts**: Issues that need attention

### Common Planning Problems and Solutions

#### Problem: Rake Already Assigned
**Solution**:
- Check rake availability in dashboard
- Look for alternative rakes
- Adjust plan dates to fit availability
- Consider splitting large shipments

#### Problem: Train Number Conflict
**Solution**:
- Verify train number is correct
- Check if train is already scheduled
- Use alternative train number
- Contact railway control for clarification

#### Problem: Route Not Available
**Solution**:
- Check route status in system
- Look for alternative routes
- Consider temporary route changes
- Plan for different time window

#### Problem: Terminal Slot Full
**Solution**:
- Check different time slots
- Consider alternative terminals
- Split shipment across multiple trips
- Plan for off-peak times

#### Problem: Plan Date Too Soon
**Solution**:
- Check minimum preparation time needed
- Consider loading time requirements
- Account for transit time
- Allow buffer for unexpected delays

### Best Practices for Rake Planning

#### Before Planning
- ✅ Check all resource availability
- ✅ Verify route operational status
- ✅ Confirm vehicle loading readiness
- ✅ Consider weather and seasonal factors
- ✅ Plan for contingency alternatives

#### During Planning
- ✅ Use consistent naming conventions
- ✅ Include clear remarks and instructions
- ✅ Set realistic timeframes
- ✅ Consider resource constraints
- ✅ Plan for maintenance schedules

#### After Planning
- ✅ Monitor plan execution
- ✅ Update status changes promptly
- ✅ Communicate with all stakeholders
- ✅ Document any deviations
- ✅ Learn from completed plans

### Planning Tips and Tricks

#### Efficiency Tips
- **Use templates** for regular routes
- **Batch planning** for repetitive movements
- **Copy successful plans** for similar operations
- **Plan in advance** to secure best resources

#### Quality Tips
- **Double-check all numbers** before saving
- **Verify train numbers** with railway control
- **Cross-check routes** with operational teams
- **Include contact information** in remarks

#### Communication Tips
- **Notify stakeholders** of new plans
- **Share plan details** with terminal operators
- **Update changes** to all affected parties
- **Document reasons** for any plan changes

### Integration with Other Systems

#### Link to OEM Pickup
- Plans use vehicles from completed pickups
- Pickup status affects planning timelines
- Vehicle quantities determine rake requirements

#### Link to Rake Operations
- Plans become active rake movements
- Planning data flows to arrival/departure tracking
- Plan execution updates operational records

#### Link to Billing
- Plan details used for freight calculation
- Distance and route affect billing amounts
- Plan types have different billing rates

---

## 🏭 Rake Operations

### What are Rake Operations?
This is tracking when trains arrive and depart from terminals with vehicles.

### Rake Arrival - How to Record
1. Go to **Rake Visit** in the left menu
2. Click **"Record New Arrival"** button
3. Fill in arrival details:
   - **Train Number**: Enter the arriving train number
   - **Terminal**: Select the terminal
   - **Arrival Date**: Choose date and time
   - **Route**: Select the route
   - **Rake ID**: Select which rake
4. Add timing details:
   - **Placement Time**: When rake was placed on track
   - **Unloading Start**: When unloading began
   - **Unloading End**: When unloading finished
5. Click **"Save Arrival"** to record

### Rake Departure - How to Record
1. Go to **Rake Departure** in the left menu
2. Click **"Create New Departure"** button
3. Fill in departure details:
   - **Rake Name**: Select from dropdown or type
   - **Train Number**: Enter train number
   - **Trip Number**: Enter trip ID
   - **Line Track**: Choose which track
4. Add arrival timing:
   - **Arrival Date**: When rake arrived
   - **Placement**: When placed for unloading
   - **Unloading**: Start and end times
   - **Stabling**: When rake was parked
   - **Released**: When cleared for departure
5. Add departure timing:
   - **Placement for Loading**: When placed for loading
   - **Loading**: Start and end times
   - **Power**: When power was connected
   - **Departure**: When train left
6. Click **"Create"** to save departure record

### How to Edit Departure Records
1. In the departure table, find the record
2. Click **"Edit"** button
3. Make your changes
4. Click **"Update"** to save

---

## 🔍 Common Tasks

### How to Search and Filter
1. Use the search box at the top of any page
2. Type what you're looking for
3. Results update automatically
4. You can search by:
   - Names
   - Numbers
   - Dates
   - Status

### How to Edit Records
1. Find the record in the table
2. Click the **"Edit"** button (pencil icon)
3. Make your changes
4. Click **"Save"** or **"Update"**

### How to Delete Records
1. Find the record you want to delete
2. Click the **"Delete"** button (trash icon)
3. Confirm you want to delete
4. Click **"Yes"** to permanently delete

### How to Export Data
1. Look for **"Export"** button
2. Choose format (Excel or PDF)
3. File will download to your computer

---

## ⚠️ Important Tips

### Before You Submit Forms
- ✅ Check all required fields (marked with *)
- ✅ Make sure dates are correct
- ✅ Verify numbers and codes
- ✅ Add remarks if something is unusual

### Common Mistakes to Avoid
- ❌ Don't leave required fields empty
- ❌ Don't use wrong date formats
- ❌ Don't enter duplicate VINs
- ❌ Don't forget to save your work

### What to Do When You See Errors
- **Red Message**: Something went wrong - check the form
- **Green Message**: Everything worked fine
- **Loading Spinner**: Wait for it to finish
- If stuck, refresh the page and try again

### Time-Saving Tips
- Use **Tab** key to move between fields
- Use **search** instead of scrolling through long lists
- **Double-click** to edit quickly
- Use **keyboard shortcuts** if available

---

## 📞 Need Help?

### If You Get Stuck
1. Check this guide first
2. Look for error messages on screen
3. Try refreshing the page
4. Contact your system administrator

### Contact Information
- **IT Support**: [Your IT Support Number]
- **System Admin**: [Admin Email/Phone]
- **Training Department**: [Training Contact]

---

## 📋 Quick Reference

### Common Buttons and What They Do
- **Create/New**: Start a new record
- **Edit**: Change existing information
- **Delete**: Remove a record
- **Save**: Store your changes
- **Cancel**: Close without saving
- **Export**: Download data
- **Print**: Get a paper copy

### Colors and What They Mean
- **Green**: Success, completed, active
- **Red**: Error, cancelled, urgent
- **Blue**: Information, in progress
- **Gray**: Inactive, disabled

---

**Remember**: This system helps track vehicles from the plant to their final destination. Every entry creates a record that helps everyone know where vehicles are and when they'll arrive.

**Happy using the Railway Logistics App! 🚂**
