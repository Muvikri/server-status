async function loadStatus() {
    const res = await fetch('/api/status');
    const s = await res.json();

    const ramCircle = document.querySelector('#ram .circle');
    const ramText = document.querySelector('#ram .gauge-text');
    const ramValue = parseFloat(s.ram);
    const ramCirc = ramCircle.getTotalLength();
    ramCircle.setAttribute('stroke-dasharray', `${(ramValue / 100) * ramCirc}, ${ramCirc}`);
    ramText.textContent = `${ramValue}%`;

    const diskFill = document.querySelector('#disk .progress-fill');
    const diskText = document.querySelector('#disk .progress-text');
    const diskUnit = document.querySelector('#disk .progress-unit');

    const diskValue = parseFloat(s.disk);
    const totalDiskGB = 320;
    const usedDiskGB = Math.round((diskValue / 100) * totalDiskGB);

    diskFill.style.width = `${diskValue}%`;
    diskText.textContent = `${diskValue}%`;
    diskUnit.textContent = `${usedDiskGB} GB`;

    document.getElementById('netUp').textContent =
        `${s.net.deltaUp} MB/s ↑ (Total: ${s.net.totalUp} MB)`;
    document.getElementById('netDown').textContent =
        `${s.net.deltaDown} MB/s ↓ (Total: ${s.net.totalDown} MB)`;

    const cpuCircle = document.querySelector('#cpu .gauge.red .circle');
    const tempCircle = document.querySelector('#cpu .gauge.blue .circle');

    const cpuText = document.querySelector('#cpu .gauge.red .gauge-text');
    const tempText = document.querySelector('#cpu .gauge.blue .gauge-text');

    const cpuValue = parseFloat(s.cpu);
    const tempValue = Math.min(parseFloat(s.temp), 100);

    const cpuCirc = cpuCircle.getTotalLength();
    const tempCirc = tempCircle.getTotalLength();

    cpuCircle.setAttribute('stroke-dasharray', `${(cpuValue / 100) * cpuCirc}, ${cpuCirc}`);
    tempCircle.setAttribute('stroke-dasharray', `${(tempValue / 100) * tempCirc}, ${tempCirc}`);

    cpuText.textContent = `${cpuValue}%`;
    tempText.textContent = `${tempValue}°C`;
}

async function loadInfo() {
    const res = await fetch('/api/info');
    const info = await res.json();

    document.getElementById('uptime').textContent = `Uptime: ${info.uptime}`;

    let time = new Date(info.time);
    const clockEl = document.getElementById('clock');

    setInterval(() => {
        time.setSeconds(time.getSeconds() + 1);
        clockEl.textContent = time.toLocaleTimeString();
    }, 1000);
}

async function initDashboard() {
    await loadInfo();
    await loadStatus();
    setInterval(loadStatus, 3000);
}

initDashboard();
