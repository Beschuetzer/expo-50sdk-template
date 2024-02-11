import { Text } from "react-native";

type InputTextProps = {
  children: string | string[];
};

export function InputText(props: InputTextProps) {
  const { children } = props;
  return (
    <Text
      style={{
        fontWeight: "900",
      }}
    >
      {children}
    </Text>
  );
}
