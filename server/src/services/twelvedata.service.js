import axios from 'axios';
import config from '../config/config.js';
import logger from '../config/logger.js';
import handleAxiosError from '../utils/handleAxiosError.js';

const API_KEY = config.twelvedataApiKey;

const URLS = {
  getTimeSeries: (symbol, start) => {
    let url = `https://api.twelvedata.com/time_series?order=ASC&symbol=${symbol}&interval=1day&outputsize=5000&apikey=${API_KEY}`;
    if (start) url += `&start_date=${start}`;
    return url;
  }
}
 
const getObjectFromValue = (v, referenceValue) => {
  let variation = Number((((v.close - v.open) / v.open) * 100).toFixed(2))
  let performance = referenceValue > 0 
    ? Number((((v.close - referenceValue) / referenceValue) * 100).toFixed(2))
    : undefined;

  return {
    date: v.datetime, 
    value: v.close,
    variation,
    performance
  }
}

const getBenchmarkIndexes = async (startDate) => {
  const startTime = new Date();

  const [gspcResponse, djiResponse, ixicResponse] = await Promise.all([
    axios.get(URLS.getTimeSeries('GSPC', startDate)).then(r => r.data).catch(handleAxiosError),
    axios.get(URLS.getTimeSeries('DJI', startDate)).then(r => r.data).catch(handleAxiosError),
    axios.get(URLS.getTimeSeries('IXIC', startDate)).then(r => r.data).catch(handleAxiosError)
  ])

  logger.info(`Get benchmarks. Took ${new Date() - startTime}ms`);

  const gspc = gspcResponse?.values?.map(v => getObjectFromValue(v, gspcResponse?.values[0]?.close));
  const dji = djiResponse?.values?.map(v => getObjectFromValue(v, djiResponse?.values[0]?.close));
  const ixic = ixicResponse?.values?.map(v => getObjectFromValue(v, ixicResponse?.values[0]?.close));

  logger.info(`Returning after ${new Date() - startTime}ms`);

  return { gspc, dji, ixic }
}

export {
  getBenchmarkIndexes
}