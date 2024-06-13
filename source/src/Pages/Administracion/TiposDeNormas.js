import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { Pagination } from '@gcba/obelisco'

const TiposDeNormas = props => {
    const [tiposDeNormas, setTiposDeNormas] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
    const [totalP, setTotalP] = useState(null)

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getTiposDeNormas()
        }
    }, [paginacion])

    //   useEffect(() => {
    //     // console.log(solicitudesPropias)
    //     if (solicitudesPropias.totalNormas) {
    //       let auxPaginacion = paginacionPropias;
    //       auxPaginacion.totalPaginas = Math.ceil(solicitudesPropias.totalNormas / auxPaginacion.limite);
    //       auxPaginacion.botones = [];
    //       for (let i = 1; i <= paginacionPropias.totalPaginas; i++) {
    //         auxPaginacion.botones.push(i)
    //       }
    //       setPaginacionPropias({ ...auxPaginacion });
    //     }
    //   }, [solicitudesPropias])

    const [form, setForm] = useState({
        normaTipo: "",
        normaTipoSigla: "",
        BO: false,
        SDIN: false,
        DJ: false
    })

    const [formEdicion, setFormEdicion] = useState({
        idNormaTipo: null,
        normaTipo: "",
        normaTipoSigla: "",
        BO: false,
        SDIN: false,
        DJ: false
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'normaTipo':
                setForm({ ...form, normaTipo: value })
                break;
            case 'normaTipoSigla':
                setForm({ ...form, normaTipoSigla: value })
                break;
            case 'bo':
                value = e.target.checked;
                setForm({
                    ...form,
                    ['BO']: value
                })
                break;
            case 'sdin':
                value = e.target.checked;
                setForm({
                    ...form,
                    ['SDIN']: value
                })
                break;
            case 'dj':
                value = e.target.checked;
                setForm({
                    ...form,
                    ['DJ']: value
                })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'normaTipo-edicion':
                setFormEdicion({ ...formEdicion, normaTipo: value })
                break;
            case 'normaTipoSigla-edicion':
                setFormEdicion({ ...formEdicion, normaTipoSigla: value })
                break;
            case 'bo-e':
                value = e.target.checked;
                setFormEdicion({
                    ...formEdicion,
                    ['BO']: value
                })
                break;
            case 'sdin-e':
                value = e.target.checked;
                setFormEdicion({
                    ...formEdicion,
                    ['SDIN']: value
                })
                break;
            case 'dj-e':
                value = e.target.checked;
                setFormEdicion({
                    ...formEdicion,
                    ['DJ']: value
                })
                break;

        }
    }

    const getTiposDeNormas = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            ...paginacion
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/tipos/todos', body, localStorage.getItem("token"))
            .then(res => {
                setTiposDeNormas(res.data.data)
                setTotalP(res.data.totalTipos)
                setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
            })
            .catch()
    }

    const handlePaginacion = (page) => {
        setPaginacion((prevPaginacion) => ({
            ...prevPaginacion,
            paginaActual: page + 1,
            cambiarPagina: true
        }));
    };

    console.log(tiposDeNormas)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            sigla: form.normaTipoSigla,
            descripcion: form.normaTipo,
            bo: form.BO,
            sdin: form.SDIN,
            dj: form.DJ
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/tipos/crear', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    normaTipo: "",
                    normaTipoSigla: "",
                    BO: false,
                    SDIN: false,
                    DJ: false
                })
                getTiposDeNormas()
            })
            .catch()
        setLoading(false)
    }

    async function borrarTipo(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idNormaTipo: id
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/tipos/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getTiposDeNormas();
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idNormaTipo: id,
            sigla: formEdicion.normaTipoSigla,
            descripcion: formEdicion.normaTipo,
            bo: formEdicion.BO,
            sdin: formEdicion.SDIN,
            dj: formEdicion.DJ
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/tipos/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getTiposDeNormas();
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    }

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idNormaTipo: elem.idNormaTipo,
            normaTipo: elem.normaTipo,
            normaTipoSigla: elem.normaTipoSigla,
            BO: elem.BO,
            SDIN: elem.SDIN,
            DJ: elem.DJ
        })
        if (habilitarEdicion) {
            setFormEdicion({ idNormaTipo: null, normaTipo: "", normaTipoSigla: "", BO: false, SDIN: false, DJ: false })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }



    useEffect(async () => {
        try {
            setLoading(true)
            await getTiposDeNormas()
            setLoading(false)
        }
        catch (err) { }
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5">
                <div id="accordion">
                    <div class="accordion-wrapper">
                        <div class="accordion">
                            <div class="card">
                                <button
                                    type="button"
                                    class="card-header collapsed card-link"
                                    data-toggle="collapse"
                                    data-target="#collapseOne"
                                >
                                    Nuevo Tipo de Norma
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="normaTipo">Tipo de Norma</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="normaTipo"
                                                    name="normaTipo"
                                                    value={form.normaTipo}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="normaTipoSigla">Sigla</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="normaTipoSigla"
                                                    name="normaTipoSigla"
                                                    value={form.normaTipoSigla}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <div class="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        class="custom-control-input"
                                                        name="bo" id="bo"
                                                        checked={form.BO}
                                                        onChange={e => handleForm(e)} />
                                                    <label for="bo"
                                                        class="custom-control-label">Check BO</label>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div class="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        class="custom-control-input"
                                                        name="sdin" id="sdin"
                                                        checked={form.SDIN}
                                                        onChange={e => handleForm(e)} />
                                                    <label for="sdin"
                                                        class="custom-control-label">Check SDIN</label>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div class="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        class="custom-control-input"
                                                        name="dj" id="dj"
                                                        checked={form.DJ}
                                                        onChange={e => handleForm(e)} />
                                                    <label for="dj"
                                                        class="custom-control-label">Check DJ</label>
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {tiposDeNormas && tiposDeNormas.length > 0 &&
                    <>
                        <span>Se encontraron {totalP} resultados</span>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Tipo de Norma</th>
                                    <th>Sigla</th>
                                    <th></th>
                                    {habilitarEdicion && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {tiposDeNormas.sort((a, b) => b.idNormaTipo - a.idNormaTipo).map((elem) => (<tr>
                                    {habilitarEdicion && formEdicion.idNormaTipo === elem.idNormaTipo ? <>
                                        <td><input type="text" className="form-control" name="normaTipo-edicion" id="normaTipo-edicion"
                                            value={formEdicion.normaTipo} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control" name="normaTipoSigla-edicion" id="normaTipoSigla-edicion"
                                            value={formEdicion.normaTipoSigla} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td class="custom-control custom-checkbox"><input type="checkbox" className="custom-control-input" name="bo-e" id="bo-e"
                                            checked={formEdicion.BO} onChange={(e) => handleFormEdicion(e)} />
                                            <label for="bo-e"
                                                class="custom-control-label">Check BO</label>
                                        </td>
                                        <td class="custom-control custom-checkbox"> <input type="checkbox" className="custom-control-input" name="sdin-e" id="sdin-e"
                                            checked={formEdicion.SDIN} onChange={(e) => handleFormEdicion(e)} />
                                            <label for="sdin-e"
                                                class="custom-control-label">Check SDIN</label>
                                        </td>
                                        <td class="custom-control custom-checkbox"><input className="custom-control-input"
                                            type="checkbox" name="dj-e" id="dj-e"
                                            checked={formEdicion.DJ} onChange={(e) => handleFormEdicion(e)} />
                                            <label for="dj-e"
                                                class="custom-control-label">Check DJ</label>
                                        </td>
                                    </>
                                        : <>
                                            <td>{elem.normaTipo}</td>
                                            <td>{elem.normaTipoSigla}</td>
                                        </>}
                                    {habilitarEdicion && formEdicion.idNormaTipo === elem.idNormaTipo &&
                                        <td>
                                            <button type="button" className="btn btn-primary btn-sm mr-2"
                                                onClick={(e) => guardarEdicion(e, elem.idNormaTipo)}>
                                                <FaCheck />
                                            </button>
                                        </td>}
                                    {habilitarEdicion && !(formEdicion.idNormaTipo === elem.idNormaTipo) &&
                                        <td></td>}
                                    <td>
                                        <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                            <FaEdit />
                                        </button>
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idNormaTipo); setShowModal(true) }}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination pages={paginacion.totalPaginas}
                            onPageSelected={page => handlePaginacion(page)} />
                    </>
                }
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar esta norma?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarTipo(e, tipoBorrar)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default TiposDeNormas;