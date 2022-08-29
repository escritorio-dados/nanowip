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
  try {
    await client.query(`CREATE ROLE ${role_name}`);

    await client.query(`GRANT USAGE ON SCHEMA public TO ${role_name}`);
  
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${role_name}`);
  
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${role_name}`);
  } catch (error) {
    console.log('CREATE ROLE', error.message)
  }

}

async function createUser(user, pass, role) {
  try {
    await client.query(`CREATE USER ${user} WITH PASSWORD '${pass}'`);

    await client.query(`GRANT ${role} TO ${user}`);
  } catch (error) {
    console.log('CREATE USER', error.message)
  }
}

async function deleteUserRole(user, role) {
  try {
    await client.query(`DROP OWNED BY ${role}`);

    await client.query(`DROP ROLE ${role}`);
  
    await client.query(`DROP USER ${user}`);
  } catch (error) {
    console.log('DELETE USER ROLE', error.message)
  }
}

async function createPolicy(table, role, policyName, organization_id) {
  try {
    await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);

    await client.query(`create policy ${policyName} on ${table} to ${role} using ('${organization_id}' = organization_id)`);
  } catch (error) {
    console.log('CREATE POLICY', error.message, table)
  }
}

const users = [
  {
    role: 'ro_unaspress',
    user: 'unaspress',
    pass: 'R3N$XwU8jpDBmkCc',
    policyName: 'unaspress',
    organization_id: 'dca28c68-febd-4c16-801a-5fda5a15e3d6'
  },
  {
    role: 'ro_ead',
    user: 'ead',
    pass: 'R3N$XwU8jpDBmkCc',
    policyName: 'ead',
    organization_id: '39f7c063-8670-429f-adf0-2fc3e0a258f1'
  }
]

// const role = 'ro_unaspress';
// const user = 'unaspress';
// const pass = 'R3N$XwU8jpDBmkCc';
// const policyName = 'unaspress';
// const organization_id = '39f7c063-8670-429f-adf0-2fc3e0a258f1';

const tables = [
  'assignments', 
  'collaborator_status', 
  'collaborators', 
  'cost_distributions', 
  'costs', 
  'customers',
  'deliverable_tags',
  'deliverables',
  'document_types',
  'integrated_objectives',
  'links',
  'measures',
  'milestones',
  'milestones_groups',
  'objective_categories',
  'objective_sections',
  'operational_objectives',
  'portfolios', 
  'product_types', 
  'products', 
  'project_types', 
  'projects', 
  'roles',
  'section_trails',
  'service_providers',
  'tags',
  'tags_groups',
  'task_report_comments',
  'task_trails',
  'task_types', 
  'tasks', 
  'trackers',
  'trail_sections',
  'trails', 
  'users', 
  'value_chains', 
];

for (const user of users) {
  await deleteUserRole(user.user, user.role);

  await createRole(user.role, client);

  await createUser(user.user, user.pass, user.role);

  for (const table of tables) {
    await createPolicy(table, user.role, user.policyName, user.organization_id);
  }
}

await client.end();