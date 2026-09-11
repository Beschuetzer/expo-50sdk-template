import { Input, InputField } from '@gluestack-ui/themed';
import React, { ComponentProps, useEffect, useRef } from 'react';

type FocusInputProps = ComponentProps<typeof InputField> & {
  isInvalid?: boolean;
  flex?: number;
  timeoutAmount?: number;
};

/**
 *This input focuses itself shortly after the page has initially rendered.
 **/
export default function FocusInput(props: FocusInputProps) {
  const { flex, isInvalid, timeoutAmount = 250, ...inputFieldProps } = props;
  const nameRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      nameRef.current?.focus();
    }, timeoutAmount);
  }, [timeoutAmount]);

  return (
    <Input variant="outline" flex={flex} isInvalid={isInvalid}>
      <InputField {...inputFieldProps} ref={nameRef} />
    </Input>
  );
}
