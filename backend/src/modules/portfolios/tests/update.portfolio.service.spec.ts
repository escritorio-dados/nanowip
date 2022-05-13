import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import { portfolioErrors } from '@modules/portfolios/errors/portfolio.errors';
import {
  portfoliosFake,
  PortfoliosFakeRepository,
} from '@modules/portfolios/repositories/portfolios.fake.repository';
import { PortfoliosRepository } from '@modules/portfolios/repositories/portfolios.repository';

import { CommonPortfolioService } from '../services/common.portfolio.service';
import { UpdatePortfolioService } from '../services/update.portfolio.service';

describe('Portfolios', () => {
  describe('UpdatePortfolioService', () => {
    let updatePortfolioService: UpdatePortfolioService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [UpdatePortfolioService, CommonPortfolioService, PortfoliosRepository],
      })
        .overrideProvider(PortfoliosRepository)
        .useClass(PortfoliosFakeRepository)
        .compile();

      updatePortfolioService = moduleRef.get<UpdatePortfolioService>(UpdatePortfolioService);
    });

    it('should be able to update a portfolio', async () => {
      const portfolio = await updatePortfolioService.execute({
        id: portfoliosFake.P1_O1.id,
        name: 'portfolio_1 atualizado',
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolio).toEqual(
        expect.objectContaining({ id: portfoliosFake.P1_O1.id, name: 'portfolio_1 atualizado' }),
      );
    });

    it('should not be able to update a portfolios that not exists', async () => {
      await expect(
        updatePortfolioService.execute({
          id: 'Não Existe',
          organization_id: portfoliosFake.P1_O1.organization_id,
          name: portfoliosFake.P1_O1.name,
        }),
      ).rejects.toEqual(new AppError(portfolioErrors.notFound));
    });

    it('should not be able to update a portfolio from another organization', async () => {
      await expect(
        updatePortfolioService.execute({
          id: portfoliosFake.P1_O1.id,
          name: 'Novo Nome',
          organization_id: portfoliosFake.P3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });

    it('should be able to change de case of the name', async () => {
      const portfolio = await updatePortfolioService.execute({
        id: portfoliosFake.P1_O1.id,
        name: portfoliosFake.P1_O1.name.toUpperCase(),
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolio).toEqual(
        expect.objectContaining({
          id: portfoliosFake.P1_O1.id,
          name: portfoliosFake.P1_O1.name.toUpperCase(),
        }),
      );
    });

    it('should not be able to change the name to a name already in use', async () => {
      await expect(
        updatePortfolioService.execute({
          id: portfoliosFake.P1_O1.id,
          name: portfoliosFake.P2_O1_WP.name,
          organization_id: portfoliosFake.P1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(portfolioErrors.duplicateName));
    });

    it('should allow duplicate names in different organizatons', async () => {
      const portfolio = await updatePortfolioService.execute({
        id: portfoliosFake.P3_O2.id,
        name: portfoliosFake.P1_O1.name,
        organization_id: portfoliosFake.P3_O2.organization_id,
      });

      expect(portfolio).toEqual(
        expect.objectContaining({ id: portfoliosFake.P3_O2.id, name: portfoliosFake.P1_O1.name }),
      );
    });

    it('should remove any white spaces on the endings of the name', async () => {
      const portfolio = await updatePortfolioService.execute({
        id: portfoliosFake.P1_O1.id,
        name: '      Portfolio      ',
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolio.name).toBe('Portfolio');
    });
  });
});
