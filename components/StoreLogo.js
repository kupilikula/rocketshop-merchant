import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export const StoreLogo = (props) => (
  <Image
    source={props.logoImage}
    style={{
      ...styles.logo,
      height: props.size,
      width: props.size,
      borderRadius: props.size / 2,
    }}
  />
);

const styles = StyleSheet.create({
  logo: {
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "black",
    margin: 0,
    padding: 0,
  },
});
