import { useNetworkStatus } from '../utils/network-error-utils';

export function NetworkStatusIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus();
  
  if (isOnline && !wasOffline) {
    return null;
  }
  
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      {isOnline ? (
        <span className="flex items-center gap-2">
          🌐 Connessione ripristinata
        </span>
      ) : (
        <span className="flex items-center gap-2">
          📡 Nessuna connessione internet
        </span>
      )}
    </div>
  );
}