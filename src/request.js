import axios from "axios";

const request = axios.create({
  timeout: 5000,
});
request.baseUrl = `http://dev.fastsupport.cn/`;
request.socketUrl = `http://dev.fastsupport.cn:6001/`;

request.interceptors.request.use(
  async (config) => {
    const baseUrl = request.baseUrl;
    config.baseURL = baseUrl;
    const token = localStorage.getItem("visitor_token");
    if (token) {
      config.headers = {
        Authorization: "Bearer " + token,
      };
    }
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
