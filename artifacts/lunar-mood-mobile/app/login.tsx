import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const enterApp = () => {
    router.replace("/home");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}>
      <Text style={{ color: "#fff", fontSize: 20, marginBottom: 20 }}>
        LunarMood 🌙
      </Text>

      <Button title="Enter" onPress={enterApp} />
    </View>
  );
}
