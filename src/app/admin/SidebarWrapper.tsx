"use client";

import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("@/components/ui/Sidebar"), {
  ssr: false,
  loading: () => <div className="hidden lg:block lg:w-60 lg:shrink-0" />,
});

export default function SidebarWrapper() {
  return <Sidebar />;
}
