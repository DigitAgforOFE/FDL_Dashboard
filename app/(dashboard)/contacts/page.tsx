import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreate, type Role } from "@/lib/roles";
import { ContactsClient } from "./contacts-client";

export default async function ContactsPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "viewer") as Role;
  const contacts = await prisma.contact.findMany({
    include: { Farm: { select: { id: true, Farm_Name: true } } },
    orderBy: { name: "asc" },
  });
  const data = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    whatsapp: c.whatsapp,
    farm_name: c.Farm?.Farm_Name ?? null,
    created_at: c.created_at.toISOString(),
  }));
  return <ContactsClient data={data} canCreate={canCreate(role)} />;
}
