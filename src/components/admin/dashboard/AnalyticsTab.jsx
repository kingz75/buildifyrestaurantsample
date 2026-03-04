import { ORDER_STATUSES, STATUS_COLORS } from "../../../data/constants";
import { fmt } from "../../../utils/storage";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AnalyticsTab({
  realOrders,
  todayOrders,
  todayRevenue,
  todayPendingRevenue,
  totalRevenue,
  pendingRevenue,
  darkMode,
}) {
  const cardClass = darkMode
    ? "border-[#2a2a3a] bg-[#17171f]"
    : "border-[#e0e0e5] bg-white";
  const mutedClass = darkMode ? "text-[#6a6a8a]" : "text-[#646485]";
  const textClass = darkMode ? "text-[#e8e0f0]" : "text-[#1a1a2e]";
  const barTrackClass = darkMode ? "bg-[#1a1a22]" : "bg-[#eeeeee]";

  const paidTodayOrders = todayOrders.filter(
    (order) => order.paymentStatus === "Paid",
  );
  const paidAllOrders = realOrders.filter((order) => order.paymentStatus === "Paid");

  const topItems = (() => {
    const counts = {};
    realOrders.forEach((order) =>
      order.items?.forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      }),
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  })();

  const hourlyCounts = (() => {
    const counts = {};
    realOrders.forEach((order) => {
      const hour = new Date(order.timestamp).getHours();
      counts[hour] = (counts[hour] || 0) + 1;
    });
    return counts;
  })();
  const maxHourCount = Math.max(...Object.values(hourlyCounts), 1);

  const weeklyCounts = (() => {
    const counts = {};
    realOrders.forEach((order) => {
      const day = new Date(order.timestamp).getDay();
      counts[day] = (counts[day] || 0) + 1;
    });
    return counts;
  })();
  const maxDayCount = Math.max(...Object.values(weeklyCounts), 1);

  const monthlyCounts = (() => {
    const counts = {};
    realOrders.forEach((order) => {
      const month = new Date(order.timestamp).getMonth();
      counts[month] = (counts[month] || 0) + 1;
    });
    return counts;
  })();
  const maxMonthCount = Math.max(...Object.values(monthlyCounts), 1);

  return (
    <div>
      <div className="mb-5 text-[18px] font-bold">Analytics</div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`rounded-xl border p-5 ${cardClass}`}>
          <div className={`mb-3 text-sm ${mutedClass}`}>Daily Revenue Summary</div>
          {[
            ["Paid Revenue", todayRevenue],
            ["Paid Orders", paidTodayOrders.length],
            ["Pending", todayPendingRevenue],
          ].map(([label, value]) => (
            <div
              key={label}
              className={`flex items-center justify-between border-b py-2 text-sm ${darkMode ? "border-[#2a2a3a]" : "border-[#e0e0e5]"}`}
            >
              <span className={mutedClass}>{label}</span>
              <span className="font-bold text-[#7c5ccc]">
                {typeof value === "number" && label.includes("Orders")
                  ? value
                  : fmt(value)}
              </span>
            </div>
          ))}
          <div className="mt-3 rounded-lg bg-[#7c5ccc]/15 p-3 text-center">
            <div className={`text-[11px] ${mutedClass}`}>Total Daily Orders</div>
            <div className="text-[26px] font-bold text-[#7c5ccc]">
              {todayOrders.length}
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${cardClass}`}>
          <div className={`mb-3 text-sm ${mutedClass}`}>All-Time Summary</div>
          {[
            ["Total Paid", totalRevenue],
            ["Pending", pendingRevenue],
            ["Paid Orders", paidAllOrders.length],
          ].map(([label, value]) => (
            <div
              key={label}
              className={`flex items-center justify-between border-b py-2 text-sm ${darkMode ? "border-[#2a2a3a]" : "border-[#e0e0e5]"}`}
            >
              <span className={mutedClass}>{label}</span>
              <span className="font-bold text-[#7c5ccc]">
                {typeof value === "number" && label.includes("Orders")
                  ? value
                  : fmt(value)}
              </span>
            </div>
          ))}
          <div className="mt-3 rounded-lg bg-[#7c5ccc]/15 p-3 text-center">
            <div className={`text-[11px] ${mutedClass}`}>All Orders</div>
            <div className="text-[26px] font-bold text-[#7c5ccc]">
              {realOrders.length}
            </div>
          </div>
        </div>
      </div>

      <div className={`mb-5 rounded-xl border p-5 ${cardClass}`}>
        <div className={`mb-3 text-sm ${mutedClass}`}>Orders by Status</div>
        {ORDER_STATUSES.map((status) => {
          const count = realOrders.filter((order) => order.status === status).length;
          const percent = realOrders.length
            ? Math.round((count / realOrders.length) * 100)
            : 0;
          return (
            <div key={status} className="mb-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span style={{ color: STATUS_COLORS[status] }}>{status}</span>
                <span className={textClass}>{count}</span>
              </div>
              <div className={`h-1.5 rounded ${barTrackClass}`}>
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mb-5 rounded-xl border p-5 ${cardClass}`}>
        <div className={`mb-3 text-sm ${mutedClass}`}>Top Ordered Items</div>
        {topItems.map(([name, quantity]) => (
          <div
            key={name}
            className={`flex items-center justify-between border-b py-2 text-[13px] ${darkMode ? "border-[#2a2a3a]" : "border-[#e0e0e5]"}`}
          >
            <span className={textClass}>{name}</span>
            <span className="font-semibold text-[#7c5ccc]">{quantity}x ordered</span>
          </div>
        ))}
        {realOrders.length === 0 && (
          <div className={`p-5 text-center text-sm ${mutedClass}`}>
            No order data yet
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={`rounded-xl border p-5 ${cardClass}`}>
          <div className={`mb-3 text-sm ${mutedClass}`}>Busy by Hour</div>
          {Object.entries(hourlyCounts)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([hour, count]) => (
              <div key={hour} className="mb-1.5">
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className={textClass}>{hour}:00</span>
                  <span className={count === maxHourCount ? "text-[#22c55e]" : mutedClass}>
                    {count} orders
                  </span>
                </div>
                <div className={`h-1.5 rounded ${barTrackClass}`}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(count / maxHourCount) * 100}%`,
                      backgroundColor: count === maxHourCount ? "#22c55e" : "#7c5ccc",
                    }}
                  />
                </div>
              </div>
            ))}
          {realOrders.length === 0 && (
            <div className={`p-2 text-center text-xs ${mutedClass}`}>No data</div>
          )}
        </div>

        <div className={`rounded-xl border p-5 ${cardClass}`}>
          <div className={`mb-3 text-sm ${mutedClass}`}>Busy by Day</div>
          {dayNames.map((day, index) => {
            const count = weeklyCounts[index] || 0;
            return (
              <div key={day} className="mb-1.5">
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className={textClass}>{day}</span>
                  <span className={count === maxDayCount ? "text-[#22c55e]" : mutedClass}>
                    {count} orders
                  </span>
                </div>
                <div className={`h-1.5 rounded ${barTrackClass}`}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(count / maxDayCount) * 100}%`,
                      backgroundColor: count === maxDayCount ? "#22c55e" : "#7c5ccc",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`rounded-xl border p-5 ${cardClass}`}>
          <div className={`mb-3 text-sm ${mutedClass}`}>Busy by Month</div>
          {monthNames.map((month, index) => {
            const count = monthlyCounts[index] || 0;
            return (
              <div key={month} className="mb-1.5">
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className={textClass}>{month}</span>
                  <span className={count === maxMonthCount ? "text-[#22c55e]" : mutedClass}>
                    {count} orders
                  </span>
                </div>
                <div className={`h-1.5 rounded ${barTrackClass}`}>
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(count / maxMonthCount) * 100}%`,
                      backgroundColor: count === maxMonthCount ? "#22c55e" : "#7c5ccc",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
