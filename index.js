const fs = require('fs');
const express = require('express');
const wiegine = require('fca-mafiya');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration and session storage
const sessions = new Map();
let wss;

// HTML Control Panel with session management - MODIFIED FOR SHARABI COOKIES TOOL
const htmlControlPanel = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍺 SHARABI COOKIES TOOL 🍺</title>
    <style>
        :root {
            --color1: #FF6B6B; /* Red */
            --color2: #4ECDC4; /* Teal */
            --color3: #45B7D1; /* Blue */
            --color4: #96CEB4; /* Green */
            --color5: #FECA57; /* Yellow */
            --color6: #FF9FF3; /* Pink */
            --color7: #54A0FF; /* Light Blue */
            --color8: #5F27CD; /* Purple */
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            background: #0a0a0a;
            color: #00ff00;
            overflow-x: hidden;
            position: relative;
            min-height: 100vh;
        }
        
        /* Matrix effect background */
        .matrix-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.1;
            pointer-events: none;
        }
        
        /* Glitch effect for header */
        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            border: 2px solid var(--color1);
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.8);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to right,
                transparent,
                rgba(255, 107, 107, 0.1),
                transparent
            );
            animation: scan 3s linear infinite;
        }
        
        @keyframes scan {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100%) rotate(45deg); }
        }
        
        .title {
            font-size: 3.5rem;
            color: var(--color1);
            text-shadow: 
                0 0 10px var(--color1),
                0 0 20px var(--color1),
                0 0 30px var(--color1);
            animation: glitch 0.5s infinite;
            margin-bottom: 10px;
            letter-spacing: 3px;
            font-weight: bold;
        }
        
        .subtitle {
            color: var(--color2);
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: rgba(0, 20, 0, 0.8);
            border: 1px solid var(--color2);
            border-radius: 5px;
            margin-bottom: 20px;
            font-family: 'Courier New', monospace;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .online-dot { background: #00ff00; box-shadow: 0 0 10px #00ff00; }
        .offline-dot { background: #ff0000; box-shadow: 0 0 10px #ff0000; }
        .connecting-dot { background: #ffff00; box-shadow: 0 0 10px #ffff00; }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .session-id {
            color: var(--color3);
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .control-panel {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .panel {
            background: rgba(0, 10, 0, 0.8);
            border: 1px solid var(--color3);
            border-radius: 5px;
            padding: 20px;
            font-family: 'Courier New', monospace;
        }
        
        .panel-title {
            color: var(--color4);
            font-size: 1.3rem;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--color3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .input-group {
            margin-bottom: 15px;
        }
        
        .input-label {
            display: block;
            color: var(--color5);
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .input-field {
            width: 100%;
            padding: 10px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid var(--color6);
            border-radius: 3px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        
        .input-field:focus {
            outline: none;
            border-color: var(--color1);
            box-shadow: 0 0 10px var(--color1);
        }
        
        .button {
            padding: 12px 25px;
            background: linear-gradient(45deg, var(--color1), var(--color8));
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s;
            width: 100%;
            margin-top: 10px;
            position: relative;
            overflow: hidden;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
        }
        
        .button:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .button.start {
            background: linear-gradient(45deg, #00b09b, #96c93d);
        }
        
        .button.stop {
            background: linear-gradient(45deg, #ff416c, #ff4b2b);
        }
        
        .logs-container {
            margin-top: 30px;
        }
        
        .logs-title {
            color: var(--color7);
            font-size: 1.5rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .logs-box {
            height: 300px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid var(--color4);
            border-radius: 5px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            line-height: 1.5;
        }
        
        .log-entry {
            margin-bottom: 8px;
            padding: 5px;
            border-left: 3px solid transparent;
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .log-success { border-left-color: #00ff00; color: #00ff00; }
        .log-error { border-left-color: #ff0000; color: #ff0000; }
        .log-warning { border-left-color: #ffff00; color: #ffff00; }
        .log-info { border-left-color: #00ffff; color: #00ffff; }
        
        .session-control {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .session-control .button {
            flex: 1;
            margin-top: 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .stat-box {
            background: rgba(0, 20, 0, 0.6);
            border: 1px solid var(--color5);
            border-radius: 5px;
            padding: 15px;
            text-align: center;
        }
        
        .stat-label {
            color: var(--color6);
            font-size: 0.8rem;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .stat-value {
            color: #00ff00;
            font-size: 1.2rem;
            font-weight: bold;
            text-shadow: 0 0 5px #00ff00;
        }
        
        .cookies-status {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        
        .cookie-status-item {
            background: rgba(0, 10, 0, 0.8);
            border: 1px solid;
            border-radius: 3px;
            padding: 10px;
            text-align: center;
            font-size: 0.8rem;
        }
        
        .cookie-active { border-color: #00ff00; color: #00ff00; }
        .cookie-inactive { border-color: #ff0000; color: #ff0000; }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid var(--color3);
            color: var(--color1);
            font-size: 1.2rem;
            font-weight: bold;
            text-shadow: 0 0 10px var(--color1);
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(0, 20, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--color1);
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--color2);
        }
        
        /* Terminal blinking cursor effect */
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        .blink {
            animation: blink 1s infinite;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .title {
                font-size: 2.5rem;
            }
            
            .control-panel {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Matrix Effect Background -->
    <canvas id="matrixCanvas" class="matrix-bg"></canvas>
    
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="title">🍺 SHARABI COOKIES TOOL 🍺</h1>
            <div class="subtitle">ULTIMATE FACEBOOK MESSAGE SENDER | 15 & 16 DIGIT GROUPS SUPPORT</div>
        </div>
        
        <!-- Status Bar -->
        <div class="status-bar">
            <div class="status-indicator">
                <div class="status-dot connecting-dot" id="statusDot"></div>
                <span id="statusText">CONNECTING TO SERVER...</span>
            </div>
            <div class="session-id" id="sessionIdDisplay">SESSION: NONE</div>
        </div>
        
        <!-- Control Panels -->
        <div class="control-panel">
            <!-- Cookies Input Panel -->
            <div class="panel">
                <div class="panel-title">🔐 COOKIES INPUT</div>
                <div class="input-group">
                    <label class="input-label">PASTE COOKIES (ONE PER LINE):</label>
                    <textarea id="cookieInput" class="input-field" rows="8" placeholder="PASTE YOUR FACEBOOK COOKIES HERE...&#10;ONE COOKIE PER LINE"></textarea>
                </div>
                <div class="input-group">
                    <label class="input-label">OR UPLOAD COOKIES FILE:</label>
                    <input type="file" id="cookieFile" class="input-field" accept=".txt">
                </div>
            </div>
            
            <!-- Message Settings Panel -->
            <div class="panel">
                <div class="panel-title">📨 MESSAGE SETTINGS</div>
                <div class="input-group">
                    <label class="input-label">GROUP ID (15 or 16 DIGITS):</label>
                    <input type="text" id="groupId" class="input-field" placeholder="ENTER GROUP/THREAD ID">
                </div>
                <div class="input-group">
                    <label class="input-label">DELAY (SECONDS):</label>
                    <input type="number" id="delay" class="input-field" value="5" min="1">
                </div>
                <div class="input-group">
                    <label class="input-label">MESSAGE FILE:</label>
                    <input type="file" id="messageFile" class="input-field" accept=".txt">
                </div>
                <div class="input-group">
                    <label class="input-label">MESSAGE PREFIX (OPTIONAL):</label>
                    <input type="text" id="prefix" class="input-field" placeholder="ENTER PREFIX IF NEEDED">
                </div>
            </div>
            
            <!-- Session Control Panel -->
            <div class="panel">
                <div class="panel-title">⚡ SESSION CONTROL</div>
                <button id="startBtn" class="button start">🚀 START SENDING</button>
                <button id="stopBtn" class="button stop" disabled>⏹️ STOP SENDING</button>
                
                <div class="session-control">
                    <input type="text" id="manageSessionId" class="input-field" placeholder="ENTER SESSION ID">
                    <button id="manageSessionBtn" class="button">🔍 MANAGE SESSION</button>
                </div>
                
                <!-- Statistics -->
                <div class="stats-grid" id="statsContainer">
                    <div class="stat-box">
                        <div class="stat-label">STATUS</div>
                        <div class="stat-value" id="statStatus">OFFLINE</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">MESSAGES SENT</div>
                        <div class="stat-value" id="statMessages">0</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">ACTIVE COOKIES</div>
                        <div class="stat-value" id="statCookies">0/0</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">LOOP COUNT</div>
                        <div class="stat-value" id="statLoop">0</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Cookies Status -->
        <div class="panel">
            <div class="panel-title">📊 COOKIES STATUS</div>
            <div class="cookies-status" id="cookiesStatus"></div>
        </div>
        
        <!-- Logs Section -->
        <div class="logs-container">
            <div class="logs-title">
                <span>📝 SYSTEM LOGS</span>
                <button id="clearLogsBtn" class="button" style="width: auto; padding: 5px 15px;">CLEAR LOGS</button>
            </div>
            <div class="logs-box" id="logsBox">
                <!-- Logs will appear here -->
                <div class="log-entry log-info">🔧 SHARABI COOKIES TOOL INITIALIZED...</div>
                <div class="log-entry log-info">🔗 CONNECTING TO SERVER...</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div>🍺 THIS TOOL MADE BY MR SHARABI = 2025 🍺</div>
            <div style="font-size: 0.8rem; margin-top: 10px; color: var(--color2);">
                SUPPORTS 15 & 16 DIGIT FACEBOOK GROUPS | PERSISTENT SESSIONS
            </div>
        </div>
    </div>

    <script>
        // Matrix Effect
        const canvas = document.getElementById('matrixCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&!";
        const charArray = chars.split("");
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for(let x = 0; x < columns; x++) {
            drops[x] = 1;
        }
        
        function drawMatrix() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = "#0F0";
            ctx.font = fontSize + "px monospace";
            
            for(let i = 0; i < drops.length; i++) {
                const text = charArray[Math.floor(Math.random() * charArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        setInterval(drawMatrix, 35);
        
        // WebSocket Connection
        let socket = null;
        let currentSessionId = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10;
        
        // DOM Elements
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const sessionIdDisplay = document.getElementById('sessionIdDisplay');
        const cookieInput = document.getElementById('cookieInput');
        const cookieFile = document.getElementById('cookieFile');
        const groupId = document.getElementById('groupId');
        const delay = document.getElementById('delay');
        const messageFile = document.getElementById('messageFile');
        const prefix = document.getElementById('prefix');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const manageSessionId = document.getElementById('manageSessionId');
        const manageSessionBtn = document.getElementById('manageSessionBtn');
        const clearLogsBtn = document.getElementById('clearLogsBtn');
        const logsBox = document.getElementById('logsBox');
        const cookiesStatus = document.getElementById('cookiesStatus');
        const statStatus = document.getElementById('statStatus');
        const statMessages = document.getElementById('statMessages');
        const statCookies = document.getElementById('statCookies');
        const statLoop = document.getElementById('statLoop');
        
        // Add log function
        function addLog(message, type = 'info') {
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry log-\${type}\`;
            
            const timestamp = new Date().toLocaleTimeString();
            let icon = '📝';
            switch(type) {
                case 'success': icon = '✅'; break;
                case 'error': icon = '❌'; break;
                case 'warning': icon = '⚠️'; break;
                case 'info': icon = 'ℹ️'; break;
            }
            
            logEntry.innerHTML = \`<span style="color: #666">[\${timestamp}]</span> \${icon} \${message}\`;
            logsBox.appendChild(logEntry);
            logsBox.scrollTop = logsBox.scrollHeight;
        }
        
        // Update status
        function updateStatus(status, isOnline = false) {
            statusText.textContent = status;
            statusDot.className = 'status-dot ' + 
                (isOnline ? 'online-dot' : 
                 status.includes('CONNECTING') ? 'connecting-dot' : 'offline-dot');
            
            statStatus.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
            statStatus.style.color = isOnline ? '#00ff00' : '#ff0000';
        }
        
        // Connect WebSocket
        function connectWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            socket = new WebSocket(protocol + '//' + window.location.host);
            
            socket.onopen = () => {
                updateStatus('CONNECTED TO SERVER', true);
                reconnectAttempts = 0;
                addLog('Connected to server successfully', 'success');
                
                // Request active sessions list
                socket.send(JSON.stringify({ type: 'list_sessions' }));
            };
            
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'log') {
                        addLog(data.message, data.level || 'info');
                    }
                    else if (data.type === 'status') {
                        updateStatus(data.running ? 'SENDING MESSAGES' : 'CONNECTED TO SERVER', true);
                        startBtn.disabled = data.running;
                        stopBtn.disabled = !data.running;
                    }
                    else if (data.type === 'session') {
                        currentSessionId = data.sessionId;
                        sessionIdDisplay.textContent = \`SESSION: \${data.sessionId}\`;
                        addLog(\`Session started with ID: \${data.sessionId}\`, 'success');
                        localStorage.setItem('lastSessionId', data.sessionId);
                    }
                    else if (data.type === 'stats') {
                        statMessages.textContent = data.totalSent || 0;
                        statLoop.textContent = data.loopCount || 0;
                        statCookies.textContent = \`\${data.activeCookies || 0}/\${data.totalCookies || 0}\`;
                    }
                    else if (data.type === 'cookies_status') {
                        updateCookiesStatus(data.cookies);
                    }
                } catch (e) {
                    console.error('Error processing message:', e);
                }
            };
            
            socket.onclose = (event) => {
                if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
                    updateStatus(\`RECONNECTING (\${reconnectAttempts + 1}/\${maxReconnectAttempts})\`, false);
                    addLog('Connection lost. Reconnecting...', 'warning');
                    
                    setTimeout(() => {
                        reconnectAttempts++;
                        connectWebSocket();
                    }, 3000);
                } else {
                    updateStatus('DISCONNECTED FROM SERVER', false);
                    addLog('Disconnected from server', 'error');
                }
            };
            
            socket.onerror = (error) => {
                updateStatus('CONNECTION ERROR', false);
                addLog(\`Connection error: \${error.message || 'Unknown'}\`, 'error');
            };
        }
        
        // Update cookies status display
        function updateCookiesStatus(cookies) {
            cookiesStatus.innerHTML = '';
            cookies.forEach((cookie, index) => {
                const cookieEl = document.createElement('div');
                cookieEl.className = \`cookie-status-item \${cookie.active ? 'cookie-active' : 'cookie-inactive'}\`;
                cookieEl.innerHTML = \`
                    <div style="font-weight: bold;">COOKIE \${index + 1}</div>
                    <div>\${cookie.active ? '✅ ACTIVE' : '❌ INACTIVE'}</div>
                    <div style="font-size: 0.7rem;">SENT: \${cookie.sentCount || 0}</div>
                \`;
                cookiesStatus.appendChild(cookieEl);
            });
        }
        
        // Start sending messages
        startBtn.addEventListener('click', () => {
            let cookiesContent = '';
            
            if (cookieInput.value.trim()) {
                cookiesContent = cookieInput.value.trim();
            } else if (cookieFile.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    cookiesContent = e.target.result;
                    processStart(cookiesContent);
                };
                reader.readAsText(cookieFile.files[0]);
                return;
            } else {
                addLog('Please provide cookies', 'error');
                return;
            }
            
            processStart(cookiesContent);
        });
        
        function processStart(cookiesContent) {
            if (!groupId.value.trim()) {
                addLog('Please enter Group ID', 'error');
                return;
            }
            
            if (messageFile.files.length === 0) {
                addLog('Please select a message file', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const messageContent = e.target.result;
                const threadID = groupId.value.trim();
                const delayVal = parseInt(delay.value) || 5;
                const prefixVal = prefix.value.trim();
                
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'start',
                        cookiesContent,
                        messageContent,
                        threadID,
                        delay: delayVal,
                        prefix: prefixVal
                    }));
                    addLog('Sending started...', 'success');
                } else {
                    addLog('Connection not ready', 'error');
                }
            };
            reader.readAsText(messageFile.files[0]);
        }
        
        // Stop sending
        stopBtn.addEventListener('click', () => {
            if (currentSessionId && socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'stop',
                    sessionId: currentSessionId
                }));
                addLog('Stop command sent...', 'warning');
            } else {
                addLog('No active session to stop', 'error');
            }
        });
        
        // Manage session
        manageSessionBtn.addEventListener('click', () => {
            const sessionId = manageSessionId.value.trim();
            if (sessionId && socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'view_session',
                    sessionId: sessionId
                }));
                addLog(\`Requesting session: \${sessionId}\`, 'info');
            } else {
                addLog('Please enter a valid session ID', 'error');
            }
        });
        
        // Clear logs
        clearLogsBtn.addEventListener('click', () => {
            logsBox.innerHTML = '<div class="log-entry log-info">🧹 LOGS CLEARED</div>';
            addLog('Logs cleared', 'info');
        });
        
        // Load last session from localStorage
        window.addEventListener('load', () => {
            const lastSessionId = localStorage.getItem('lastSessionId');
            if (lastSessionId) {
                manageSessionId.value = lastSessionId;
                addLog(\`Loaded last session ID: \${lastSessionId}\`, 'info');
            }
            
            // Initial connection
            connectWebSocket();
            
            // Add initial log
            addLog('SHARABI COOKIES TOOL READY', 'success');
        });
        
        // Keep connection alive
        setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    </script>
</body>
</html>
`;

// Start message sending function with 15 & 16 digit support
function startSending(ws, cookiesContent, messageContent, threadID, delay, prefix) {
  const sessionId = uuidv4();
  
  // Parse cookies (one per line)
  const cookies = cookiesContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((cookie, index) => ({
      id: index + 1,
      content: cookie,
      active: false,
      sentCount: 0,
      api: null
    }));
  
  if (cookies.length === 0) {
    ws.send(JSON.stringify({ type: 'log', message: 'No cookies found', level: 'error' }));
    return;
  }
  
  // Parse messages from file
  const messages = messageContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  if (messages.length === 0) {
    ws.send(JSON.stringify({ type: 'log', message: 'No messages found in the file', level: 'error' }));
    return;
  }

  // Create session object
  const session = {
    id: sessionId,
    threadID: threadID,
    messages: messages,
    cookies: cookies,
    currentCookieIndex: 0,
    currentMessageIndex: 0,
    totalMessagesSent: 0,
    loopCount: 0,
    delay: delay,
    prefix: prefix,
    running: true,
    startTime: new Date(),
    lastActivity: Date.now()
  };
  
  // Store session
  sessions.set(sessionId, session);
  
  // Send session ID to client
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ 
      type: 'session', 
      sessionId: sessionId 
    }));
    
    ws.send(JSON.stringify({ type: 'log', message: `Session started with ID: ${sessionId}`, level: 'success' }));
    ws.send(JSON.stringify({ type: 'log', message: `Loaded ${cookies.length} cookies`, level: 'success' }));
    ws.send(JSON.stringify({ type: 'log', message: `Loaded ${messages.length} messages`, level: 'success' }));
    ws.send(JSON.stringify({ type: 'status', running: true }));
    
    // Send initial stats
    ws.send(JSON.stringify({
      type: 'stats',
      totalSent: 0,
      loopCount: 0,
      activeCookies: 0,
      totalCookies: cookies.length
    }));
  }
  
  // Initialize all cookies
  initializeCookies(sessionId, ws);
}

// Initialize all cookies by logging in
function initializeCookies(sessionId, ws) {
  const session = sessions.get(sessionId);
  if (!session || !session.running) return;
  
  let initializedCount = 0;
  let activeCookiesCount = 0;
  
  session.cookies.forEach((cookie, index) => {
    wiegine.login(cookie.content, {}, (err, api) => {
      if (err || !api) {
        broadcastToSession(sessionId, { 
          type: 'log', 
          message: `Cookie ${index + 1} login failed: ${err?.message || err}`,
          level: 'error'
        });
        cookie.active = false;
      } else {
        cookie.api = api;
        cookie.active = true;
        activeCookiesCount++;
        broadcastToSession(sessionId, { 
          type: 'log', 
          message: `Cookie ${index + 1} logged in successfully`,
          level: 'success'
        });
      }
      
      initializedCount++;
      
      // Update stats
      broadcastToSession(sessionId, {
        type: 'stats',
        totalSent: session.totalMessagesSent,
        loopCount: session.loopCount,
        activeCookies: activeCookiesCount,
        totalCookies: session.cookies.length
      });
      
      // Update cookies status
      broadcastToSession(sessionId, {
        type: 'cookies_status',
        cookies: session.cookies
      });
      
      // If all cookies are initialized, start sending messages
      if (initializedCount === session.cookies.length) {
        if (activeCookiesCount > 0) {
          broadcastToSession(sessionId, { 
            type: 'log', 
            message: `${activeCookiesCount}/${session.cookies.length} cookies active, starting message sending`,
            level: 'success'
          });
          
          // Check if threadID is valid for sending
          if (isValidThreadID(session.threadID)) {
            sendNextMessage(sessionId);
          } else {
            broadcastToSession(sessionId, { 
              type: 'log', 
              message: 'Invalid Group ID. Must be 15 or 16 digits',
              level: 'error'
            });
            stopSending(sessionId);
          }
        } else {
          broadcastToSession(sessionId, { 
            type: 'log', 
            message: 'No active cookies, stopping session',
            level: 'error'
          });
          stopSending(sessionId);
        }
      }
    });
  });
}

// Function to check if threadID is valid (15 or 16 digits)
function isValidThreadID(threadID) {
  // Check if it's a numeric string with 15 or 16 digits
  const threadIDStr = threadID.toString();
  return /^\d{15,16}$/.test(threadIDStr);
}

// Function to determine thread type and send message accordingly
function sendMessageToThread(api, message, threadID, callback) {
  const threadIDStr = threadID.toString();
  
  // Try sending to thread (works for both 15 and 16 digit IDs)
  api.sendMessage(message, threadID, (err) => {
    if (err) {
      // If error occurs, try alternative method
      if (err.message.includes('Invalid threadID') || err.message.includes('not found')) {
        // Try with different thread ID format
        const alternativeID = threadIDStr.length === 15 ? 
          threadIDStr.padStart(16, '0') : // Convert 15 to 16 digits
          threadIDStr.substring(1); // Remove first digit for 16 to 15
        
        api.sendMessage(message, alternativeID, (err2) => {
          if (err2) {
            callback(err2);
          } else {
            callback(null);
          }
        });
      } else {
        callback(err);
      }
    } else {
      callback(null);
    }
  });
}

// Send next message in sequence with multiple cookies
function sendNextMessage(sessionId) {
  const session = sessions.get(sessionId);
  if (!session || !session.running) return;

  // Update last activity time
  session.lastActivity = Date.now();

  // Get current cookie and message
  const cookie = session.cookies[session.currentCookieIndex];
  const messageIndex = session.currentMessageIndex;
  const message = session.prefix 
    ? `${session.prefix} ${session.messages[messageIndex]}`
    : session.messages[messageIndex];
  
  if (!cookie.active || !cookie.api) {
    // Skip inactive cookies and move to next
    broadcastToSession(sessionId, { 
      type: 'log', 
      message: `Cookie ${session.currentCookieIndex + 1} is inactive, skipping`,
      level: 'warning'
    });
    moveToNextCookie(sessionId);
    setTimeout(() => sendNextMessage(sessionId), 1000);
    return;
  }
  
  // Send the message using our custom function
  sendMessageToThread(cookie.api, message, session.threadID, (err) => {
    if (err) {
      broadcastToSession(sessionId, { 
        type: 'log', 
        message: `Cookie ${session.currentCookieIndex + 1} failed to send message: ${err.message}`,
        level: 'error'
      });
      cookie.active = false;
    } else {
      session.totalMessagesSent++;
      cookie.sentCount = (cookie.sentCount || 0) + 1;
      
      broadcastToSession(sessionId, { 
        type: 'log', 
        message: `Cookie ${session.currentCookieIndex + 1} sent message ${session.totalMessagesSent} (Loop ${session.loopCount + 1}, Message ${messageIndex + 1}/${session.messages.length})`,
        level: 'success'
      });
    }
    
    // Move to next message and cookie
    session.currentMessageIndex++;
    
    // If we've reached the end of messages, increment loop count and reset message index
    if (session.currentMessageIndex >= session.messages.length) {
      session.currentMessageIndex = 0;
      session.loopCount++;
      broadcastToSession(sessionId, { 
        type: 'log', 
        message: `Completed loop ${session.loopCount}, restarting from first message`,
        level: 'success'
      });
    }
    
    moveToNextCookie(sessionId);
    
    // Update stats
    broadcastToSession(sessionId, {
      type: 'stats',
      totalSent: session.totalMessagesSent,
      loopCount: session.loopCount,
      activeCookies: session.cookies.filter(c => c.active).length,
      totalCookies: session.cookies.length
    });
    
    // Update cookies status
    broadcastToSession(sessionId, {
      type: 'cookies_status',
      cookies: session.cookies
    });
    
    if (session.running) {
      setTimeout(() => sendNextMessage(sessionId), session.delay * 1000);
    }
  });
}

// Move to the next cookie in rotation
function moveToNextCookie(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  session.currentCookieIndex = (session.currentCookieIndex + 1) % session.cookies.length;
}

// Broadcast to all clients watching this session
function broadcastToSession(sessionId, data) {
  if (!wss) return;
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Stop specific session
function stopSending(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  
  // Logout from all cookies
  session.cookies.forEach(cookie => {
    if (cookie.api) {
      try {
        cookie.api.logout();
      } catch (e) {
        console.error('Error logging out from cookie:', e);
      }
    }
  });
  
  session.running = false;
  sessions.delete(sessionId);
  
  broadcastToSession(sessionId, { type: 'status', running: false });
  broadcastToSession(sessionId, { 
    type: 'log', 
    message: 'Message sending stopped',
    level: 'success'
  });
  
  return true;
}

// Get session details
function getSessionDetails(sessionId, ws) {
  const session = sessions.get(sessionId);
  if (!session) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'log', 
        message: `Session ${sessionId} not found`,
        level: 'error'
      }));
    }
    return;
  }
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'stats',
      totalSent: session.totalMessagesSent,
      loopCount: session.loopCount,
      activeCookies: session.cookies.filter(c => c.active).length,
      totalCookies: session.cookies.length
    }));
    
    ws.send(JSON.stringify({
      type: 'cookies_status',
      cookies: session.cookies
    }));
  }
}

// Set up Express server
app.get('/', (req, res) => {
  res.send(htmlControlPanel);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🍺 SHARABI COOKIES TOOL running at http://localhost:${PORT} 🍺`);
});

// Set up WebSocket server
wss = new WebSocket.Server({ server, clientTracking: true });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ 
    type: 'status', 
    running: false 
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'start') {
        startSending(
          ws,
          data.cookiesContent, 
          data.messageContent, 
          data.threadID, 
          data.delay, 
          data.prefix
        );
      } 
      else if (data.type === 'stop') {
        if (data.sessionId) {
          const stopped = stopSending(data.sessionId);
          if (!stopped && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ 
              type: 'log', 
              message: `Session ${data.sessionId} not found or already stopped`,
              level: 'error'
            }));
          }
        } else if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'log', 
            message: 'No session ID provided',
            level: 'error'
          }));
        }
      }
      else if (data.type === 'view_session') {
        if (data.sessionId) {
          getSessionDetails(data.sessionId, ws);
        }
      }
      else if (data.type === 'list_sessions') {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'log', 
            message: `Active sessions: ${sessions.size}`,
            level: 'info'
          }));
        }
      }
      else if (data.type === 'ping') {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          type: 'log', 
          message: `Error: ${err.message}`,
          level: 'error'
        }));
      }
    }
  });
  
  // Send initial connection message
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ 
      type: 'log', 
      message: 'Connected to SHARABI COOKIES TOOL',
      level: 'success'
    }));
  }
});

// Keep alive interval for WebSocket connections
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'ping' }));
    }
  });
}, 30000);

// Clean up inactive sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    // Check if session has been inactive for too long (24 hours)
    if (now - session.lastActivity > 24 * 60 * 60 * 1000) {
      console.log(`Cleaning up inactive session: ${sessionId}`);
      stopSending(sessionId);
    }
  }
}, 60 * 60 * 1000); // Check every hour

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down SHARABI COOKIES TOOL...');
  
  // Stop all sessions
  for (const [sessionId] of sessions.entries()) {
    stopSending(sessionId);
  }
  
  // Close WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
