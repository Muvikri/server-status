import express from "express";
import si from "systeminformation";
import fs from "fs";
import os from "os";

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// ----------------- HELPERS -----------------
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

function readProcStat() {
    const data = fs.readFileSync("/proc/stat", "utf8");
    const cpuLine = data.split("\n")[0].trim().split(/\s+/);
    const user = parseInt(cpuLine[1]);
    const nice = parseInt(cpuLine[2]);
    const system = parseInt(cpuLine[3]);
    const idle = parseInt(cpuLine[4]);
    const iowait = parseInt(cpuLine[5]);
    const total = user + nice + system + idle + iowait;
    return { total, idle };
}

function readNetwork() {
    const data = fs.readFileSync("/proc/net/dev", "utf8").split("\n").slice(2);
    const first = data.find(line => line.includes(":"));
    if (!first) return { rx: 0, tx: 0 };
    const parts = first.split(/[:\s]+/).filter(Boolean);
    const rx = parseInt(parts[1]);
    const tx = parseInt(parts[9]);
    return { rx, tx };
}

// ----------------- CACHE -----------------
let prevCpu = readProcStat();
let prevNet = readNetwork();

let cache = {
    cpu: 0,
    ram: 0,
    temp: 0,
    disk: 0,
    net: {
        deltaUp: 0,
        deltaDown: 0,
        totalUp: 0,
        totalDown: 0
    }
};

// ----------------- API ENDPOINTS -----------------
app.get("/api/info", (req, res) => {
    res.json({
        time: new Date().toISOString(),
        uptime: formatUptime(os.uptime())
    });
});

app.get("/api/status", (req, res) => {
    res.json(cache);
});

// ----------------- UPDATE CACHE -----------------
async function updateCache() {
    try {
        // CPU usage
        const currCpu = readProcStat();
        const totalDiff = currCpu.total - prevCpu.total;
        const idleDiff = currCpu.idle - prevCpu.idle;
        const cpuUsage = ((1 - idleDiff / totalDiff) * 100).toFixed(1);
        prevCpu = currCpu;

        // RAM usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const ramUsage = ((1 - freeMem / totalMem) * 100).toFixed(1);

        // CPU temperature
        const temp = (await si.cpuTemperature()).main || 0;

        // Disk usage
        const disks = await si.fsSize();
        const disk = disks?.[0]?.use?.toFixed(1) ?? 0;

        // Network
        const currNet = readNetwork();
        const deltaUp = ((currNet.tx - prevNet.tx) / 1024 / 1024).toFixed(2);
        const deltaDown = ((currNet.rx - prevNet.rx) / 1024 / 1024).toFixed(2);
        const totalUp = (currNet.tx / 1024 / 1024).toFixed(2);
        const totalDown = (currNet.rx / 1024 / 1024).toFixed(2);
        prevNet = currNet;

        cache = {
            cpu: cpuUsage,
            ram: ramUsage,
            temp,
            disk,
            net: { deltaUp, deltaDown, totalUp, totalDown }
        };
    } catch (err) {
        console.error("updateCache error:", err.message);
    }
}

// ----------------- START LOOP -----------------
setInterval(updateCache, 3000);
updateCache();

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
    console.log(`✅ Linux Monitoring API running at http://localhost:${PORT}`);
});
