"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, CheckCircle2, Smartphone } from "lucide-react";

interface LabMemberRow {
  id: string;
  name: string | null;
  email: string;
  position: string | null;
  status: string | null;
  faa_part_107: boolean;
  contact_phone: string | null;
  role: string;
  has_token: boolean;
}

function statusVariant(status: string | null): "default" | "secondary" | "outline" {
  if (status === "Active") return "default";
  if (status?.startsWith("Inactive")) return "secondary";
  return "outline";
}

export function LabMembersClient({ data, canCreate }: { data: LabMemberRow[]; canCreate?: boolean }) {
  const router = useRouter();

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "position", header: "Position" },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as LabMemberRow;
        return r.status ? (
          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      key: "faa_part_107",
      header: "FAA Part 107",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as LabMemberRow;
        return r.faa_part_107 ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <span className="text-slate-300">—</span>
        );
      },
    },
    {
      key: "role",
      header: "Role",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as LabMemberRow;
        return <Badge variant={r.role === "admin" ? "default" : "secondary"}>{r.role}</Badge>;
      },
    },
    {
      key: "has_token",
      header: "App Access",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as LabMemberRow;
        return r.has_token ? (
          <Badge variant="default" className="gap-1">
            <Smartphone className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-400">None</Badge>
        );
      },
    },
    {
      key: "_actions",
      header: "",
      render: (row: Record<string, unknown>) => (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); router.push(`/lab-members/${(row as unknown as LabMemberRow).id}/edit`); }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      title="Lab Members"
      data={data as unknown as Record<string, unknown>[]}
      columns={columns}
      searchKeys={["name", "email", "position", "status"]}
      onAdd={canCreate ? () => router.push("/lab-members/new") : undefined}
      addLabel="New Member"
      onRowClick={(row) => router.push(`/lab-members/${(row as unknown as LabMemberRow).id}`)}
    />
  );
}
