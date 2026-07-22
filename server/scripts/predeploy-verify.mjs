// Pre/post-deploy VERSION verifier.
//
// Prints the exact commit SHA that a build will bake in (NEXT_PUBLIC_BUILD_VERSION on the client,
// BUILD_VERSION on the server). After you deploy, run this with PROD_URL set to confirm production is
// actually serving that SHA — the durable answer to "is prod running my latest code, or a stale bundle?"
//
//   Local (what will deploy):     npm run predeploy   (runs this at the end)
//   Verify prod after deploy:     PROD_URL=https://wellnesscentre.myhealthschool.in npm run predeploy:scan  # (or run this file directly)
//     PROD_URL=https://your-domain node server/scripts/predeploy-verify.mjs
import { execSync } from 'child_process';

function localSha() {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return '(unknown)'; }
}
function dirty() {
  try { return execSync('git status --porcelain').toString().trim().length > 0; } catch { return false; }
}

async function main() {
  const sha = localSha();
  console.log('\n────────────────────────────────────────────────────────');
  console.log(' DEPLOY VERSION CHECK');
  console.log('────────────────────────────────────────────────────────');
  console.log(` Local HEAD SHA to be deployed: ${sha}${dirty() ? '  ⚠️ (uncommitted changes present)' : ''}`);

  const prod = process.env.PROD_URL;
  if (!prod) {
    console.log('\n This SHA is baked into the build (client footer + /version).');
    console.log(' AFTER deploying + restarting the server, verify prod matches with:');
    console.log('   PROD_URL=https://<your-domain> node server/scripts/predeploy-verify.mjs');
    console.log('   → the reported version must equal', sha);
    console.log('────────────────────────────────────────────────────────\n');
    return;
  }

  const url = prod.replace(/\/$/, '') + '/version';
  try {
    const r = await fetch(url, { cache: 'no-store' });
    const j = await r.json();
    const live = String((j && j.version) || '');
    console.log(` Production /version reports:    ${live}   (${url})`);
    if (live === sha) {
      console.log('\n ✅ PROD == LOCAL — production is serving the current build.');
    } else {
      console.log('\n ❌ MISMATCH — production is NOT serving the current build.');
      console.log('    Fix: on the server → git reset --hard origin/main → npm run build (client AND server) → restart (pm2 restart).');
      console.log('    Then hard-reload the browser (the in-app "Refresh" banner does this for open tabs).');
      process.exitCode = 1;
    }
  } catch (e) {
    console.log(`\n ⚠️  Could not reach ${url} — ${e.message}`);
    process.exitCode = 2;
  }
  console.log('────────────────────────────────────────────────────────\n');
}

main();
