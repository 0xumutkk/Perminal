"use client";

import Image from "next/image";
import { Twitter, Send, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          {/* Logo & Social */}
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <Image
              src="/logo.svg"
              alt="Perminal"
              width={120}
              height={26}
              className="invert h-auto"
            />
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com/perminal"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://t.me/perminal"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://discord.gg/perminal"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-slate-500 transition-colors hover:text-slate-100"
            >
              Docs
            </a>
            <a
              href="#"
              className="text-slate-500 transition-colors hover:text-slate-100"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-500 transition-colors hover:text-slate-100"
            >
              Terms
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-800/50 pt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Perminal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
