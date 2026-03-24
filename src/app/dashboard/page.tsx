import { SiteShell } from "@/components/site-shell";
import { SubscriberDashboard } from "@/components/subscriber-dashboard";

export default function DashboardPage() {
  return (
    <SiteShell>
      <main className="page-wrap">
        <SubscriberDashboard />
      </main>
    </SiteShell>
  );
}

