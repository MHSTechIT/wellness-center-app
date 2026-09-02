// Deleting a lead or a payment is Super-Admin-only, and the rule that matters is the SERVER one: the client
// hides the button, but anyone who can post to /db/query could send the delete themselves.
// This exercises the real guard from routes/data.ts.
//
// Run:  node server/scripts/test-lead-delete-guard.mjs     (needs `npm --prefix server run build`)
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { validateLeadDelete } = await import(pathToFileURL(path.resolve('server/dist/routes/data.js')).href);

let pass = 0, fail = 0;
const check = (name, ok, detail) => { (ok ? pass++ : fail++); console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '   ' + detail : '')); };
const blocked = (q, role) => validateLeadDelete(q, { role }) !== null;

const del = { table: 'leads', action: 'delete', filters: [{ col: 'meta_lead_id', op: 'eq', val: 'x' }] };
console.log('\nOnly a Super Admin may delete a lead\n');
check('Super Admin may delete',            !blocked(del, 'Super Admin'));
for (const role of ['Manager', 'Branch Manager', 'Admin', 'Advisor', 'Health Coach', 'Receptionist', 'BDM', 'ABM', '']) {
  check(('"' + role + '" may not').padEnd(28), blocked(del, role), validateLeadDelete(del, { role }) || '');
}
check('a missing user is refused',          blocked(del, undefined));
// The guard must not leak into anything else on the leads table, or ordinary work stops.
check('Advisor may still UPDATE a lead',   !blocked({ table: 'leads', action: 'update' }, 'Advisor'));
check('Advisor may still SELECT leads',    !blocked({ table: 'leads', action: 'select' }, 'Advisor'));
check('Advisor may still INSERT a lead',   !blocked({ table: 'leads', action: 'insert' }, 'Advisor'));
check('deletes on OTHER tables untouched', !blocked({ table: 'csv_leads', action: 'delete' }, 'Advisor'));

// A payment IS the revenue record, so its delete is restricted the same way.
const delPay = { table: 'payments', action: 'delete' };
console.log('\nOnly a Super Admin may delete a payment\n');
check('Super Admin may delete a payment',   !blocked(delPay, 'Super Admin'));
for (const role of ['Manager', 'Accounts', 'Admin', 'Advisor', 'Receptionist', '']) {
  check(('"' + role + '" may not').padEnd(28), blocked(delPay, role));
}
check('Accounts may still UPDATE a payment', !blocked({ table: 'payments', action: 'update' }, 'Accounts'));
check('Accounts may still INSERT a payment', !blocked({ table: 'payments', action: 'insert' }, 'Accounts'));
check('verifying a payment is unaffected',   !blocked({ table: 'payments', action: 'update' }, 'Receptionist'));

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
