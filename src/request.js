import axios from "axios";

const request = axios.create({
  timeout: 5000,
  baseURL: API_URL,
  proxy: {
    host: '127.0.0.1',
    port: 8888,
    protocol: 'http',
  },
});

request.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("visitor_token");
    if (token) {
      config.headers = {
        Authorization: "Bearer " + token,
      };
    }
    Promise.resolve(config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const data = response.data || {};
    if (data.Status !== 200) {
    }
    Promise.resolve(data);
    return data;
  },
  (err) => {
    const data = err.response.data || {};
    if (data.status === 401 || data.code === 1003) {
      localStorage.removeItem("visitor_token");
    }
    return Promise.reject(err);
  }
);

export default request;
