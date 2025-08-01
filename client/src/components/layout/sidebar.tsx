import { LayoutDashboard, Users, CalendarCheck, Book, BarChart, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Lesson Packages", href: "/packages", icon: Book },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full overflow-y-auto">
      <div className="p-4 pt-20">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-50"
                )}>
                  <Icon className="mr-3" size={20} />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
