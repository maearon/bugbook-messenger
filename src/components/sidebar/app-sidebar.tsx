"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Group,
  LifeBuoy,
  Map,
  Moon,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Sun,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import CreateNewChat from "../chat/CreateNewChat"
import NewGroupChatModal from "../chat/NewGroupChatDialog"
import GroupChatList from "../chat/GroupChatList"
import AddFriendModal from "../chat/AddFriendModal"
import DirectMessageList from "../chat/DirectMessageList"
import { registerNextThemeSetter, useThemeStore } from "@/stores/useThemeStore"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { NavUser } from "./nav-user"
import { mapBetterAuthUserToMongoUser } from "@/lib/mappers/user-data-to-simple-user"
import { useChatStore } from "@/stores/useChatStore"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: sessionClient, isPending } = authClient.useSession();
  const user = sessionClient?.user ?? null;
  const { isDark, toggleTheme } = useThemeStore();
  const { theme, setTheme } = useTheme();
  const { setTheme: setZustandTheme } = useThemeStore();
  const fetchConversations = useChatStore(state => state.fetchConversations);
  
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Ưu tiên next-themes => sync vào Zustand
    if (theme) {
      setZustandTheme(theme === "dark");
    }
  }, [theme, setZustandTheme]);

  // Bridge: đăng ký setter của next-themes cho Zustand
  useEffect(() => {
    registerNextThemeSetter(setTheme);
  }, [setTheme]);

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild
              className="bg-gradient-primary"
            >
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold justify-center">Moji AI</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-zinc-600 dark:text-zinc-400" />
                    {/* <Switch 
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-blue-600 h-6 w-11 rounded-full bg-gray-200 p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="data-[state=checked]:bg-background/80" />
                    </Switch> */}
                    <Switch 
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                    />
                    <Moon className="size-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar">
        {/* New Chat */}
        <SidebarGroup>
          <SidebarContent>
            <CreateNewChat />
          </SidebarContent>
        </SidebarGroup>

        {/* Group Chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            nhóm chat
          </SidebarGroupLabel>
          <SidebarGroupAction title="Tạo nhóm" className="cursor-pointer">
            <NewGroupChatModal />
          </SidebarGroupAction>

          <SidebarGroupContent>
            {/* List of group chats would go here */}
            <GroupChatList />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Direct Message */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            bạn bè
          </SidebarGroupLabel>
          <SidebarGroupAction title="Kết bạn" className="cursor-pointer">
            <AddFriendModal />
          </SidebarGroupAction>

          <SidebarGroupContent>
            {/* List of group chats would go here */}
            <DirectMessageList />
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {user && <NavUser user={mapBetterAuthUserToMongoUser(user)} />}
      </SidebarFooter>
    </Sidebar>
  )
}
