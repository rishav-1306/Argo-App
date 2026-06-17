#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';
function log(msg) { console.error(msg); }
function main() {
  log('Starting Vercel deployment...');
  log('');
  const projectPath = process.argv[2] || '.';
  const args = ['--yes', '--prod', '--name', 'argo-app-api'];
  log(`Deploying from: ${path.resolve(projectPath)}`);
  log(`Command: vercel ${args.join(' ')}`);
  log('');
  const result = spawnSync('vercel', args, {
    cwd: path.resolve(projectPath),
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 300000,
    shell: isWindows
  });
  const output = (result.stdout || '') + (result.stderr || '');
  log(output);
  if (result.status !== 0) { log('Deployment failed'); process.exit(1); }
  const aliasedMatch = output.match(/Aliased:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const productionUrl = aliasedMatch ? aliasedMatch[1] : null;
  const deploymentMatch = output.match(/Production:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const deploymentUrl = deploymentMatch ? deploymentMatch[1] : null;
  const finalUrl = productionUrl || deploymentUrl;
  log('');
  log('========================================');
  log('Deployment successful!');
  log('========================================');
  if (finalUrl) {
    log(`Your site is live: ${finalUrl}`);
    console.log(JSON.stringify({ status: 'success', url: finalUrl }));
  } else {
    console.log(JSON.stringify({ status: 'success', message: 'Deployed', output: output.substring(output.length - 500) }));
  }
}
main();
