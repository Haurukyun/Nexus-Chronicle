import { spawn } from 'child_process';
import path from 'path';

function runMcpTest() {
  const scriptPath = path.resolve('tools/openwolf-mcp.mjs');
  const proc = spawn('node', [scriptPath], {
    env: { ...process.env, NEXUS_PROJECT_DIR: process.cwd() },
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };

  proc.stdout.on('data', (chunk) => {
    console.log('STDOUT chunk:', chunk.toString());
    proc.kill();
    process.exit(0);
  });

  proc.stdin.write(JSON.stringify(initRequest) + '\n');

  setTimeout(() => {
    console.error('Timeout waiting for MCP response');
    proc.kill();
    process.exit(1);
  }, 4000);
}

runMcpTest();
