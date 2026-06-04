import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUpload } from "@/lib/upload-auth";

const INCLUDE = {
  ExperimentTests: { include: { Test: { select: { id: true, Test_Name: true } } } },
  ExperimentDroneFlights: { include: { Drone: { select: { id: true, Name: true } } } },
  ExperimentTreatments: { include: { Treatment: { select: { id: true, Treatment_Name: true } } } },
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateUpload(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const farmId = parseInt(id);
  if (isNaN(farmId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const experiment = await prisma.farmExperiment.findFirst({
    where: { farm_id: farmId },
    include: INCLUDE,
  });

  return NextResponse.json(experiment ?? null);
}
