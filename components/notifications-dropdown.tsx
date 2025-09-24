"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scrollarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, CheckCircle, Wrench, Coins, Gift, Calendar, X, Check, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Notification {
  id: number
  type: "repair_update" | "ecopoints_earned" | "discount_available" | "repair_completed" | "system"
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  onMarkAsRead?: (id: number) => void
  onMarkAllAsRead?: () => void
  onDeleteNotification?: (id: number) => void
  className?: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "repair_update":
      return <Wrench className="w-5 h-5 text-accent" />
    case "ecopoints_earned":
      return <Coins className="w-5 h-5 text-primary" />
    case "discount_available":
      return <Gift className="w-5 h-5 text-accent" />
    case "repair_completed":
      return <CheckCircle className="w-5 h-5 text-primary" />
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />
  }
}

const getNotificationBgColor = (type: string, read: boolean) => {
  if (read) return "bg-muted/30 border-border"

  switch (type) {
    case "repair_update":
      return "bg-accent/5 border-accent/20"
    case "ecopoints_earned":
      return "bg-primary/5 border-primary/20"
    case "discount_available":
      return "bg-accent/5 border-accent/20"
    case "repair_completed":
      return "bg-primary/5 border-primary/20"
    default:
      return "bg-muted/30 border-border"
  }
}

export function NotificationsDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  className,
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: number) => {
    onMarkAsRead?.(id)
  }

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.()
  }

  const handleDeleteNotification = (id: number) => {
    onDeleteNotification?.(id)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative text-foreground hover:bg-muted", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 bg-background border border-border shadow-lg">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    {unreadCount} new
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-muted-foreground hover:text-primary"
                  disabled={unreadCount === 0}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mb-3" />
                  <h4 className="font-medium text-foreground mb-1">No notifications</h4>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200 hover:shadow-sm group",
                        getNotificationBgColor(notification.type, notification.read),
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5
                              className={cn(
                                "font-medium text-sm leading-tight",
                                notification.read ? "text-muted-foreground" : "text-foreground",
                              )}
                            >
                              {notification.title}
                            </h5>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-6 w-6 p-0 hover:bg-primary/10"
                                >
                                  <Check className="w-3 h-3 text-primary" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="h-6 w-6 p-0 hover:bg-destructive/10"
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {notification.time}
                            </div>

                            {notification.actionUrl && notification.actionText && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 p-1"
                              >
                                {notification.actionText}
                              </Button>
                            )}
                          </div>

                          {!notification.read && (
                            <div className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="border-t border-border p-3">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/5"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Notification toast component for real-time notifications
export function NotificationToast({
  notification,
  onClose,
  className,
}: {
  notification: Notification
  onClose: () => void
  className?: string
}) {
  return (
    <Card
      className={cn(
        "fixed top-4 right-4 w-80 z-50 shadow-lg border-2 animate-slide-in-right",
        getNotificationBgColor(notification.type, false),
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-foreground text-sm mb-1">{notification.title}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>

            {notification.actionUrl && notification.actionText && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 p-1"
              >
                {notification.actionText}
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-muted">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing notifications state
export function useNotifications(initialNotifications: Notification[] = []) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
    }
    setNotifications((prev) => [newNotification, ...prev])
    return newNotification
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadCount,
  }
}
