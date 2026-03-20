import { useState } from "react";
import { Text, View } from "react-native";


export default function Register() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

return <View>
    <Text>
        Register Screen
    </Text>

  </View>;
}
