"use client"

import ProfileWindowLayout from "./ProfileWindowLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ChatAppPage = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>

        <div className="flex h-screen w-full p-2">
          <div className="flex-1 w-full">
            <ProfileWindowLayout />
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default ChatAppPage;