import { Test } from '@nestjs/testing';
import { validate as isUUID } from 'uuid';

import { AppError } from '@shared/errors/AppError';

import { portfolioErrors } from '@modules/portfolios/errors/portfolio.errors';
import {
  portfoliosFake,
  PortfoliosFakeRepository,
} from '@modules/portfolios/repositories/portfolios.fake.repository';
import { PortfoliosRepository } from '@modules/portfolios/repositories/portfolios.repository';

import { CommonPortfolioService } from '../services/common.portfolio.service';
import { CreatePortfolioService } from '../services/create.portfolio.service';

describe('Portfolios', () => {
  describe('CreatePortfolioService', () => {
    let createPortfolioService: CreatePortfolioService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [CreatePortfolioService, CommonPortfolioService, PortfoliosRepository],
      })
        .overrideProvider(PortfoliosRepository)
        .useClass(PortfoliosFakeRepository)
        .compile();

      createPortfolioService = moduleRef.get<CreatePortfolioService>(CreatePortfolioService);
    });

    it('should be able to create a portfolio', async () => {
      const portfolio = await createPortfolioService.execute({
        name: 'Projetos Organizacionais',
        organization_id: 'organizarionID',
      });

      const uuidValid = isUUID(portfolio.id);

      expect(uuidValid).toBeTruthy();
    });

    it('should not be able to create a portfolio with same name (case insensitive)', async () => {
      await expect(
        createPortfolioService.execute({
          name: portfoliosFake.P1_O1.name.toUpperCase(),
          organization_id: portfoliosFake.P1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(portfolioErrors.duplicateName));
    });

    it('should remove any white spaces on the endings of the name', async () => {
      const portfolio = await createPortfolioService.execute({
        name: '        Projetos Organizacionais      ',
        organization_id: portfoliosFake.P1_O1.organization_id,
      });

      expect(portfolio.name).toBe('Projetos Organizacionais');
    });

    it('should allow duplicate names in different organizatons', async () => {
      const portfolio = await createPortfolioService.execute({
        name: portfoliosFake.P1_O1.name,
        organization_id: portfoliosFake.P3_O2.organization_id,
      });

      const portfoliosCreated = isUUID(portfolio.id);

      expect(portfoliosCreated).toBeTruthy();
    });
  });
});
