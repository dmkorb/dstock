import { formatMoney } from "./text";

export const getNPositions = (positions, number, field) => {
  if (!positions || !positions.length || !number) return [];
  
  const response = [];
  const step = Math.ceil(positions.length / number + 1);

  for (let i = 0; i < positions.length; i += step) {
    if (positions[i]) response.push(positions[i][field]);
  }

  if (positions[positions.length - 1]) {
    response.push(positions[positions.length - 1][field]);
  }

  return response;
}

export const getNPositionsCurrency = (positions, number, field) => {
  const raw = this.getNPositions(positions, number, field);
  const data = raw.map(d => formatMoney(d))
  return data;
}