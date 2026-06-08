import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreate } from "@/lib/roles";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canCreate(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, email, password, position, phone, faa_part_107, status } = body;
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const hashed = password
    ? await bcrypt.hash(password, 12)
    : "__disabled__";

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashed,
      role: "member",
      position: position || null,
      contact_phone: phone || null,
      faa_part_107: faa_part_107 ?? false,
      status: status || null,
      bearer_token: crypto.randomBytes(32).toString("hex"),
    },
  });
  return NextResponse.json(user, { status: 201 });
}
