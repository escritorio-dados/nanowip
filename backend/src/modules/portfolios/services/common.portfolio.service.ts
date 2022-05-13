import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Portfolio } from '../entities/Portfolio';
import { portfolioErrors } from '../errors/portfolio.errors';
import { PortfoliosRepository } from '../repositories/portfolios.repository';

type IValidateNamePortfolio = { name: string; organization_id: string };

type IGetPortfolio = { id: string; relations?: string[]; organization_id: string };

type IValidatePortfolio = { portfolio: Portfolio; organization_id: string };

@Injectable()
export class CommonPortfolioService {
  constructor(private portfoliosRepository: PortfoliosRepository) {}

  async validadeName({ name, organization_id }: IValidateNamePortfolio): Promise<void> {
    const portfolioWithSameName = await this.portfoliosRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (portfolioWithSameName) {
      throw new AppError(portfolioErrors.duplicateName);
    }
  }

  async getPortfolio({ id, organization_id, relations }: IGetPortfolio): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findById(id, relations);

    await this.validatePortfolio({ portfolio, organization_id });

    return portfolio;
  }

  async validatePortfolio({ portfolio, organization_id }: IValidatePortfolio) {
    if (!portfolio) {
      throw new AppError(portfolioErrors.notFound);
    }

    validateOrganization({ entity: portfolio, organization_id });
  }
}
