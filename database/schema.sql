-- ============================================================
--  SehhaTech – Full Database Schema
--  Generated from EF Core Migrations → MySQL
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Tenants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Tenants` (
    `Id`             INT            NOT NULL AUTO_INCREMENT,
    `Name`           VARCHAR(200)   NOT NULL,
    `Email`          VARCHAR(200)   NOT NULL,
    `Phone`          VARCHAR(50)    NOT NULL,
    `Address`        TEXT           NOT NULL,
    `IsActive`       TINYINT(1)     NOT NULL DEFAULT 1,
    `Specialization` TEXT           NOT NULL DEFAULT '',
    `CreatedAt`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_Tenants_Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Users` (
    `Id`               INT          NOT NULL AUTO_INCREMENT,
    `TenantId`         INT          NULL,
    `FullName`         TEXT         NOT NULL,
    `Email`            VARCHAR(200) NOT NULL,
    `PasswordHash`     TEXT         NOT NULL,
    `Role`             VARCHAR(50)  NOT NULL,
    `MustResetPassword` TINYINT(1)  NOT NULL DEFAULT 0,
    `IsActive`         TINYINT(1)   NOT NULL DEFAULT 1,
    `ProfileImageUrl`  TEXT         NULL,
    `CreatedAt`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_Users_Email` (`Email`),
    KEY `IX_Users_TenantId` (`TenantId`),
    CONSTRAINT `FK_Users_Tenants_TenantId`
        FOREIGN KEY (`TenantId`) REFERENCES `Tenants` (`Id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Subscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Subscriptions` (
    `Id`                   INT            NOT NULL AUTO_INCREMENT,
    `TenantId`             INT            NOT NULL,
    `Status`               VARCHAR(50)    NOT NULL,
    `Amount`               DECIMAL(18,2)  NOT NULL,
    `StartDate`            DATETIME       NOT NULL,
    `EndDate`              DATETIME       NOT NULL,
    `PaymobOrderId`        TEXT           NULL,
    `PaymobTransactionId`  TEXT           NULL,
    `CreatedAt`            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_Subscriptions_TenantId` (`TenantId`),
    CONSTRAINT `FK_Subscriptions_Tenants_TenantId`
        FOREIGN KEY (`TenantId`) REFERENCES `Tenants` (`Id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Patients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Patients` (
    `Id`               INT          NOT NULL AUTO_INCREMENT,
    `TenantId`         INT          NOT NULL,
    `FullName`         VARCHAR(200) NOT NULL,
    `Phone`            VARCHAR(20)  NOT NULL,
    `Email`            TEXT         NULL,
    `DateOfBirth`      DATETIME     NOT NULL,
    `Gender`           VARCHAR(20)  NOT NULL,
    `MedicalHistory`   TEXT         NULL,
    `ProfileImageUrl`  TEXT         NULL,
    `CreatedAt`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    KEY `IX_Patients_TenantId` (`TenantId`),
    CONSTRAINT `FK_Patients_Tenants_TenantId`
        FOREIGN KEY (`TenantId`) REFERENCES `Tenants` (`Id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Doctors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Doctors` (
    `Id`               INT         NOT NULL AUTO_INCREMENT,
    `TenantId`         INT         NOT NULL,
    `UserId`           INT         NOT NULL,
    `Specialization`   TEXT        NOT NULL,
    `Bio`              TEXT        NULL,
    `ProfileImageUrl`  TEXT        NULL,
    `IsActive`         TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (`Id`),
    KEY `IX_Doctors_TenantId` (`TenantId`),
    KEY `IX_Doctors_UserId` (`UserId`),
    CONSTRAINT `FK_Doctors_Tenants_TenantId`
        FOREIGN KEY (`TenantId`) REFERENCES `Tenants` (`Id`)
        ON DELETE RESTRICT,
    CONSTRAINT `FK_Doctors_Users_UserId`
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Appointments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Appointments` (
    `Id`              INT         NOT NULL AUTO_INCREMENT,
    `TenantId`        INT         NOT NULL,
    `PatientId`       INT         NOT NULL,
    `DoctorId`        INT         NOT NULL,
    `AppointmentDate` DATETIME    NOT NULL,
    `Duration`        TIME        NOT NULL,
    `Status`          VARCHAR(50) NOT NULL,
    `Source`          VARCHAR(50) NOT NULL DEFAULT '',
    `Notes`           TEXT        NULL,
    `CreatedAt`       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    KEY `IX_Appointments_TenantId`  (`TenantId`),
    KEY `IX_Appointments_PatientId` (`PatientId`),
    KEY `IX_Appointments_DoctorId`  (`DoctorId`),
    CONSTRAINT `FK_Appointments_Tenants_TenantId`
        FOREIGN KEY (`TenantId`)  REFERENCES `Tenants`  (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Appointments_Patients_PatientId`
        FOREIGN KEY (`PatientId`) REFERENCES `Patients` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Appointments_Doctors_DoctorId`
        FOREIGN KEY (`DoctorId`)  REFERENCES `Doctors`  (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PortalUsers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `PortalUsers` (
    `Id`                  INT          NOT NULL AUTO_INCREMENT,
    `FullName`            VARCHAR(200) NOT NULL,
    `Phone`               VARCHAR(20)  NOT NULL,
    `Email`               TEXT         NULL,
    `PasswordHash`        TEXT         NOT NULL,
    `IsPhoneVerified`     TINYINT(1)   NOT NULL DEFAULT 0,
    `IsEmailVerified`     TINYINT(1)   NOT NULL DEFAULT 0,
    `NationalId`          TEXT         NULL,
    `Level`               VARCHAR(50)  NOT NULL,
    `ProfileImageUrl`     TEXT         NULL,
    `CreatedAt`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `IsBlocked`           TINYINT(1)   NOT NULL DEFAULT 0,
    `FailedLoginAttempts` INT          NOT NULL DEFAULT 0,
    `BlockedUntil`        DATETIME     NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_PortalUsers_Phone` (`Phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- OTPRecords
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `OTPRecords` (
    `Id`           INT         NOT NULL AUTO_INCREMENT,
    `Phone`        VARCHAR(20) NOT NULL,
    `CodeHash`     TEXT        NOT NULL,
    `Purpose`      VARCHAR(50) NOT NULL,
    `ExpiresAt`    DATETIME    NOT NULL,
    `IsUsed`       TINYINT(1)  NOT NULL DEFAULT 0,
    `AttemptCount` INT         NOT NULL DEFAULT 0,
    `IpAddress`    TEXT        NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- SlotTemplates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `SlotTemplates` (
    `Id`                   INT        NOT NULL AUTO_INCREMENT,
    `DoctorId`             INT        NOT NULL,
    `TenantId`             INT        NOT NULL,
    `DayOfWeek`            INT        NOT NULL,
    `StartTime`            TIME       NOT NULL,
    `EndTime`              TIME       NOT NULL,
    `SlotDurationMinutes`  INT        NOT NULL,
    `MaxPatientsPerSlot`   INT        NOT NULL,
    `IsActive`             TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`Id`),
    KEY `IX_SlotTemplates_DoctorId` (`DoctorId`),
    CONSTRAINT `FK_SlotTemplates_Doctors_DoctorId`
        FOREIGN KEY (`DoctorId`) REFERENCES `Doctors` (`Id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PatientBookings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `PatientBookings` (
    `Id`                  INT          NOT NULL AUTO_INCREMENT,
    `IdempotencyKey`      CHAR(36)     NOT NULL,
    `PortalUserId`        INT          NOT NULL,
    `TenantId`            INT          NOT NULL,
    `DoctorId`            INT          NOT NULL,
    `SlotDate`            DATETIME     NOT NULL,
    `SlotTime`            TIME         NOT NULL,
    `Status`              VARCHAR(50)  NOT NULL,
    `Notes`               TEXT         NULL,
    `CreatedAt`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `CancelledAt`         DATETIME     NULL,
    `CancellationReason`  TEXT         NULL,
    `LinkedAppointmentId` INT          NULL,
    `LinkedPatientId`     INT          NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_PatientBookings_IdempotencyKey` (`IdempotencyKey`),
    KEY `IX_PatientBookings_PortalUserId` (`PortalUserId`),
    -- Unique booking per slot (excluding cancelled)
    -- Note: MySQL doesn't support filtered indexes; enforce this in application logic
    -- or via a partial unique index workaround using a generated column if needed.
    CONSTRAINT `FK_PatientBookings_PortalUsers_PortalUserId`
        FOREIGN KEY (`PortalUserId`) REFERENCES `PortalUsers` (`Id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- RefreshTokens  (Portal)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `RefreshTokens` (
    `Id`           INT          NOT NULL AUTO_INCREMENT,
    `Token`        VARCHAR(450) NOT NULL,
    `PortalUserId` INT          NOT NULL,
    `ExpiresAt`    DATETIME     NOT NULL,
    `IsRevoked`    TINYINT(1)   NOT NULL DEFAULT 0,
    `CreatedAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_RefreshTokens_Token` (`Token`),
    KEY `IX_RefreshTokens_PortalUserId` (`PortalUserId`),
    CONSTRAINT `FK_RefreshTokens_PortalUsers_PortalUserId`
        FOREIGN KEY (`PortalUserId`) REFERENCES `PortalUsers` (`Id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PaymentInvoices
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `PaymentInvoices` (
    `Id`              INT            NOT NULL AUTO_INCREMENT,
    `TenantId`        INT            NOT NULL,
    `PatientId`       INT            NOT NULL,
    `AppointmentId`   INT            NULL,
    `InvoiceNumber`   VARCHAR(50)    NOT NULL,
    `ServiceName`     VARCHAR(150)   NOT NULL,
    `TotalAmount`     DECIMAL(18,2)  NOT NULL,
    `PaidAmount`      DECIMAL(18,2)  NOT NULL,
    `RemainingAmount` DECIMAL(18,2)  NOT NULL,
    `Status`          INT            NOT NULL,
    `PaymentMethod`   INT            NOT NULL,
    `Notes`           VARCHAR(500)   NULL,
    `CreatedAt`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `PaidAt`          DATETIME       NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_PaymentInvoices_TenantId`      (`TenantId`),
    KEY `IX_PaymentInvoices_PatientId`     (`PatientId`),
    KEY `IX_PaymentInvoices_AppointmentId` (`AppointmentId`),
    CONSTRAINT `FK_PaymentInvoices_Tenants_TenantId`
        FOREIGN KEY (`TenantId`)      REFERENCES `Tenants`      (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_PaymentInvoices_Patients_PatientId`
        FOREIGN KEY (`PatientId`)     REFERENCES `Patients`     (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_PaymentInvoices_Appointments_AppointmentId`
        FOREIGN KEY (`AppointmentId`) REFERENCES `Appointments` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- MonthlyReports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MonthlyReports` (
    `Id`                     INT           NOT NULL AUTO_INCREMENT,
    `TenantId`               INT           NOT NULL,
    `Month`                  INT           NOT NULL,
    `Year`                   INT           NOT NULL,
    `TotalAppointments`      INT           NOT NULL DEFAULT 0,
    `CompletedAppointments`  INT           NOT NULL DEFAULT 0,
    `CancelledAppointments`  INT           NOT NULL DEFAULT 0,
    `NoShowAppointments`     INT           NOT NULL DEFAULT 0,
    `TotalRevenue`           DECIMAL(18,2) NOT NULL DEFAULT 0,
    `PendingRevenue`         DECIMAL(18,2) NOT NULL DEFAULT 0,
    `NewPatients`            INT           NOT NULL DEFAULT 0,
    `GeneratedAt`            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_MonthlyReports_TenantId_Month_Year` (`TenantId`, `Month`, `Year`),
    CONSTRAINT `FK_MonthlyReports_Tenants_TenantId`
        FOREIGN KEY (`TenantId`) REFERENCES `Tenants` (`Id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
