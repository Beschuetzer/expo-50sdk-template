import { Linking, Platform } from 'react-native';

import { EMPTY_STRING } from '@/constants/general';
import { setError, setLoading } from '@/state/slices/generalSlice';
import { AppDispatch } from '@/state/store';

export type OpenMapProps = {
  dispatch: AppDispatch;
  lat: string | number;
  lon: string | number;
  label: string;
};

export async function openMap(props: OpenMapProps) {
  const { lat, lon: lng, label, dispatch } = props;
  const scheme = Platform.select({
    ios: `maps://?q=${label}&ll=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
  });

  if (scheme) {
    try {
      dispatch(setLoading('Opening Map...'));
      await Linking.openURL(scheme);
    } catch (error) {
      dispatch(setError(error as Error));
    } finally {
      dispatch(setLoading(EMPTY_STRING));
    }
  }
}
