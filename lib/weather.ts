export async function getWeatherData(location: string) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    return {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].main,
      forecast: forecastData.list
        .filter((_: any, index: number) => index % 8 === 0)
        .map((item: any) => ({
          date: new Date(item.dt * 1000).toLocaleDateString(),
          condition: item.weather[0].main,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
        })),
      farmingAdvice: generateFarmingAdvice(data, forecastData),
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
}

function generateFarmingAdvice(current: any, forecast: any): string {
  const advisories = [];
  
  if (forecast.list[0].rain) {
    advisories.push("Rain expected - avoid pesticide spraying");
  }
  if (current.main.humidity > 75) {
    advisories.push("High humidity - monitor for fungal diseases");
  }
  if (current.wind.speed > 15) {
    advisories.push("Strong winds - secure support structures");
  }
  
  return advisories.join(". ") || "Conditions favorable for field work.";
}