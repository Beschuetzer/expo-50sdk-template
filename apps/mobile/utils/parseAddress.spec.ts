import { parseAddress } from './parseAddress';

import { ADDRESS_INITIAL, EMPTY_STRING } from '@/constants/general';
import { Address } from '@/types/general';

describe('parseAddress', () => {
  test('falsy works', () => {
    const actual = parseAddress(EMPTY_STRING);
    expect(actual).toStrictEqual(ADDRESS_INITIAL);
  });
  test('6 sections works', () => {
    const actual = parseAddress(
      'Target, Mission Viejo, Orange County, California, 92630, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: EMPTY_STRING,
      city: 'Mission Viejo',
      country: 'United States',
      state: 'California',
      zipCode: '92630',
    } as Address);
  });
  test('7 sections works', () => {
    const actual = parseAddress(
      'Target, 5760, East 7th Street, Long Beach, California, 90803, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: '5760 East 7th Street',
      city: 'Long Beach',
      country: 'United States',
      state: 'California',
      zipCode: '90803',
    } as Address);
  });
  test('8 sections works - 1', () => {
    const actual = parseAddress(
      'Target, 1701, North Gaffey Street, Los Angeles, Los Angeles County, California, 90731, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: '1701 North Gaffey Street',
      city: 'Los Angeles',
      country: 'United States',
      state: 'California',
      zipCode: '90731',
    } as Address);
  });
  test('8 sections works - 2', () => {
    const actual = parseAddress(
      'Target, Nordhoff Way, Northridge West Neighborhood Council District, Los Angeles City Council District 12, Los Angeles, California, 91324, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: 'Nordhoff Way',
      city: 'Los Angeles',
      country: 'United States',
      state: 'California',
      zipCode: '91324',
    } as Address);
  });
  test('9 sections works - 1', () => {
    const actual = parseAddress(
      'Target, Alley 79719, Granada Hills, Granada Hills South Neighborhood Council District, Los Angeles City Council District 12, Los Angeles, California, 91344, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: 'Alley 79719 Granada Hills',
      city: 'Los Angeles',
      country: 'United States',
      state: 'California',
      zipCode: '91344',
    } as Address);
  });
  test('9 sections works - 2', () => {
    const actual = parseAddress(
      'Target, Sepulveda Boulevard, Mission Hills, Mission Hills Neighborhood Council District, Los Angeles City Council District 7, Los Angeles, California, 91345, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: 'Sepulveda Boulevard',
      city: 'Los Angeles',
      country: 'United States',
      state: 'California',
      zipCode: '91345',
    } as Address);
  });
  test('1 sections works', () => {
    const actual = parseAddress(
      'Target, 95, Holger Way, @First, North San Jose, San Jose, Santa Clara County, California, 95134, United States',
    );
    expect(actual).toStrictEqual({
      addressLineOne: 'Target',
      addressLineTwo: '95 Holger Way',
      city: 'San Jose',
      country: 'United States',
      state: 'California',
      zipCode: '95134',
    } as Address);
  });
});
