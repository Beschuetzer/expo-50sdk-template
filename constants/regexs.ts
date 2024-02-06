export const UPC_REQUIRED_CHAR_LENGTH = 12;
export const UPC_REGEX = new RegExp(
  `^\\s*\\d{${UPC_REQUIRED_CHAR_LENGTH}}\\s*$`,
  "i",
);
