import { useEffect, useState } from 'react';

interface QueueItem {
  id: string;
  slotId: string;
  userName: string;
  action: 'viewing' | 'booking';
  timestamp: Date;
}

function LiveBookingQueue({ slotId }: { slotId: string }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate live queue updates
    // In production, this would use WebSocket or SSE
    const simulateQueue = () => {
      const actions: ('viewing' | 'booking')[] = ['viewing', 'booking'];
      const names = ['User A', 'User B', 'User C', 'User D'];

      const newItem: QueueItem = {
        id: Math.random().toString(36).substr(2, 9),
        slotId,
        userName: names[Math.floor(Math.random() * names.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        timestamp: new Date(),
      };

      setQueue((prev) => {
        const updated = [newItem, ...prev].slice(0, 5); // Keep last 5
        return updated;
      });

      // Remove old items
      setTimeout(() => {
        setQueue((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 5000);
    };

    const interval = setInterval(simulateQueue, 3000);
    return () => clearInterval(interval);
  }, [slotId]);

  if (queue.length === 0) return null;

  return (
    <div className="live-queue">
      <div className="queue-header" onClick={() => setIsVisible(!isVisible)}>
        <span className="live-pulse"></span>
        <span>Live Activity ({queue.length})</span>
        <span className="queue-toggle">{isVisible ? '▼' : '▶'}</span>
      </div>

      {isVisible && (
        <div className="queue-items">
          {queue.map((item) => (
            <div key={item.id} className="queue-item">
              <div className="queue-avatar">{item.userName.charAt(0)}</div>
              <div className="queue-info">
                <div className="queue-user">{item.userName}</div>
                <div className="queue-action">
                  {item.action === 'viewing' ? '👁️ Viewing' : '📅 Booking'}
                </div>
              </div>
              <div className="queue-time">
                {Math.floor((Date.now() - item.timestamp.getTime()) / 1000)}s ago
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveBookingQueue;
