import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function HomeSvg({ size = 24, color = "#E46C45" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 24" fill="none">
      <Path
        d="M2 10L11 2L20 10V21C20 21.55 19.55 22 19 22H14V16H8V22H3C2.45 22 2 21.55 2 21V10Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
