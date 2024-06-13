import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaCheck, FaTimes, FaEye, FaArrowRight, FaArrowLeft, FaEdit, FaPaperclip, FaDollarSign } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../Helpers/Navigation";
import moment from "moment";
//API PIN
import './Reportes.css';
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { Button } from "@gcba/obelisco/dist/components/Button";
import { FiDownload } from "react-icons/fi";
var b64toBlob = require('b64-to-blob');

const Reportes = props => {

    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [analistas, setAnalistas] = useState()
    const initForm = {
        usuarioAsignado: null,
        fecha: '',
        alcance: 0
    }
    const [form, setForm] = useState(initForm)
    const [fechaActividadPorDia, setFechaActividadPorDia] = useState('')
    const [fechaNormasPorDia, setFechaNormasPorDia] = useState('')

    const getAnalistas = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/usuarios/sdin', body, token).then((res) => {
                setAnalistas(Array.from(res.data.data))
            }).catch(function (error) {
                throw error
            });
        }
        catch (error) {
        }
    }

    function handleFormChange(e) {

    }

    function handleActividadPorDia(e) {
        e.preventDefault();
    }

    function handleCantidadNormasPorDia(e) {
        e.preventDefault();
    }

    function handleCantidadNormasAnalista(e) {
        e.preventDefault();
    }

    //Hook inicial
    useEffect(() => {
        getAnalistas()
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5" id="pagina-reportes">
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title">Actividad por día</div>
                            <hr />
                            <form className="form row" onSubmit={e => handleActividadPorDia(e)}>
                                <div className="form-group col-3">
                                    <label for="fechaActividadPorDia">Fecha</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaActividadPorDia"
                                        name="fechaActividadPorDia"
                                        aria-describedby="date-help"
                                        onChange={e => setFechaActividadPorDia(e.target.value)} value={fechaActividadPorDia}
                                        required
                                    />
                                </div>
                                <div className="col-8 d-flex align-items-center justify-content-end">
                                    <button className="btn btn-success" type="submit">Descargar &nbsp;<FiDownload /></button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <br />
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title">Cantidad de Normas asignadas por día</div>
                            <hr />
                            <form className="form row" onSubmit={e => handleCantidadNormasPorDia(e)}>
                                <div className="form-group col-3">
                                    <label for="fechaNormasPorDia">Fecha</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaNormasPorDia"
                                        name="fechaNormasPorDia"
                                        aria-describedby="date-help"
                                        onChange={e => setFechaNormasPorDia(e.target.value)} value={fechaNormasPorDia}
                                        required
                                    />
                                </div>
                                <div className="col-8 d-flex align-items-center justify-content-end">
                                    <button className="btn btn-success" type="submit">Descargar &nbsp;<FiDownload /></button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <br />
                    <div className="card">
                        <div className="card-body">
                            <div className="card-title">Cantidad de Normas trabajadas por analista</div>
                            <hr />
                            <form className="form row" onSubmit={e => handleCantidadNormasAnalista(e)}>
                                <div className="form-group col">
                                    <label for="fechaSugerida">Fecha</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaCarga"
                                        name="fechaCarga"
                                        aria-describedby="date-help"
                                        onChange={e => setForm({ ...form, fecha: e.target.value })} value={form.fecha}
                                    />
                                </div>
                                <div className="form-group col">
                                    <label for="usuarioAsignado">Analista</label>
                                    <select className="custom-select" id="usuarioAsignado" name="usuarioAsignado"
                                        onChange={e => setForm({ ...form, usuarioAsignado: e.target.value })} value={(form.usuarioAsignado != null) ? form.usuarioAsignado : -1}
                                    ><option selected value=""></option>
                                        {analistas && analistas.length > 0 ?
                                            analistas.map((elem) => (
                                                <option key={"opt-" + elem.idUsuario} value={elem.idUsuario}>{elem.apellidoNombre}</option>
                                            )) : <option selected hidden>No hay usuarios para mostrar...</option>}
                                    </select>
                                </div>
                                <div className="form-group col">
                                    <label for="alcance">Alcance</label>
                                    <select className="custom-select" id="alcance" name="alcance" onChange={e => setForm({ ...form, alcance: e.target.value })}
                                        value={(form.alcance != null) ? form.alcance : -1}>
                                        <option value={0}>General</option>
                                        <option value={1}>Particular</option>
                                    </select>
                                </div>
                                <div className="col d-flex align-items-center">
                                    <button className="btn btn-success" type="submit">Descargar &nbsp;<FiDownload /></button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );

    }

};



export default Reportes;

