// Sheet names
const SHEETS = {
  CUSTOMERS: 'Customers',
  ELEVATORS: 'Elevators',
  MAINTENANCE: 'Maintenance',
  SERVICE_REQUESTS: 'ServiceRequests',
  ADMIN_USERS: 'AdminUsers',
};

// Column mappings for each sheet
const COLUMNS = {
  [SHEETS.CUSTOMERS]: [
    'customerId',
    'name',
    'phone',
    'email',
    'passwordHash',
    'address',
    'pushToken',
  ],
  [SHEETS.ELEVATORS]: [
    'elevatorId',
    'customerId',
    'elevatorCode',
    'location',
    'installationDate',
    'warrantyExpiry',
    'lastMaintenance',
    'nextMaintenance',
    'status',
  ],
  [SHEETS.MAINTENANCE]: [
    'maintenanceId',
    'elevatorId',
    'serviceDate',
    'nextServiceDate',
    'remarks',
    'technicianName',
  ],
  [SHEETS.SERVICE_REQUESTS]: [
    'requestId',
    'customerId',
    'elevatorId',
    'issue',
    'status',
    'createdAt',
  ],
  [SHEETS.ADMIN_USERS]: ['adminId', 'username', 'passwordHash'],
};

// Elevator statuses
const ELEVATOR_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Under Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
};

// Service request statuses
const REQUEST_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

module.exports = { SHEETS, COLUMNS, ELEVATOR_STATUS, REQUEST_STATUS };
