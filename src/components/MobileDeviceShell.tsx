import { X } from 'lucide-react';
export interface ActiveOrderInfo {
  token: string; orderId?: string; vendor: string; status: string;
  stage?: 'sent' | 'preparing' | 'ready' | 'declined';
}
interface MobileDeviceShellProps { children: React.ReactNode; activeOrder?: ActiveOrderInfo | null; onClearActiveOrder?: () => void }
export function MobileDeviceShell({ children, activeOrder, onClearActiveOrder }: MobileDeviceShellProps) {
  return <div className="app-shell">
    <div role="status" aria-live="polite" aria-atomic="true" className={activeOrder ? 'live-order' : 'sr-only'} data-stage={activeOrder?.stage}>
      {activeOrder && <><div><strong>Token #{activeOrder.token} · {activeOrder.vendor}</strong><p>{activeOrder.status}</p></div><button aria-label="Dismiss order tracking" onClick={onClearActiveOrder}><X size={18} aria-hidden="true" /></button></>}
    </div>
    {children}
  </div>;
}
