import { AppShell } from "@/components/shared/AppShell";
import { Navbar } from "@/components/Navbar";
import { ResultsExperience } from "@/components/results/ResultsExperience";

export default function ResultsPage() {
  return (
    <AppShell>
      <Navbar />
      <section className="min-h-[calc(100vh-4rem)] bg-[hsl(var(--surface))] py-10 lg:py-14">
        <div className="container">
          <ResultsExperience />
        </div>
      </section>
    </AppShell>
  );
}
