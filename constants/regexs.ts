export const AMAZON_S3_REGEX = /^.*grocify.*amazonaws/i;
export const LOCAL_FILE_REGEX = /^\s*file:\/\//i;
export const POSTAL_CODE_REGEX = /^\s*\d{5}(?:[-\s]\d{4})?\s*$/;
export const UPC_REQUIRED_CHAR_LENGTH = 12;
export const UPC_REGEX = new RegExp(
  `^\\s*\\d{${UPC_REQUIRED_CHAR_LENGTH},${UPC_REQUIRED_CHAR_LENGTH + 1}}\\s*$`,
  'i',
);
