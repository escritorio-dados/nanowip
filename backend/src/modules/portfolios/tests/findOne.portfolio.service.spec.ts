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
import { FindOnePortfolioService } from '../services/findOne.portfolio.service';

describe('Portfolios', () => {
  describe('FindOnePortfolioService', () => {
    let findOnePortfolioService: FindOnePortfolioService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindOnePortfolioService, CommonPortfolioService, PortfoliosRepository],
      })
        .overrideProvider(PortfoliosRepository)
        .useClass(PortfoliosFakeRepository)
        .compile();

      findOnePortfolioService = moduleRef.get<FindOnePortfolioService>(FindOnePortfolioService);
    });

    it('should be able to find one portfolio', async () => {
      // Deletando o cliente
      const portfolio = await findOnePortfolioService.execute({
        id: portfoliosFake.P1_O1.id,
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolio).toEqual(expect.objectContaining(portfoliosFake.P1_O1));
    });

    it('should not be able to find a user that not exists', async () => {
      await expect(
        findOnePortfolioService.execute({ id: 'Não Existe', organization_id: 'organização_1' }),
      ).rejects.toEqual(new AppError(portfolioErrors.notFound));
    });

    it('should not be able to return a portfolio from another organization', async () => {
      await expect(
        findOnePortfolioService.execute({
          id: portfoliosFake.P1_O1.id,
          organization_id: portfoliosFake.P3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
