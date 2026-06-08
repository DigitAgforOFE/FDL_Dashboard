import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreate } from "@/lib/roles";

export async function GET() {
  const fields = await prisma.field.findMany({ orderBy: { id: "asc" }, include: { Farm: true } });
  return NextResponse.json(fields);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canCreate(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const field = await prisma.field.create({ data: body });
  return NextResponse.json(field, { status: 201 });
}
