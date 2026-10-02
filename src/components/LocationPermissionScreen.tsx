import { MapPin } from 'lucide-react';
interface LocationPermissionScreenProps { onAllow?: () => void; onManual?: () => void }
export function LocationPermissionScreen({ onManual }: LocationPermissionScreenProps) {
  return <div className="consumer-ui campus-welcome">
    <section className="campus-surface p-6 w-full max-w-md">
      <MapPin size={40} aria-hidden="true" className="mb-6" />
      <p className="campus-eyebrow">MITS campus</p><h1 className="text-3xl mt-2 mb-4">Food around you</h1>
      <p className="campus-muted mb-6">Browse campus shops and find your next bite. When you need directions, use your location from the shop map.</p>
      <button className="campus-primary" onClick={onManual}>Browse the campus menu</button>
      <p className="campus-muted mt-4 text-xs">Location access is optional. The map asks when you choose to use it.</p>
    </section>
  </div>;
}
