import { useQuery } from '@tanstack/react-query';

import { UpcProp } from '@/types/general';
import { TanstackQueryUseCase } from '@/types/tanstack-query';
import { fetchUpcProduct } from '@/utils/helpers';

type UseUpcProductProps = {
  shouldSkip?: boolean;
} & UpcProp;

export function useUpcProduct(props: UseUpcProductProps) {
  const { shouldSkip, upc } = props;

  const {
    data: upcProduct = null,
    error,
    isLoading,
  } = useQuery({
    queryKey: [TanstackQueryUseCase.UpcProduct, upc],
    queryFn: () => {
      return fetchUpcProduct(upc);
    },
    enabled: !shouldSkip && !!upc,
    staleTime: 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  return {
    upcProduct,
    isLoading,
    error,
  };
}
