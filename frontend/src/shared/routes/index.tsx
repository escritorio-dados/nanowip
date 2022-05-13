import { Route, Routes } from 'react-router-dom';

import { CustomizeColors } from '#shared/pages/CustomizeColors';
import { Home } from '#shared/pages/Home';

import { AssignmentsRoutes } from '#modules/assignments/routes';
import { CollaboratorsRoutes } from '#modules/collaborators/routes';
import { CollaboratorsStatusRoutes } from '#modules/collaboratorsStatus/routes';
import { CostDitributionsRoutes } from '#modules/costs/costDistrbutions/routes';
import { CostsRoutes } from '#modules/costs/costs/routes';
import { DocumentTypesRoutes } from '#modules/costs/documentTypes/routes';
import { ServiceProvidersRoutes } from '#modules/costs/serviceProviders/routes';
import { ServicesRoutes } from '#modules/costs/services/routes';
import { CustomersRoutes } from '#modules/customers/routes';
import { LinksRoutes } from '#modules/links/routes';
import { MeasuresRoutes } from '#modules/measures/routes';
import { OrganizationsRoutes } from '#modules/organizations/routes';
import { PersonalRoutes } from '#modules/personal/routes';
import { PortfoliosRoutes } from '#modules/portfolios/routes';
import { ProductsRoutes } from '#modules/products/routes';
import { ProductTypesRoutes } from '#modules/productTypes/routes';
import { ProjectsRoutes } from '#modules/projects/routes';
import { ProjectTypesRoutes } from '#modules/projectTypes/routes';
import { RolesRoutes } from '#modules/roles/routes';
import { TasksRoutes } from '#modules/tasks/routes';
import { TaskTrailsRoutes } from '#modules/taskTrails/routes';
import { TaskTypesRoutes } from '#modules/taskTypes/routes';
import { TrackersRoutes } from '#modules/trackers/routes';
import { TrailsRoutes } from '#modules/trails/routes';
import { Auth } from '#modules/users/pages/Auth';
import { UsersRoutes } from '#modules/users/routes';
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
        path="/services/*"
        element={
          <PrivateRoute>
            <ServicesRoutes />
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
    </Routes>
  );
}
