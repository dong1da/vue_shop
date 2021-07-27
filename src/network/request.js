// import axios from "axios";

// export function request(config) {
//   // 1.创建axios实例
//   const instance = axios.create({
//     baseURL: "http://127.0.0.1:8888/api/private/v1/",
//     timeout: 5000
//   })

//   // 1.请求拦截
//   instance.interceptors.request.use(config => {
//     return config
//   }, err => {
//     // console.log(err);
//   })
//   // 2.响应拦截
//   instance.interceptors.response.use(config => {
//     return res
//   }, err => {
//     // console.log(err);
//   })

//   // 3.发送真正的网络请求
//   return instance(config)
// }