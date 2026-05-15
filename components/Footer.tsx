"use client";

import { Briefcase, MapPin, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="bg-accent p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-accent-foreground" />
              </div>
              <span>HireHub</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The career launchpad where ambition meets opportunity. Premium job board and CV management.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-foreground transition-colors">Browse Companies</Link></li>
              <li><Link href="/ai-tools" className="hover:text-foreground transition-colors">AI Resume Grader</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/post-job" className="hover:text-foreground transition-colors">Post a Job</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Employer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 HireHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border border-border">
            <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white/40 rotate-45"></div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Made with Replit</span>
            <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <span className="text-xs">×</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
