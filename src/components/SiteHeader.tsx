import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-black">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-4">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-red-500 sm:text-4xl"
        >
          {siteConfig.name}
        </Link>
      </div>
    </header>
  );
}