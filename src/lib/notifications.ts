import { prisma } from "@/lib/db";

interface CreateNotificationParams {
  title: string;
  message: string;
  userId: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await prisma.notification.create({ data: params });
  notifySSEClients(params.userId, notification);
  return notification;
}

type SSEClient = {
  userId: string;
  controller: ReadableStreamDefaultController;
};

const sseClients: SSEClient[] = [];

export function addSSEClient(userId: string, controller: ReadableStreamDefaultController) {
  sseClients.push({ userId, controller });
}

export function removeSSEClient(controller: ReadableStreamDefaultController) {
  const index = sseClients.findIndex((c) => c.controller === controller);
  if (index !== -1) sseClients.splice(index, 1);
}

function notifySSEClients(userId: string, data: unknown) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    if (client.userId === userId) {
      try {
        client.controller.enqueue(encoder.encode(message));
      } catch {
        removeSSEClient(client.controller);
      }
    }
  }
}

export function broadcastToOrg(orgId: string, data: unknown) {
  void prisma.user.findMany({ where: { organizationId: orgId }, select: { id: true } }).then((users) => {
    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify(data)}\n\n`;
    for (const user of users) {
      for (const client of sseClients) {
        if (client.userId === user.id) {
          try {
            client.controller.enqueue(encoder.encode(message));
          } catch {
            removeSSEClient(client.controller);
          }
        }
      }
    }
  });
}
