import axios from "axios";
import {API_URL} from "@/constants.js";

const instance = axios.create({
  baseURL:  API_URL + "api"
});

export default instance;

