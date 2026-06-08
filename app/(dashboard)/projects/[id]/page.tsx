import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEditMode } from "@/lib/edit-mode";
import { canEdit, canDelete, type Role } from "@/lib/roles";
import { DeleteProjectButton } from "./delete-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { RelationPicker } from "@/components/relation-picker";
import { DocumentUpload } from "@/components/document-upload";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = parseInt(id);

  const [session, editMode] = await Promise.all([auth(), getEditMode()]);
  const role = (session?.user?.role ?? "viewer") as Role;
  const showEdit = canEdit(role);
  const showDelete = canDelete(role, editMode);

  const [project, allFarms, allLabMembers] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        ProjectFarms: { include: { Farm: true } },
        ProjectLabMembers: { include: { User: true } },
        TreatmentProtocols: { include: { Treatment: true } },
        ExperimentZones: { include: { Farm: true } },
        Documents: { orderBy: { uploaded_at: "desc" } },
      },
    }),
    prisma.farm.findMany({ select: { id: true, Farm_Name: true } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
  ]);

  if (!project) notFound();

  const linkedFarmIds = new Set(project.ProjectFarms.map((pf) => pf.Farms_id));
  const linkedMemberIds = new Set(project.ProjectLabMembers.map((pm) => pm.user_id));

  const availableFarms = allFarms
    .filter((f) => !linkedFarmIds.has(f.id))
    .map((f) => ({ id: f.id, name: f.Farm_Name ?? `Farm #${f.id}` }));

  const availableMembers = allLabMembers
    .filter((m) => !linkedMemberIds.has(m.id))
    .map((m) => ({ id: m.id, name: m.name ?? m.email }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/projects" className="hover:text-slate-900">Projects</Link>
            <span>/</span>
            <span>{project.Project_Name ?? `Project #${project.id}`}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {project.Project_Name ?? `Project #${project.id}`}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={project.Status === "Active" ? "default" : "secondary"}>
            {project.Status ?? "Unknown"}
          </Badge>
          {showEdit && (
            <Link href={`/projects/${project.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Edit</Link>
          )}
          {showDelete && (
            <DeleteProjectButton projectId={project.id} projectName={project.Project_Name} />
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="farms">Farms ({project.ProjectFarms.length})</TabsTrigger>
          <TabsTrigger value="lab-members">Lab Members ({project.ProjectLabMembers.length})</TabsTrigger>
          <TabsTrigger value="protocols">Treatment Protocols ({project.TreatmentProtocols.length})</TabsTrigger>
          <TabsTrigger value="zones">Experiment Zones ({project.ExperimentZones.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({project.Documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Name</span><p className="font-medium mt-0.5">{project.Project_Name ?? "—"}</p></div>
                <div><span className="text-slate-500">Status</span><p className="font-medium mt-0.5">{project.Status ?? "—"}</p></div>
                <div><span className="text-slate-500">Year Started</span><p className="font-medium mt-0.5">{project.Year_Started ?? "—"}</p></div>
                <div><span className="text-slate-500">Total Budget</span><p className="font-medium mt-0.5">{project.Total_Budget ? `$${Number(project.Total_Budget).toLocaleString()}` : "—"}</p></div>
                <div className="col-span-2"><span className="text-slate-500">Sponsors</span><p className="font-medium mt-0.5">{project.Project_Sponsors ?? "—"}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farms" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Associated Farms</CardTitle>
              <RelationPicker label="Farm" options={availableFarms} apiPath={`/api/projects/${project.id}/farms`} />
            </CardHeader>
            <CardContent>
              {project.ProjectFarms.length === 0 ? (
                <p className="text-sm text-slate-500">No farms associated</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Farm Name</TableHead><TableHead>County</TableHead><TableHead>State</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {project.ProjectFarms.map((pf) => (
                      <TableRow key={pf.Farms_id}>
                        <TableCell><Link href={`/farms/${pf.Farm.id}`} className="text-blue-600 hover:underline">{pf.Farm.Farm_Name ?? `Farm #${pf.Farm.id}`}</Link></TableCell>
                        <TableCell>{pf.Farm.County ?? "—"}</TableCell>
                        <TableCell>{pf.Farm.State ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Lab Members</CardTitle>
              <RelationPicker label="Lab Member" options={availableMembers} apiPath={`/api/projects/${project.id}/lab-members`} />
            </CardHeader>
            <CardContent>
              {project.ProjectLabMembers.length === 0 ? (
                <p className="text-sm text-slate-500">No lab members assigned</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Position</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {project.ProjectLabMembers.map((pm) => (
                      <TableRow key={pm.user_id}>
                        <TableCell className="font-medium">{pm.User.name ?? "—"}</TableCell>
                        <TableCell>{pm.User.position ?? "—"}</TableCell>
                        <TableCell>{pm.User.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Treatment Protocols</CardTitle></CardHeader>
            <CardContent>
              {project.TreatmentProtocols.length === 0 ? (
                <p className="text-sm text-slate-500">No treatment protocols defined</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Protocol Name</TableHead><TableHead>Treatment</TableHead><TableHead>Product</TableHead><TableHead>Control</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {project.TreatmentProtocols.map((tp) => (
                      <TableRow key={tp.id}>
                        <TableCell className="font-medium">{tp.Protocol_Name ?? "—"}</TableCell>
                        <TableCell>{tp.Treatment?.Treatment_Name ?? "—"}</TableCell>
                        <TableCell>{tp.Product ?? "—"}</TableCell>
                        <TableCell><Badge variant={tp.Is_Control ? "default" : "outline"}>{tp.Is_Control ? "Yes" : "No"}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Experiment Zones</CardTitle></CardHeader>
            <CardContent>
              {project.ExperimentZones.length === 0 ? (
                <p className="text-sm text-slate-500">No experiment zones defined</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Zone Label</TableHead><TableHead>Farm</TableHead><TableHead>Rep #</TableHead><TableHead>Geometry</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {project.ExperimentZones.map((ez) => (
                      <TableRow key={ez.id}>
                        <TableCell className="font-medium">{ez.Zone_Label ?? "—"}</TableCell>
                        <TableCell>{ez.Farm?.Farm_Name ?? "—"}</TableCell>
                        <TableCell>{ez.Rep_Number ?? "—"}</TableCell>
                        <TableCell><Badge variant={ez.geometry ? "default" : "outline"}>{ez.geometry ? "Yes" : "No"}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-4 space-y-4">
          <DocumentUpload projectId={project.id} />
          {project.Documents.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Uploaded Documents</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.Documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.original_name ?? doc.filename}</TableCell>
                        <TableCell><Badge variant="secondary">{doc.file_type?.toUpperCase() ?? "—"}</Badge></TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : "—"}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-500">{doc.description ?? "—"}</TableCell>
                        <TableCell>
                          <a
                            href={`/api/files/documents/${doc.filename}`}
                            className="text-blue-600 hover:underline text-sm"
                            download={doc.original_name ?? doc.filename}
                          >
                            Download
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
