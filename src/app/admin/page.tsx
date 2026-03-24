import { AdminControlCenter } from "@/components/admin-control-center";
import { SiteShell } from "@/components/site-shell";

export default function AdminPage() {
  return (
    <SiteShell>
      <main className="page-wrap">
        <AdminControlCenter />
      </main>
    </SiteShell>
  );
}

