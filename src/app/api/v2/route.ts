import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { placeOrder } from "@/lib/order-core";

/**
 * Reseller API — implements the de-facto "SMM panel API" contract (the
 * same shape used by Perfect Panel / JAP-style panels: one POST endpoint,
 * `key` + `action`, form-encoded or JSON body) so existing reseller tools
 * work against this panel without modification. See /api for docs +
 * key management.
 */

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PENDING_ADMIN: "Pending",
  PROCESSING: "Processing",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PARTIAL: "Partial",
  CANCELED: "Canceled",
  REFUNDED: "Canceled",
};

async function parseBody(req: Request): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = await req.json().catch(() => ({}));
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(json ?? {})) out[k] = String(v);
    return out;
  }

  const text = await req.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

export async function POST(req: Request) {
  const body = await parseBody(req);
  const key = body.key;

  if (!key) {
    return NextResponse.json({ error: "Missing API key." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { apiKey: key } });
  if (!user) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }
  if (user.blocked) {
    return NextResponse.json({ error: "Account is blocked." }, { status: 403 });
  }

  const action = body.action;

  switch (action) {
    case "services": {
      const services = await prisma.service.findMany({
        where: { active: true },
        include: { category: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(
        services.map((s) => ({
          service: s.id,
          name: s.name,
          category: s.category.name,
          type: s.serviceType,
          rate: s.pricePer1000.toString(),
          min: s.minQuantity,
          max: s.maxQuantity,
          refill: s.refillDays > 0,
          cancel: false,
        })),
      );
    }

    case "add": {
      const serviceId = body.service;
      const link = body.link ?? "";
      const quantity = Number(body.quantity);

      if (!serviceId) return NextResponse.json({ error: "Missing 'service'." }, { status: 400 });

      const result = await placeOrder({
        userId: user.id,
        serviceId,
        quantity,
        targetLink: link,
        source: "API",
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ order: 90000 + result.orderNumber });
    }

    case "status": {
      const orderCodesRaw = body.orders ?? body.order;
      if (!orderCodesRaw) {
        return NextResponse.json({ error: "Missing 'order' or 'orders'." }, { status: 400 });
      }

      const orderNumbers = orderCodesRaw
        .split(",")
        .map((s) => parseInt(s.trim(), 10) - 90000)
        .filter((n) => Number.isFinite(n));

      const orders = await prisma.order.findMany({
        where: { orderNumber: { in: orderNumbers }, userId: user.id },
      });

      const byNumber = new Map(orders.map((o) => [o.orderNumber, o]));

      const buildEntry = (order: (typeof orders)[number]) => ({
        charge: order.chargedAmount.toString(),
        start_count: 0,
        status: STATUS_LABELS[order.status] ?? order.status,
        remains: Math.max(0, order.quantity - order.deliveredQuantity),
        currency: "USD",
      });

      if (body.orders) {
        const out: Record<string, unknown> = {};
        for (const num of orderNumbers) {
          const order = byNumber.get(num);
          out[String(90000 + num)] = order
            ? buildEntry(order)
            : { error: "Order not found." };
        }
        return NextResponse.json(out);
      }

      const order = byNumber.get(orderNumbers[0]);
      if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
      return NextResponse.json(buildEntry(order));
    }

    case "balance": {
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
      return NextResponse.json({
        balance: (wallet?.balance.toNumber() ?? 0).toFixed(2),
        currency: "USD",
      });
    }

    default:
      return NextResponse.json(
        { error: "Unknown action. Use one of: services, add, status, balance." },
        { status: 400 },
      );
  }
}
