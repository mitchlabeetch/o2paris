'use client';

import dynamicImport from 'next/dynamic';
import { useState, useMemo } from 'react';
import MapOverlay from '@/components/MapOverlay';
import Loading from '@/components/Loading';
import type { Pinpoint, MapConfig } from '@/lib/db';

// Dynamically import Map component with no SSR to avoid Leaflet issues
const Map = dynamicImport(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <Loading />,
});

interface HomeClientProps {
  initialPinpoints: Pinpoint[];
  config: MapConfig;
}

export default function HomeClient({ initialPinpoints, config }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPinpoints = useMemo(() => {
    if (!searchQuery) return initialPinpoints;
    const lowerQuery = searchQuery.toLowerCase();
    return initialPinpoints.filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }, [initialPinpoints, searchQuery]);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MapOverlay
        onSearch={setSearchQuery}
        onLocate={() => {
           // Locate logic is handled inside Map component via internal state/effect or prop
           // But actually my Map component has its own LocateControl.
           // So we don't strictly need to pass this down unless we want to trigger it from outside.
           // For now, let's keep it simple.
        }}
      />

      <Map pinpoints={filteredPinpoints} config={config} />
    </main>
  );
}
