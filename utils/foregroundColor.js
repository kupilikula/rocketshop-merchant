import colorContrast from "color-contrast";
export const foregroundColor = (backgroundColor) => {
  const colorContrastBlackForeground = colorContrast(
    "#000000",
    backgroundColor,
  );
  const colorContrastWhiteForeground = colorContrast(
    "#ffffff",
    backgroundColor,
  );

  let textColor;
  let oppositeColor;
  if (colorContrastBlackForeground > colorContrastWhiteForeground) {
    textColor = "#000000";
    oppositeColor = "#ffffff";
  } else {
    textColor = "#ffffff";
    oppositeColor = "#000000";
  }
  console.log("line16:", textColor);
  return { textColor: textColor, oppositeColor: oppositeColor };
};
