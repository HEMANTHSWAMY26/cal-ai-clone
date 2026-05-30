const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('c:/Users/heman/OneDrive/Desktop/cal-ai-clone/node_modules/ws');

const ARTIFACTS_DIR = 'C:\\Users\\heman\\.gemini\\antigravity\\brain\\41857d69-27ec-45fe-b061-9e11bb2ef6b7';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profileDir = `${ARTIFACTS_DIR}\\scratch\\edge_profile`;
  
  console.log('Spawning Edge headless...');
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=375,812', // Mobile dimensions
    `--user-data-dir=${profileDir}`,
    'about:blank'
  ]);

  edge.on('error', (err) => {
    console.error('Failed to start Edge:', err);
  });

  // Wait for Edge to start
  await new Promise(r => setTimeout(r, 2000));

  console.log('Fetching targets from Edge...');
  const getJson = () => new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  let targets;
  try {
    targets = await getJson();
  } catch (e) {
    console.error('Failed to get targets:', e);
    edge.kill();
    return;
  }

  const target = targets.find(t => t.type === 'page');
  if (!target) {
    console.error('No page target found');
    edge.kill();
    return;
  }

  console.log('Connecting to WebSocket:', target.webSocketDebuggerUrl);
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  const pendingCommands = new Map();
  let cmdId = 1;

  const sendCommand = (method, params = {}) => new Promise((resolve, reject) => {
    const id = cmdId++;
    pendingCommands.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.id && pendingCommands.has(msg.id)) {
        const { resolve, reject } = pendingCommands.get(msg.id);
        pendingCommands.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const args = msg.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a)));
        console.log(`[BROWSER CONSOLE ${type.toUpperCase()}]`, ...args);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', JSON.stringify(msg.params.exceptionDetails, null, 2));
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('error', (err) => {
    console.error('WS Error:', err);
  });

  await new Promise(r => ws.on('open', r));
  console.log('CDP WebSocket open. Initializing domains...');
  
  await sendCommand('Runtime.enable');
  await sendCommand('Log.enable');
  await sendCommand('Page.enable');

  const captureScreenshot = async (name) => {
    console.log(`Capturing screenshot ${name}...`);
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(`${ARTIFACTS_DIR}\\screenshot_${name}.png`, buffer);
    console.log(`Saved screenshot_${name}.png`);
  };

  const evaluate = async (expression) => {
    const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception.description);
    }
    return res.result.value;
  };

  // Navigating
  console.log('Navigating to http://localhost:8081...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081' });

  // 1. Splash Screen
  console.log('Waiting on Splash Screen...');
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot('1_splash');

  // Wait for automatic routing transition from Splash (takes 2.5s)
  console.log('Waiting for routing transition...');
  await new Promise(r => setTimeout(r, 3000));

  // Determine path
  let currentPath = await evaluate('window.location.pathname');
  console.log('Current Route Path:', currentPath);

  if (currentPath.includes('onboarding')) {
    // 2. Onboarding Slide 1
    await captureScreenshot('2_onboarding_1');

    // Click Continue
    console.log('Clicking Onboarding 1 Continue...');
    await evaluate(`
      (() => {
        const divs = Array.from(document.querySelectorAll('div, span, p'));
        const btn = divs.find(d => d.textContent && d.textContent.trim() === 'Continue');
        if (btn) { btn.click(); return 'Clicked'; }
        return 'Not found';
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    // Onboarding Slide 2
    await captureScreenshot('2_onboarding_2');
    console.log('Clicking Onboarding 2 Continue...');
    await evaluate(`
      (() => {
        const divs = Array.from(document.querySelectorAll('div, span, p'));
        const btn = divs.find(d => d.textContent && d.textContent.trim() === 'Continue');
        if (btn) { btn.click(); return 'Clicked'; }
        return 'Not found';
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    // Onboarding Slide 3 (Goals)
    await captureScreenshot('2_onboarding_3');
    console.log('Clicking Onboarding Let\'s Go...');
    await evaluate(`
      (() => {
        const divs = Array.from(document.querySelectorAll('div, span, p'));
        const btn = divs.find(d => d.textContent && d.textContent.trim() === "Let's Go");
        if (btn) { btn.click(); return 'Clicked'; }
        return 'Not found';
      })()
    `);
    await new Promise(r => setTimeout(r, 2000));
    currentPath = await evaluate('window.location.pathname');
    console.log('Route Path after Onboarding:', currentPath);
  }

  if (currentPath.includes('auth')) {
    // 3. Auth Screen
    await captureScreenshot('3_auth');

    // Perform mock signup/login by entering email and clicking
    console.log('Filling Auth details...');
    await evaluate(`
      (() => {
        const inputs = document.querySelectorAll('input');
        if (inputs.length > 0) {
          inputs[0].value = 'test@example.com';
          inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
        return 'Filled';
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    await captureScreenshot('3_auth_filled');

    console.log('Submitting Auth Form...');
    await evaluate(`
      (() => {
        const divs = Array.from(document.querySelectorAll('div, span, p'));
        const btn = divs.find(d => d.textContent && (d.textContent.trim() === 'Get Started' || d.textContent.trim() === 'Login' || d.textContent.trim() === 'Sign In'));
        if (btn) { btn.click(); return 'Clicked'; }
        return 'Not found';
      })()
    `);
    await new Promise(r => setTimeout(r, 3000));
    currentPath = await evaluate('window.location.pathname');
    console.log('Route Path after Auth:', currentPath);
  }

  // 4. Dashboard tab
  console.log('Navigating to tabs dashboard...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/(tabs)/dashboard' });
  await new Promise(r => setTimeout(r, 2500));
  await captureScreenshot('4_dashboard');

  // 5. Diary tab
  console.log('Navigating to tabs diary...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/(tabs)/diary' });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('5_diary');

  // 6. Camera tab
  console.log('Navigating to tabs camera...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/(tabs)/camera' });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('6_camera');

  // 7. Analytics tab
  console.log('Navigating to tabs analytics...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/(tabs)/analytics' });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('7_analytics');

  // 8. Profile tab
  console.log('Navigating to tabs profile...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/(tabs)/profile' });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('8_profile');

  // 9. Streak screen
  console.log('Navigating to streak screen...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/streak' });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('9_streak');

  // 10. Analysis screen
  console.log('Navigating to analysis screen...');
  await sendCommand('Page.navigate', { url: 'http://localhost:8081/analysis' });
  await new Promise(r => setTimeout(r, 2000));
  await captureScreenshot('10_analysis');

  console.log('Cleaning up browser process...');
  ws.close();
  edge.kill();
  console.log('Done testing! Verification screenshots created.');
}

run().catch(console.error);
