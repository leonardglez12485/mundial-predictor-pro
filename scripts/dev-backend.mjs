import { spawn } from "node:child_process";
import net from "node:net";

const port = Number.parseInt(process.env.BACKEND_PORT ?? "3001", 10);
const host = process.env.BACKEND_HOST ?? "127.0.0.1";
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? `http://localhost:${port}/api`;

function isPortInUse(targetPort, targetHost) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(targetPort, targetHost);
  });
}

async function isExpectedBackendRunning() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${apiBaseUrl}/ranking`, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

function keepProcessAlive() {
  console.log(`[backend] Reutilizando backend ya activo en ${apiBaseUrl}`);
  const interval = setInterval(() => {}, 60_000);

  const stop = () => {
    clearInterval(interval);
    process.exit(0);
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

async function main() {
  const portOccupied = await isPortInUse(port, host);

  if (portOccupied) {
    const backendReady = await isExpectedBackendRunning();

    if (backendReady) {
      keepProcessAlive();
      return;
    }

    console.error(`[backend] El puerto ${port} ya está en uso por otro proceso y no responde como la API esperada.`);
    process.exit(1);
  }

  const child = spawn("npm --prefix backend run start:dev", [], {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });

  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
}

void main();
