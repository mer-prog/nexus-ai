import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") ?? "revenue";
  const orgId = user.organizationId;

  let csvContent = "";

  if (type === "revenue") {
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: orgId },
      orderBy: { issuedAt: "desc" },
    });

    csvContent = "ID,Amount,Status,Issued At,Paid At\n";
    for (const inv of invoices) {
      csvContent += `${inv.id},${inv.amount},${inv.status},${inv.issuedAt.toISOString()},${inv.paidAt?.toISOString() ?? ""}\n`;
    }
  } else if (type === "customers") {
    const customers = await prisma.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    csvContent = "ID,Name,Email,Company,Status,Created At\n";
    for (const c of customers) {
      csvContent += `${c.id},"${c.name}","${c.email}","${c.company ?? ""}",${c.status},${c.createdAt.toISOString()}\n`;
    }
  }

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
