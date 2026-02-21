import * as React from "react"

/**
 * Minimal Slot implementation for the asChild pattern.
 * Merges parent props into the single child element.
 */

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const overrideProps: Record<string, unknown> = { ...childProps }

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]

    if (/^on[A-Z]/.test(propName)) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          ;(childPropValue as (...args: unknown[]) => void)(...args)
          ;(slotPropValue as (...args: unknown[]) => void)(...args)
        }
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...(slotPropValue as object), ...(childPropValue as object) }
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ")
    }
  }

  return { ...slotProps, ...overrideProps }
}

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props

  if (!React.isValidElement(children)) {
    return null
  }

  const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref
  const ref = forwardedRef
    ? composeRefs(forwardedRef, childRef ?? null)
    : childRef

  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      ...mergeProps(slotProps, (children as React.ReactElement<Record<string, unknown>>).props),
      ref,
    }
  )
})
Slot.displayName = "Slot"

function composeRefs<T>(
  ...refs: (React.Ref<T> | null)[]
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    })
  }
}

export { Slot }
