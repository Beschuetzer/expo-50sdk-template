import { setLastUpcScanned } from "@/state/slices/generalSlice";
import { FontAwesome } from "@expo/vector-icons";
import {
  Button,
  Input,
  View,
  Text,
  useTheme,
  Row,
} from "native-base";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
} from "react-native";
import { useDispatch } from "react-redux";

type ManualUpcInputProps = {
  isVisible?: boolean;
};

const DEBOUNCE_TIMEOUT = 500;
const REQUIRED_CHAR_LENGTH = 12;
const UPC_REGEX = new RegExp(`^\\s*\\d{${REQUIRED_CHAR_LENGTH}}\\s*$`, 'i');
const VALUE_INITIAL = "";
const IS_VALID_INITIAL = true;

export function ManualUpcInput(props: ManualUpcInputProps) {
  const { isVisible = true } = props;
  const timeoutRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isValid, setIsValid] = useState(IS_VALID_INITIAL);
  const [value, setValue] = useState<string>(VALUE_INITIAL);
  const theme = useTheme();
    const dispatch = useDispatch();

  const onSearchPress = useCallback((e: GestureResponderEvent) => {
    e.preventDefault();
    dispatch(setLastUpcScanned(value));
  }, [value]);

  const handleSetIsValid = useCallback((value: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsValid(!!UPC_REGEX.test(value));
    }, DEBOUNCE_TIMEOUT);
  }, []);

  const onValueChange = useCallback(
    (text: string) => {
      const newValue = text.trim();
      setValue(newValue);
      handleSetIsValid(newValue);
    },
    [setIsValid, setValue]
  );

  useEffect(() => {
    setValue(VALUE_INITIAL);
    setIsValid(IS_VALID_INITIAL)

    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, [isVisible])

  if (!isVisible) return null;
  return (
    <View>
      <Text p={3} pb={0}>
        Enter the Upc:
      </Text>
      <Input
        ref={inputRef}
        m={3}
        placeholder="UPC Number"
        onChangeText={onValueChange}
        value={value}
        focusOutlineColor={isValid ? "primary.100" : "red.200"}
      />
    <Row display={!isValid ? 'block' : 'none'} justifyContent={"flex-start"} alignItems={"center"} pb={3} px={3}>
        <FontAwesome
        size={10}
        pb={0}
        name="warning"
        color={theme.colors.red[900]}
        />
        <Text pl={3} color={isValid ? "black" : "red.900"}>Must be {REQUIRED_CHAR_LENGTH} numbers (currently {value.length} chars)</Text>
    </Row>
      <Button
        isDisabled={!isValid}
        backgroundColor={"secondary.900"}
        borderRadius={0}
        onPress={onSearchPress}
      >
        Search
      </Button>
    </View>
  );
}
