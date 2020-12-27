import axios from 'axios';
import { handleAxiosError } from '../helpers';
import {authService} from './auth.service';
import jwtDecode from 'jwt-decode';

const axiosIntance = axios.create();

// Request interceptor for API calls
axiosIntance.interceptors.request.use(
  async config => {
    
    const user = JSON.parse(localStorage.getItem('user'));
    let token = user.access_token
    let decodedToken = jwtDecode(token);
    let currentDate = new Date();

    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      const tokens = await authService.refreshToken().catch(() => authService.logout());
      token = tokens.access_token;
    }

    config.headers = { 
      'Authorization': token ? `Bearer ${token}` : undefined,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
    
    return config;
  },
  error => {
    Promise.reject(error)
});

const getFunc = (url) => axiosIntance.get(url).then(r => r.data).catch(handleAxiosError);
const postFunc = (url, data) => axiosIntance.post(url, data).then(r => r.data).catch(handleAxiosError);
const putFunc = (url, data) => axiosIntance.put(url, data).then(r => r.data).catch(handleAxiosError);
const deleteFunc = (url) => axiosIntance.delete(url).then(r => r.data).catch(handleAxiosError);

export default {
  get: getFunc,
  post: postFunc,
  put: putFunc,
  delete: deleteFunc
}