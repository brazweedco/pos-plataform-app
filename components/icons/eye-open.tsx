import Svg, { Path } from "react-native-svg";

export function EyeOpen({ size = 20, color = "#000" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 19 16" fill="none">
      <Path
        d="M9.5 1C5 1 1.73 3.61 0 8c1.73 4.39 5 7 9.5 7S17.27 12.39 19 8c-1.73-4.39-5-7-9.5-7Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M9.5 11a3 3 0 100-6 3 3 0 000 6Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}