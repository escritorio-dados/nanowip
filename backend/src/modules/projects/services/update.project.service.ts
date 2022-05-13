import { Injectable } from '@nestjs/common';

import { ServiceDatesController } from '@shared/utils/ServiceDatesController';
import { validadeDates } from '@shared/utils/validadeDates';

import { FindOneCustomerService } from '@modules/customers/services/findOneCustomer.service';
import { FindAllPortfolioService } from '@modules/portfolios/services/findAll.portfolio.service';
import { FindOneProjectTypeService } from '@modules/projectTypes/services/findOne.projectType.service';

import { ProjectDto } from '../dtos/project.dto';
import { Project } from '../entities/Project';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CommonProjectService } from './common.project.service';
import { FixDatesProjectService } from './fixDates.project.service';

type IResolveParentProps = {
  customer_id?: string;
  project_parent_id?: string;
  project: Project;
  name: string;
  organization_id: string;
};

type IUpdateProjectService = ProjectDto & { id: string; organization_id: string };

type IUpdateDatesParent = {
  project: Project;
  serviceDatesController: ServiceDatesController;
  parentController: {
    old_parent_id: string;
    old_customer_id: string;
  };
};

@Injectable()
export class UpdateProjectService {
  constructor(
    private projectsRepository: ProjectsRepository,
    private commonProjectService: CommonProjectService,
    private fixDatesProjectService: FixDatesProjectService,

    private findOneProjectTypeService: FindOneProjectTypeService,
    private findOneCustomerService: FindOneCustomerService,
    private findAllPortfolioService: FindAllPortfolioService,
  ) {}

  private async resolveParent({
    project,
    customer_id,
    project_parent_id,
    name,
    organization_id,
  }: IResolveParentProps) {
    // Verificando se houve alterações
    const changeParent =
      (customer_id && project.customer_id !== customer_id) ||
      (project_parent_id && project.project_parent_id !== project_parent_id);

    if (changeParent) {
      await this.commonProjectService.validadeName({
        name,
        customer_id,
        project_parent_id,
        organization_id,
      });

      if (customer_id) {
        project.customer = await this.findOneCustomerService.execute({
          id: customer_id,
          organization_id,
        });

        project.customer_id = customer_id;
        project.project_parent_id = null;
      } else {
        project.projectParent = await this.commonProjectService.getParent({
          id: project_parent_id,
          organization_id,
        });

        this.commonProjectService.validateProjectParent(project.projectParent);

        await this.commonProjectService.validateProjectWithSubprojects(project.id);

        project.project_parent_id = project_parent_id;
        project.customer_id = null;
      }
    }
  }

  private async updateDatesParent({
    parentController,
    project,
    serviceDatesController,
  }: IUpdateDatesParent) {
    const changedParent = parentController.old_parent_id !== project.project_parent_id;

    serviceDatesController.updateDates(project, changedParent);

    if (serviceDatesController.needChangeDates()) {
      // Aplicando as mudanças no lugar atual se for um project parent
      if (project.project_parent_id) {
        await this.fixDatesProjectService.verifyDatesChanges({
          project_id: project.project_parent_id,
          ...serviceDatesController.getUpdateParams(),
        });
      }

      // Aplicando as mudanças no local antigo caso ele seja um project parent
      if (parentController.old_parent_id) {
        await this.fixDatesProjectService.verifyDatesChanges({
          project_id: parentController.old_parent_id,
          ...serviceDatesController.getUpdateParamsDelete(),
        });
      }
    }

    // // Possuia um cliente, mas agora possui um projeto pai
    // if (parentController.old_customer_id && project.project_parent_id) {
    //   await this.fixDatesProjectService.verifyDatesChanges({
    //     project_id: project.project_parent_id,
    //     ...serviceDatesController.getUpdateParams(),
    //   });
    // }

    // // Possuia um projeto mas agora possui um cliente
    // if (parentController.old_parent_id && project.customer_id) {
    //   await this.fixDatesProjectService.verifyDatesChanges({
    //     project_id: parentController.old_parent_id,
    //     ...serviceDatesController.getUpdateParamsDelete(),
    //   });
    // }

    // // Atualmente está em baixo de um subprojeto
    // if (project.project_parent_id) {
    //   // As datas alteraram
    //   if (serviceDatesController.needChangeDates()) {
    //     await this.fixDatesProjectService.verifyDatesChanges({
    //       project_id: project.project_parent_id,
    //       ...serviceDatesController.getUpdateParams(),
    //     });
    //   }

    //   // Mudou de um projeto pai para outro
    //   if (project.project_parent_id !== parentController.old_parent_id) {
    //     await this.fixDatesProjectService.verifyDatesChanges({
    //       project_id: parentController.old_parent_id,
    //       ...serviceDatesController.getUpdateParamsDelete(),
    //     });
    //   }
    // }
  }

  async execute({
    id,
    name,
    customer_id,
    project_type_id,
    project_parent_id,
    portfolios_id,
    availableDate,
    deadline,
    endDate,
    startDate,
    organization_id,
  }: IUpdateProjectService): Promise<Project> {
    const project = await this.commonProjectService.getProject({ id, organization_id });

    // Variavel de controle das datas
    const serviceDatesController = new ServiceDatesController(project);

    const parentController = {
      old_parent_id: project.project_parent_id,
      old_customer_id: project.customer_id,
    };

    // Alterando tipo de projeto
    if (project.project_type_id !== project_type_id) {
      project.projectType = await this.findOneProjectTypeService.execute({
        id: project_type_id,
        organization_id,
      });

      project.project_type_id = project_type_id;
    }

    // Alterando pai (cliente ou projeto pai)
    await this.resolveParent({ name, project, customer_id, project_parent_id, organization_id });

    // Alterando Nome
    if (project.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonProjectService.validadeName({
        name,
        customer_id,
        project_parent_id,
        organization_id,
      });
    }

    project.name = name.trim();

    // Alterando portifolios
    if (!portfolios_id || portfolios_id.length === 0) {
      project.portfolios = [];
    } else {
      project.portfolios = await this.findAllPortfolioService.execute({
        portfolios_id,
        organization_id,
      });
    }

    // Alterando datas fixas
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    project.deadline = deadline;
    project.availableDate = availableDate;
    project.startDate = startDate;
    project.endDate = endDate;

    await this.projectsRepository.save(project);

    // Aplicando alterações de datas no Path acima
    await this.updateDatesParent({ parentController, project, serviceDatesController });

    return project;
  }
}
