/* =========================================================
   Rate Contract + Invoice Schema for SQL Server
   Safe to run multiple times.
   ========================================================= */

/* =========================================================
   SUPPORTING MASTER TABLES
   ========================================================= */

IF OBJECT_ID(N'dbo.Party', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Party (
        PartyId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        PartyCode NVARCHAR(50) NOT NULL,
        PartyName NVARCHAR(200) NOT NULL,
        PartyType NVARCHAR(30) NOT NULL,
        GSTIN NVARCHAR(20) NULL,
        PAN NVARCHAR(20) NULL,
        AddressLine1 NVARCHAR(300) NULL,
        StateCode NVARCHAR(10) NULL,
        StateName NVARCHAR(100) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Party_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_Party_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Party_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        RowVersion ROWVERSION NOT NULL,
        CONSTRAINT PK_Party PRIMARY KEY (PartyId),
        CONSTRAINT CK_Party_Type CHECK (PartyType IN ('Customer','Vendor','CHA','BillingParty','Other'))
    );
END;

IF OBJECT_ID(N'dbo.ServiceMaster', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ServiceMaster (
        ServiceId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        ServiceCode NVARCHAR(50) NOT NULL,
        ServiceName NVARCHAR(150) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_ServiceMaster_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_ServiceMaster_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ServiceMaster_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        CONSTRAINT PK_ServiceMaster PRIMARY KEY (ServiceId)
    );
END;

IF OBJECT_ID(N'dbo.ItemMaster', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ItemMaster (
        ItemId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        ItemCode NVARCHAR(50) NOT NULL,
        ItemName NVARCHAR(200) NOT NULL,
        ItemType NVARCHAR(50) NULL,
        HSNCode NVARCHAR(20) NULL,
        SACCode NVARCHAR(20) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_ItemMaster_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_ItemMaster_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ItemMaster_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        CONSTRAINT PK_ItemMaster PRIMARY KEY (ItemId)
    );
END;

IF OBJECT_ID(N'dbo.UnitMaster', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UnitMaster (
        UnitId BIGINT IDENTITY(1,1) NOT NULL,
        UnitCode NVARCHAR(20) NOT NULL,
        UnitName NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_UnitMaster_IsActive DEFAULT (1),
        CONSTRAINT PK_UnitMaster PRIMARY KEY (UnitId)
    );
END;

IF OBJECT_ID(N'dbo.TaxRate', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TaxRate (
        TaxRateId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        TaxName NVARCHAR(100) NOT NULL,
        IGSTRate DECIMAL(9,4) NOT NULL CONSTRAINT DF_TaxRate_IGST DEFAULT (0),
        CGSTRate DECIMAL(9,4) NOT NULL CONSTRAINT DF_TaxRate_CGST DEFAULT (0),
        SGSTRate DECIMAL(9,4) NOT NULL CONSTRAINT DF_TaxRate_SGST DEFAULT (0),
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_TaxRate_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_TaxRate_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_TaxRate_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy BIGINT NULL,
        CONSTRAINT PK_TaxRate PRIMARY KEY (TaxRateId)
    );
END;

/* =========================================================
   RATE CONTRACT TABLES
   ========================================================= */

IF OBJECT_ID(N'dbo.RateContract', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RateContract (
        RateContractId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        AcademicYearId BIGINT NOT NULL,
        ContractNumber NVARCHAR(50) NOT NULL,
        ContractDate DATE NOT NULL CONSTRAINT DF_RateContract_ContractDate DEFAULT CAST(GETDATE() AS DATE),
        ValidFrom DATE NULL,
        ValidTo DATE NULL,
        PartyId BIGINT NOT NULL,
        ServiceId BIGINT NULL,
        BillingCondition NVARCHAR(30) NOT NULL,
        RateType NVARCHAR(30) NOT NULL,
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_RateContract_Status DEFAULT ('Draft'),
        Remarks NVARCHAR(1000) NULL,
        TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_RateContract_TotalAmount DEFAULT (0),
        RevisionNo INT NOT NULL CONSTRAINT DF_RateContract_RevisionNo DEFAULT (0),
        ParentRateContractId BIGINT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_RateContract_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_RateContract_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_RateContract_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        DeletedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        DeletedBy BIGINT NULL,
        RowVersion ROWVERSION NOT NULL,
        CONSTRAINT PK_RateContract PRIMARY KEY (RateContractId),
        CONSTRAINT CK_RateContract_Status CHECK (Status IN ('Draft','Active','Expired','Closed','Cancelled')),
        CONSTRAINT CK_RateContract_RateType CHECK (RateType IN ('Public','Private','Contract')),
        CONSTRAINT CK_RateContract_BillingCondition CHECK (BillingCondition IN ('Prepaid','Postpaid','Credit','To Pay')),
        CONSTRAINT CK_RateContract_ValidDates CHECK (ValidTo IS NULL OR ValidFrom IS NULL OR ValidTo >= ValidFrom)
    );
END;

IF OBJECT_ID(N'dbo.RateContractItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RateContractItems (
        RateContractItemId BIGINT IDENTITY(1,1) NOT NULL,
        RateContractId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        FromDate DATE NULL,
        ToDate DATE NULL,
        ServiceMode NVARCHAR(50) NULL,
        WagonType NVARCHAR(50) NULL,
        FromLocation NVARCHAR(150) NULL,
        FromTerminal NVARCHAR(150) NULL,
        ToTerminal NVARCHAR(150) NULL,
        ItemId BIGINT NULL,
        ItemDescription NVARCHAR(300) NULL,
        Quantity DECIMAL(18,3) NOT NULL CONSTRAINT DF_RCItem_Quantity DEFAULT (1),
        UnitId BIGINT NULL,
        LoadFactor DECIMAL(18,4) NULL,
        BaseRate DECIMAL(18,4) NOT NULL CONSTRAINT DF_RCItem_BaseRate DEFAULT (0),
        Contd NVARCHAR(20) NULL,
        DIC DECIMAL(18,4) NULL,
        Rate DECIMAL(18,4) NOT NULL CONSTRAINT DF_RCItem_Rate DEFAULT (0),
        TaxRateId BIGINT NULL,
        TaxPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_RCItem_TaxPercent DEFAULT (0),
        TaxAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_RCItem_TaxAmount DEFAULT (0),
        LineAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_RCItem_LineAmount DEFAULT (0),
        TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_RCItem_TotalAmount DEFAULT (0),
        IsActive BIT NOT NULL CONSTRAINT DF_RCItem_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_RCItem_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_RCItem_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        CONSTRAINT PK_RateContractItems PRIMARY KEY (RateContractItemId),
        CONSTRAINT CK_RCItem_DateRange CHECK (ToDate IS NULL OR FromDate IS NULL OR ToDate >= FromDate),
        CONSTRAINT CK_RCItem_Amounts CHECK (Quantity >= 0 AND BaseRate >= 0 AND Rate >= 0)
    );
END;

/* =========================================================
   INVOICE TABLES
   ========================================================= */

IF OBJECT_ID(N'dbo.Invoice', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Invoice (
        InvoiceId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        AcademicYearId BIGINT NOT NULL,
        InvoiceNumber NVARCHAR(50) NOT NULL,
        InvoiceDate DATE NOT NULL,
        InvoiceType NVARCHAR(30) NOT NULL CONSTRAINT DF_Invoice_InvoiceType DEFAULT ('Standard'),
        RateContractId BIGINT NULL,
        PartyId BIGINT NULL,
        BillingPartyId BIGINT NULL,
        CHAId BIGINT NULL,
        Address NVARCHAR(500) NULL,
        StateCode NVARCHAR(10) NULL,
        StateName NVARCHAR(100) NULL,
        BookingNo NVARCHAR(50) NULL,
        BookingList NVARCHAR(50) NULL,
        BookingDate DATE NULL,
        TrainNo NVARCHAR(50) NULL,
        RakeNo NVARCHAR(50) NULL,
        Route NVARCHAR(200) NULL,
        DepartureDate DATE NULL,
        CustomerInvoiceNo NVARCHAR(50) NULL,
        CustomerInvoiceDate DATE NULL,
        PONumber NVARCHAR(50) NULL,
        PaymentMode NVARCHAR(30) NULL,
        PaymentStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Invoice_PaymentStatus DEFAULT ('Unpaid'),
        ServiceRequest NVARCHAR(150) NULL,
        IsNonTaxable BIT NOT NULL CONSTRAINT DF_Invoice_IsNonTaxable DEFAULT (0),
        Narration NVARCHAR(1000) NULL,
        Category NVARCHAR(100) NULL,
        Description NVARCHAR(500) NULL,
        FromLocation NVARCHAR(150) NULL,
        ToLocation NVARCHAR(150) NULL,
        InvoiceNote NVARCHAR(1000) NULL,
        SubTotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_SubTotal DEFAULT (0),
        DiscountAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Discount DEFAULT (0),
        TaxableAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Taxable DEFAULT (0),
        IGSTAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_IGST DEFAULT (0),
        CGSTAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_CGST DEFAULT (0),
        SGSTAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_SGST DEFAULT (0),
        TaxAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Tax DEFAULT (0),
        GrandTotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_GrandTotal DEFAULT (0),
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_Invoice_Status DEFAULT ('Draft'),
        RevisionNo INT NOT NULL CONSTRAINT DF_Invoice_RevisionNo DEFAULT (0),
        ParentInvoiceId BIGINT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Invoice_IsActive DEFAULT (1),
        IsDeleted BIT NOT NULL CONSTRAINT DF_Invoice_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Invoice_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        DeletedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        DeletedBy BIGINT NULL,
        RowVersion ROWVERSION NOT NULL,
        CONSTRAINT PK_Invoice PRIMARY KEY (InvoiceId),
        CONSTRAINT CK_Invoice_Status CHECK (Status IN ('Draft','Generated','Approved','Cancelled','Revised')),
        CONSTRAINT CK_Invoice_PaymentStatus CHECK (PaymentStatus IN ('Unpaid','PartiallyPaid','Paid','Refunded','Cancelled')),
        CONSTRAINT CK_Invoice_Type CHECK (InvoiceType IN ('Standard','SS','Manual'))
    );
END;

IF OBJECT_ID(N'dbo.InvoiceItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvoiceItems (
        InvoiceItemId BIGINT IDENTITY(1,1) NOT NULL,
        InvoiceId BIGINT NOT NULL,
        RateContractItemId BIGINT NULL,
        ItemId BIGINT NULL,
        ServiceId BIGINT NULL,
        [LineNo] INT NOT NULL,
        ArticleNo NVARCHAR(100) NULL,
        ItemDescription NVARCHAR(300) NULL,
        ServiceDescription NVARCHAR(300) NULL,
        Quantity DECIMAL(18,3) NOT NULL CONSTRAINT DF_InvoiceItems_Qty DEFAULT (0),
        UnitId BIGINT NULL,
        Rate DECIMAL(18,4) NOT NULL CONSTRAINT DF_InvoiceItems_Rate DEFAULT (0),
        Amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_Amount DEFAULT (0),
        DiscountAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_Discount DEFAULT (0),
        TaxableAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_Taxable DEFAULT (0),
        IGSTRate DECIMAL(9,4) NOT NULL CONSTRAINT DF_InvoiceItems_IGSTRate DEFAULT (0),
        IGSTAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_IGSTAmount DEFAULT (0),
        CGSTRate DECIMAL(9,4) NOT NULL CONSTRAINT DF_InvoiceItems_CGSTRate DEFAULT (0),
        CGSTAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_CGSTAmount DEFAULT (0),
        SGSTRate DECIMAL(9,4) NOT NULL CONSTRAINT DF_InvoiceItems_SGSTRate DEFAULT (0),
        SGSTAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_SGSTAmount DEFAULT (0),
        TaxAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_TaxAmount DEFAULT (0),
        TotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceItems_Total DEFAULT (0),
        IsDeleted BIT NOT NULL CONSTRAINT DF_InvoiceItems_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_InvoiceItems_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2(3) NULL,
        CreatedBy BIGINT NULL,
        UpdatedBy BIGINT NULL,
        CONSTRAINT PK_InvoiceItems PRIMARY KEY (InvoiceItemId),
        CONSTRAINT CK_InvoiceItems_Amount CHECK (Quantity >= 0 AND Rate >= 0 AND Amount >= 0)
    );
END;

IF OBJECT_ID(N'dbo.InvoicePayment', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvoicePayment (
        InvoicePaymentId BIGINT IDENTITY(1,1) NOT NULL,
        InvoiceId BIGINT NOT NULL,
        PaymentDate DATE NOT NULL,
        PaymentMode NVARCHAR(30) NOT NULL,
        TransactionReference NVARCHAR(100) NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Remarks NVARCHAR(500) NULL,
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_InvoicePayment_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy BIGINT NULL,
        CONSTRAINT PK_InvoicePayment PRIMARY KEY (InvoicePaymentId),
        CONSTRAINT CK_InvoicePayment_Amount CHECK (Amount > 0)
    );
END;

IF OBJECT_ID(N'dbo.InvoiceStatusHistory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvoiceStatusHistory (
        InvoiceStatusHistoryId BIGINT IDENTITY(1,1) NOT NULL,
        InvoiceId BIGINT NOT NULL,
        OldStatus NVARCHAR(30) NULL,
        NewStatus NVARCHAR(30) NOT NULL,
        Remarks NVARCHAR(500) NULL,
        ChangedAt DATETIME2(3) NOT NULL CONSTRAINT DF_InvoiceStatusHistory_ChangedAt DEFAULT SYSUTCDATETIME(),
        ChangedBy BIGINT NULL,
        CONSTRAINT PK_InvoiceStatusHistory PRIMARY KEY (InvoiceStatusHistoryId)
    );
END;

IF OBJECT_ID(N'dbo.DocumentAttachment', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DocumentAttachment (
        DocumentAttachmentId BIGINT IDENTITY(1,1) NOT NULL,
        InstituteId BIGINT NOT NULL,
        EntityType NVARCHAR(50) NOT NULL,
        EntityId BIGINT NOT NULL,
        FileName NVARCHAR(255) NOT NULL,
        FilePath NVARCHAR(500) NOT NULL,
        ContentType NVARCHAR(100) NULL,
        FileSizeBytes BIGINT NULL,
        IsDeleted BIT NOT NULL CONSTRAINT DF_DocumentAttachment_IsDeleted DEFAULT (0),
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_DocumentAttachment_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy BIGINT NULL,
        CONSTRAINT PK_DocumentAttachment PRIMARY KEY (DocumentAttachmentId)
    );
END;

/* =========================================================
   FOREIGN KEYS
   ========================================================= */

IF OBJECT_ID(N'dbo.FK_RateContract_Party', N'F') IS NULL
    ALTER TABLE dbo.RateContract ADD CONSTRAINT FK_RateContract_Party FOREIGN KEY (PartyId) REFERENCES dbo.Party(PartyId);

IF OBJECT_ID(N'dbo.FK_RateContract_Service', N'F') IS NULL
    ALTER TABLE dbo.RateContract ADD CONSTRAINT FK_RateContract_Service FOREIGN KEY (ServiceId) REFERENCES dbo.ServiceMaster(ServiceId);

IF OBJECT_ID(N'dbo.FK_RateContract_Parent', N'F') IS NULL
    ALTER TABLE dbo.RateContract ADD CONSTRAINT FK_RateContract_Parent FOREIGN KEY (ParentRateContractId) REFERENCES dbo.RateContract(RateContractId);

IF OBJECT_ID(N'dbo.FK_RateContractItems_RateContract', N'F') IS NULL
    ALTER TABLE dbo.RateContractItems ADD CONSTRAINT FK_RateContractItems_RateContract FOREIGN KEY (RateContractId) REFERENCES dbo.RateContract(RateContractId);

IF OBJECT_ID(N'dbo.FK_RateContractItems_Item', N'F') IS NULL
    ALTER TABLE dbo.RateContractItems ADD CONSTRAINT FK_RateContractItems_Item FOREIGN KEY (ItemId) REFERENCES dbo.ItemMaster(ItemId);

IF OBJECT_ID(N'dbo.FK_RateContractItems_Unit', N'F') IS NULL
    ALTER TABLE dbo.RateContractItems ADD CONSTRAINT FK_RateContractItems_Unit FOREIGN KEY (UnitId) REFERENCES dbo.UnitMaster(UnitId);

IF OBJECT_ID(N'dbo.FK_RateContractItems_TaxRate', N'F') IS NULL
    ALTER TABLE dbo.RateContractItems ADD CONSTRAINT FK_RateContractItems_TaxRate FOREIGN KEY (TaxRateId) REFERENCES dbo.TaxRate(TaxRateId);

IF OBJECT_ID(N'dbo.FK_Invoice_RateContract', N'F') IS NULL
    ALTER TABLE dbo.Invoice ADD CONSTRAINT FK_Invoice_RateContract FOREIGN KEY (RateContractId) REFERENCES dbo.RateContract(RateContractId);

IF OBJECT_ID(N'dbo.FK_Invoice_Party', N'F') IS NULL
    ALTER TABLE dbo.Invoice ADD CONSTRAINT FK_Invoice_Party FOREIGN KEY (PartyId) REFERENCES dbo.Party(PartyId);

IF OBJECT_ID(N'dbo.FK_Invoice_BillingParty', N'F') IS NULL
    ALTER TABLE dbo.Invoice ADD CONSTRAINT FK_Invoice_BillingParty FOREIGN KEY (BillingPartyId) REFERENCES dbo.Party(PartyId);

IF OBJECT_ID(N'dbo.FK_Invoice_CHA', N'F') IS NULL
    ALTER TABLE dbo.Invoice ADD CONSTRAINT FK_Invoice_CHA FOREIGN KEY (CHAId) REFERENCES dbo.Party(PartyId);

IF OBJECT_ID(N'dbo.FK_Invoice_Parent', N'F') IS NULL
    ALTER TABLE dbo.Invoice ADD CONSTRAINT FK_Invoice_Parent FOREIGN KEY (ParentInvoiceId) REFERENCES dbo.Invoice(InvoiceId);

IF OBJECT_ID(N'dbo.FK_InvoiceItems_Invoice', N'F') IS NULL
    ALTER TABLE dbo.InvoiceItems ADD CONSTRAINT FK_InvoiceItems_Invoice FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoice(InvoiceId);

IF OBJECT_ID(N'dbo.FK_InvoiceItems_RateContractItem', N'F') IS NULL
    ALTER TABLE dbo.InvoiceItems ADD CONSTRAINT FK_InvoiceItems_RateContractItem FOREIGN KEY (RateContractItemId) REFERENCES dbo.RateContractItems(RateContractItemId);

IF OBJECT_ID(N'dbo.FK_InvoiceItems_Item', N'F') IS NULL
    ALTER TABLE dbo.InvoiceItems ADD CONSTRAINT FK_InvoiceItems_Item FOREIGN KEY (ItemId) REFERENCES dbo.ItemMaster(ItemId);

IF OBJECT_ID(N'dbo.FK_InvoiceItems_Service', N'F') IS NULL
    ALTER TABLE dbo.InvoiceItems ADD CONSTRAINT FK_InvoiceItems_Service FOREIGN KEY (ServiceId) REFERENCES dbo.ServiceMaster(ServiceId);

IF OBJECT_ID(N'dbo.FK_InvoiceItems_Unit', N'F') IS NULL
    ALTER TABLE dbo.InvoiceItems ADD CONSTRAINT FK_InvoiceItems_Unit FOREIGN KEY (UnitId) REFERENCES dbo.UnitMaster(UnitId);

IF OBJECT_ID(N'dbo.FK_InvoicePayment_Invoice', N'F') IS NULL
    ALTER TABLE dbo.InvoicePayment ADD CONSTRAINT FK_InvoicePayment_Invoice FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoice(InvoiceId);

IF OBJECT_ID(N'dbo.FK_InvoiceStatusHistory_Invoice', N'F') IS NULL
    ALTER TABLE dbo.InvoiceStatusHistory ADD CONSTRAINT FK_InvoiceStatusHistory_Invoice FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoice(InvoiceId);

/* =========================================================
   UNIQUE KEYS AND INDEXES
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Party_Institute_PartyCode' AND object_id = OBJECT_ID(N'dbo.Party'))
    CREATE UNIQUE INDEX UX_Party_Institute_PartyCode ON dbo.Party(InstituteId, PartyCode) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ServiceMaster_Institute_ServiceCode' AND object_id = OBJECT_ID(N'dbo.ServiceMaster'))
    CREATE UNIQUE INDEX UX_ServiceMaster_Institute_ServiceCode ON dbo.ServiceMaster(InstituteId, ServiceCode) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemMaster_Institute_ItemCode' AND object_id = OBJECT_ID(N'dbo.ItemMaster'))
    CREATE UNIQUE INDEX UX_ItemMaster_Institute_ItemCode ON dbo.ItemMaster(InstituteId, ItemCode) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UnitMaster_UnitCode' AND object_id = OBJECT_ID(N'dbo.UnitMaster'))
    CREATE UNIQUE INDEX UX_UnitMaster_UnitCode ON dbo.UnitMaster(UnitCode);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_RateContract_Number' AND object_id = OBJECT_ID(N'dbo.RateContract'))
    CREATE UNIQUE INDEX UX_RateContract_Number ON dbo.RateContract(InstituteId, AcademicYearId, ContractNumber, RevisionNo) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RateContract_Party_Status' AND object_id = OBJECT_ID(N'dbo.RateContract'))
    CREATE INDEX IX_RateContract_Party_Status ON dbo.RateContract(InstituteId, PartyId, Status, IsDeleted);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RateContract_Validity' AND object_id = OBJECT_ID(N'dbo.RateContract'))
    CREATE INDEX IX_RateContract_Validity ON dbo.RateContract(InstituteId, ValidFrom, ValidTo, Status) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_RateContractItems_LineNo' AND object_id = OBJECT_ID(N'dbo.RateContractItems'))
    CREATE UNIQUE INDEX UX_RateContractItems_LineNo ON dbo.RateContractItems(RateContractId, [LineNo]) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RateContractItems_SearchRate' AND object_id = OBJECT_ID(N'dbo.RateContractItems'))
    CREATE INDEX IX_RateContractItems_SearchRate ON dbo.RateContractItems(RateContractId, ItemId, FromLocation, ToTerminal, ServiceMode) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Invoice_Number' AND object_id = OBJECT_ID(N'dbo.Invoice'))
    CREATE UNIQUE INDEX UX_Invoice_Number ON dbo.Invoice(InstituteId, AcademicYearId, InvoiceNumber, RevisionNo) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Invoice_Date_Status' AND object_id = OBJECT_ID(N'dbo.Invoice'))
    CREATE INDEX IX_Invoice_Date_Status ON dbo.Invoice(InstituteId, InvoiceDate, Status, IsDeleted);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Invoice_RateContract' AND object_id = OBJECT_ID(N'dbo.Invoice'))
    CREATE INDEX IX_Invoice_RateContract ON dbo.Invoice(RateContractId) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Invoice_Party' AND object_id = OBJECT_ID(N'dbo.Invoice'))
    CREATE INDEX IX_Invoice_Party ON dbo.Invoice(InstituteId, PartyId, InvoiceDate) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InvoiceItems_LineNo' AND object_id = OBJECT_ID(N'dbo.InvoiceItems'))
    CREATE UNIQUE INDEX UX_InvoiceItems_LineNo ON dbo.InvoiceItems(InvoiceId, [LineNo]) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InvoiceItems_RateContractItem' AND object_id = OBJECT_ID(N'dbo.InvoiceItems'))
    CREATE INDEX IX_InvoiceItems_RateContractItem ON dbo.InvoiceItems(RateContractItemId) WHERE IsDeleted = 0;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InvoicePayment_Invoice' AND object_id = OBJECT_ID(N'dbo.InvoicePayment'))
    CREATE INDEX IX_InvoicePayment_Invoice ON dbo.InvoicePayment(InvoiceId, PaymentDate);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InvoiceStatusHistory_Invoice' AND object_id = OBJECT_ID(N'dbo.InvoiceStatusHistory'))
    CREATE INDEX IX_InvoiceStatusHistory_Invoice ON dbo.InvoiceStatusHistory(InvoiceId, ChangedAt DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_DocumentAttachment_Entity' AND object_id = OBJECT_ID(N'dbo.DocumentAttachment'))
    CREATE INDEX IX_DocumentAttachment_Entity ON dbo.DocumentAttachment(EntityType, EntityId) WHERE IsDeleted = 0;

/* =========================================================
   DEFAULT UNITS AND TAX ROWS
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM dbo.UnitMaster WHERE UnitCode = N'NOS')
    INSERT INTO dbo.UnitMaster (UnitCode, UnitName) VALUES (N'NOS', N'Numbers');

IF NOT EXISTS (SELECT 1 FROM dbo.UnitMaster WHERE UnitCode = N'MT')
    INSERT INTO dbo.UnitMaster (UnitCode, UnitName) VALUES (N'MT', N'Metric Ton');

IF NOT EXISTS (SELECT 1 FROM dbo.UnitMaster WHERE UnitCode = N'TRIP')
    INSERT INTO dbo.UnitMaster (UnitCode, UnitName) VALUES (N'TRIP', N'Trip');

IF NOT EXISTS (SELECT 1 FROM dbo.TaxRate WHERE InstituteId = 1 AND TaxName = N'GST 18%' AND IsDeleted = 0)
    INSERT INTO dbo.TaxRate (InstituteId, TaxName, IGSTRate, CGSTRate, SGSTRate, EffectiveFrom)
    VALUES (1, N'GST 18%', 18, 9, 9, CAST(GETDATE() AS DATE));

PRINT 'Rate Contract + Invoice schema completed successfully.';
