
import { customAlphabet} from 'nanoid';
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890', 20);

export const getIdWithPrefix = prefix => prefix ? `${prefix}_${nanoid()}` : nanoid();