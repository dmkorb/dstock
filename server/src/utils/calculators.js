

export const calculateGainAndPerformance = (equity, invested, withdrawn) => {
  let performance = 0;
  let gains = 0;
  if (invested > 0) {
    gains = (equity + withdrawn - invested);
    performance = Number(((gains / invested) * 100).toFixed(2));
  }
  return { gains, performance };
}