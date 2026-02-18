export default function Navbar() {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold text-white">ShowSkins</div>

        <div className="flex gap-6 text-sm text-zinc-300">
          <span className="hover:text-white cursor-pointer">Pistols</span>
          <span className="hover:text-white cursor-pointer">SMGs</span>
          <span className="hover:text-white cursor-pointer">Rifles</span>
          <span className="hover:text-white cursor-pointer">Knives</span>
          <span className="hover:text-white cursor-pointer">Gloves</span>
        </div>
      </div>
    </nav>
  );
}
