import React, { createContext, useContext, useMemo, useState } from "react";
import { Notification } from "../types";

interface NotificationsContextValue {
  items: Notification[];
  toast: Notification | null;
  setNotifications: (items: Notification[]) => void;
  addNotification: (item: Notification) => void;
  pushToast: (item: Notification) => void;
  clearToast: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Notification[]>([]);
  const [toast, setToast] = useState<Notification | null>(null);

  const setNotifications = (next: Notification[]) => setItems(next);
  const addNotification = (item: Notification) => setItems((prev) => [item, ...prev]);
  const pushToast = (item: Notification) => setToast(item);
  const clearToast = () => setToast(null);

  const value = useMemo(
    () => ({ items, toast, setNotifications, addNotification, pushToast, clearToast }),
    [items, toast]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("NotificationsContext missing");
  return ctx;
};
