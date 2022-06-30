import { Route, Routes } from 'react-router-dom';

import { CustomizeColors } from '#shared/pages/CustomizeColors';
import { Home } from '#shared/pages/Home';

import { AssignmentsRoutes } from '#modules/assignments/routes';
import { CollaboratorsRoutes } from '#modules/collaborators/collaborators/routes';
import { CollaboratorsStatusRoutes } from '#modules/collaborators/collaboratorsStatus/routes';
import { CostDitributionsRoutes } from '#modules/costs/costDistrbutions/routes';
import { CostsRoutes } from '#modules/costs/costs/routes';
import { DocumentTypesRoutes } from '#modules/costs/documentTypes/routes';
import { ServiceProvidersRoutes } from '#modules/costs/serviceProviders/routes';
import { CustomersRoutes } from '#modules/customers/routes';
import { LinksRoutes } from '#modules/links/routes';
import { IntegratedObjectivesRoutes } from '#modules/objectives/integratedObjectives/routes';
import { ObjectiveCategoriesRoutes } from '#modules/objectives/objectiveCategories/routes';
import { OperationalObjectivesRoutes } from '#modules/objectives/operationalObjectives/routes';
import { SectionTrailsRoutes } from '#modules/objectives/sectionTrails/sectionTrails/routes';
import { OrganizationsRoutes } from '#modules/organizations/routes';
import { PersonalRoutes } from '#modules/personal/routes';
import { PortfoliosRoutes } from '#modules/portfolios/routes';
import { MeasuresRoutes } from '#modules/products/measures/routes';
import { ProductsRoutes } from '#modules/products/products/routes';
import { ProductTypesRoutes } from '#modules/products/productTypes/routes';
import { ProjectsRoutes } from '#modules/projects/projects/routes';
import { ProjectTypesRoutes } from '#modules/projects/projectTypes/routes';
import { TasksRoutes } from '#modules/tasks/tasks/routes';
import { TaskTypesRoutes } from '#modules/tasks/taskTypes/routes';
import { TrackersRoutes } from '#modules/trackers/routes';
import { TaskTrailsRoutes } from '#modules/trails/taskTrails/routes';
import { TrailsRoutes } from '#modules/trails/trails/routes';
import { RolesRoutes } from '#modules/users/roles/routes';
import { Auth } from '#modules/users/users/pages/Auth';
import { UsersRoutes } from '#modules/users/users/routes';
import { ValueChainsRoutes } from '#modules/valueChains/routes';

import { PrivateRoute } from './private';

export function Router() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/customize"
        element={
          <PrivateRoute>
            <CustomizeColors />
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/users/*"
        element={
          <PrivateRoute>
            <UsersRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/roles/*"
        element={
          <PrivateRoute>
            <RolesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/customers/*"
        element={
          <PrivateRoute>
            <CustomersRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/portfolios/*"
        element={
          <PrivateRoute>
            <PortfoliosRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/project_types/*"
        element={
          <PrivateRoute>
            <ProjectTypesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/projects/*"
        element={
          <PrivateRoute>
            <ProjectsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/measures/*"
        element={
          <PrivateRoute>
            <MeasuresRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/product_types/*"
        element={
          <PrivateRoute>
            <ProductTypesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/products/*"
        element={
          <PrivateRoute>
            <ProductsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/value_chains/*"
        element={
          <PrivateRoute>
            <ValueChainsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/task_types/*"
        element={
          <PrivateRoute>
            <TaskTypesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/tasks/*"
        element={
          <PrivateRoute>
            <TasksRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/collaborators/*"
        element={
          <PrivateRoute>
            <CollaboratorsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/collaborators_status/*"
        element={
          <PrivateRoute>
            <CollaboratorsStatusRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/assignments/*"
        element={
          <PrivateRoute>
            <AssignmentsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/trackers/*"
        element={
          <PrivateRoute>
            <TrackersRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/personal/*"
        element={
          <PrivateRoute>
            <PersonalRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/trails/*"
        element={
          <PrivateRoute>
            <TrailsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/task_trails/*"
        element={
          <PrivateRoute>
            <TaskTrailsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/document_types/*"
        element={
          <PrivateRoute>
            <DocumentTypesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/service_providers/*"
        element={
          <PrivateRoute>
            <ServiceProvidersRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/costs/*"
        element={
          <PrivateRoute>
            <CostsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/cost_distributions/*"
        element={
          <PrivateRoute>
            <CostDitributionsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/links/*"
        element={
          <PrivateRoute>
            <LinksRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/organizations/*"
        element={
          <PrivateRoute>
            <OrganizationsRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/operational_objectives/*"
        element={
          <PrivateRoute>
            <OperationalObjectivesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/integrated_objectives/*"
        element={
          <PrivateRoute>
            <IntegratedObjectivesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/objective_categories/*"
        element={
          <PrivateRoute>
            <ObjectiveCategoriesRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/sections_trails/*"
        element={
          <PrivateRoute>
            <SectionTrailsRoutes />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
