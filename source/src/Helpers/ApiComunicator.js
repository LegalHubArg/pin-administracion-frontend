import Config from "../config.js";
const axios = require('axios');

export const ApiPinPost = async (ruta, body, token) => {
  let url = Config.endpoint + ruta;
  const params = {
    credentials: "include",
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      "Authorization": `Bearer ${token}`
    }
  };
  let datosUsuario = {};
  if (!body.idUsuario) datosUsuario.idUsuario = JSON.parse(localStorage.getItem("perfiles"))[0].idUsuario;
  const res = await axios.post(
    url, { ...body, ...datosUsuario }, params
  )
  .catch(error => {
    //console.log(error)
    throw (error.response)
  });
  return res;
};

export const ApiPinGet = async (ruta, token) => {
  let url = Config.endpoint + ruta;
  const params = {
    credentials: "include",
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      "Authorization": `Bearer ${token}`
    }
  };
  const res = await axios.get(
    url, params
  ).catch(error => {
    //console.log(error)
    throw (error.response)
  });
  return res;
};