-- =============================================
-- Nexus AI — Neon PostgreSQL Full Migration + Seed
-- Usage: Paste into Neon SQL Editor and run
-- =============================================

BEGIN;

-- =============================================
-- 1. DROP TABLES (children first)
-- =============================================
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "ai_messages" CASCADE;
DROP TABLE IF EXISTS "ai_conversations" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "organizations" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- =============================================
-- 2. DROP & CREATE ENUMS
-- =============================================
DROP TYPE IF EXISTS "Plan" CASCADE;
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

DROP TYPE IF EXISTS "Role" CASCADE;
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

DROP TYPE IF EXISTS "CustomerStatus" CASCADE;
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CHURNED');

DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

DROP TYPE IF EXISTS "InvoiceStatus" CASCADE;
CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

DROP TYPE IF EXISTS "MessageRole" CASCADE;
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- =============================================
-- 3. CREATE TABLES
-- =============================================

-- Organizations
CREATE TABLE "organizations" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "slug"      TEXT NOT NULL,
    "plan"      "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- Users
CREATE TABLE "users" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "password"       TEXT NOT NULL,
    "role"           "Role" NOT NULL DEFAULT 'MEMBER',
    "organizationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Customers
CREATE TABLE "customers" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "company"        TEXT,
    "status"         "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customers_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Subscriptions
CREATE TABLE "subscriptions" (
    "id"               TEXT NOT NULL,
    "plan"             "Plan" NOT NULL DEFAULT 'FREE',
    "status"           "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "organizationId"   TEXT NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Invoices
CREATE TABLE "invoices" (
    "id"             TEXT NOT NULL,
    "amount"         DOUBLE PRECISION NOT NULL,
    "status"         "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "issuedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt"         TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invoices_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AI Conversations
CREATE TABLE "ai_conversations" (
    "id"        TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_conversations_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AI Messages
CREATE TABLE "ai_messages" (
    "id"             TEXT NOT NULL,
    "role"           "MessageRole" NOT NULL,
    "content"        TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_messages_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notifications
CREATE TABLE "notifications" (
    "id"        TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "read"      BOOLEAN NOT NULL DEFAULT false,
    "userId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Activity Logs
CREATE TABLE "activity_logs" (
    "id"             TEXT NOT NULL,
    "action"         TEXT NOT NULL,
    "details"        TEXT,
    "userId"         TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activity_logs_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activity_logs_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Prisma Migrations tracking table
CREATE TABLE "_prisma_migrations" (
    "id"                  VARCHAR(36) NOT NULL,
    "checksum"            VARCHAR(64) NOT NULL,
    "finished_at"         TIMESTAMP WITH TIME ZONE,
    "migration_name"      VARCHAR(255) NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMP WITH TIME ZONE,
    "started_at"          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- =============================================
-- 4. SEED DATA
-- =============================================

-- --- Organizations ---
INSERT INTO "organizations" ("id", "name", "slug", "plan", "createdAt", "updatedAt") VALUES
    ('org_acme',      'Acme Corporation', 'acme-corp',  'PRO',        NOW(), NOW()),
    ('org_techstart', 'TechStart Inc',    'techstart',  'ENTERPRISE', NOW(), NOW());

-- --- Users (password: password123) ---
INSERT INTO "users" ("id", "name", "email", "password", "role", "organizationId", "createdAt") VALUES
    ('usr_yuki',    'Yuki Tanaka',      'admin@acme.com',       '$2b$10$oJps6Y8uW3OUbLBipeqbJOzBOhFfBV4Les1UV8evMo3WqBjb50zOa', 'ADMIN',   'org_acme',      NOW()),
    ('usr_sarah',   'Sarah Chen',       'manager@acme.com',     '$2b$10$oJps6Y8uW3OUbLBipeqbJOzBOhFfBV4Les1UV8evMo3WqBjb50zOa', 'MANAGER', 'org_acme',      NOW()),
    ('usr_james',   'James Wilson',     'member@acme.com',      '$2b$10$oJps6Y8uW3OUbLBipeqbJOzBOhFfBV4Les1UV8evMo3WqBjb50zOa', 'MEMBER',  'org_acme',      NOW()),
    ('usr_emily',   'Emily Rodriguez',  'admin@techstart.com',  '$2b$10$oJps6Y8uW3OUbLBipeqbJOzBOhFfBV4Les1UV8evMo3WqBjb50zOa', 'ADMIN',   'org_techstart', NOW()),
    ('usr_michael', 'Michael Park',     'member@techstart.com', '$2b$10$oJps6Y8uW3OUbLBipeqbJOzBOhFfBV4Les1UV8evMo3WqBjb50zOa', 'MEMBER',  'org_techstart', NOW());

-- --- Customers (50 total: 35 ACTIVE, 8 INACTIVE, 7 CHURNED) ---
INSERT INTO "customers" ("id", "name", "email", "company", "status", "organizationId", "createdAt") VALUES
    ('cust_01', 'Alice Johnson',    'alice@digitalwave.io',    'DigitalWave',    'ACTIVE',   'org_acme', NOW()),
    ('cust_02', 'Bob Martinez',     'bob@cloudsync.com',       'CloudSync Pro',  'ACTIVE',   'org_acme', NOW()),
    ('cust_03', 'Carla Nguyen',     'carla@datapulse.co',      'DataPulse',      'ACTIVE',   'org_acme', NOW()),
    ('cust_04', 'David Kim',        'david@neonapps.dev',      'NeonApps',       'ACTIVE',   'org_acme', NOW()),
    ('cust_05', 'Eva Schmidt',      'eva@streamlineai.com',    'StreamLine AI',  'ACTIVE',   'org_acme', NOW()),
    ('cust_06', 'Frank Okafor',     'frank@byteforge.io',      'ByteForge',      'ACTIVE',   'org_acme', NOW()),
    ('cust_07', 'Grace Liu',        'grace@pixelcraft.co',     'PixelCraft',     'ACTIVE',   'org_acme', NOW()),
    ('cust_08', 'Hassan Ali',       'hassan@nexova.tech',      'Nexova Tech',    'ACTIVE',   'org_acme', NOW()),
    ('cust_09', 'Irene Costa',      'irene@flowmetrics.com',   'FlowMetrics',    'ACTIVE',   'org_acme', NOW()),
    ('cust_10', 'Jack Thompson',    'jack@cybershield.net',    'CyberShield',    'ACTIVE',   'org_acme', NOW()),
    ('cust_11', 'Keiko Yamamoto',   'keiko@sakurasoft.jp',     'SakuraSoft',     'ACTIVE',   'org_acme', NOW()),
    ('cust_12', 'Lucas Brown',      'lucas@greengrid.eco',     'GreenGrid',      'ACTIVE',   'org_acme', NOW()),
    ('cust_13', 'Maria Santos',     'maria@quickpay.co',       'QuickPay',       'ACTIVE',   'org_acme', NOW()),
    ('cust_14', 'Nathan Wright',    'nathan@devforge.dev',     'DevForge',       'ACTIVE',   'org_acme', NOW()),
    ('cust_15', 'Olivia Chen',      'olivia@brightpath.io',    'BrightPath',     'ACTIVE',   'org_acme', NOW()),
    ('cust_16', 'Peter Ivanov',     'peter@rocketscale.com',   'RocketScale',    'ACTIVE',   'org_acme', NOW()),
    ('cust_17', 'Quinn Taylor',     'quinn@healthpulse.med',   'HealthPulse',    'ACTIVE',   'org_acme', NOW()),
    ('cust_18', 'Rosa Garcia',      'rosa@edutechpro.com',     'EduTech Pro',    'ACTIVE',   'org_acme', NOW()),
    ('cust_19', 'Samuel Lee',       'samuel@fintrack.io',      'FinTrack',       'ACTIVE',   'org_acme', NOW()),
    ('cust_20', 'Tina Mueller',     'tina@autoflow.de',        'AutoFlow',       'ACTIVE',   'org_acme', NOW()),
    ('cust_21', 'Umar Patel',       'umar@smarthub.com',       'SmartHub',       'ACTIVE',   'org_acme', NOW()),
    ('cust_22', 'Victoria Ross',    'victoria@peakperform.co', 'PeakPerform',    'ACTIVE',   'org_acme', NOW()),
    ('cust_23', 'William Zhang',    'william@agilestack.io',   'AgileStack',     'ACTIVE',   'org_acme', NOW()),
    ('cust_24', 'Xin Wang',         'xin@corelogic.tech',      'CoreLogic',      'ACTIVE',   'org_acme', NOW()),
    ('cust_25', 'Yara Hussein',     'yara@sparklabs.ai',       'SparkLabs',      'ACTIVE',   'org_acme', NOW()),
    ('cust_26', 'Zachary Bell',     'zachary@infosync.com',    'InfoSync',       'ACTIVE',   'org_acme', NOW()),
    ('cust_27', 'Aiko Sato',        'aiko@bluewave.jp',        'BlueWave',       'ACTIVE',   'org_acme', NOW()),
    ('cust_28', 'Brian Cooper',     'brian@trustnet.io',        'TrustNet',       'ACTIVE',   'org_acme', NOW()),
    ('cust_29', 'Diana Flores',     'diana@lightyear.co',       'LightYear',      'ACTIVE',   'org_acme', NOW()),
    ('cust_30', 'Erik Johansson',   'erik@nordstack.se',        'NordStack',      'ACTIVE',   'org_acme', NOW()),
    ('cust_31', 'Fatima Zahra',     'fatima@atlasai.com',       'Atlas AI',       'ACTIVE',   'org_techstart', NOW()),
    ('cust_32', 'George Martin',    'george@signalco.io',       'SignalCo',       'ACTIVE',   'org_techstart', NOW()),
    ('cust_33', 'Hannah Park',      'hannah@vividlabs.co',      'VividLabs',      'ACTIVE',   'org_techstart', NOW()),
    ('cust_34', 'Igor Petrov',      'igor@codemill.dev',        'CodeMill',       'ACTIVE',   'org_techstart', NOW()),
    ('cust_35', 'Julia Andersson',  'julia@snapmetric.com',     'SnapMetric',     'ACTIVE',   'org_techstart', NOW()),
    ('cust_36', 'Kevin OBrien',     'kevin@pathwise.io',        'PathWise',       'INACTIVE', 'org_techstart', NOW()),
    ('cust_37', 'Leila Amiri',      'leila@zenflow.co',         'ZenFlow',        'INACTIVE', 'org_techstart', NOW()),
    ('cust_38', 'Marco Rossi',      'marco@velotech.it',        'VeloTech',       'INACTIVE', 'org_techstart', NOW()),
    ('cust_39', 'Nina Volkov',      'nina@synapseai.com',       'Synapse AI',     'INACTIVE', 'org_techstart', NOW()),
    ('cust_40', 'Oscar Mendez',     'oscar@aqualab.tech',       'AquaLab',        'INACTIVE', 'org_techstart', NOW()),
    ('cust_41', 'Priya Sharma',     'priya@innovault.in',       'InnoVault',      'INACTIVE', 'org_techstart', NOW()),
    ('cust_42', 'Remy Dubois',      'remy@vertexhub.fr',        'VertexHub',      'INACTIVE', 'org_techstart', NOW()),
    ('cust_43', 'Sofia Torres',     'sofia@pulsartech.co',      'PulsarTech',     'INACTIVE', 'org_techstart', NOW()),
    ('cust_44', 'Thomas Weber',     'thomas@datanest.de',       'DataNest',       'CHURNED',  'org_techstart', NOW()),
    ('cust_45', 'Uma Krishnan',     'uma@fluxcode.io',          'FluxCode',       'CHURNED',  'org_techstart', NOW()),
    ('cust_46', 'Vincent Lam',      'vincent@horizonx.com',     'HorizonX',       'CHURNED',  'org_techstart', NOW()),
    ('cust_47', 'Wendy Zhao',       'wendy@nimbusnet.cn',       'NimbusNet',      'CHURNED',  'org_techstart', NOW()),
    ('cust_48', 'Xavier Durand',    'xavier@opticore.fr',       'OptiCore',       'CHURNED',  'org_techstart', NOW()),
    ('cust_49', 'Yuki Hashimoto',   'yuki@fusionlab.jp',        'FusionLab',      'CHURNED',  'org_techstart', NOW()),
    ('cust_50', 'Zara Mitchell',    'zara@clearview.co',        'ClearView',      'CHURNED',  'org_techstart', NOW());

-- --- Subscriptions ---
INSERT INTO "subscriptions" ("id", "plan", "status", "currentPeriodEnd", "organizationId", "createdAt") VALUES
    ('sub_acme',      'PRO',        'ACTIVE', '2026-03-15 00:00:00.000', 'org_acme',      NOW()),
    ('sub_techstart', 'ENTERPRISE', 'ACTIVE', '2026-06-01 00:00:00.000', 'org_techstart', NOW());

-- --- Invoices (30 total: 20 PAID, 6 PENDING, 4 OVERDUE) ---
INSERT INTO "invoices" ("id", "amount", "status", "issuedAt", "paidAt", "organizationId", "createdAt") VALUES
    ('inv_01', 149,  'PAID',    NOW(),                        NOW() + INTERVAL '3 days',   'org_acme', NOW()),
    ('inv_02', 189,  'PAID',    NOW(),                        NOW() + INTERVAL '5 days',   'org_acme', NOW()),
    ('inv_03', 135,  'PAID',    NOW() - INTERVAL '1 month',  NOW() - INTERVAL '1 month'  + INTERVAL '7 days',  'org_acme', NOW()),
    ('inv_04', 210,  'PAID',    NOW() - INTERVAL '1 month',  NOW() - INTERVAL '1 month'  + INTERVAL '4 days',  'org_acme', NOW()),
    ('inv_05', 175,  'PAID',    NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '10 days', 'org_acme', NOW()),
    ('inv_06', 199,  'PAID',    NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months' + INTERVAL '6 days',  'org_acme', NOW()),
    ('inv_07', 125,  'PAID',    NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '8 days',  'org_acme', NOW()),
    ('inv_08', 245,  'PAID',    NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months' + INTERVAL '2 days',  'org_acme', NOW()),
    ('inv_09', 160,  'PAID',    NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '11 days', 'org_acme', NOW()),
    ('inv_10', 185,  'PAID',    NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '5 days',  'org_acme', NOW()),
    ('inv_11', 220,  'PAID',    NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '9 days',  'org_acme', NOW()),
    ('inv_12', 140,  'PAID',    NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '3 days',  'org_acme', NOW()),
    ('inv_13', 275,  'PAID',    NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months' + INTERVAL '7 days',  'org_acme', NOW()),
    ('inv_14', 155,  'PAID',    NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months' + INTERVAL '12 days', 'org_acme', NOW()),
    ('inv_15', 195,  'PAID',    NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months' + INTERVAL '4 days',  'org_acme', NOW()),
    ('inv_16', 230,  'PAID',    NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months' + INTERVAL '8 days',  'org_acme', NOW()),
    ('inv_17', 170,  'PAID',    NOW() - INTERVAL '8 months', NOW() - INTERVAL '8 months' + INTERVAL '6 days',  'org_acme', NOW()),
    ('inv_18', 205,  'PAID',    NOW() - INTERVAL '8 months', NOW() - INTERVAL '8 months' + INTERVAL '10 days', 'org_acme', NOW()),
    ('inv_19', 350,  'PAID',    NOW() - INTERVAL '9 months', NOW() - INTERVAL '9 months' + INTERVAL '5 days',  'org_techstart', NOW()),
    ('inv_20', 420,  'PAID',    NOW() - INTERVAL '9 months', NOW() - INTERVAL '9 months' + INTERVAL '9 days',  'org_techstart', NOW()),
    ('inv_21', 385,  'PENDING', NOW() - INTERVAL '10 months', NULL, 'org_techstart', NOW()),
    ('inv_22', 310,  'PENDING', NOW() - INTERVAL '10 months', NULL, 'org_techstart', NOW()),
    ('inv_23', 445,  'PENDING', NOW() - INTERVAL '11 months', NULL, 'org_techstart', NOW()),
    ('inv_24', 365,  'PENDING', NOW() - INTERVAL '11 months', NULL, 'org_techstart', NOW()),
    ('inv_25', 490,  'PENDING', NOW() - INTERVAL '12 months', NULL, 'org_techstart', NOW()),
    ('inv_26', 330,  'PENDING', NOW() - INTERVAL '12 months', NULL, 'org_techstart', NOW()),
    ('inv_27', 410,  'OVERDUE', NOW() - INTERVAL '13 months', NULL, 'org_techstart', NOW()),
    ('inv_28', 375,  'OVERDUE', NOW() - INTERVAL '13 months', NULL, 'org_techstart', NOW()),
    ('inv_29', 460,  'OVERDUE', NOW() - INTERVAL '14 months', NULL, 'org_techstart', NOW()),
    ('inv_30', 340,  'OVERDUE', NOW() - INTERVAL '14 months', NULL, 'org_techstart', NOW());

-- --- AI Conversations ---
INSERT INTO "ai_conversations" ("id", "title", "userId", "createdAt") VALUES
    ('conv_01', 'Monthly Revenue Analysis',  'usr_yuki',  NOW()),
    ('conv_02', 'Customer Churn Prediction', 'usr_yuki',  NOW()),
    ('conv_03', 'Team Performance Overview', 'usr_emily', NOW());

-- --- AI Messages ---
INSERT INTO "ai_messages" ("id", "role", "content", "conversationId", "createdAt") VALUES
    ('msg_01', 'USER',      'Show me the revenue trends for last quarter', 'conv_01', NOW()),
    ('msg_02', 'ASSISTANT', 'Based on the data, your revenue grew 12.5% last quarter. The main growth drivers were the Enterprise tier upgrades in January and new customer acquisitions in February. Would you like a detailed breakdown by plan?', 'conv_01', NOW() + INTERVAL '1 second'),
    ('msg_03', 'USER',      'Yes, break it down by plan', 'conv_01', NOW() + INTERVAL '2 seconds'),
    ('msg_04', 'ASSISTANT', E'Here''s the breakdown:\n\n- **Free**: $0 (42 customers)\n- **Pro**: $18,810 (19 customers, +8.2%)\n- **Enterprise**: $35,880 (12 customers, +15.1%)\n\nEnterprise tier is showing the strongest growth momentum.', 'conv_01', NOW() + INTERVAL '3 seconds'),
    ('msg_05', 'USER',      'Which customers are at risk of churning?', 'conv_02', NOW()),
    ('msg_06', 'ASSISTANT', E'I''ve identified 7 customers showing churn risk signals:\n\n1. **ClearView** - No login in 45 days\n2. **PulsarTech** - Support tickets up 300%\n3. **DataNest** - Downgraded plan last month\n\nWould you like me to suggest retention strategies?', 'conv_02', NOW() + INTERVAL '1 second'),
    ('msg_07', 'USER',      'How is our sales team performing this month?', 'conv_03', NOW()),
    ('msg_08', 'ASSISTANT', E'Your sales team is on track to exceed monthly targets by 15%. Key highlights:\n\n- **New deals closed**: 8 (target: 6)\n- **Pipeline value**: $124,500\n- **Average deal size**: $2,450 (+12% vs last month)\n\nTop performer: Michael Park with 3 closed deals.', 'conv_03', NOW() + INTERVAL '1 second');

-- --- Notifications ---
INSERT INTO "notifications" ("id", "title", "message", "read", "userId", "createdAt") VALUES
    ('notif_01', 'New Customer Signup',    'ClearView has signed up for the Pro plan',              false, 'usr_yuki',  NOW()),
    ('notif_02', 'Invoice Overdue',        'Invoice #INV-027 from DataNest is 15 days overdue',    false, 'usr_yuki',  NOW()),
    ('notif_03', 'Team Member Joined',     'James Wilson has been added to Acme Corporation',      true,  'usr_yuki',  NOW()),
    ('notif_04', 'Monthly Report Ready',   'Your February 2026 analytics report is ready to view', false, 'usr_emily', NOW()),
    ('notif_05', 'Subscription Renewal',   'Your Enterprise plan will renew on June 1, 2026',      true,  'usr_emily', NOW());

-- --- Activity Logs ---
INSERT INTO "activity_logs" ("id", "action", "details", "userId", "organizationId", "createdAt") VALUES
    ('log_01', 'user.login',            'Logged in from 192.168.1.100',                     'usr_yuki',  'org_acme',      NOW()),
    ('log_02', 'customer.created',      'Added new customer: ClearView',                    'usr_sarah', 'org_acme',      NOW()),
    ('log_03', 'invoice.sent',          'Sent invoice #INV-031 to BlueWave ($299)',          'usr_yuki',  'org_acme',      NOW()),
    ('log_04', 'subscription.upgraded', 'Upgraded organization plan from Pro to Enterprise', 'usr_emily', 'org_techstart', NOW()),
    ('log_05', 'user.invited',          'Invited michael@techstart.com as Member',           'usr_emily', 'org_techstart', NOW()),
    ('log_06', 'settings.updated',      'Updated billing email address',                     'usr_yuki',  'org_acme',      NOW());

-- =============================================
-- 5. PRISMA MIGRATIONS RECORD
-- =============================================
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") VALUES
    ('00000000-0000-0000-0000-000000000001', 'manual_neon_seed_sql', NOW(), '20260221000000_initial_setup', NULL, NULL, NOW(), 1);

COMMIT;
