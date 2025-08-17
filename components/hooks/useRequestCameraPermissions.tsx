import { useCameraPermissions } from 'expo-camera';

export const useRequestCameraPermissions = () => {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return null;
  if (!permission.granted) {
    // Attempt to request if canAskAgain
    if (permission.canAskAgain) {
      requestPermission();
    }
    return false;
  }
  return true;
};
