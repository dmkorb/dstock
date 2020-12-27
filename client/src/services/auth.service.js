import axios from 'axios';
import { handleAxiosError } from '../helpers';
import jwtDecode from 'jwt-decode';

const URLS = {
    LOGIN: `/v1/auth/login`,
    LOGOUT: `/v1/auth/logout`,
    REGISTER: `/v1/auth/register`,
    REFRESH_TOKENS: `/v1/auth/refresh-tokens`,
}

const isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return false;
    let decodedToken = jwtDecode(user.refresh_token);
    
    let currentDate = new Date();
  
    // JWT exp is in seconds
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      console.log("Token expired.");
      return false
    } 

    return true;
}

const login = async (email, password) => {
    const user = await axios.post(URLS.LOGIN, { email, password }).then(r => r.data).catch(handleAxiosError)
    localStorage.setItem('user', JSON.stringify(user));
    return user
}

const register = async (userData) => {
    const user = await axios.post(URLS.REGISTER, userData)
        .then(r => r.data)
        .catch(handleAxiosError)
    localStorage.setItem('user', JSON.stringify(user));
    return user
}

const logout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    localStorage.removeItem('user');
    window.location.href = '/';
    await axios.post(URLS.LOGOUT, { refresh_token: user.refresh_token }).catch(() => {})
}

const refreshToken = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    const tokens = await axios
        .post(URLS.REFRESH_TOKENS, { refresh_token: user.refresh_token })
        .then(r => r.data)
        .catch(handleAxiosError)

    localStorage.setItem('user', JSON.stringify({ ...user, ...tokens }));
    return tokens;
}

export const authService = {
    login,
    logout,
    register,
    isLoggedIn,
    refreshToken
};