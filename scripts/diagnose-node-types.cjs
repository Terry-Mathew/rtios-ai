/* eslint-disable no-console */
// Diagnostic script for tsserver/IDE issues around resolving @types/node.
// Run: node scripts/diagnose-node-types.cjs

const fs = require('fs');
const path = require('path');

function safeStat(p) {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

const runId = process.env.DIAG_RUN_ID || 'pre-fix';
const cwd = process.cwd();
const nodeTypesPkg = path.join(cwd, 'node_modules', '@types', 'node', 'package.json');
const tsPkg = path.join(cwd, 'node_modules', 'typescript', 'package.json');

// #region agent log
fetch('http://127.0.0.1:7245/ingest/78f85a51-8169-4f0e-b33b-2351e2d11dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId,hyothesisId:'A',hypothesisId:'A',location:'scripts/diagnose-node-types.cjs:18',message:'diagnose start',data:{cwd,nodeTypesPkg,tsPkg},timestamp:Date.now()})}).catch(()=>{});
// #endregion

// Hypothesis A: @types/node is missing or not in expected location under this cwd.
const nodeTypesExists = !!safeStat(nodeTypesPkg);
// #region agent log
fetch('http://127.0.0.1:7245/ingest/78f85a51-8169-4f0e-b33b-2351e2d11dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId,hypothesisId:'A',location:'scripts/diagnose-node-types.cjs:25',message:'@types/node package.json exists?',data:{nodeTypesExists},timestamp:Date.now()})}).catch(()=>{});
// #endregion

// Hypothesis B: resolution differs depending on module loader / cwd.
let resolvedNodeTypesPkg = null;
let resolvedErr = null;
try {
  resolvedNodeTypesPkg = require.resolve('@types/node/package.json');
} catch (e) {
  resolvedErr = String(e && e.message ? e.message : e);
}
// #region agent log
fetch('http://127.0.0.1:7245/ingest/78f85a51-8169-4f0e-b33b-2351e2d11dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId,hypothesisId:'B',location:'scripts/diagnose-node-types.cjs:40',message:'require.resolve(@types/node/package.json)',data:{resolvedNodeTypesPkg,resolvedErr},timestamp:Date.now()})}).catch(()=>{});
// #endregion

// Hypothesis C: editor is using a different TypeScript than workspace (we report workspace TS version).
let workspaceTsVersion = null;
try {
  // eslint-disable-next-line global-require
  workspaceTsVersion = require('typescript/package.json').version;
} catch {
  workspaceTsVersion = null;
}
// #region agent log
fetch('http://127.0.0.1:7245/ingest/78f85a51-8169-4f0e-b33b-2351e2d11dce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId,hypothesisId:'C',location:'scripts/diagnose-node-types.cjs:55',message:'workspace TypeScript version',data:{workspaceTsVersion},timestamp:Date.now()})}).catch(()=>{});
// #endregion

console.log('[diagnose-node-types] cwd:', cwd);
console.log('[diagnose-node-types] node types exists:', nodeTypesExists);
console.log('[diagnose-node-types] resolved @types/node pkg:', resolvedNodeTypesPkg || '(failed)');
console.log('[diagnose-node-types] workspace TS version:', workspaceTsVersion || '(unknown)');


