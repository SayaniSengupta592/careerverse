
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import {
  LayoutDashboard,
  FileText,
  PenBox,
  GraduationCap,
  ChevronDown,
  Stars,
} from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex justify-between items-center p-4">

        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo-career.png"
            alt="CareerVerse Logo"
            width={200}
            height={60}
            priority
            className="h-12 py-1 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">

          <Show when="signed-in">
            <Link href="/dashboard">
              <span className="hidden md:inline-flex items-center gap-2 rounded-md border px-4 py-2 hover:bg-accent">
                <LayoutDashboard className="h-4 w-4" />
                Industry Insights
              </span>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 rounded-md bg-purple-700 px-4 py-2 text-white hover:bg-purple-800 transition-colors"
              >
                <Stars className="h-4 w-4" />
                <span className="hidden md:inline">Growth Tools</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover text-popover-foreground p-2 shadow-xl z-50">

                  <Link
                    href="/resume"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <FileText className="h-4 w-4 text-purple-700" />
                    Resume Builder
                  </Link>

                  <Link
                    href="/ai-cover-letter"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <PenBox className="h-4 w-4 text-purple-700" />
                    Cover Letter
                  </Link>

                  <Link
                    href="/interview"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <GraduationCap className="h-4 w-4 text-purple-700" />
                    Interview Preparation
                  </Link>
                </div>
              )}
            </div>

            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-md border px-4 py-2 hover:bg-accent">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="rounded-md bg-purple-700 px-4 py-2 text-white hover:bg-purple-800">
                Sign Up
              </button>
            </SignUpButton>
          </Show>

        </div>
      </nav>
    </header>
  );
};

export default Header;
