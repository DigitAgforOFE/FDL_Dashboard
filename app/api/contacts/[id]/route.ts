import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id: parseInt(id) },
    include: { Farm: { select: { id: true, Farm_Name: true } } },
  });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const contact = await prisma.contact.update({
    where: { id: parseInt(id) },
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      whatsapp: body.whatsapp ?? false,
      channel: body.channel ?? null,
      is_lab_member: body.is_lab_member ?? false,
      farms_id: body.farms_id ? Number(body.farms_id) : null,
    },
  });
  return NextResponse.json(contact);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("channel" in body) data.channel = body.channel ?? null;
  if ("whatsapp" in body) data.whatsapp = body.whatsapp;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }
  const contact = await prisma.contact.update({
    where: { id: parseInt(id) },
    data,
  });
  return NextResponse.json(contact);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.contact.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
