export function getIsDevelopmentMode() {
  return !!process.env.EXPO_PUBLIC_ENV?.match(/dev/);
}
