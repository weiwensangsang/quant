"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Globe, BarChart3, Activity, Briefcase, LineChart } from "lucide-react";
import _ from "lodash";

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "a-share",
    title: "A股",
    icon: <TrendingUp className="w-5 h-5" />,
    href: "/a-share",
    active: true,
  },
  {
    id: "crypto",
    title: "加密货币",
    icon: <Globe className="w-5 h-5" />,
    href: "/crypto",
    active: false,
  },
  {
    id: "futures",
    title: "期货",
    icon: <BarChart3 className="w-5 h-5" />,
    href: "/futures",
    active: false,
  },
  {
    id: "backtest",
    title: "回测",
    icon: <Activity className="w-5 h-5" />,
    href: "/backtest",
    active: false,
  },
  {
    id: "portfolio",
    title: "组合",
    icon: <Briefcase className="w-5 h-5" />,
    href: "/portfolio",
    active: false,
  },
  {
    id: "analytics",
    title: "分析",
    icon: <LineChart className="w-5 h-5" />,
    href: "/analytics",
    active: false,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-16 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-2 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          Q
        </div>
      </div>

      <nav className="flex-1 py-4">
        {_.map(navItems, (item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.id === "home");
          const isEnabled = item.active !== false;

          return (
            <Link
              key={item.id}
              href={isEnabled ? item.href : "#"}
              {...(!isEnabled && { onClick: (e) => e.preventDefault() })}
              className={`flex flex-col items-center justify-center py-3 px-1 transition-all relative group ${
                !isEnabled ? "cursor-not-allowed opacity-30" : ""
              } ${
                isActive && isEnabled ? "bg-blue-50" : ""
              }`}
            >
              {isActive && isEnabled && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-600 rounded-r-md transition-all" />
              )}

              <div className={`mb-1 transition-all ${
                isActive && isEnabled
                  ? "text-blue-600 scale-110"
                  : isEnabled
                    ? "text-gray-600 group-hover:text-gray-900 group-hover:scale-105"
                    : "text-gray-400"
              }`}>
                {item.icon}
              </div>

              <span className={`text-xs font-medium transition-all ${
                isActive && isEnabled
                  ? "text-blue-600 font-semibold"
                  : isEnabled
                    ? "text-gray-600 group-hover:text-gray-900"
                    : "text-gray-400"
              }`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
