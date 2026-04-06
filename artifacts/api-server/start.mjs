import net from "node:net";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function isPortInUse(portToCheck) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: portToCheck });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED") {
        resolve(false);
        return;
      }

      reject(error);
    });
  });
}

async function isLunarMoodHealthcheckAvailable(portToCheck) {
  try {
    const response = await fetch(`http://127.0.0.1:${portToCheck}/api/healthz`);
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}

async function start() {
  const portIsInUse = await isPortInUse(port);

  if (portIsInUse) {
    const backendAlreadyRunning = await isLunarMoodHealthcheckAvailable(port);

    if (backendAlreadyRunning) {
      console.log(`LunarMood backend already running on port ${port}. Reusing existing instance.`);
      return;
    }

    throw new Error(`Port ${port} is already in use by another process.`);
  }

  await import("./dist/index.mjs");
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
