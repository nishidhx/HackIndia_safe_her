import { StyleSheet, TextInput } from "react-native";

type FieldInputProps = {
  placeholder: string;
  type?: "default" | "email-address" | "password";
  onChangeText: (newText: string) => void;
  value?: string;
};

export default function FieldInput({
  placeholder,
  type = "default",
  onChangeText ,
  value
}: FieldInputProps) {
  return (
    <TextInput
      style={FieldInputStyles.textInputStyles}
      placeholder={placeholder}
      keyboardType={type === "password" ? "default" : type}
      secureTextEntry={type === "password"}
      autoCapitalize="none"
      onChangeText={onChangeText}
      value={value}
    />
  );
}

const FieldInputStyles = StyleSheet.create({
  textInputStyles: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    borderBottomWidth: 1,
    margin: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    textAlign: "center",
    color: "black",
    borderColor: "rgba(255, 255, 255, 0.57)",
    fontSize: 20,
    fontWeight: "bold",
  },
});