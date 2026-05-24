import axios from 'axios';

const api = axios.create({
  //URL base do nosso servidor Java (Spring Boot)
  baseURL: 'http://localhost:8080/api',
});

export default api;