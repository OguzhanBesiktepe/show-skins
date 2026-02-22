import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#272727] text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left — Logo */}
          <div className="flex justify-center md:justify-start">
            <img
              src="/logo.png"
              alt="ShowSkins Logo"
              className="h-30 object-contain"
            />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-xs text-zinc-300 mt-4">
              © {new Date().getFullYear()} ShowSkins. All rights reserved.
            </p>
          </div>

          {/* Right — Personal + Social */}
          <div className="text-center md:text-right">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Built By
            </h3>

            <p className="mt-3 text-sm text-zinc-300">Oguzhan Besiktepe</p>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-end items-center gap-4 mt-4">
              <a
                href="https://github.com/OguzhanBesiktepe"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white hover:scale-110 transform transition duration-200"
              >
                <Github size={18} />
              </a>

              <a
                href="https://linkedin.com/in/oguzhan-besiktepe"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white hover:scale-110 transform transition duration-200"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
