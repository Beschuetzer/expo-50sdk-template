import { IInputProps, Input } from 'native-base';
import React, { useEffect, useRef } from 'react';

type FocusInputProps = IInputProps & {
  timeoutAmount?: number;
};

/**
 *This input focuses itself after the page has initially rendered
 **/
export default function FocusInput(props: FocusInputProps) {
  const { timeoutAmount = 250 } = props;
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      nameRef.current?.focus();
    }, timeoutAmount);
  }, [nameRef, timeoutAmount]);

  return <Input {...props} ref={nameRef} />;
}
