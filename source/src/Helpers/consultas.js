import { ApiPinGet, ApiPinPost } from './ApiComunicator';

const getSecciones = async () => {
    let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
    }
    let token = localStorage.getItem("token");
    const res = await ApiPinGet('/api/v1/boletin-oficial/sumario/secciones', body, token)
        .catch(function (error) {
            throw error
        });
    return res.data.data
}

const getEstados = async () => {
    let body = {
        usuario: localStorage.getItem("user_cuit"),
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
    }
    let token = localStorage.getItem("token");
    const res = await ApiPinPost('/api/v1/boletin-oficial/normas/estados', body, token)
        .catch(function (error) {
            throw error;
        });

    return Array.from(res.data.estados)
}

const getNormaTipos = async () => {
    let token = localStorage.getItem("token");
    let body = {
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit")
    };
    const res = await ApiPinPost('/api/v1/boletin-oficial/normas/tipos', body, token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.data)
}

const getNormaSubtipos = async () => {
    let token = localStorage.getItem("token");
    let body = {
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit")
    };
    const res = await ApiPinPost('/api/v1/boletin-oficial/normas/subtipos', body, token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.data)
}

const getOrganismos = async () => {
    let token = localStorage.getItem("token");
    const res = await ApiPinGet('/api/v1/organismos/reparticiones', token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.data)
}

const getFeriados = async (fechaAnio) => {
    let token = localStorage.getItem("token");
    const res = await ApiPinPost('/api/v1/boletin-oficial/feriados', { fechaAnio: fechaAnio }, token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.data)
}

const getPatologiasNormativas = async () => {
    let token = localStorage.getItem("token");
    const res = await ApiPinGet('/api/v1/dj/patologias-normativas', token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.response)
}

const getCausales = async () => {
    let token = localStorage.getItem("token");
    const res = await ApiPinGet('/api/v1/dj/causales', token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.data)
}

const getTiposAbrogacion = async () => {
    let token = localStorage.getItem("token");
    const res = await ApiPinGet('/api/v1/dj/tipos-abrogacion', token)
        .catch(function (error) {
            throw error
        });
    return Array.from(res.data.data)
}

export {
    getSecciones, getEstados, getNormaTipos, getNormaSubtipos, getOrganismos, getFeriados,
    getPatologiasNormativas, getCausales, getTiposAbrogacion
};