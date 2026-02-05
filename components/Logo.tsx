import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface LogoProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export const Logo = ({
  size = 48,
  color = "rgb(10, 132, 255)",
  strokeWidth = 2,
  style,
}: LogoProps) => {
  const containerPadding = 16;
  const borderRadius = 25;

  return (
    <View style={[{ position: "relative", alignSelf: "center" }, style]}>
      <View
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          right: 5,
          bottom: 5,
          borderRadius: borderRadius,
          backgroundColor: color,
          opacity: 1,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 20,
          elevation: 25,
        }}
      />

      <View
        style={{
          backgroundColor: "#000",
          borderRadius: borderRadius,

          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 10,

          padding: containerPadding,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
};