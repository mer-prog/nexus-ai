import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Organizations ---
  const org1 = await prisma.organization.create({
    data: {
      name: "Acme Corporation",
      slug: "acme-corp",
      plan: "PRO",
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "TechStart Inc",
      slug: "techstart",
      plan: "ENTERPRISE",
    },
  });

  console.log(`Created organizations: ${org1.name}, ${org2.name}`);

  // --- Users ---
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Yuki Tanaka",
        email: "admin@acme.com",
        password: hashedPassword,
        role: "ADMIN",
        organizationId: org1.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sarah Chen",
        email: "manager@acme.com",
        password: hashedPassword,
        role: "MANAGER",
        organizationId: org1.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "James Wilson",
        email: "member@acme.com",
        password: hashedPassword,
        role: "MEMBER",
        organizationId: org1.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Emily Rodriguez",
        email: "admin@techstart.com",
        password: hashedPassword,
        role: "ADMIN",
        organizationId: org2.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Michael Park",
        email: "member@techstart.com",
        password: hashedPassword,
        role: "MEMBER",
        organizationId: org2.id,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // --- Customers ---
  const customerNames = [
    { name: "Alice Johnson", company: "DigitalWave", email: "alice@digitalwave.io" },
    { name: "Bob Martinez", company: "CloudSync Pro", email: "bob@cloudsync.com" },
    { name: "Carla Nguyen", company: "DataPulse", email: "carla@datapulse.co" },
    { name: "David Kim", company: "NeonApps", email: "david@neonapps.dev" },
    { name: "Eva Schmidt", company: "StreamLine AI", email: "eva@streamlineai.com" },
    { name: "Frank Okafor", company: "ByteForge", email: "frank@byteforge.io" },
    { name: "Grace Liu", company: "PixelCraft", email: "grace@pixelcraft.co" },
    { name: "Hassan Ali", company: "Nexova Tech", email: "hassan@nexova.tech" },
    { name: "Irene Costa", company: "FlowMetrics", email: "irene@flowmetrics.com" },
    { name: "Jack Thompson", company: "CyberShield", email: "jack@cybershield.net" },
    { name: "Keiko Yamamoto", company: "SakuraSoft", email: "keiko@sakurasoft.jp" },
    { name: "Lucas Brown", company: "GreenGrid", email: "lucas@greengrid.eco" },
    { name: "Maria Santos", company: "QuickPay", email: "maria@quickpay.co" },
    { name: "Nathan Wright", company: "DevForge", email: "nathan@devforge.dev" },
    { name: "Olivia Chen", company: "BrightPath", email: "olivia@brightpath.io" },
    { name: "Peter Ivanov", company: "RocketScale", email: "peter@rocketscale.com" },
    { name: "Quinn Taylor", company: "HealthPulse", email: "quinn@healthpulse.med" },
    { name: "Rosa Garcia", company: "EduTech Pro", email: "rosa@edutechpro.com" },
    { name: "Samuel Lee", company: "FinTrack", email: "samuel@fintrack.io" },
    { name: "Tina Müller", company: "AutoFlow", email: "tina@autoflow.de" },
    { name: "Umar Patel", company: "SmartHub", email: "umar@smarthub.com" },
    { name: "Victoria Ross", company: "PeakPerform", email: "victoria@peakperform.co" },
    { name: "William Zhang", company: "AgileStack", email: "william@agilestack.io" },
    { name: "Xin Wang", company: "CoreLogic", email: "xin@corelogic.tech" },
    { name: "Yara Hussein", company: "SparkLabs", email: "yara@sparklabs.ai" },
    { name: "Zachary Bell", company: "InfoSync", email: "zachary@infosync.com" },
    { name: "Aiko Sato", company: "BlueWave", email: "aiko@bluewave.jp" },
    { name: "Brian Cooper", company: "TrustNet", email: "brian@trustnet.io" },
    { name: "Diana Flores", company: "LightYear", email: "diana@lightyear.co" },
    { name: "Erik Johansson", company: "NordStack", email: "erik@nordstack.se" },
    { name: "Fatima Zahra", company: "Atlas AI", email: "fatima@atlasai.com" },
    { name: "George Martin", company: "SignalCo", email: "george@signalco.io" },
    { name: "Hannah Park", company: "VividLabs", email: "hannah@vividlabs.co" },
    { name: "Igor Petrov", company: "CodeMill", email: "igor@codemill.dev" },
    { name: "Julia Andersson", company: "SnapMetric", email: "julia@snapmetric.com" },
    { name: "Kevin O'Brien", company: "PathWise", email: "kevin@pathwise.io" },
    { name: "Leila Amiri", company: "ZenFlow", email: "leila@zenflow.co" },
    { name: "Marco Rossi", company: "VeloTech", email: "marco@velotech.it" },
    { name: "Nina Volkov", company: "Synapse AI", email: "nina@synapseai.com" },
    { name: "Oscar Mendez", company: "AquaLab", email: "oscar@aqualab.tech" },
    { name: "Priya Sharma", company: "InnoVault", email: "priya@innovault.in" },
    { name: "Remy Dubois", company: "VertexHub", email: "remy@vertexhub.fr" },
    { name: "Sofia Torres", company: "PulsarTech", email: "sofia@pulsartech.co" },
    { name: "Thomas Weber", company: "DataNest", email: "thomas@datanest.de" },
    { name: "Uma Krishnan", company: "FluxCode", email: "uma@fluxcode.io" },
    { name: "Vincent Lam", company: "HorizonX", email: "vincent@horizonx.com" },
    { name: "Wendy Zhao", company: "NimbusNet", email: "wendy@nimbusnet.cn" },
    { name: "Xavier Durand", company: "OptiCore", email: "xavier@opticore.fr" },
    { name: "Yuki Hashimoto", company: "FusionLab", email: "yuki@fusionlab.jp" },
    { name: "Zara Mitchell", company: "ClearView", email: "zara@clearview.co" },
  ];

  const statuses: Array<"ACTIVE" | "INACTIVE" | "CHURNED"> = ["ACTIVE", "INACTIVE", "CHURNED"];

  const customers = await Promise.all(
    customerNames.map((c, i) =>
      prisma.customer.create({
        data: {
          name: c.name,
          email: c.email,
          company: c.company,
          status: i < 35 ? "ACTIVE" : i < 43 ? "INACTIVE" : "CHURNED",
          organizationId: i < 30 ? org1.id : org2.id,
        },
      })
    )
  );

  console.log(`Created ${customers.length} customers`);

  // --- Subscriptions ---
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        plan: "PRO",
        status: "ACTIVE",
        currentPeriodEnd: new Date("2026-03-15"),
        organizationId: org1.id,
      },
    }),
    prisma.subscription.create({
      data: {
        plan: "ENTERPRISE",
        status: "ACTIVE",
        currentPeriodEnd: new Date("2026-06-01"),
        organizationId: org2.id,
      },
    }),
  ]);

  console.log(`Created ${subscriptions.length} subscriptions`);

  // --- Invoices ---
  const invoiceData: Array<{
    amount: number;
    status: "PAID" | "PENDING" | "OVERDUE";
    issuedAt: Date;
    paidAt: Date | null;
    organizationId: string;
  }> = [];

  for (let i = 0; i < 30; i++) {
    const isOrg1 = i < 18;
    const orgId = isOrg1 ? org1.id : org2.id;
    const baseAmount = isOrg1 ? 99 : 299;
    const amount = baseAmount + Math.floor(Math.random() * 200);
    const monthsAgo = Math.floor(i / 2);
    const issuedAt = new Date();
    issuedAt.setMonth(issuedAt.getMonth() - monthsAgo);

    let status: "PAID" | "PENDING" | "OVERDUE";
    let paidAt: Date | null = null;

    if (i < 20) {
      status = "PAID";
      paidAt = new Date(issuedAt);
      paidAt.setDate(paidAt.getDate() + Math.floor(Math.random() * 14) + 1);
    } else if (i < 26) {
      status = "PENDING";
    } else {
      status = "OVERDUE";
    }

    invoiceData.push({ amount, status, issuedAt, paidAt, organizationId: orgId });
  }

  const invoices = await Promise.all(
    invoiceData.map((inv) =>
      prisma.invoice.create({ data: inv })
    )
  );

  console.log(`Created ${invoices.length} invoices`);

  // --- AI Conversations ---
  const conversations = await Promise.all([
    prisma.aiConversation.create({
      data: {
        title: "Monthly Revenue Analysis",
        userId: users[0].id,
        messages: {
          create: [
            { role: "USER", content: "Show me the revenue trends for last quarter" },
            { role: "ASSISTANT", content: "Based on the data, your revenue grew 12.5% last quarter. The main growth drivers were the Enterprise tier upgrades in January and new customer acquisitions in February. Would you like a detailed breakdown by plan?" },
            { role: "USER", content: "Yes, break it down by plan" },
            { role: "ASSISTANT", content: "Here's the breakdown:\n\n- **Free**: $0 (42 customers)\n- **Pro**: $18,810 (19 customers, +8.2%)\n- **Enterprise**: $35,880 (12 customers, +15.1%)\n\nEnterprise tier is showing the strongest growth momentum." },
          ],
        },
      },
    }),
    prisma.aiConversation.create({
      data: {
        title: "Customer Churn Prediction",
        userId: users[0].id,
        messages: {
          create: [
            { role: "USER", content: "Which customers are at risk of churning?" },
            { role: "ASSISTANT", content: "I've identified 7 customers showing churn risk signals:\n\n1. **ClearView** - No login in 45 days\n2. **PulsarTech** - Support tickets up 300%\n3. **DataNest** - Downgraded plan last month\n\nWould you like me to suggest retention strategies?" },
          ],
        },
      },
    }),
    prisma.aiConversation.create({
      data: {
        title: "Team Performance Overview",
        userId: users[3].id,
        messages: {
          create: [
            { role: "USER", content: "How is our sales team performing this month?" },
            { role: "ASSISTANT", content: "Your sales team is on track to exceed monthly targets by 15%. Key highlights:\n\n- **New deals closed**: 8 (target: 6)\n- **Pipeline value**: $124,500\n- **Average deal size**: $2,450 (+12% vs last month)\n\nTop performer: Michael Park with 3 closed deals." },
          ],
        },
      },
    }),
  ]);

  console.log(`Created ${conversations.length} AI conversations`);

  // --- Notifications ---
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        title: "New Customer Signup",
        message: "ClearView has signed up for the Pro plan",
        read: false,
        userId: users[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Invoice Overdue",
        message: "Invoice #INV-027 from DataNest is 15 days overdue",
        read: false,
        userId: users[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Team Member Joined",
        message: "James Wilson has been added to Acme Corporation",
        read: true,
        userId: users[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Monthly Report Ready",
        message: "Your February 2026 analytics report is ready to view",
        read: false,
        userId: users[3].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Subscription Renewal",
        message: "Your Enterprise plan will renew on June 1, 2026",
        read: true,
        userId: users[3].id,
      },
    }),
  ]);

  console.log(`Created ${notifications.length} notifications`);

  // --- Activity Logs ---
  const activityLogs = await Promise.all([
    prisma.activityLog.create({
      data: {
        action: "user.login",
        details: "Logged in from 192.168.1.100",
        userId: users[0].id,
        organizationId: org1.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "customer.created",
        details: "Added new customer: ClearView",
        userId: users[1].id,
        organizationId: org1.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "invoice.sent",
        details: "Sent invoice #INV-031 to BlueWave ($299)",
        userId: users[0].id,
        organizationId: org1.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "subscription.upgraded",
        details: "Upgraded organization plan from Pro to Enterprise",
        userId: users[3].id,
        organizationId: org2.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "user.invited",
        details: "Invited michael@techstart.com as Member",
        userId: users[3].id,
        organizationId: org2.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "settings.updated",
        details: "Updated billing email address",
        userId: users[0].id,
        organizationId: org1.id,
      },
    }),
  ]);

  console.log(`Created ${activityLogs.length} activity logs`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
