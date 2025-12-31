import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "오류", {
        description: description,
      });
    } else {
      sonnerToast.success(title, {
        description: description,
      });
    }
  };

  return { toast };
}
