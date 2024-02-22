import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { handleMockResponse } from '../mocks/mockUpcData'

import { UPC_REGEX } from '@/constants/regexs'
import { shouldShouldMockScannedResponsesSelector } from '@/state/slices/generalSlice'
import { addUpcProduct, upcProductSelector } from '@/state/slices/scannerSlice'
import { UpcProduct, UpcResponse } from '@/types/UpcResponse'
import { UpcProp } from '@/types/general'

type UseUpcProductProps = {
  onSuccessfulFetch?: (upcProduct: UpcProduct) => void
} & UpcProp

export function useUpcProduct(props: UseUpcProductProps) {
  const { onSuccessfulFetch, upc } = props
  const upcProduct = useSelector(upcProductSelector(upc))
  const shouldMockResponse = useSelector(
    shouldShouldMockScannedResponsesSelector,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [product, setProduct] = useState<UpcProduct | null>(null)
  const dispatch = useDispatch()

  const fetchUpcData = useCallback(async () => {
    const url = `https://world.openfoodfacts.org/api/v0/product/${upc}`
    try {
      setIsLoading(true)
      setErrorMsg(null)

      if (shouldMockResponse) {
        alert('Fetching data...')
      }

      const response = shouldMockResponse
        ? await handleMockResponse(upc)
        : await fetch(url)

      if (response.ok) {
        const data = (await response.json()) as UpcResponse
        const upcProduct = data.product
        if (!upcProduct.code && !upcProduct.id && !upcProduct.product_name) {
          upcProduct.product_name = 'N/A'
          upcProduct.brands = 'N/A'
        }
        dispatch(addUpcProduct(upcProduct))
        setProduct(upcProduct)
        onSuccessfulFetch && onSuccessfulFetch(upcProduct)
      } else {
        setErrorMsg(
          `Invalid resopnse from service for '${upc}'.  Make sure you have a data connection and try again in a few seconds.`,
        )
        setProduct(null)
      }
    } catch (error) {
      setErrorMsg(`Error fetching data for '${upc}': ${error}.`)
      setProduct(null)
    } finally {
      setIsLoading(false)
    }
  }, [upc])

  useEffect(() => {
    if (upcProduct) {
      setProduct(upcProduct)
      onSuccessfulFetch && onSuccessfulFetch(upcProduct)
    } else if (upc?.match(UPC_REGEX)) {
      fetchUpcData()
    }
  }, [upc, upcProduct])

  return {
    upcProduct: product,
    isLoading,
    errorMsg,
  }
}
