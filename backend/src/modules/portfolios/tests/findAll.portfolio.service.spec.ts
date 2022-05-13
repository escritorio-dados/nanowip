import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import {
  portfoliosFake,
  PortfoliosFakeRepository,
} from '@modules/portfolios/repositories/portfolios.fake.repository';
import { PortfoliosRepository } from '@modules/portfolios/repositories/portfolios.repository';

import { FindAllPortfolioService } from '../services/findAll.portfolio.service';

describe('Portfolios', () => {
  describe('FindAllPortfolioService', () => {
    let findAllPortfolioService: FindAllPortfolioService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindAllPortfolioService, PortfoliosRepository],
      })
        .overrideProvider(PortfoliosRepository)
        .useClass(PortfoliosFakeRepository)
        .compile();

      findAllPortfolioService = moduleRef.get<FindAllPortfolioService>(FindAllPortfolioService);
    });

    it('should be able to find all portfolio from a organization', async () => {
      const portfolios = await findAllPortfolioService.execute({
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolios).toEqual(
        expect.arrayContaining([
          portfoliosFake.P1_O1,
          portfoliosFake.P2_O1_WP,
          portfoliosFake.P3_O1_WP,
        ]),
      );
    });

    it('should be able to find all portfolios by a list of ids', async () => {
      const portfolios = await findAllPortfolioService.execute({
        organization_id: portfoliosFake.P1_O1.organization_id,
        portfolios_id: [portfoliosFake.P1_O1.id, portfoliosFake.P2_O1_WP.id],
      });

      expect(portfolios).toEqual(
        expect.arrayContaining([portfoliosFake.P1_O1, portfoliosFake.P2_O1_WP]),
      );

      expect(portfolios).not.toEqual(expect.arrayContaining([portfoliosFake.P3_O1_WP]));
    });

    it('should be able to find all portfolios from a project', async () => {
      const portfolios = await findAllPortfolioService.execute({
        organization_id: portfoliosFake.P1_O1.organization_id,
        project_id: 'project_1',
      });

      expect(portfolios).toEqual(
        expect.arrayContaining([portfoliosFake.P2_O1_WP, portfoliosFake.P3_O1_WP]),
      );

      expect(portfolios).not.toEqual(expect.arrayContaining([portfoliosFake.P1_O1]));
    });

    it('should not be able to find portfolios from another organization', async () => {
      await expect(
        findAllPortfolioService.execute({
          project_id: 'project_1',
          organization_id: portfoliosFake.P3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
