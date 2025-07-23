import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface BackButtonProps {
  to?: string;
  label?: string;
}

export default function BackButton({ to = "/dashboard", label = "Back" }: BackButtonProps) {
  const [, setLocation] = useLocation();

  return (
    <Button
      onClick={() => setLocation(to)}
      className="mb-4 flex items-center gap-2 text-white bg-[#fd7014] hover:bg-[#e5640f]"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}