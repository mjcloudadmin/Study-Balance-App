import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // Simple in-memory storage for peer support messages (for demo/prototype)
  // In a real app, this would be a database
  const messages: any[] = [];
  const rooms: Record<string, Set<WebSocket>> = {};

  wss.on("connection", (ws) => {
    let currentRoom = "general";
    
    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === "join") {
        currentRoom = message.room || "general";
        if (!rooms[currentRoom]) rooms[currentRoom] = new Set();
        rooms[currentRoom].add(ws);
        
        // Send existing messages for this room
        const roomMessages = messages.filter(m => m.room === currentRoom);
        ws.send(JSON.stringify({ type: "history", messages: roomMessages }));
      } else if (message.type === "chat") {
        const chatMsg = {
          id: Date.now().toString(),
          room: currentRoom,
          text: message.text,
          user: message.user || "Anonymous Student",
          timestamp: new Date().toISOString()
        };
        messages.push(chatMsg);
        
        // Broadcast to everyone in the room
        rooms[currentRoom]?.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "chat", message: chatMsg }));
          }
        });
      }
    });

    ws.on("close", () => {
      rooms[currentRoom]?.delete(ws);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
