// /components/ui/appsidebar.jsx
"use client";
import React from "react";
import { FileText, User, House } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    } from "@/components/ui/sidebar";


    const items = [
        { title: "Search", url: "#", icon: House },
        { title: "Home", url: "#", icon: FileText },
        { title: "Inbox", url: "/user", icon: User },
    ];

    export function AppSidebar() {
    return (
        <Sidebar
        variant="inset"
        collapsible="icon"
        className="flex flex-col items-center justify-center bg-white border-r"
        style={{
            "--sidebar-width": "5rem",
            "--sidebar-width-icon": "20rem",
        }}
        >
        <SidebarContent className="flex flex-col items-center justify-center gap-6 h-full">
            <SidebarMenu className="flex flex-col items-center gap-6">
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                    asChild
                    className="flex flex-col items-center justify-center rounded-full w-12 h-12 hover:bg-orange-100 text-orange-400 transition-all hover:scale-110 shadow-sm"
                >
                    <a href={item.url} title={item.title}>
                    <item.icon className="w-7! h-7! hover:scale-125 transition-transform duration-200" />
                    </a>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>
        </Sidebar>
    );
}
