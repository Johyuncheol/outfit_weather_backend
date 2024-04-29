export const ChangeTempPeriod = (temperature: number) => {
  let temperatureKey = "";

  if (temperature >= 28) temperatureKey = "28";
  else if (temperature >= 23 && temperature <= 27) temperatureKey = "23-27";
  else if (temperature >= 20 && temperature <= 22) temperatureKey = "20-22";
  else if (temperature >= 17 && temperature <= 19) temperatureKey = "17-19";
  else if (temperature >= 12 && temperature <= 16) temperatureKey = "12-16";
  else if (temperature >= 9 && temperature <= 11) temperatureKey = "9-11";
  else if (temperature >= 5 && temperature <= 8) temperatureKey = "5-8";
  else if (temperature <= 4) temperatureKey = "4";

  return temperatureKey;
};
