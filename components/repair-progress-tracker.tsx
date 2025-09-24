"use client"

import type React from "react"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Package, CreditCard, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RepairStage {
  id: number
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completedAt?: string
  estimatedDuration?: string
}

export interface RepairProgressTrackerProps {
  currentStage: number
  stages: RepairStage[]
  className?: string
  variant?: "default" | "compact" | "detailed"
  showProgress?: boolean
  pendingActions?: { [stageId: number]: string }
}

const defaultStages: RepairStage[] = [
  {
    id: 1,
    name: "Request Booked",
    description: "Repair request submitted successfully",
    icon: Clock,
    estimatedDuration: "Immediate",
  },
  {
    id: 2,
    name: "Request Verified",
    description: "Shop confirmed availability & provided cost estimate",
    icon: CheckCircle,
    estimatedDuration: "1-2 hours",
  },
  {
    id: 3,
    name: "Device Delivered",
    description: "Device handed over to repair shop",
    icon: Package,
    estimatedDuration: "2-5 days",
  },
  {
    id: 4,
    name: "Payment & Rewards",
    description: "Payment completed & ecoPoints earned",
    icon: CreditCard,
    estimatedDuration: "Immediate",
  },
]

export function RepairProgressTracker({
  currentStage,
  stages = defaultStages,
  className,
  variant = "default",
  showProgress = true,
  pendingActions = {},
}: RepairProgressTrackerProps) {
  const progressPercentage = (currentStage / stages.length) * 100
  const maxStage = Math.max(...stages.map((s) => s.id))

  const getStageStatus = (stage: RepairStage) => {
    if (currentStage > stage.id) return "completed"
    if (currentStage === stage.id) return "current"
    return "pending"
  }

  const getStageColors = (status: string) => {
    switch (status) {
      case "completed":
        return {
          container: "border-primary/30 bg-primary/5",
          icon: "bg-primary text-primary-foreground",
          text: "text-foreground",
          badge: "bg-primary text-primary-foreground",
        }
      case "current":
        return {
          container: "border-accent/30 bg-accent/5 ring-2 ring-accent/20",
          icon: "bg-accent text-accent-foreground",
          text: "text-foreground",
          badge: "bg-accent text-accent-foreground",
        }
      default:
        return {
          container: "border-border bg-muted/30",
          icon: "bg-muted text-muted-foreground",
          text: "text-muted-foreground",
          badge: "bg-muted text-muted-foreground",
        }
    }
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        {showProgress && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Progress</span>
            <span className="text-muted-foreground">
              Stage {currentStage} of {maxStage}
            </span>
          </div>
        )}

        {showProgress && <Progress value={progressPercentage} className="h-2" />}

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stages.map((stage, index) => {
            const StageIcon = stage.icon
            const status = getStageStatus(stage)
            const colors = getStageColors(status)

            return (
              <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    colors.icon,
                  )}
                >
                  <StageIcon className="w-4 h-4" />
                </div>
                <span className={cn("text-sm font-medium whitespace-nowrap", colors.text)}>{stage.name}</span>
                {index < stages.length - 1 && <div className="w-8 h-px bg-border mx-2" />}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div className={cn("space-y-6", className)}>
        {showProgress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Repair Progress</h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Stage {currentStage} of {maxStage}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        )}

        <div className="space-y-4">
          {stages.map((stage) => {
            const StageIcon = stage.icon
            const status = getStageStatus(stage)
            const colors = getStageColors(status)
            const hasPendingAction = pendingActions[stage.id]

            return (
              <div
                key={stage.id}
                className={cn("p-6 rounded-xl border-2 transition-all duration-300", colors.container)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      colors.icon,
                    )}
                  >
                    <StageIcon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className={cn("font-semibold text-lg", colors.text)}>{stage.name}</h5>
                      <Badge className={colors.badge}>
                        {status === "completed" ? "Completed" : status === "current" ? "In Progress" : "Pending"}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{stage.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      {stage.estimatedDuration && (
                        <span className="text-muted-foreground">Duration: {stage.estimatedDuration}</span>
                      )}
                      {stage.completedAt && (
                        <span className="text-primary font-medium">
                          Completed: {new Date(stage.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {hasPendingAction && status === "current" && (
                      <div className="flex items-center gap-2 mt-3 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm text-accent font-medium">Action Required: {hasPendingAction}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      {showProgress && (
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Progress</h4>
          <span className="text-sm text-muted-foreground">
            Stage {currentStage} of {maxStage}
          </span>
        </div>
      )}

      {showProgress && <Progress value={progressPercentage} className="h-2" />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const StageIcon = stage.icon
          const status = getStageStatus(stage)
          const colors = getStageColors(status)
          const hasPendingAction = pendingActions[stage.id]

          return (
            <div key={stage.id} className={cn("p-4 rounded-xl border-2 transition-all duration-300", colors.container)}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    colors.icon,
                  )}
                >
                  <StageIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h5 className={cn("font-medium text-sm", colors.text)}>{stage.name}</h5>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{stage.description}</p>

              {hasPendingAction && status === "current" && (
                <div className="flex items-center gap-1 mt-2 text-xs text-accent">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-medium">Action needed</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Export default stages for reuse
export { defaultStages as repairStages }
