import { Calendar, Clock, Folder, Mail, Pencil } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Projects",
    url: "/",
    icon: Folder,
  },
  {
    title: "My Task",
    url: "/my-task",
    icon: Pencil,
  },
  {
    title: "Calender",
    url: "/calender",
    icon: Calendar,
  },
  {
    title: "Timesheet",
    url: "/timesheet",
    icon: Clock,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Mail,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="bg-slate-800 border-gray-500">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-bold tracking-wider text-white my-4">Time Manager SEA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="py-6 px-2" asChild>
                    <a href={item.url}>
                      <item.icon className="size-64 mx-2" />
                      <span className="text-lg">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}