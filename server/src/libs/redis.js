import Redis from 'ioredis';
import config from '../config/config.js'

const redis = new Redis(config.redis.url);

const getKey = async (key) => {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

const setKey = async (key, value, expireMinutes) => {
  if (expireMinutes) return redis.set(key, JSON.stringify(value), 'EX', expireMinutes * 60);
  return redis.set(key, JSON.stringify(value));
}

const incKey = async (key) => {
  return redis.incr(key);
}

export {
  redis as connection,
  getKey,
  setKey,
  incKey
}