import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AccountStatus } from "@/components/shared/account-status";

export function AppShell({
  title,
  description,
  headerContent,
  showAccountMenu = false,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  headerContent?: React.ReactNode;
  showAccountMenu?: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen lg:flex">
        <Sidebar />
        <div className="flex-1 pb-28 lg:pb-8">
          <div className="shell py-6">
            <header className="mb-6 rounded-[32px] border border-white/50 bg-white/70 px-5 py-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">CalorieTrack</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
                  {description ? (
                    <div className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {description}
                    </div>
                  ) : null}
                  {headerContent ? <div className="mt-3">{headerContent}</div> : null}
                </div>
                {showAccountMenu ? (
                  <div className="shrink-0">
                    <AccountStatus />
                  </div>
                ) : null}
              </div>
            </header>
            {children}
          </div>
        </div>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
