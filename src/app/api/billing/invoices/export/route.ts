import { prisma } from "@/lib/db";
import { errorResponse, getAuthenticatedUser } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { issuedAt: "desc" },
  });

  let csv = "Invoice ID,Amount,Status,Issued Date,Paid Date\n";
  for (const inv of invoices) {
    csv += `${inv.id},$${inv.amount.toFixed(2)},${inv.status},${inv.issuedAt.toISOString().slice(0, 10)},${inv.paidAt ? inv.paidAt.toISOString().slice(0, 10) : ""}\n`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="invoices-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
