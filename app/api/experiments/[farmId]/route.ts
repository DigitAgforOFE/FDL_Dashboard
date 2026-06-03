import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INCLUDE = {
  ExperimentTests: { include: { Test: { select: { id: true, Test_Name: true } } } },
  ExperimentDroneFlights: { include: { Drone: { select: { id: true, Name: true } } } },
  ExperimentTreatments: { include: { Treatment: { select: { id: true, Treatment_Name: true } } } },
};

export async function GET(_: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  const experiment = await prisma.farmExperiment.findFirst({
    where: { farm_id: parseInt(farmId) },
    include: INCLUDE,
  });
  return NextResponse.json(experiment ?? null);
}

export async function PUT(req: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  const farmIdInt = parseInt(farmId);
  const body = await req.json();

  const {
    experiment_name, start_date, hypothesis, experiment_desc,
    measurements, criteria, lab_description,
    tests = [], drones = [], treatment_ids = [],
  } = body;

  const existing = await prisma.farmExperiment.findFirst({ where: { farm_id: farmIdInt } });

  let experiment;
  if (existing) {
    // Clear nested items then re-create
    await prisma.$transaction([
      prisma.experimentTest.deleteMany({ where: { experiment_id: existing.id } }),
      prisma.experimentDroneFlight.deleteMany({ where: { experiment_id: existing.id } }),
      prisma.experimentTreatment.deleteMany({ where: { experiment_id: existing.id } }),
    ]);
    experiment = await prisma.farmExperiment.update({
      where: { id: existing.id },
      data: {
        experiment_name: experiment_name || null,
        start_date: start_date ? new Date(start_date) : null,
        hypothesis: hypothesis || null,
        experiment_desc: experiment_desc || null,
        measurements: measurements || null,
        criteria: criteria || null,
        lab_description: lab_description || null,
        ExperimentTests: {
          create: tests.map((t: { test_id: number; n_samples?: number | null; expected_date?: string | null }) => ({
            test_id: t.test_id,
            n_samples: t.n_samples ?? null,
            expected_date: t.expected_date ? new Date(t.expected_date) : null,
          })),
        },
        ExperimentDroneFlights: {
          create: drones.map((d: { drone_id: number; n_flights?: number | null; expected_date?: string | null }) => ({
            drone_id: d.drone_id,
            n_flights: d.n_flights ?? null,
            expected_date: d.expected_date ? new Date(d.expected_date) : null,
          })),
        },
        ExperimentTreatments: {
          create: treatment_ids.map((tid: number) => ({ treatment_id: tid })),
        },
      },
      include: INCLUDE,
    });
  } else {
    experiment = await prisma.farmExperiment.create({
      data: {
        farm_id: farmIdInt,
        experiment_name: experiment_name || null,
        start_date: start_date ? new Date(start_date) : null,
        hypothesis: hypothesis || null,
        experiment_desc: experiment_desc || null,
        measurements: measurements || null,
        criteria: criteria || null,
        lab_description: lab_description || null,
        ExperimentTests: {
          create: tests.map((t: { test_id: number; n_samples?: number | null; expected_date?: string | null }) => ({
            test_id: t.test_id,
            n_samples: t.n_samples ?? null,
            expected_date: t.expected_date ? new Date(t.expected_date) : null,
          })),
        },
        ExperimentDroneFlights: {
          create: drones.map((d: { drone_id: number; n_flights?: number | null; expected_date?: string | null }) => ({
            drone_id: d.drone_id,
            n_flights: d.n_flights ?? null,
            expected_date: d.expected_date ? new Date(d.expected_date) : null,
          })),
        },
        ExperimentTreatments: {
          create: treatment_ids.map((tid: number) => ({ treatment_id: tid })),
        },
      },
      include: INCLUDE,
    });
  }

  return NextResponse.json(experiment);
}
