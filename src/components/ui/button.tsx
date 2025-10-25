import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyle =
      "px-4 py-2 rounded font-medium focus:outline-none transition-colors duration-150";
    const variantStyle =
      variant === "outline"
        ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
        : variant === "destructive"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-blue-600 text-white hover:bg-blue-700";

    return (
      <button ref={ref} className={`${baseStyle} ${variantStyle} ${className}`} {...props} />
    );
  }
);

Button.displayName = "Button";

