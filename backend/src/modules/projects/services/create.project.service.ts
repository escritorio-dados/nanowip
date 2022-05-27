import { Injectable } from '@nestjs/common';

import { getStatusDate } from '@shared/utils/getStatusDate';
import { validadeDates } from '@shared/utils/validadeDates';

import { FindOneCustomerService } from '@modules/customers/services/findOneCustomer.service';
import { FindAllPortfolioService } from '@modules/portfolios/services/findAll.portfolio.service';
import { FindOneProjectTypeService } from '@modules/projectTypes/services/findOne.projectType.service';

import { ICreateProjectRepository } from '../dtos/create.project.repository.dto';
import { ProjectDto } from '../dtos/project.dto';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CommonProjectService } from './common.project.service';
import { FixDatesProjectService } from './fixDates.project.service';

type ICreateProjectService = ProjectDto & { organization_id: string };

@Injectable()
export class CreateProjectService {
  constructor(
    private projectsRepository: ProjectsRepository,
    private commonProjectService: CommonProjectService,
    private fixDatesProjectService: FixDatesProjectService,

    private findOneProjectTypeService: FindOneProjectTypeService,
    private findOneCustomerService: FindOneCustomerService,
    private findAllPortfolioService: FindAllPortfolioService,
  ) {}

  async execute({
    name,
    customer_id,
    project_type_id,
    project_parent_id,
    portfolios_id,
    availableDate,
    endDate,
    startDate,
    deadline,
    organization_id,
  }: ICreateProjectService) {
    const newProject: ICreateProjectRepository = { organization_id } as ICreateProjectRepository;

    // Validando e Pegando tipo de projeto
    newProject.projectType = await this.findOneProjectTypeService.execute({
      id: project_type_id,
      organization_id,
    });

    // Pegando os portfolios
    if (portfolios_id && portfolios_id.length > 0) {
      newProject.portfolios = await this.findAllPortfolioService.execute({
        portfolios_id,
        organization_id,
      });
    }

    // Pegando o parent (Customer ou Project)
    if (customer_id) {
      const customer = await this.findOneCustomerService.execute({
        id: customer_id,
        organization_id,
      });

      newProject.customer = customer;
    } else {
      const projectParent = await this.commonProjectService.getParent({
        id: project_parent_id,
        organization_id,
      });

      this.commonProjectService.validateProjectParent(projectParent);

      newProject.projectParent = projectParent;
    }

    // Validando e atribuuindo o nome
    await this.commonProjectService.validadeName({
      name,
      customer_id,
      project_parent_id,
      organization_id,
    });

    newProject.name = name.trim();

    // Validando e atribuindo as datas fixas
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    newProject.deadline = deadline;
    newProject.availableDate = availableDate;
    newProject.startDate = startDate;
    newProject.endDate = endDate;

    // Salvando no banco de dados o projeto
    const project = await this.projectsRepository.create(newProject);

    // Adicionando os portfolios no retorno (Por motivos de testes)
    project.portfolios = newProject.portfolios;

    // Causando os efeitos colaterais
    if (project.project_parent_id) {
      await this.fixDatesProjectService.recalculateDates(project.project_parent_id, 'full');
    }

    return {
      ...project,
      statusDate: getStatusDate(project),
      subprojects: [],
    };
  }
}
