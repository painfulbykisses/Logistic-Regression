// ===== STATE =====
let dataPoints = [];
let activeClass = 0;
let isPaused = false;
let animationId = null;
let simResults = [];

const C = { W: 800, H: 500, PAD: 50 };
const dataCanvas = document.getElementById('data-canvas');
const dataCtx = dataCanvas.getContext('2d');

// ===== SVG ICON TEMPLATES =====
const ICONS = {
    pause: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    play: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    trophy: '<svg class="icon icon-inline icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
};

// ===== CLASS TOGGLE =====
function setActiveClass(c) {
    activeClass = c;
    document.getElementById('class-btn-0').className = 'class-btn' + (c === 0 ? ' active-0' : '');
    document.getElementById('class-btn-1').className = 'class-btn' + (c === 1 ? ' active-1' : '');
}

// ===== DATA INPUT =====
dataCanvas.addEventListener('click', function(e) {
    const rect = dataCanvas.getBoundingClientRect();
    const sx = C.W / rect.width;
    const px = (e.clientX - rect.left) * sx;
    const py = (e.clientY - rect.top) * sx;
    const x1 = (px - C.PAD) / (C.W - 2 * C.PAD) * 10;
    const x2 = (1 - (py - C.PAD) / (C.H - 2 * C.PAD)) * 10;
    if (x1 >= 0 && x1 <= 10 && x2 >= 0 && x2 <= 10) {
        dataPoints.push({ x1, x2, label: activeClass });
        drawData();
    }
});

function clearData() {
    dataPoints = [];
    drawData();
}

function loadPreset(p) {
    dataPoints = [];
    if (p === 1) {
        for (let i = 0; i < 20; i++) { dataPoints.push({ x1: R(0.5, 4.5), x2: R(4, 9), label: 0 }); }
        for (let i = 0; i < 20; i++) { dataPoints.push({ x1: R(5.5, 9.5), x2: R(1, 6), label: 1 }); }
    } else if (p === 2) {
        for (let i = 0; i < 25; i++) { dataPoints.push({ x1: R(1, 6), x2: R(3, 8), label: 0 }); }
        for (let i = 0; i < 25; i++) { dataPoints.push({ x1: R(4, 9), x2: R(2, 7), label: 1 }); }
    } else {
        for (let i = 0; i < 20; i++) { dataPoints.push({ x1: R(0.5, 9.5), x2: R(0.5, 9.5), label: 0 }); }
        for (let i = 0; i < 20; i++) { dataPoints.push({ x1: R(0.5, 9.5), x2: R(0.5, 9.5), label: 1 }); }
    }
    drawData();
}

function R(a, b) { return a + Math.random() * (b - a); }

// ===== DRAWING FUNCTIONS =====
function drawData(canvas, ctx) {
    canvas = canvas || dataCanvas;
    ctx = ctx || dataCtx;
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, C.W, C.H);
    drawGrid(ctx);
    dataPoints.forEach(p => drawPoint(ctx, p.x1, p.x2, p.label));
    updateCounts();
}

function drawGrid(ctx) {
    ctx.strokeStyle = 'rgba(255,122,26,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        const x = C.PAD + i * (C.W - 2 * C.PAD) / 10;
        const y = C.PAD + i * (C.H - 2 * C.PAD) / 10;
        ctx.beginPath(); ctx.moveTo(x, C.PAD); ctx.lineTo(x, C.H - C.PAD); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(C.PAD, y); ctx.lineTo(C.W - C.PAD, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(i, x, C.H - C.PAD + 18);
        ctx.textAlign = 'right';
        ctx.fillText(10 - i, C.PAD - 10, y + 4);
    }
    ctx.strokeStyle = 'rgba(255,122,26,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(C.PAD, C.PAD); ctx.lineTo(C.PAD, C.H - C.PAD); ctx.lineTo(C.W - C.PAD, C.H - C.PAD); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('x₁', C.W / 2, C.H - 10);
    ctx.save(); ctx.translate(14, C.H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('x₂', 0, 0); ctx.restore();
}

function toCanvasX(x) { return C.PAD + x / 10 * (C.W - 2 * C.PAD); }
function toCanvasY(x) { return C.H - C.PAD - x / 10 * (C.H - 2 * C.PAD); }

function drawPoint(ctx, x1, x2, label, r) {
    r = r || 6;
    const cx = toCanvasX(x1), cy = toCanvasY(x2);
    const color = label === 0 ? '#4fc3f7' : '#ff7a1a';
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = label === 0 ? 'rgba(79,195,247,0.15)' : 'rgba(255,122,26,0.15)';
    ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
}

function drawDecisionBoundary(ctx, w1, w2, b, color, lw) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(C.PAD, C.PAD, C.W - 2 * C.PAD, C.H - 2 * C.PAD);
    ctx.clip();
    ctx.strokeStyle = color || '#ff7a1a';
    ctx.lineWidth = lw || 2.5;
    ctx.setLineDash([]);
    if (Math.abs(w2) > 0.0001) {
        const x1a = 0, x1b = 10;
        const x2a = -(w1 * x1a + b) / w2;
        const x2b = -(w1 * x1b + b) / w2;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x1a), toCanvasY(x2a));
        ctx.lineTo(toCanvasX(x1b), toCanvasY(x2b));
        ctx.stroke();
    } else if (Math.abs(w1) > 0.0001) {
        const x1v = -b / w1;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x1v), toCanvasY(0));
        ctx.lineTo(toCanvasX(x1v), toCanvasY(10));
        ctx.stroke();
    }
    ctx.restore();
}

function drawProbabilityHeatmap(ctx, w1, w2, b) {
    const imgW = C.W - 2 * C.PAD, imgH = C.H - 2 * C.PAD;
    const imgData = ctx.createImageData(imgW, imgH);
    const step = 2;
    for (let py = 0; py < imgH; py += step) {
        for (let px = 0; px < imgW; px += step) {
            const x1 = px / imgW * 10;
            const x2 = (1 - py / imgH) * 10;
            const z = w1 * x1 + w2 * x2 + b;
            const prob = sigmoid(z);
            const r = Math.round(79 + (255 - 79) * prob);
            const g = Math.round(195 + (122 - 195) * prob);
            const bv = Math.round(247 + (26 - 247) * prob);
            const alpha = 40;
            for (let dy = 0; dy < step && py + dy < imgH; dy++) {
                for (let dx = 0; dx < step && px + dx < imgW; dx++) {
                    const idx = ((py + dy) * imgW + (px + dx)) * 4;
                    imgData.data[idx] = r; imgData.data[idx + 1] = g;
                    imgData.data[idx + 2] = bv; imgData.data[idx + 3] = alpha;
                }
            }
        }
    }
    ctx.putImageData(imgData, C.PAD, C.PAD);
}

// ===== MATH FUNCTIONS =====
function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

function updateCounts() {
    const c0 = dataPoints.filter(p => p.label === 0).length;
    const c1 = dataPoints.filter(p => p.label === 1).length;
    document.getElementById('count-0').textContent = c0;
    document.getElementById('count-1').textContent = c1;
    document.getElementById('count-total').textContent = dataPoints.length;
}

function randomizeWeights() {
    document.getElementById('w1-init').value = (Math.random() * 4 - 2).toFixed(2);
    document.getElementById('w2-init').value = (Math.random() * 4 - 2).toFixed(2);
    document.getElementById('b-init').value = (Math.random() * 4 - 2).toFixed(2);
}

// ===== ALGORITHMS =====
function perceptronStep(w1, w2, b, lr, data) {
    let misclassified = 0;
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    for (const p of shuffled) {
        const y = p.label === 1 ? 1 : -1;
        const score = w1 * p.x1 + w2 * p.x2 + b;
        if (y * score <= 0) {
            w1 += lr * y * p.x1;
            w2 += lr * y * p.x2;
            b += lr * y;
            misclassified++;
        }
    }
    return { w1, w2, b, misclassified };
}

function logisticStep(w1, w2, b, lr, data) {
    let totalLoss = 0;
    let dw1 = 0, dw2 = 0, db = 0;
    const n = data.length;
    for (const p of data) {
        const z = w1 * p.x1 + w2 * p.x2 + b;
        const yhat = sigmoid(z);
        const y = p.label;
        const eps = 1e-15;
        totalLoss += -(y * Math.log(yhat + eps) + (1 - y) * Math.log(1 - yhat + eps));
        const err = yhat - y;
        dw1 += err * p.x1;
        dw2 += err * p.x2;
        db += err;
    }
    w1 -= lr * dw1 / n;
    w2 -= lr * dw2 / n;
    b -= lr * db / n;
    return { w1, w2, b, loss: totalLoss / n };
}

function calcAccuracy(w1, w2, b, data, isPerceptron) {
    let correct = 0;
    for (const p of data) {
        const z = w1 * p.x1 + w2 * p.x2 + b;
        let pred;
        if (isPerceptron) { pred = z > 0 ? 1 : 0; }
        else { pred = sigmoid(z) >= 0.5 ? 1 : 0; }
        if (pred === p.label) correct++;
    }
    return data.length > 0 ? correct / data.length : 0;
}

function calcLogLoss(w1, w2, b, data) {
    if (data.length === 0) return 0;
    let total = 0;
    const eps = 1e-15;
    for (const p of data) {
        const yhat = sigmoid(w1 * p.x1 + w2 * p.x2 + b);
        total += -(p.label * Math.log(yhat + eps) + (1 - p.label) * Math.log(1 - yhat + eps));
    }
    return total / data.length;
}

// ===== SIMULATION =====
function runSimulation() {
    if (dataPoints.length < 4) { alert('Tambahkan minimal 4 titik data terlebih dahulu!'); return; }
    const lr = parseFloat(document.getElementById('lr').value);
    const epochs = parseInt(document.getElementById('epochs').value);
    const w1Init = parseFloat(document.getElementById('w1-init').value);
    const w2Init = parseFloat(document.getElementById('w2-init').value);
    const bInit = parseFloat(document.getElementById('b-init').value);
    const algoChoice = document.getElementById('algo-select').value;

    simResults = [];
    const algos = [];
    if (algoChoice === 'both' || algoChoice === 'perceptron') algos.push('perceptron');
    if (algoChoice === 'both' || algoChoice === 'logistic') algos.push('logistic');

    algos.forEach(algo => {
        const history = [];
        let w1 = w1Init, w2 = w2Init, b = bInit;
        for (let e = 0; e < epochs; e++) {
            if (algo === 'perceptron') {
                const res = perceptronStep(w1, w2, b, lr, dataPoints);
                w1 = res.w1; w2 = res.w2; b = res.b;
                const loss = res.misclassified / dataPoints.length;
                const acc = calcAccuracy(w1, w2, b, dataPoints, true);
                history.push({ w1, w2, b, loss, acc, epoch: e + 1 });
            } else {
                const res = logisticStep(w1, w2, b, lr, dataPoints);
                w1 = res.w1; w2 = res.w2; b = res.b;
                const acc = calcAccuracy(w1, w2, b, dataPoints, false);
                history.push({ w1, w2, b, loss: res.loss, acc, epoch: e + 1 });
            }
        }
        simResults.push({ algo, history, color: algo === 'perceptron' ? '#4fc3f7' : '#ff7a1a' });
    });

    document.getElementById('viz-section').style.display = '';
    document.getElementById('results-section').style.display = '';
    isPaused = false;
    document.getElementById('btn-pause').innerHTML = ICONS.pause + ' Pause';
    buildVizCards();
    startAnimation();
    document.getElementById('viz-section').scrollIntoView({ behavior: 'smooth' });
}

// ===== VISUALIZATION =====
function buildVizCards() {
    const grid = document.getElementById('viz-grid');
    grid.innerHTML = '';
    simResults.forEach((sim, i) => {
        const card = document.createElement('div');
        card.className = 'viz-card';
        card.innerHTML = `
            <div class="viz-card-header">
                <div class="viz-card-title">
                    <span style="width:12px;height:12px;border-radius:50%;background:${sim.color};box-shadow:0 0 10px ${sim.color};display:inline-block;"></span>
                    ${sim.algo === 'perceptron' ? 'Perceptron' : 'Logistic Regression'}
                </div>
                <div class="viz-card-stats">
                    <div class="viz-stat"><span class="viz-stat-label">Epoch</span><span class="viz-stat-value" id="epoch-${i}">0</span></div>
                    <div class="viz-stat"><span class="viz-stat-label">Accuracy</span><span class="viz-stat-value" id="acc-${i}">0%</span></div>
                    <div class="viz-stat"><span class="viz-stat-label">Loss</span><span class="viz-stat-value" id="loss-${i}">—</span></div>
                </div>
            </div>
            <div class="viz-canvas-wrap"><canvas id="viz-canvas-${i}" width="800" height="500"></canvas></div>
        `;
        grid.appendChild(card);
    });
}

let currentEpoch = 0;
function startAnimation() {
    currentEpoch = 0;
    if (animationId) cancelAnimationFrame(animationId);
    animate();
}

function animate() {
    if (isPaused) { animationId = requestAnimationFrame(animate); return; }
    const speed = parseInt(document.getElementById('speed-slider').value);
    document.getElementById('speed-label').textContent = speed;
    const stepsPerFrame = Math.max(1, Math.floor(speed / 10));
    const maxEpoch = simResults[0]?.history.length || 0;

    for (let s = 0; s < stepsPerFrame && currentEpoch < maxEpoch; s++) {
        currentEpoch++;
    }

    simResults.forEach((sim, i) => {
        const canvas = document.getElementById(`viz-canvas-${i}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const frame = sim.history[Math.min(currentEpoch - 1, sim.history.length - 1)];
        if (!frame) return;

        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, C.W, C.H);

        if (sim.algo === 'logistic') {
            drawProbabilityHeatmap(ctx, frame.w1, frame.w2, frame.b);
        }

        drawGrid(ctx);
        drawDecisionBoundary(ctx, frame.w1, frame.w2, frame.b, sim.color, 3);
        dataPoints.forEach(p => drawPoint(ctx, p.x1, p.x2, p.label));

        document.getElementById(`epoch-${i}`).textContent = frame.epoch;
        document.getElementById(`acc-${i}`).textContent = (frame.acc * 100).toFixed(1) + '%';
        document.getElementById(`loss-${i}`).textContent = frame.loss.toFixed(4);
    });

    drawLossChart(currentEpoch);

    if (currentEpoch < maxEpoch) {
        animationId = requestAnimationFrame(animate);
    } else {
        showResults();
    }
}

// ===== LOSS CHART =====
function drawLossChart(upToEpoch) {
    const canvas = document.getElementById('loss-chart');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { t: 30, r: 30, b: 50, l: 70 };

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, W, H);

    if (simResults.length === 0) return;

    let maxLoss = 0;
    simResults.forEach(sim => {
        for (let i = 0; i < Math.min(upToEpoch, sim.history.length); i++) {
            if (sim.history[i].loss > maxLoss) maxLoss = sim.history[i].loss;
        }
    });
    maxLoss = Math.max(maxLoss, 0.1) * 1.1;
    const maxE = simResults[0].history.length;

    ctx.strokeStyle = 'rgba(255,122,26,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = pad.t + i * (H - pad.t - pad.b) / 5;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText((maxLoss * (1 - i / 5)).toFixed(3), pad.l - 8, y + 4);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Epoch', W / 2, H - 10);
    ctx.save(); ctx.translate(16, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('Loss', 0, 0); ctx.restore();

    simResults.forEach(sim => {
        ctx.strokeStyle = sim.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const n = Math.min(upToEpoch, sim.history.length);
        for (let i = 0; i < n; i++) {
            const x = pad.l + i / maxE * (W - pad.l - pad.r);
            const y = pad.t + (1 - sim.history[i].loss / maxLoss) * (H - pad.t - pad.b);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    let lx = pad.l + 10;
    simResults.forEach(sim => {
        ctx.fillStyle = sim.color;
        ctx.fillRect(lx, pad.t + 5, 14, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(sim.algo === 'perceptron' ? 'Perceptron' : 'Logistic Regression', lx + 20, pad.t + 10);
        lx += 160;
    });
}

// ===== RESULTS =====
function showResults() {
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = '';
    let bestAcc = -1, bestIdx = 0;

    simResults.forEach((sim, i) => {
        const last = sim.history[sim.history.length - 1];
        if (last.acc > bestAcc) { bestAcc = last.acc; bestIdx = i; }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="color:${sim.color};font-weight:700;">${sim.algo === 'perceptron' ? 'Perceptron' : 'Logistic Regression'}</span></td>
            <td>${last.w1.toFixed(4)}</td><td>${last.w2.toFixed(4)}</td><td>${last.b.toFixed(4)}</td>
            <td style="color:${last.acc >= 0.9 ? 'var(--success)' : 'var(--text-primary)'}; font-weight:700;">${(last.acc * 100).toFixed(1)}%</td>
            <td>${last.loss.toFixed(6)}</td><td>${last.epoch}</td>
        `;
        tbody.appendChild(tr);
    });

    if (tbody.rows.length > 0) tbody.rows[bestIdx].classList.add('best-row');

    const best = simResults[bestIdx];
    const last = best.history[best.history.length - 1];
    const card = document.getElementById('best-result-card');
    card.style.display = '';
    card.innerHTML = `
        <h3>${ICONS.trophy} Algoritma Terbaik: ${best.algo === 'perceptron' ? 'Perceptron' : 'Logistic Regression'}</h3>
        <div class="equation">${last.w1.toFixed(3)}·x₁ + ${last.w2.toFixed(3)}·x₂ + ${last.b.toFixed(3)} = 0</div>
        <div class="detail">Accuracy: ${(last.acc * 100).toFixed(1)}% · Final Loss: ${last.loss.toFixed(6)}</div>
        <div class="detail">Decision Boundary: x₂ = ${(-last.w1 / last.w2).toFixed(3)}·x₁ + ${(-last.b / last.w2).toFixed(3)}</div>
    `;
}

// ===== CONTROLS =====
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('btn-pause').innerHTML = isPaused ? ICONS.play + ' Play' : ICONS.pause + ' Pause';
}

function resetViz() {
    if (animationId) cancelAnimationFrame(animationId);
    currentEpoch = 0;
    isPaused = false;
    document.getElementById('btn-pause').innerHTML = ICONS.pause + ' Pause';
    if (simResults.length > 0) startAnimation();
}

// ===== INIT =====
drawData();
