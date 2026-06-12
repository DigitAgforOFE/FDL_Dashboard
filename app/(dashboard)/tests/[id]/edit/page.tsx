import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditTestClient from "./edit-client";

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id: parseInt(id) } });
  if (!test) notFound();
  return (
    <EditTestClient
      test={{
        id: test.id,
        Test_Name: test.Test_Name,
        Test_Description: test.Test_Description,
        Cost: test.Cost ? Number(test.Cost) : null,
        Methodology: test.Methodology,
        Data_Processing_Instructions: test.Data_Processing_Instructions,
      }}
    />
  );
}
