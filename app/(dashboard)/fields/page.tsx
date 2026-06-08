import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreate, type Role } from "@/lib/roles";
import { FieldsClient } from "./fields-client";

export default async function FieldsPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "viewer") as Role;
  const fields = await prisma.field.findMany({
    orderBy: { id: "asc" },
    include: { Farm: true },
  });

  const data = fields.map((f) => ({
    id: f.id,
    Name: f.Name,
    Farm_Name: f.Farm?.Farm_Name ?? null,
    boundary_source: f.boundary_source,
    hasGeometry: !!f.geometry,
  }));

  return <FieldsClient data={data} canCreate={canCreate(role)} />;
}
