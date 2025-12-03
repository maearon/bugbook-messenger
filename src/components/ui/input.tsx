import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
          "appearance-none shadow-none !shadow-none", // <<<<<< TẮT SHADOW TẠI ĐÂY
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
