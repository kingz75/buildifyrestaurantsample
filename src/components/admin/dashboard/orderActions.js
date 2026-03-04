import { getOrderBreakdown } from "../../../utils/billing";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (value) => `N${Number(value || 0).toLocaleString()}`;

export const markOrderAsPaid = (orderId, setOrders, updateOrder) => {
  setOrders((prev) =>
    prev.map((order) =>
      order.id === orderId ? { ...order, paymentStatus: "Paid" } : order,
    ),
  );

  return updateOrder(orderId, { paymentStatus: "Paid" });
};

export const updateOrderStatusWithGuard = async ({
  orderId,
  status,
  orders,
  getOrderLock,
  updateOrder,
  saveNotification,
}) => {
  const order = orders.find((item) => item.id === orderId);
  const previousStatus = order?.status;

  const lock = getOrderLock(orderId);
  if (lock && lock.userType === "customer") {
    alert("Cannot update: Customer is currently editing this order");
    return;
  }

  await updateOrder(orderId, { status });

  if (order && previousStatus !== status) {
    saveNotification({
      type: "status_change",
      title: "Order Status Updated",
      message: `Table ${order.table}: ${previousStatus} -> ${status}`,
      table: order.table,
      orderId,
    });
  }
};

export const openInvoiceWindow = (order) => {
  const breakdown = getOrderBreakdown(order);
  const itemsHtml = (order.items || [])
    .map(
      (item) =>
        `<tr>
          <td>${escapeHtml(item.qty)}x ${escapeHtml(item.name)}</td>
          <td align="right">${formatCurrency(Number(item.price) * Number(item.qty))}</td>
        </tr>`,
    )
    .join("");

  const html = `<html><body style="font-family:serif;padding:40px;max-width:500px;margin:0 auto">
      <h1 style="color:#c17f2a;border-bottom:2px solid #c17f2a;padding-bottom:8px">Grand Table Restaurant</h1>
      <p>Invoice #${escapeHtml(String(order.id || "").toUpperCase())} | Table #${escapeHtml(order.table)}</p>
      <p>Date: ${new Date(order.timestamp).toLocaleString()}</p>
      <hr/>
      <table width="100%">${itemsHtml}</table>
      <hr/>
      <table width="100%">
        <tr><td>Subtotal</td><td align="right">${formatCurrency(breakdown.subtotal)}</td></tr>
        <tr><td>Service Charge</td><td align="right">${formatCurrency(breakdown.serviceCharge)}</td></tr>
        <tr><td>VAT</td><td align="right">${formatCurrency(breakdown.vat)}</td></tr>
        <tr><td>Tax</td><td align="right">${formatCurrency(breakdown.tax)}</td></tr>
        <tr><td><b>Total</b></td><td align="right"><b>${formatCurrency(breakdown.total)}</b></td></tr>
      </table>
      <p>Payment: ${escapeHtml(order.paymentStatus)}</p>
      ${
        order.specialInstructions
          ? `<p>Notes: ${escapeHtml(order.specialInstructions)}</p>`
          : ""
      }
      <script>window.print()</script></body></html>`;

  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) return;
  invoiceWindow.document.write(html);
  invoiceWindow.document.close();
};
