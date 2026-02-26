"use client";
import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, Modal } from "@/components/shared";
import { ProjectCard, ProjectDetail } from "@/components/domain";

export default function ProjectsPage() {
  const { data, loading, refresh } = useDashboard();
  const [tab, setTab] = useState<"active" | "shipped">("active");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading projects...</div>;
  }
  if (!data) return null;

  const projects = data.projects;
  const activeProjects = projects.filter(p =>
    p.status === "ACTIVE" || p.status === "BUILDING" || p.status === "APPROVED" || p.status === "UNKNOWN"
  );
  const shippedProjects = projects.filter(p => p.status === "SHIPPED");

  const displayed = tab === "active" ? activeProjects : shippedProjects;
  const selectedProject = selectedSlug ? projects.find(p => p.slug === selectedSlug) || null : null;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total · ${activeProjects.length} active · ${shippedProjects.length} shipped`}
        icon="📦"
        actions={
          <button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">
            Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Tab Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("active")}
            className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors font-medium ${
              tab === "active"
                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                : "border-card-border text-slate-500 hover:text-slate-300"
            }`}
          >
            Active ({activeProjects.length})
          </button>
          <button
            onClick={() => setTab("shipped")}
            className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors font-medium ${
              tab === "shipped"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "border-card-border text-slate-500 hover:text-slate-300"
            }`}
          >
            Shipped ({shippedProjects.length})
          </button>
        </div>

        {/* Project Grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(project => (
              <ProjectCard
                key={project.slug}
                project={project}
                onClick={() => setSelectedSlug(project.slug)}
                dashboardMonitoring={project.slug === "SYSTEM" ? data.dashboardMonitoring : undefined}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-3xl mb-3">{tab === "shipped" ? "🚀" : "📦"}</div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1">
                {tab === "shipped" ? "No shipped products yet" : "No active projects"}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {tab === "shipped"
                  ? "Products will appear here once they move through the pipeline from GO → BUILDING → SHIPPED. Keep building!"
                  : "Active projects will appear here as pipeline ideas get approved and enter the build phase."
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Project Detail Modal */}
      <Modal
        open={!!selectedProject}
        onClose={() => setSelectedSlug(null)}
        title={selectedProject?.name}
        width="max-w-3xl"
      >
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            flywheelItems={data.flywheel.items}
            taskboard={data.taskboard}
            ideas={data.incomePipeline.ideas}
            dashboardMonitoring={data.dashboardMonitoring}
          />
        )}
      </Modal>
    </div>
  );
}
