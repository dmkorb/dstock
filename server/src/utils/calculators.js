

export const calculateGainAndPerformance = (equity, invested, withdrawn) => {
  let performance = 0;
  let gains = 0;
  if (invested > 0) {
    gains = (equity + withdrawn - invested);
    performance = (gains / invested) * 100
  }
  return { gains, performance };
}