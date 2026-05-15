import { use } from "react";
import { PrismaClient } from "@prisma/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPin, Briefcase, Calendar, DollarSign, ArrowLeft, Building2, Globe, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { JobDetailsClient } from "@/components/jobs/JobDetailsClient";

const prisma = new PrismaClient();

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const job = await prisma.job.findUnique({
    where: { id: parseInt(id) },
    include: {
      employer: {
        select: {
          id: true,
          name: true,
          bio: true,
          image: true,
        }
      }
    }
  });

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ажлын байр олдсонгүй</h1>
          <Link href="/jobs" className="text-accent font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Бүх ажил харах
          </Link>
        </div>
      </div>
    );
  }

  return <JobDetailsClient job={job} />;
}
