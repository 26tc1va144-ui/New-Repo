/**
 * Real-time event broadcaster using Server-Sent Events (SSE)
 * Zero external dependencies, native in all modern browsers.
 */

class RealtimeBroadcaster {
  constructor() {
    this.clients = new Set();
  }

  // Register client connection
  addClient(res) {
    this.clients.add(res);

    // Initial heartbeat
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    // Remove on disconnect
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  // Broadcast an event to all connected sessions
  broadcast(eventType, payload = {}) {
    const data = JSON.stringify({
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      try {
        client.write(`data: ${data}\n\n`);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }
}

export const realtime = new RealtimeBroadcaster();
