import { useState } from "react";
import { useNotifications } from "../components/NotificationContext";
import { FaBell } from "react-icons/fa";

export default function NotificationBell() {
  const { notifications, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        className="relative text-2xl"
        onClick={() => {
          setOpen(!open);
          markAllRead();
        }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md border p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-2 border-b text-sm">
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
