import { formatMoney } from "./text";

export const getNElements = (positions, number) => {
  if (!positions || !positions.length || !number) return [];
  
  const response = [];
  const step = Math.ceil(positions.length / number + 1);

  for (let i = 0; i < positions.length; i += step) {
    if (positions[i]) response.push(positions[i]);
  }

  if (positions[positions.length - 1]) {
    response.push(positions[positions.length - 1]);
  }

  return response;
}

export const getBenchmarksForElements = (positions, benchmarks) => {
  const gspc = [];
  const dji = [];
  const ixic = [];

  if (!positions || !benchmarks) return { gspc, dji, ixic };

  positions.forEach(pos => {
    if (benchmarks.gspc) gspc.push(benchmarks.gspc.find(b => b.date >= pos.date))
    if (benchmarks.dji) dji.push(benchmarks.dji.find(b => b.date >= pos.date))
    if (benchmarks.ixic) ixic.push(benchmarks.ixic.find(b => b.date >= pos.date))
  })
  return { gspc, dji, ixic };
}

export const getFieldFromElements = (source, field) => {
  const response = [];
  source.forEach(element => response.push(element[field]))
  return response;
}

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