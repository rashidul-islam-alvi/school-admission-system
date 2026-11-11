import { useEffect, useState } from "react";
import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  House,
  CircleHelp,
  GraduationCap,
  FileText,
  PlusCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  School,
} from "lucide-react";

import StudentIdentification from "../components/layout/student-identification";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkIdentity = () => {
      const savedId = localStorage.getItem("studentId");
      const adminId = import.meta.env.VITE_ADMIN_ID;

      setIsAdmin(Boolean(adminId && savedId === adminId));
    };

    checkIdentity();

    window.addEventListener("identityChanged", checkIdentity);

    return () => {
      window.removeEventListener("identityChanged", checkIdentity);
    };
  }, []);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isApplyPage = pathname.startsWith("/apply/");
  const isAdminPage = pathname.startsWith("/admin/");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-slate-200 bg-slate-50
          transition-all duration-300
          ${collapsed ? "w-[84px]" : "w-[280px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-6">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <School size={21} />
            </div>

            {!collapsed && (
              <span className="whitespace-nowrap text-lg font-bold tracking-tight text-slate-900">
                Edu<span className="text-indigo-600">Apply</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 lg:hidden"
          >
            <X size={20} />
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 lg:block"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
          <div>
            {!collapsed && (
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                General
              </p>
            )}

            <SidebarLink
              to="/"
              label="Home"
              icon={House}
              collapsed={collapsed}
              exact
              onNavigate={() => setMobileOpen(false)}
            />

            <SidebarLink
              to="/"
              label="Help"
              icon={CircleHelp}
              collapsed={collapsed}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>

          <div>
            {!collapsed && (
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admissions
              </p>
            )}

            <SidebarLink
              to="/"
              label="Classes"
              icon={GraduationCap}
              collapsed={collapsed}
              exact
              onNavigate={() => setMobileOpen(false)}
            />

            <SidebarLink
              to="/applications"
              label="My Applications"
              icon={FileText}
              collapsed={collapsed}
              onNavigate={() => setMobileOpen(false)}
            />

            {isAdmin && (
              <SidebarLink
                to="/admin/create-class"
                label="Create Class"
                icon={PlusCircle}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            )}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {isAdmin ? "AU" : "ST"}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {isAdmin ? "Admin User" : "Student"}
                </p>
                <p className="text-xs text-slate-500">
                  {isAdmin ? "School Administrator" : "Applicant"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-[84px]" : "lg:ml-[280px]"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="hidden text-sm text-slate-500 sm:block">
              School Admission Portal
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 sm:block">
              School Portal
            </span>

            <button
              aria-label="Notifications"
              className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              AU
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 lg:px-12">
          {!isApplyPage && !isAdminPage && <StudentIdentification />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  to: "/" | "/applications" | "/admin/create-class";
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  exact?: boolean;
  onNavigate: () => void;
}

function SidebarLink({
  to,
  label,
  icon: Icon,
  collapsed,
  exact = false,
  onNavigate,
}: SidebarLinkProps) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      onClick={onNavigate}
      className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
      activeProps={{
        className:
          "mb-1 flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700",
      }}
      title={collapsed ? label : undefined}
    >
      <Icon size={19} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
