"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/* ---------------------------------- Context --------------------------------- */

interface TooltipProviderContextValue {
  delayDuration: number
}

const TooltipProviderContext = React.createContext<TooltipProviderContextValue>({
  delayDuration: 700,
})

/* --------------------------------- Provider -------------------------------- */

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

function TooltipProvider({
  children,
  delayDuration = 700,
}: TooltipProviderProps) {
  const value = React.useMemo(
    () => ({ delayDuration }),
    [delayDuration]
  )

  return (
    <TooltipProviderContext.Provider value={value}>
      {children}
    </TooltipProviderContext.Provider>
  )
}

/* ---------------------------------- Context --------------------------------- */

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  delayDuration: number
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltip() {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>")
  return ctx
}

/* ---------------------------------- Root ----------------------------------- */

interface TooltipProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

function Tooltip({
  children,
  open: controlledOpen,
  onOpenChange,
  delayDuration: tooltipDelay,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const providerCtx = React.useContext(TooltipProviderContext)

  const open = controlledOpen ?? uncontrolledOpen
  const delayDuration = tooltipDelay ?? providerCtx.delayDuration

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setUncontrolledOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [onOpenChange]
  )

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

/* --------------------------------- Trigger --------------------------------- */

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
  const { setOpen, triggerRef, delayDuration } = useTooltip()
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const composedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      ;(triggerRef as React.MutableRefObject<HTMLElement | null>).current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    },
    [ref, triggerRef]
  )

  const handleOpen = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, delayDuration)
  }, [setOpen, delayDuration])

  const handleClose = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(false)
  }, [setOpen])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <button
      ref={composedRef}
      type="button"
      className={className}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        handleOpen()
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e)
        handleClose()
      }}
      onFocus={(e) => {
        onFocus?.(e)
        handleOpen()
      }}
      onBlur={(e) => {
        onBlur?.(e)
        handleClose()
      }}
      {...props}
    />
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

/* --------------------------------- Content --------------------------------- */

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "bottom" | "left" | "right"
    sideOffset?: number
  }
>(({ className, side = "top", sideOffset = 4, children, ...props }, ref) => {
  const { open, triggerRef } = useTooltip()
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open || !triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    let top: number
    let left: number

    switch (side) {
      case "top":
        top = rect.top - sideOffset + window.scrollY
        left = rect.left + rect.width / 2 + window.scrollX
        break
      case "bottom":
        top = rect.bottom + sideOffset + window.scrollY
        left = rect.left + rect.width / 2 + window.scrollX
        break
      case "left":
        top = rect.top + rect.height / 2 + window.scrollY
        left = rect.left - sideOffset + window.scrollX
        break
      case "right":
        top = rect.top + rect.height / 2 + window.scrollY
        left = rect.right + sideOffset + window.scrollX
        break
    }

    setPosition({ top, left })
  }, [open, side, sideOffset, triggerRef])

  if (!open || !mounted) return null

  const sideStyles = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
    right: "-translate-y-1/2",
  }

  return (
    <div
      ref={(node) => {
        contentRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      role="tooltip"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        pointerEvents: "none",
      }}
      className={cn(
        sideStyles[side],
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipContent.displayName = "TooltipContent"

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
}
