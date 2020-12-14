import { load, save, remove } from './storage';
import { pushError } from './pnotify';
import decideTologin from './main';

class FetchMe {
  constructor() {
    this.URL = 'https://callboard-backend.herokuapp.com';
    this._token = {
      accessToken: '',
      refreshToken: '',
      sid: '',
    };
    this.count = 0;
    this.points = {
      reg: '/auth/register/',
      login: '/auth/login/',
      logout: '/auth/logout/',
      refresh: '/auth/refresh/',
      google: '/auth/google/',
      user: '/user/',
      call: '/call/',
      fav: '/call/favourite/',
      myFav: '/call/favourites/',
      myCalls: '/call/own/',
      find: '/call/find?search=',
      cat: '/call/categories',
      catCalls: '/call/specific/',
    };
  }
  get headers() {
    return {
      'Content-Type': 'application/json',
      authorization: load('Token') ? `Bearer ${load('Token').accessToken}` : '',
    };
  }
  get token() {
    return this._token;
  }
  set token(token) {
    let i = 0;
    for (let key in token) {
      this._token[Object.keys(this._token)[i]] = token[key];
      i += 1;
    }
  }
  async logout() {
    const response = await this.getRequest({ point: false });
    if (response.ok) {
      remove('Token');
      remove('User');
      this.token = {
        accessToken: '',
        refreshToken: '',
        sid: '',
      };
      decideTologin();
      return await response;
    }
    pushError(response.message);
  }
  async login(opt) {
    return await this.getRequest(opt).then(data => {
      this.token = data;
      save('Token', data);
      save('User', data.user);
      decideTologin();
      return data;
    });
  }
  async getRequest({
    point,
    method = 'GET',
    body = null,
    query = '',
    contentType = false,
  }) {
    const opt = {
      method,
      headers: this.headers,
    };
    if (contentType) {
      opt.redirect = 'follow';
      opt.headers = {
        accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        authorization: load('Token')
          ? `Bearer ${load('Token').accessToken}`
          : '',
      };
    }
    if (body) opt.body = JSON.stringify(body);
    const params = point ? opt : false;
    const url = this.URL + point + query;
    return await this.sendRequest(url, params);
  }
  async sendRequest(url, params) {
    try {
      if (!params) {
        const response = await fetch(this.URL + this.points.logout, {
          method: 'POST',
          headers: { accept: '*/*', authorization: this.headers.authorization },
        });
        return response;
      }
      const response = await fetch(url, params);
      if (response.status === 401) {
        const newResponse = await this.refresh(url, params);
        return await newResponse.json();
      } else if (!response.ok) {
        await response.json().then(data => pushError(data.message));
        return;
      }
      this.count = 0;
      return await response.json();
    } catch (err) {
      console.log('mistake in request', err.message);
    }
  }

  // async refresh(url, opt) {
  //   const body = { sid: load('Token').sid };
  //   const option = {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       accept: 'application/json',
  //       authorization: `Bearer ${load('Token').refreshToken}`,
  //     },
  //     body: JSON.stringify(body),
  //   };
  //   try {
  //     const response = await fetch(this.URL + this.points.refresh, option);
  //     response.json().then(data => {
  //       this.token = data;
  //       console.log('refresh', this.token);
  //       save('Token', this.token);
  //       decideTologin();
  //     });
  //     if (this.count < 5) {
  //       this.count += 1;
  //       return await this.sendRequest(url, opt);
  //     }
  //   } catch (err) {
  //     console.log('mistake in refresh', err.message);
  //   }
  // }
}

const fetchFunctions = new FetchMe();
export default fetchFunctions;
