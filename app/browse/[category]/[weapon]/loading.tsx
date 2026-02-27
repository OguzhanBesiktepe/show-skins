import SkinCardSkeleton from "../../../components/SkinCardSkeleton";

export default function WeaponLoading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 48 }).map((_, i) => (
          <SkinCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
