export function authHeader() {
    // return authorization header with jwt token
    let user = JSON.parse(localStorage.getItem('user'));
    
    console.log('USER', user)
    if (user && user.access_token) {
        console.log('access_token', user.access_token)
        return { 'Authorization': 'Bearer ' + user.access_token };
    } else {
        return {};
    }
}

export function getUserId() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        return user._id;
    }
}

export function getUser() {
    let user = JSON.parse(localStorage.getItem('user'));
    return user;
}