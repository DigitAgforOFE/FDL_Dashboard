import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!user.bearer_token) return NextResponse.json({ error: "No token" }, { status: 404 });

  const serverUrl = process.env.FARMER_SERVER_URL ?? process.env.NEXTAUTH_URL ?? "";
  const payload = JSON.stringify({ url: serverUrl, token: user.bearer_token });
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 400,
    margin: 2,
    color: { dark: "#1B5E20", light: "#FFFFFF" },
  });
  return NextResponse.json({ dataUrl, serverUrl, memberName: user.name });
}
