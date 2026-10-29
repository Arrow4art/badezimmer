import { claimTelegramAlert, setEmailResult } from "@/lib/catalog";
import { sendMail } from "@/lib/email";
import { orderMessage, ownerAlert } from "@/lib/order-text";
import { siteUrl } from "@/lib/site";
import { sendTelegram } from "@/lib/telegram";
import type { Order } from "@/lib/types";

export async function notifyOrder(order: Order): Promise<Order> {
  if (order.emailSent || order.emailNote) return order;
  if (order.status !== "bezahlt" && order.status !== "anfrage" && order.status !== "nachnahme") return order;
  if (await claimTelegramAlert(order.id)) await sendTelegram(ownerAlert(order, `${siteUrl()}/admin#${order.id}`));
  const message = orderMessage(order);
  const result = await sendMail({
    to: order.customer.email,
    subject: message.subject,
    text: message.text,
  });
  await setEmailResult(order.id, result.sent, result.note);
  return { ...order, emailSent: result.sent, emailNote: result.note };
}
