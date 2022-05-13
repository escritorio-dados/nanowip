export const productErrors = {
  duplicateName: {
    message: 'This name is already being used by another product',
    userMessage: 'Este nome já está sendo utilizado por outro Produto',
  },
  subproductsOfsubproducts: {
    message: 'It is not possible to create subproducts of subproducts',
    userMessage: 'Não é possivel criar subprodutos de subprodutos',
  },
  notFound: {
    message: 'product not found',
    userMessage: 'produto não encontrado',
  },
  deleteWithSubproducts: {
    message: 'a product with subproducts cannot be deleted',
    userMessage: 'um produto com subprodutos não pode ser excluido',
  },
  deleteWithValueChains: {
    message: 'a product with valueChains cannot be deleted',
    userMessage: 'um produto com cadeias de valor não pode ser excluido',
  },
  deleteWithCosts: {
    message: 'a product with costs cannot be deleted',
    userMessage: 'um produto com custos não pode ser excluido',
  },
  productWithSubproductsToSubproduct: {
    message: 'It is not possible to convert a product with subproducts to a subproduct',
    userMessage: 'Não é possivel converter um produto com subprodutos em um subproduto',
  },
};
