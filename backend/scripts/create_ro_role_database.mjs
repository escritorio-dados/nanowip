import pg from 'pg'

import { config } from 'dotenv';

config();

const client = new pg.Client({
  host: process.env.POSTGRESS_HOST,
  port: process.env.POSTGRESS_PORT,
  user: process.env.POSTGRESS_USER,
  password: process.env.POSTGRESS_PASSWORD,
  database: process.env.POSTGRESS_DATABASE
})

await client.connect();

async function createRole(role_name, client) {
  await client.query(`CREATE ROLE ${role_name}`);

  await client.query(`GRANT USAGE ON SCHEMA public TO ${role_name}`);

  await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${role_name}`);

  await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${role_name}`);
}

async function createUser(user, pass, role) {
  await client.query(`CREATE USER ${user} WITH PASSWORD '${pass}'`);

  await client.query(`GRANT ${role} TO ${user}`);
}

async function deleteUserRole(user, role) {
  await client.query(`DROP OWNED BY ${role}`);

  await client.query(`DROP ROLE ${role}`);

  await client.query(`DROP USER ${user}`);
}

async function createPolicy(table, role, policyName, organization_id) {
  await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);

  await client.query(`create policy ${policyName} on ${table} to ${role} using ('${organization_id}' = organization_id)`);
}

const role = 'ro_unaspress';
const user = 'unaspress';
const pass = 'R3N$XwU8jpDBmkCc';
const policyName = 'unaspress';
const organization_id = '39f7c063-8670-429f-adf0-2fc3e0a258f1';

const tables = [
  'assignments', 'collaborator_status', 'collaborators', 'costs', 'customers', 'measures',
  'portfolios', 'product_types', 'products', 'project_types', 'projects', 'roles', 'task_trails',
  'task_types', 'tasks', 'trackers', 'trails', 'users', 'value_chains', 'links'
];

// await deleteUserRole(user, role);

await createRole(role, client);

await createUser(user, pass, role);


for (const table of tables) {
  await createPolicy(table, role, policyName, organization_id);
}

await client.end();