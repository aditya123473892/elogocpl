const { pool, sql } = require('./elogivinbackend/Src/config/dbconfig');

async function createPickupWithoutASNTable() {
  try {
    console.log('Creating pickup_without_asn table...');
    
    const createTableQuery = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pickup_without_asn' AND xtype='U')
    BEGIN
        CREATE TABLE pickup_without_asn (
            id INT PRIMARY KEY IDENTITY(1,1),
            plant VARCHAR(100) NOT NULL,
            yard_location VARCHAR(100) NOT NULL,
            vendor_transporter VARCHAR(200) NOT NULL,
            truck_number VARCHAR(50) NOT NULL,
            vin_details NVARCHAR(MAX) NOT NULL,
            pickup_date DATE NOT NULL,
            delivery_date DATE NOT NULL,
            arrival_time TIME NULL,
            departure_time TIME NULL,
            driver_name VARCHAR(200) NOT NULL,
            remarks TEXT NULL,
            transportation_type VARCHAR(50) NOT NULL DEFAULT 'TRUCK',
            created_by VARCHAR(100) NULL,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
        );
        
        -- Create indexes
        CREATE INDEX idx_pickup_plant ON pickup_without_asn(plant);
        CREATE INDEX idx_pickup_driver_name ON pickup_without_asn(driver_name);
        CREATE INDEX idx_pickup_pickup_date ON pickup_without_asn(pickup_date);
        CREATE INDEX idx_pickup_truck_number ON pickup_without_asn(truck_number);
        CREATE INDEX idx_pickup_created_at ON pickup_without_asn(created_at);
        
        PRINT 'Table pickup_without_asn created successfully';
    END
    ELSE
    BEGIN
        PRINT 'Table pickup_without_asn already exists';
    END
    `;
    
    const result = await pool.request().query(createTableQuery);
    console.log('✅ Table creation completed successfully');
    
    // Insert sample data if table is empty
    const checkDataQuery = 'SELECT COUNT(*) as count FROM pickup_without_asn';
    const countResult = await pool.request().query(checkDataQuery);
    
    if (countResult.recordset[0].count === 0) {
      console.log('Inserting sample data...');
      
      const insertSampleQuery = `
      INSERT INTO pickup_without_asn (
          plant, yard_location, vendor_transporter, truck_number, 
          vin_details, pickup_date, delivery_date, arrival_time, 
          departure_time, driver_name, remarks, transportation_type, created_by
      ) VALUES (
          'Plant A', 'Yard 1', 'Transporter A Ltd.', 'DL6CV7887',
          '["VIN001", "VIN002", "VIN003"]',
          '2024-01-15', '2024-01-16', '09:30:00', '14:45:00',
          'John Doe', 'Sample pickup without ASN', 'TRUCK', 'admin'
      );
      `;
      
      await pool.request().query(insertSampleQuery);
      console.log('✅ Sample data inserted successfully');
    }
    
    console.log('🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
}

// Run the setup
createPickupWithoutASNTable()
  .then(() => {
    console.log('Setup completed. You can now start using the Pickup Without ASN feature.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
