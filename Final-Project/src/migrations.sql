IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE TABLE [Tenants] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(200) NOT NULL,
        [Email] nvarchar(200) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Address] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Tenants] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE TABLE [Patients] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NOT NULL,
        [FullName] nvarchar(200) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [Email] nvarchar(max) NULL,
        [DateOfBirth] datetime2 NOT NULL,
        [Gender] nvarchar(max) NOT NULL,
        [MedicalHistory] nvarchar(max) NULL,
        [ProfileImageUrl] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Patients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Patients_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE TABLE [Subscriptions] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [PaymobOrderId] nvarchar(max) NULL,
        [PaymobTransactionId] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Subscriptions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Subscriptions_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Email] nvarchar(200) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] nvarchar(max) NOT NULL,
        [MustResetPassword] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [ProfileImageUrl] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Users_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE TABLE [Doctors] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NOT NULL,
        [UserId] int NOT NULL,
        [Specialization] nvarchar(max) NOT NULL,
        [Bio] nvarchar(max) NULL,
        [ProfileImageUrl] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Doctors] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Doctors_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Doctors_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE TABLE [Appointments] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NOT NULL,
        [PatientId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [AppointmentDate] datetime2 NOT NULL,
        [Duration] time NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Appointments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Appointments_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Appointments_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Appointments_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Appointments_DoctorId] ON [Appointments] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Appointments_PatientId] ON [Appointments] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Appointments_TenantId] ON [Appointments] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Doctors_TenantId] ON [Doctors] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Doctors_UserId] ON [Doctors] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Patients_TenantId] ON [Patients] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Subscriptions_TenantId] ON [Subscriptions] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Tenants_Email] ON [Tenants] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Users_TenantId] ON [Users] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428202158_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260428202158_InitialCreate', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428215506_AddTeamSeed'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'IsActive', N'MustResetPassword', N'PasswordHash', N'ProfileImageUrl', N'Role', N'TenantId') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] ON;
    EXEC(N'INSERT INTO [Users] ([Id], [CreatedAt], [Email], [FullName], [IsActive], [MustResetPassword], [PasswordHash], [ProfileImageUrl], [Role], [TenantId])
    VALUES (1, ''2026-01-01T00:00:00.0000000Z'', N''abdelrahman@sehhatech.com'', N''Abdelrahman Khalawy'', CAST(1 AS bit), CAST(0 AS bit), N''$2a$11$Ra0vGMXtltWL94izAo1EP.6ye.tFmO9JUJijBEIzYXzU1n2cBzqHy'', NULL, N''SuperAdmin'', NULL),
    (2, ''2026-01-01T00:00:00.0000000Z'', N''naglaa@sehhatech.com'', N''Naglaa Shawky'', CAST(1 AS bit), CAST(0 AS bit), N''$2a$11$Ra0vGMXtltWL94izAo1EP.6ye.tFmO9JUJijBEIzYXzU1n2cBzqHy'', NULL, N''SuperAdmin'', NULL),
    (3, ''2026-01-01T00:00:00.0000000Z'', N''mariam@sehhatech.com'', N''Mariam Khaled'', CAST(1 AS bit), CAST(0 AS bit), N''$2a$11$Ra0vGMXtltWL94izAo1EP.6ye.tFmO9JUJijBEIzYXzU1n2cBzqHy'', NULL, N''SuperAdmin'', NULL),
    (4, ''2026-01-01T00:00:00.0000000Z'', N''shahd@sehhatech.com'', N''Shahd Abdelaziz'', CAST(1 AS bit), CAST(0 AS bit), N''$2a$11$Ra0vGMXtltWL94izAo1EP.6ye.tFmO9JUJijBEIzYXzU1n2cBzqHy'', NULL, N''SuperAdmin'', NULL),
    (5, ''2026-01-01T00:00:00.0000000Z'', N''baher@sehhatech.com'', N''Baher Khedr'', CAST(1 AS bit), CAST(0 AS bit), N''$2a$11$Ra0vGMXtltWL94izAo1EP.6ye.tFmO9JUJijBEIzYXzU1n2cBzqHy'', NULL, N''SuperAdmin'', NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'IsActive', N'MustResetPassword', N'PasswordHash', N'ProfileImageUrl', N'Role', N'TenantId') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428215506_AddTeamSeed'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260428215506_AddTeamSeed', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428220554_RemoveHardcodedSeed'
)
BEGIN
    EXEC(N'DELETE FROM [Users]
    WHERE [Id] = 1;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428220554_RemoveHardcodedSeed'
)
BEGIN
    EXEC(N'DELETE FROM [Users]
    WHERE [Id] = 2;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428220554_RemoveHardcodedSeed'
)
BEGIN
    EXEC(N'DELETE FROM [Users]
    WHERE [Id] = 3;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428220554_RemoveHardcodedSeed'
)
BEGIN
    EXEC(N'DELETE FROM [Users]
    WHERE [Id] = 4;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428220554_RemoveHardcodedSeed'
)
BEGIN
    EXEC(N'DELETE FROM [Users]
    WHERE [Id] = 5;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260428220554_RemoveHardcodedSeed'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260428220554_RemoveHardcodedSeed', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260429233843_AddSpecializationToTenant'
)
BEGIN
    ALTER TABLE [Tenants] ADD [Specialization] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260429233843_AddSpecializationToTenant'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260429233843_AddSpecializationToTenant', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    ALTER TABLE [Appointments] ADD [Source] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE TABLE [OTPRecords] (
        [Id] int NOT NULL IDENTITY,
        [Phone] nvarchar(20) NOT NULL,
        [CodeHash] nvarchar(max) NOT NULL,
        [Purpose] nvarchar(max) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [IsUsed] bit NOT NULL,
        [AttemptCount] int NOT NULL,
        [IpAddress] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_OTPRecords] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE TABLE [PortalUsers] (
        [Id] int NOT NULL IDENTITY,
        [FullName] nvarchar(200) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [Email] nvarchar(max) NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [IsPhoneVerified] bit NOT NULL,
        [IsEmailVerified] bit NOT NULL,
        [NationalId] nvarchar(max) NULL,
        [Level] nvarchar(max) NOT NULL,
        [ProfileImageUrl] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [IsBlocked] bit NOT NULL,
        [FailedLoginAttempts] int NOT NULL,
        [BlockedUntil] datetime2 NULL,
        CONSTRAINT [PK_PortalUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE TABLE [SlotTemplates] (
        [Id] int NOT NULL IDENTITY,
        [DoctorId] int NOT NULL,
        [TenantId] int NOT NULL,
        [DayOfWeek] int NOT NULL,
        [StartTime] time NOT NULL,
        [EndTime] time NOT NULL,
        [SlotDurationMinutes] int NOT NULL,
        [MaxPatientsPerSlot] int NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_SlotTemplates] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE TABLE [PatientBookings] (
        [Id] int NOT NULL IDENTITY,
        [IdempotencyKey] uniqueidentifier NOT NULL,
        [PortalUserId] int NOT NULL,
        [TenantId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [SlotDate] datetime2 NOT NULL,
        [SlotTime] time NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CancelledAt] datetime2 NULL,
        [CancellationReason] nvarchar(max) NULL,
        [LinkedAppointmentId] int NULL,
        [LinkedPatientId] int NULL,
        CONSTRAINT [PK_PatientBookings] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PatientBookings_PortalUsers_PortalUserId] FOREIGN KEY ([PortalUserId]) REFERENCES [PortalUsers] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_PatientBookings_DoctorId_SlotDate_SlotTime_TenantId] ON [PatientBookings] ([DoctorId], [SlotDate], [SlotTime], [TenantId]) WHERE [Status] != ''Cancelled''');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PatientBookings_IdempotencyKey] ON [PatientBookings] ([IdempotencyKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE INDEX [IX_PatientBookings_PortalUserId] ON [PatientBookings] ([PortalUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PortalUsers_Phone] ON [PortalUsers] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613013745_AddPatientPortal'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260613013745_AddPatientPortal', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613015547_AddPortalRefreshToken'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [Token] nvarchar(450) NOT NULL,
        [PortalUserId] int NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [IsRevoked] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_PortalUsers_PortalUserId] FOREIGN KEY ([PortalUserId]) REFERENCES [PortalUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613015547_AddPortalRefreshToken'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_PortalUserId] ON [RefreshTokens] ([PortalUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613015547_AddPortalRefreshToken'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260613015547_AddPortalRefreshToken'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260613015547_AddPortalRefreshToken', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    CREATE TABLE [PaymentInvoices] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NOT NULL,
        [PatientId] int NOT NULL,
        [AppointmentId] int NULL,
        [InvoiceNumber] nvarchar(50) NOT NULL,
        [ServiceName] nvarchar(150) NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [PaidAmount] decimal(18,2) NOT NULL,
        [RemainingAmount] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [PaymentMethod] int NOT NULL,
        [Notes] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [PaidAt] datetime2 NULL,
        CONSTRAINT [PK_PaymentInvoices] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PaymentInvoices_Appointments_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [Appointments] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_PaymentInvoices_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_PaymentInvoices_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    CREATE INDEX [IX_SlotTemplates_DoctorId] ON [SlotTemplates] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    CREATE INDEX [IX_PaymentInvoices_AppointmentId] ON [PaymentInvoices] ([AppointmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    CREATE INDEX [IX_PaymentInvoices_PatientId] ON [PaymentInvoices] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    CREATE INDEX [IX_PaymentInvoices_TenantId] ON [PaymentInvoices] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    ALTER TABLE [SlotTemplates] ADD CONSTRAINT [FK_SlotTemplates_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260617101355_AddReceptionPayments'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260617101355_AddReceptionPayments', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618231953_FixTenantIsActiveDefault'
)
BEGIN
    CREATE INDEX [IX_SlotTemplates_DoctorId] ON [SlotTemplates] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618231953_FixTenantIsActiveDefault'
)
BEGIN
    ALTER TABLE [SlotTemplates] ADD CONSTRAINT [FK_SlotTemplates_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618231953_FixTenantIsActiveDefault'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260618231953_FixTenantIsActiveDefault', N'10.0.9');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627225726_AddMonthlyReports'
)
BEGIN
    CREATE TABLE [MonthlyReports] (
        [Id] int NOT NULL IDENTITY,
        [TenantId] int NOT NULL,
        [Month] int NOT NULL,
        [Year] int NOT NULL,
        [TotalAppointments] int NOT NULL,
        [CompletedAppointments] int NOT NULL,
        [CancelledAppointments] int NOT NULL,
        [NoShowAppointments] int NOT NULL,
        [TotalRevenue] decimal(18,2) NOT NULL,
        [PendingRevenue] decimal(18,2) NOT NULL,
        [NewPatients] int NOT NULL,
        [GeneratedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_MonthlyReports] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MonthlyReports_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627225726_AddMonthlyReports'
)
BEGIN
    CREATE UNIQUE INDEX [IX_MonthlyReports_TenantId_Month_Year] ON [MonthlyReports] ([TenantId], [Month], [Year]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627225726_AddMonthlyReports'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260627225726_AddMonthlyReports', N'10.0.9');
END;

COMMIT;
GO

