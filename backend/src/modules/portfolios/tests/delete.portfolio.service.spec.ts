import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import {
  portfoliosFake,
  PortfoliosFakeRepository,
} from '@modules/portfolios/repositories/portfolios.fake.repository';
import { PortfoliosRepository } from '@modules/portfolios/repositories/portfolios.repository';

import { CommonPortfolioService } from '../services/common.portfolio.service';
import { DeletePortfolioService } from '../services/delete.portfolio.service';

describe('Portfolios', () => {
  describe('DeletePortfolioService', () => {
    let deletePortfolioService: DeletePortfolioService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [DeletePortfolioService, CommonPortfolioService, PortfoliosRepository],
      })
        .overrideProvider(PortfoliosRepository)
        .useClass(PortfoliosFakeRepository)
        .compile();

      deletePortfolioService = moduleRef.get<DeletePortfolioService>(DeletePortfolioService);
    });

    it('should be able to delete a portfolio', async () => {
      // Deletando o cliente
      const portfolio = await deletePortfolioService.execute({
        id: portfoliosFake.P1_O1.id,
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolio.id === portfoliosFake.P1_O1.id).toBeTruthy();
    });

    it('should not be able to delete a portfolio from another organization', async () => {
      await expect(
        deletePortfolioService.execute({
          id: portfoliosFake.P1_O1.id,
          organization_id: portfoliosFake.P3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
