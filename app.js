// ============================================================
// Linear Regression — Gradient Descent Simulation
// ============================================================

(() => {
    'use strict';

    // ==================== STATE ====================
    const SIM_COLORS = ['#ff7a1a', '#ffb347', '#ff5722', '#ffd180', '#e65100', '#ffab40'];
    const SIM_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];

    let dataPoints = [];
    let simulations = [];
    let simResults = [];
    let animRunning = false;
    let animPaused = false;
    let animSpeed = 50;
    let animFrameId = null;
    let simIdCounter = 0;

    // ==================== DOM REFS ====================
    const dataCanvas = document.getElementById('data-canvas');
    const dataCtx = dataCanvas.getContext('2d');
    const pointCountEl = document.getElementById('point-count');
    const simConfigsEl = document.getElementById('sim-configs');
    const vizSection = document.getElementById('viz-section');
    const vizGrid = document.getElementById('viz-grid');
    const resultsSection = document.getElementById('results-section');
    const resultsBody = document.getElementById('results-body');
    const bestResultCard = document.getElementById('best-result-card');
    const mseChart = document.getElementById('mse-chart');
    const mseCtx = mseChart.getContext('2d');
    const speedSlider = document.getElementById('speed-slider');
    const speedLabel = document.getElementById('speed-label');

    // Canvas scaling for retina
    function setupHiDPI(canvas, w, h) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ==================== DATA CANVAS ====================
    const DATA_W = 800, DATA_H = 450;
    // Coordinate ranges for mapping
    const COORD = { xMin: -1, xMax: 11, yMin: -2, yMax: 14 };

    function toCanvasX(x) { return ((x - COORD.xMin) / (COORD.xMax - COORD.xMin)) * DATA_W; }
    function toCanvasY(y) { return DATA_H - ((y - COORD.yMin) / (COORD.yMax - COORD.yMin)) * DATA_H; }
    function toDataX(cx) { return COORD.xMin + (cx / DATA_W) * (COORD.xMax - COORD.xMin); }
    function toDataY(cy) { return COORD.yMin + ((DATA_H - cy) / DATA_H) * (COORD.yMax - COORD.yMin); }

    function drawGrid(ctx, w, h) {
        ctx.clearRect(0, 0, w, h);

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0e0e0e');
        grad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,122,26,0.05)';
        ctx.lineWidth = 1;
        for (let x = Math.ceil(COORD.xMin); x <= COORD.xMax; x++) {
            const cx = toCanvasX(x);
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
        }
        for (let y = Math.ceil(COORD.yMin); y <= COORD.yMax; y++) {
            const cy = toCanvasY(y);
            ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255,122,26,0.15)';
        ctx.lineWidth = 1.5;
        const cx0 = toCanvasX(0);
        const cy0 = toCanvasY(0);
        ctx.beginPath(); ctx.moveTo(cx0, 0); ctx.lineTo(cx0, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy0); ctx.lineTo(w, cy0); ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(154,145,138,0.5)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        for (let x = Math.ceil(COORD.xMin); x <= COORD.xMax; x += 1) {
            ctx.fillText(x, toCanvasX(x), cy0 + 15);
        }
        ctx.textAlign = 'right';
        for (let y = Math.ceil(COORD.yMin); y <= COORD.yMax; y += 2) {
            ctx.fillText(y, cx0 - 6, toCanvasY(y) + 4);
        }
    }

    function drawDataPoints(ctx, points, w, h) {
        drawGrid(ctx, w, h);

        points.forEach(p => {
            const cx = toCanvasX(p.x);
            const cy = toCanvasY(p.y);

            // Outer glow
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,122,26,0.12)';
            ctx.fill();

            // Inner dot
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ff7a1a';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    function refreshDataCanvas() {
        setupHiDPI(dataCanvas, DATA_W, DATA_H);
        drawDataPoints(dataCtx, dataPoints, DATA_W, DATA_H);
        pointCountEl.textContent = dataPoints.length;
    }

    // Click to add point
    dataCanvas.addEventListener('click', (e) => {
        const rect = dataCanvas.getBoundingClientRect();
        const scaleX = DATA_W / rect.width;
        const scaleY = DATA_H / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        const dx = toDataX(cx);
        const dy = toDataY(cy);
        dataPoints.push({ x: parseFloat(dx.toFixed(2)), y: parseFloat(dy.toFixed(2)) });
        refreshDataCanvas();
    });

    // Preset datasets
    document.getElementById('btn-preset-1').addEventListener('click', () => {
        dataPoints = [
            {x:1, y:2}, {x:2, y:4}, {x:3, y:5}, {x:4, y:4.5},
            {x:5, y:7}, {x:6, y:8}, {x:7, y:7.5}, {x:8, y:9},
            {x:9, y:10}, {x:10, y:12}
        ];
        refreshDataCanvas();
    });

    document.getElementById('btn-preset-2').addEventListener('click', () => {
        dataPoints = [
            {x:0.5, y:1}, {x:1, y:3}, {x:1.5, y:2.5}, {x:2, y:5},
            {x:3, y:4}, {x:3.5, y:6}, {x:4, y:5.5}, {x:5, y:7},
            {x:5.5, y:8}, {x:6, y:7}, {x:7, y:9}, {x:8, y:10},
            {x:9, y:11}, {x:9.5, y:10.5}, {x:10, y:13}
        ];
        refreshDataCanvas();
    });

    document.getElementById('btn-preset-3').addEventListener('click', () => {
        dataPoints = [];
        const n = 12 + Math.floor(Math.random() * 8);
        const trueM = 0.5 + Math.random() * 1.5;
        const trueB = -0.5 + Math.random() * 3;
        for (let i = 0; i < n; i++) {
            const x = 0.5 + Math.random() * 9.5;
            const noise = (Math.random() - 0.5) * 3;
            const y = trueM * x + trueB + noise;
            dataPoints.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
        }
        refreshDataCanvas();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        dataPoints = [];
        refreshDataCanvas();
    });

    // ==================== SIMULATION CONFIGS ====================
    function createSimCard(id) {
        const idx = id % SIM_COLORS.length;
        const color = SIM_COLORS[idx];
        const name = SIM_NAMES[idx] || `Sim ${id + 1}`;

        const lrOptions = [0.001, 0.005, 0.01, 0.02, 0.05];
        const lr = lrOptions[id % lrOptions.length] || 0.01;
        const initM = parseFloat((Math.random() * 6 - 3).toFixed(2));
        const initB = parseFloat((Math.random() * 10 - 5).toFixed(2));

        const card = document.createElement('div');
        card.className = 'sim-card';
        card.style.setProperty('--sim-color', color);
        card.dataset.simId = id;
        card.innerHTML = `
            <div class="sim-card-header">
                <div class="sim-card-title">
                    <span class="sim-dot"></span>
                    Simulasi ${name}
                </div>
                <button class="btn-remove" title="Hapus">✕</button>
            </div>
            <div class="sim-field">
                <label>Learning Rate (α)</label>
                <input type="number" class="input-lr" value="${lr}" min="0.0001" max="1" step="0.001">
            </div>
            <div class="sim-field-row">
                <div class="sim-field">
                    <label>Slope Awal (m₀)</label>
                    <input type="number" class="input-m" value="${initM}" step="0.1">
                </div>
                <div class="sim-field">
                    <label>Intercept Awal (b₀)</label>
                    <input type="number" class="input-b" value="${initB}" step="0.1">
                </div>
            </div>
            <div class="sim-field">
                <button class="randomize-btn"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg> Randomize m & b</button>
            </div>
        `;

        card.querySelector('.btn-remove').addEventListener('click', () => {
            simulations = simulations.filter(s => s.id !== id);
            card.remove();
        });

        card.querySelector('.randomize-btn').addEventListener('click', () => {
            card.querySelector('.input-m').value = (Math.random() * 6 - 3).toFixed(2);
            card.querySelector('.input-b').value = (Math.random() * 10 - 5).toFixed(2);
        });

        return card;
    }

    function addSimulation() {
        const id = simIdCounter++;
        const card = createSimCard(id);
        simConfigsEl.appendChild(card);
        simulations.push({ id });
    }

    // Initial 3 simulations
    addSimulation();
    addSimulation();
    addSimulation();

    document.getElementById('btn-add-sim').addEventListener('click', () => {
        if (simIdCounter >= 6) {
            alert('Maksimal 6 simulasi!');
            return;
        }
        addSimulation();
    });

    // ==================== GRADIENT DESCENT ====================
    function computeMSE(points, m, b) {
        if (points.length === 0) return 0;
        let sum = 0;
        for (const p of points) {
            const err = p.y - (m * p.x + b);
            sum += err * err;
        }
        return sum / points.length;
    }

    function computeGradients(points, m, b) {
        const n = points.length;
        if (n === 0) return { dm: 0, db: 0 };
        let dm = 0, db = 0;
        for (const p of points) {
            const err = p.y - (m * p.x + b);
            dm += -2 * p.x * err;
            db += -2 * err;
        }
        return { dm: dm / n, db: db / n };
    }

    // ==================== RUN SIMULATION ====================
    const MAX_EPOCHS = 2000;

    function collectSimConfigs() {
        const cards = simConfigsEl.querySelectorAll('.sim-card');
        const configs = [];
        cards.forEach((card, idx) => {
            const lr = parseFloat(card.querySelector('.input-lr').value) || 0.01;
            const m0 = parseFloat(card.querySelector('.input-m').value) || 0;
            const b0 = parseFloat(card.querySelector('.input-b').value) || 0;
            const simId = parseInt(card.dataset.simId);
            const color = SIM_COLORS[simId % SIM_COLORS.length];
            const name = SIM_NAMES[simId % SIM_NAMES.length];
            configs.push({ id: simId, lr, m0, b0, color, name, idx });
        });
        return configs;
    }

    function runAllGradientDescent(configs) {
        return configs.map(cfg => {
            let m = cfg.m0;
            let b = cfg.b0;
            const history = [{ m, b, mse: computeMSE(dataPoints, m, b) }];

            for (let epoch = 0; epoch < MAX_EPOCHS; epoch++) {
                const { dm, db } = computeGradients(dataPoints, m, b);
                m -= cfg.lr * dm;
                b -= cfg.lr * db;

                // Divergence check
                if (!isFinite(m) || !isFinite(b) || Math.abs(m) > 1e6 || Math.abs(b) > 1e6) {
                    break;
                }

                const mse = computeMSE(dataPoints, m, b);
                history.push({ m, b, mse });

                // Early stopping
                if (history.length > 2) {
                    const prev = history[history.length - 2].mse;
                    if (Math.abs(prev - mse) < 1e-10) break;
                }
            }

            return {
                ...cfg,
                history,
                finalM: history[history.length - 1].m,
                finalB: history[history.length - 1].b,
                finalMSE: history[history.length - 1].mse,
                epochs: history.length - 1
            };
        });
    }

    // ==================== VISUALIZATION RENDERING ====================
    const VIZ_W = 420, VIZ_H = 300;

    function drawVizFrame(ctx, w, h, points, m, b, color, ghostHistory) {
        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0e0e0e');
        grad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,122,26,0.04)';
        ctx.lineWidth = 1;
        const scaleX = (x) => ((x - COORD.xMin) / (COORD.xMax - COORD.xMin)) * w;
        const scaleY = (y) => h - ((y - COORD.yMin) / (COORD.yMax - COORD.yMin)) * h;

        for (let x = Math.ceil(COORD.xMin); x <= COORD.xMax; x += 2) {
            const sx = scaleX(x);
            ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
        }
        for (let y = Math.ceil(COORD.yMin); y <= COORD.yMax; y += 2) {
            const sy = scaleY(y);
            ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke();
        }

        // Ghost lines (history trail)
        if (ghostHistory && ghostHistory.length > 1) {
            const step = Math.max(1, Math.floor(ghostHistory.length / 15));
            // Parse hex color to rgb components
            const hexToRgb = (hex) => {
                const r = parseInt(hex.slice(1,3), 16);
                const g = parseInt(hex.slice(3,5), 16);
                const b = parseInt(hex.slice(5,7), 16);
                return {r, g, b};
            };
            const rgb = hexToRgb(color);
            for (let i = 0; i < ghostHistory.length - 1; i += step) {
                const gh = ghostHistory[i];
                const alpha = 0.05 + 0.15 * (i / ghostHistory.length);
                ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(scaleX(COORD.xMin), scaleY(gh.m * COORD.xMin + gh.b));
                ctx.lineTo(scaleX(COORD.xMax), scaleY(gh.m * COORD.xMax + gh.b));
                ctx.stroke();
            }
        }

        // Error lines
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#ff4d4d';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        points.forEach(p => {
            const pred = m * p.x + b;
            ctx.beginPath();
            ctx.moveTo(scaleX(p.x), scaleY(p.y));
            ctx.lineTo(scaleX(p.x), scaleY(pred));
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Current regression line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(scaleX(COORD.xMin), scaleY(m * COORD.xMin + b));
        ctx.lineTo(scaleX(COORD.xMax), scaleY(m * COORD.xMax + b));
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Data points
        points.forEach(p => {
            const cx = scaleX(p.x);
            const cy = scaleY(p.y);
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff7a1a';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });
    }

    // ==================== MSE CHART ====================
    const MSE_W = 900, MSE_H = 350;

    function drawMSEChart(results, currentStep) {
        setupHiDPI(mseChart, MSE_W, MSE_H);
        const ctx = mseCtx;
        const w = MSE_W, h = MSE_H;
        const pad = { top: 20, right: 30, bottom: 50, left: 70 };
        const plotW = w - pad.left - pad.right;
        const plotH = h - pad.top - pad.bottom;

        // Background
        ctx.fillStyle = '#0e0e0e';
        ctx.fillRect(0, 0, w, h);

        // Find max MSE and max epoch (capped at currentStep)
        let maxMSE = 0;
        let maxEpoch = 0;
        results.forEach(r => {
            const steps = Math.min(r.history.length, currentStep + 1);
            maxEpoch = Math.max(maxEpoch, steps);
            for (let i = 0; i < steps; i++) {
                if (isFinite(r.history[i].mse)) maxMSE = Math.max(maxMSE, r.history[i].mse);
            }
        });
        if (maxMSE === 0) maxMSE = 1;
        // Cap max MSE for visualization (prevent extreme values from squashing)
        const displayMaxMSE = Math.min(maxMSE, maxMSE);

        const scaleX = (epoch) => pad.left + (epoch / Math.max(maxEpoch - 1, 1)) * plotW;
        const mseScale = (mse) => pad.top + plotH - (Math.min(mse, displayMaxMSE) / displayMaxMSE) * plotH;

        // Grid
        ctx.strokeStyle = 'rgba(255,122,26,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + (i / 5) * plotH;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = 'rgba(154,145,138,0.5)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const val = displayMaxMSE * (1 - i / 5);
            const y = pad.top + (i / 5) * plotH;
            ctx.fillText(val.toFixed(2), pad.left - 8, y + 4);
        }

        ctx.textAlign = 'center';
        const epochLabels = 5;
        for (let i = 0; i <= epochLabels; i++) {
            const epoch = Math.round((i / epochLabels) * (maxEpoch - 1));
            const x = scaleX(epoch);
            ctx.fillText(epoch, x, h - pad.bottom + 20);
        }

        // Axis titles
        ctx.fillStyle = 'rgba(154,145,138,0.7)';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Epoch', w / 2, h - 8);
        ctx.save();
        ctx.translate(15, pad.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('MSE', 0, 0);
        ctx.restore();

        // Draw lines for each simulation
        results.forEach(r => {
            const steps = Math.min(r.history.length, currentStep + 1);
            if (steps < 2) return;

            ctx.strokeStyle = r.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = r.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            for (let i = 0; i < steps; i++) {
                const x = scaleX(i);
                const y = mseScale(r.history[i].mse);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Label at end
            const lastI = steps - 1;
            const lx = scaleX(lastI);
            const ly = mseScale(r.history[lastI].mse);
            ctx.fillStyle = r.color;
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(r.name, lx + 6, ly - 4);
        });
    }

    // ==================== ANIMATION LOOP ====================
    function buildVizCards(results) {
        vizGrid.innerHTML = '';
        results.forEach(r => {
            const card = document.createElement('div');
            card.className = 'viz-card';
            card.innerHTML = `
                <div class="viz-card-header">
                    <div class="viz-card-title">
                        <span class="sim-dot" style="background:${r.color};box-shadow:0 0 10px ${r.color}"></span>
                        Simulasi ${r.name}
                    </div>
                    <div class="viz-card-stats">
                        <div class="viz-stat">
                            <span class="viz-stat-label">Epoch</span>
                            <span class="viz-stat-value" data-stat="epoch">0</span>
                        </div>
                        <div class="viz-stat">
                            <span class="viz-stat-label">m</span>
                            <span class="viz-stat-value" data-stat="m">${r.m0.toFixed(3)}</span>
                        </div>
                        <div class="viz-stat">
                            <span class="viz-stat-label">b</span>
                            <span class="viz-stat-value" data-stat="b">${r.b0.toFixed(3)}</span>
                        </div>
                        <div class="viz-stat">
                            <span class="viz-stat-label">MSE</span>
                            <span class="viz-stat-value" data-stat="mse">—</span>
                        </div>
                        <div class="viz-stat">
                            <span class="viz-stat-label">LR</span>
                            <span class="viz-stat-value">${r.lr}</span>
                        </div>
                    </div>
                </div>
                <div class="viz-canvas-wrap">
                    <canvas class="viz-canvas" width="${VIZ_W}" height="${VIZ_H}"></canvas>
                </div>
            `;
            vizGrid.appendChild(card);

            const canvas = card.querySelector('.viz-canvas');
            setupHiDPI(canvas, VIZ_W, VIZ_H);
            r._canvas = canvas;
            r._ctx = canvas.getContext('2d');
            r._card = card;
        });
    }

    function animateSimulations(results) {
        let step = 0;
        const maxSteps = Math.max(...results.map(r => r.history.length));

        function frame() {
            if (animPaused) {
                animFrameId = requestAnimationFrame(frame);
                return;
            }

            // How many steps per frame based on speed
            const stepsPerFrame = Math.max(1, Math.floor(animSpeed / 10));

            for (let s = 0; s < stepsPerFrame && step < maxSteps; s++, step++) {
                results.forEach(r => {
                    const i = Math.min(step, r.history.length - 1);
                    const { m, b, mse } = r.history[i];

                    // Draw viz
                    const ghostSlice = r.history.slice(0, i);
                    drawVizFrame(r._ctx, VIZ_W, VIZ_H, dataPoints, m, b, r.color, ghostSlice);

                    // Update stats
                    const epochEl = r._card.querySelector('[data-stat="epoch"]');
                    const mEl = r._card.querySelector('[data-stat="m"]');
                    const bEl = r._card.querySelector('[data-stat="b"]');
                    const mseEl = r._card.querySelector('[data-stat="mse"]');
                    epochEl.textContent = i;
                    mEl.textContent = m.toFixed(4);
                    bEl.textContent = b.toFixed(4);
                    mseEl.textContent = mse.toFixed(4);
                });
            }

            // MSE chart
            drawMSEChart(results, step);

            if (step < maxSteps) {
                const delay = Math.max(5, 120 - animSpeed);
                setTimeout(() => {
                    animFrameId = requestAnimationFrame(frame);
                }, delay);
            } else {
                animRunning = false;
                showResults(results);
            }
        }

        animRunning = true;
        animPaused = false;
        animFrameId = requestAnimationFrame(frame);
    }

    // ==================== RESULTS ====================
    function showResults(results) {
        resultsSection.style.display = '';

        // Sort by MSE
        const sorted = [...results].sort((a, b) => a.finalMSE - b.finalMSE);

        resultsBody.innerHTML = '';
        sorted.forEach((r, idx) => {
            const rank = idx + 1;
            const tr = document.createElement('tr');
            if (rank === 1) tr.className = 'best-row';

            let rankClass = '';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            tr.innerHTML = `
                <td><span class="rank-badge ${rankClass}">${rank}</span></td>
                <td style="color:${r.color};font-weight:700;font-family:var(--font-main);">${r.name}</td>
                <td>${r.lr}</td>
                <td>${r.m0.toFixed(3)}</td>
                <td>${r.b0.toFixed(3)}</td>
                <td>${r.finalM.toFixed(5)}</td>
                <td>${r.finalB.toFixed(5)}</td>
                <td style="font-weight:700;${rank === 1 ? 'color:var(--success)' : ''}">${r.finalMSE.toFixed(6)}</td>
                <td>${r.epochs}</td>
            `;
            resultsBody.appendChild(tr);
        });

        // Best result card
        const best = sorted[0];
        bestResultCard.style.display = '';
        bestResultCard.innerHTML = `
            <h3><svg class="icon icon-inline icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> Garis Regresi Terbaik — Simulasi ${best.name}</h3>
            <div class="equation">ŷ = ${best.finalM.toFixed(5)}·x + ${best.finalB.toFixed(5)}</div>
            <div class="mse-value">MSE = ${best.finalMSE.toFixed(6)} | Learning Rate = ${best.lr} | Epochs = ${best.epochs}</div>
        `;

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ==================== EVENT HANDLERS ====================
    document.getElementById('btn-run-all').addEventListener('click', () => {
        if (dataPoints.length < 2) {
            alert('Tambahkan minimal 2 titik data terlebih dahulu!');
            return;
        }

        const configs = collectSimConfigs();
        if (configs.length === 0) {
            alert('Tambahkan minimal 1 simulasi!');
            return;
        }

        // Cancel any running animation
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animRunning = false;

        // Run gradient descent
        simResults = runAllGradientDescent(configs);

        // Show viz section
        vizSection.style.display = '';
        resultsSection.style.display = 'none';

        // Build viz cards
        buildVizCards(simResults);

        // Scroll to viz
        vizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Start animation
        setTimeout(() => {
            animateSimulations(simResults);
        }, 500);
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
        animPaused = !animPaused;
        const pauseBtn = document.getElementById('btn-pause');
        if (animPaused) {
            pauseBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play';
        } else {
            pauseBtn.innerHTML = '<svg class="icon pause-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg> Pause';
        }
    });

    document.getElementById('btn-reset-viz').addEventListener('click', () => {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animRunning = false;
        animPaused = false;
        document.getElementById('btn-pause').textContent = '⏸ Pause';

        if (simResults.length > 0) {
            buildVizCards(simResults);
            setTimeout(() => {
                animateSimulations(simResults);
            }, 300);
        }
    });

    speedSlider.addEventListener('input', () => {
        animSpeed = parseInt(speedSlider.value);
        speedLabel.textContent = animSpeed;
    });

    // ==================== INIT ====================
    refreshDataCanvas();

})();
