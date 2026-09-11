import { ADDRESS_INITIAL, EMPTY_STRING } from '@/constants/general';
import { Address } from '@/types/general';

/**
 *Takes an address string returned from the geocoding api and returns an {@link Address}
 **/
export function parseAddress(addressStr?: string, separator = ',') {
  if (!addressStr) return ADDRESS_INITIAL;
  const split = addressStr
    .split(separator)
    .filter((item) => !item.match(/(county|region|district)/gi))
    .map((item) => item.trim());

  const isAdressLineTwoPresent = split.length > 5;
  const is2ndIndexOnlyNumbers = !!split[1].match(/\d+/i);

  return {
    addressLineOne: split[0],
    addressLineTwo: !isAdressLineTwoPresent
      ? EMPTY_STRING
      : is2ndIndexOnlyNumbers
        ? `${split[1]} ${split[2]}`
        : split[1],
    city: split[split.length - 4],
    country: split[split.length - 1],
    state: split[split.length - 3],
    zipCode: split[split.length - 2],
  } as Address;
}
