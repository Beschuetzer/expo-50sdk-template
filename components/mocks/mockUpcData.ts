import { MOCK_UPC_PRODUCTS } from './constants';

import { delay } from '@/utils/helpers';

export async function handleMockResponse(upc: string) {
  await delay(1000);
  const toReturn = MOCK_UPC_PRODUCTS?.[upc] || {
    data: {
      code: upc,
      status: 0,
      status_verbose: 'product not found',
    },
  };
  return new Response(JSON.stringify(toReturn));
}
