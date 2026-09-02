import { AccountTabs } from "@/components/features/account/AccountTabs";

/**
 * The /account shell (VIB-69). Chrome only — every page under it keeps its
 * own auth check, because a layout is not a gate: middleware handles the
 * signed-out half at the edge and each page re-checks the session itself.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AccountTabs />
      {children}
    </div>
  );
}
