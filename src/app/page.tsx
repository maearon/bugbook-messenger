"use client"

import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ChatAppPage = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />

        <div className="flex h-screen w-full p-2">
          <ChatWindowLayout />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default ChatAppPage;