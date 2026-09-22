import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/popup")({
  component: PopupPage,
});

function PopupPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center">
    
    </div>
  );
}