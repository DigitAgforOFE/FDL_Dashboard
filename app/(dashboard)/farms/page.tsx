import { prisma } from "@/lib/prisma";
import { FarmsClient } from "./farms-client";

export default async function FarmsPage() {
  const farms = await prisma.farm.findMany({ orderBy: { id: "asc" } });
  const data = farms.map((f) => ({
    id: f.id,
    Farm_Name: f.Farm_Name,
    Farmer_Name: f.Farmer_Name,
    County: f.County,
    State: f.State,
    is_active: f.is_active,
    created_at: f.created_at ? f.created_at.toISOString() : null,
    updated_at: f.updated_at ? f.updated_at.toISOString() : null,
  }));
  return <FarmsClient data={data} />;
}
