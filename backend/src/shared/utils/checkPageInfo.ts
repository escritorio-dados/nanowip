type ICheckPage = { hasNextPage: boolean; hasPreviousPage: boolean };

type ICheckPageProps = { offset: number; limit: number; totalCount: number };

export function checkPageInfo({ limit, offset, totalCount }: ICheckPageProps): ICheckPage {
  return {
    hasNextPage: limit + offset < totalCount,
    hasPreviousPage: offset > 0,
  };
}
