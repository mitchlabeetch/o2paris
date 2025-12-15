export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-water-light">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-water-dark"></div>
        <div className="text-water-dark text-xl font-semibold animate-pulse">Chargement de la carte...</div>
      </div>
    </div>
  );
}
