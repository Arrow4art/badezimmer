import { setEmailResult } from "@/lib/catalog";
import { sendMail } from "@/lib/email";
import { orderMessage } from "@/lib/order-text";
import type { Order } from "@/lib/types";

export async function notifyOrder(order: Order): Promise<Order> {
  if (order.emailSent || order.emailNote) return order;
  if (order.status !== "bezahlt" && order.status !== "anfrage") return order;
  const message = orderMessage(order);
  const result = await sendMail({
    to: order.customer.email,
    subject: message.subject,
    text: message.text,
  });
  await setEmailResult(order.id, result.sent, result.note);
  return { ...order, emailSent: result.sent, emailNote: result.note };
}
