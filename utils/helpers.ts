export { getIsDevelopmentMode } from './environment';

export {
  calculateDistance,
  delay,
  displayAlert,
  getBackendUrl,
  getButtonHitSlop,
  getEmptyArray,
  getEmptyObject,
  getGpsCoordinate,
  getId,
  measureExecutionTime,
  roundNumber,
  wait,
} from './platform';

export {
  camelCaseToSpacedCapitalized,
  ensureMaxLength,
  getAddressString,
  getDurationInMilliseconds,
  getDurationValue,
  getKeyToUse,
  getS3Images,
  getS3ObjectKey,
  getStateFromString,
  joinWithAnd,
  sanitize,
  sanitizeKey,
  trimObjectValues,
} from './strings';

export {
  getCustomImageInfo,
  getFilteredList,
  getIndexOfSmallestField,
  getNewViewingMode,
  getTaskForImport,
  getTaskFromList,
  getTaskValidation,
  getUserCredentials,
  getEmptyTask,
  handleError,
  isAddressValid,
  resetConfirmModalProps,
  setAppData,
} from './tasks';

export {
  captureImage,
  deleteFile,
  deleteImages,
  getDirectory,
  getImagePickerOptions,
  importAppData,
  makeNewDirectory,
  pickImage,
  retrieveImagePathFromAsyncStorage,
  saveAppStateToFile,
  saveImageLocally,
  saveImagePathToAsyncStorage,
  scheduleNotification,
  uriToBlob,
} from './storage';
