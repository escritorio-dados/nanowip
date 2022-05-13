import { Injectable } from '@nestjs/common';

import {
  recalculateAvailableDate,
  recalculateStartDate,
  recalculateEndDate,
} from '@shared/utils/changeDatesAux';
import { sliceList } from '@shared/utils/sliceList';

import { Product } from '@modules/products/entities/Product';
import { ProductsRepository } from '@modules/products/repositories/products.repository';

type IRecalculateDates = { organization_id: string };

@Injectable()
export class RecalculateDatesProductService {
  constructor(private productsRepository: ProductsRepository) {}

  private async recalculate(products: Product[], origin: 'root' | 'sub') {
    const slicedProducts = sliceList({ array: products, maxLenght: 2000 });

    for await (const sliceProducts of slicedProducts) {
      const productsRecalculated = sliceProducts.map(product => {
        const children =
          origin === 'sub'
            ? [...product.valueChains]
            : [...product.valueChains, ...product.subproducts];

        const availableCalculated = recalculateAvailableDate(children);

        const startCalculated = recalculateStartDate(children);

        const endCalculated = recalculateEndDate(children);

        return {
          ...product,
          availableDate: availableCalculated,
          startDate: startCalculated,
          endDate: endCalculated,
        };
      });

      await this.productsRepository.saveAll(productsRecalculated);
    }
  }

  async recalculateDates({ organization_id }: IRecalculateDates) {
    // Pegar todos os sub produtos junto com os seus valueChains
    const subproducts = await this.productsRepository.findAll({
      onlySub: true,
      relations: ['valueChains'],
      organization_id,
    });

    // Recalculando as datas dos subprodutos
    await this.recalculate(subproducts, 'sub');

    // Pegando todos os produtos raiz com os seus subprodutos
    const rootProducts = await this.productsRepository.findAll({
      onlyRoot: true,
      relations: ['subproducts', 'valueChains'],
      organization_id,
    });

    // Recalculando as datas dos produtos raiz
    await this.recalculate(rootProducts, 'root');
  }
}
