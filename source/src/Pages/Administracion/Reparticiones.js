import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import { getOrganismos, getSecciones, getNormaTipos, getNormaSubtipos } from '../../Helpers/consultas'
import { Pagination } from '@gcba/obelisco'

const Reparticiones = props => {
    const [reparticion, setReparticion] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [loadingPermisos, setLoadingPermisos] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [tipoBorrar, setTipoBorrar] = useState(null)
    const [modalPermisos, setModalPermisos] = useState({ show: false, idReparticion: null })
    const [modalBorrarPermiso, setModalBorrarPermiso] = useState({ show: false, permiso: null })
    const [tiposNorma, setTiposNorma] = useState(null)
    const [secciones, setSecciones] = useState(null)
    const [subtiposNorma, setSubtiposNorma] = useState(null)
    const [jerarquia, setJerarquia] = useState(null)
    const [sumario, setSumario] = useState(null)
    const [permisoBorrar, setPermisoBorrar] = useState(null)
    const [permisosRepa, setPermisosRepa] = useState(null)
    const [errorCarga, setErrorCarga] = useState()
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
            await getReparticion()
        }
    }, [paginacion])

    const initFormPermisoCarga = {
        idSeccion: null,
        idNormaTipo: null,
        idNormaSubtipo: null,
        idReparticion: null,
        idReparticionOrganismo: null,
    }
    const [formPermisoCarga, setFormPermisoCarga] = useState(initFormPermisoCarga)
    const [validaFormPermisoCarga, setValidaFormPermisoCarga] = useState(false)
    const [form, setForm] = useState({
        idReparticion: null,
        reparticion: "",
        siglaReparticion: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idReparticion: null,
        reparticion: "",
        siglaReparticion: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'reparticion':
                setForm({ ...form, reparticion: value })
                break;
            case 'siglaReparticion':
                setForm({ ...form, siglaReparticion: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'reparticion':
                setFormEdicion({ ...formEdicion, reparticion: value })
                break;
            case 'siglaReparticion':
                setFormEdicion({ ...formEdicion, siglaReparticion: value })
                break;
        }
    }

    const handleFormPermisoCarga = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'idSeccion':
                setFormPermisoCarga({ ...formPermisoCarga, idSeccion: parseInt(value) })
                break;
            case 'idReparticion':
                setFormPermisoCarga({ ...formPermisoCarga, idReparticion: parseInt(value) })
                break;
            case 'idReparticionOrganismo':
                setFormPermisoCarga({ ...formPermisoCarga, idReparticionOrganismo: parseInt(value) })
                break;
            case 'idNormaTipo':
                setFormPermisoCarga({ ...formPermisoCarga, idNormaTipo: parseInt(value) })
                break;
            case 'idNormaSubtipo':
                setFormPermisoCarga({ ...formPermisoCarga, idNormaSubtipo: parseInt(value) })
                break;
        }
    }

    const getReparticion = async () => {
        /* let body = {
            usuario: localStorage.getItem("user_cuit"),
            ...paginacion
        } */
        let limite = paginacion?.limite
        let paginaActual = paginacion?.paginaActual
        console.log("GET REPARTICION CON PARAMS POR QUERY")
        await ApiPinGet(`/api/v1/organismos/reparticiones?limite=${limite}&paginaActual=${paginaActual}`, localStorage.getItem("token"))
            .then((res) => {
                console.log("RESPUESTA DE REPARTICIONES",res.data)
                setReparticion(res.data.data)
                setTotalP(res.data.totalReparticiones)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrorCarga()
            setLoading(true);
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: localStorage.getItem('idUsuarioBO'),
                siglaReparticion: form.siglaReparticion,
                reparticion: form.reparticion
            }
            await ApiPinPost('/api/v1/organismos/reparticiones/reparticion/crear', body, localStorage.getItem("token"))
                .then(_ => {
                    setForm({
                        reparticion: "",
                        siglaReparticion: ""
                    })
                    getReparticion()
                })
            setLoading(false)
        }
        catch (e) {
            setErrorCarga(e?.data?.mensaje ? e.data.mensaje : "Ocurrió un error al crear la repartición. Verifique los datos ingresados o inténtelo de nuevo.")
            setLoading(false)
            document.getElementById("boton-formulario-repa").click()
        }
    }

    const handleSubmitPermiso = async (e) => {
        e.preventDefault();
        setLoadingPermisos(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
                idOrgJerarquia: jerarquia.find(elem => elem.idReparticion === formPermisoCarga.idReparticion &&
                    elem.idReparticionOrganismo === formPermisoCarga.idReparticionOrganismo)?.idOrgJerarquia,
                permisosCargaReparticion: { ...sumario[formPermisoCarga.indiceSumario] }
            }
            await ApiPinPost('/api/v1/usuarios/permisos/reparticion/crear', body, localStorage.getItem("token"))
                .then(_ => {
                    setFormPermisoCarga(initFormPermisoCarga)
                    getPermisosRepa(modalPermisos.idOrgJerarquia)
                })
                .catch(e => { throw e })
            setLoadingPermisos(false)
        }
        catch (e) {
            setLoadingPermisos(false)
        }
    }

    async function borrarReparticion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: localStorage.getItem('idUsuarioBO'),
            idReparticion: id
        }
        await ApiPinPost('/api/v1/organismos/reparticiones/reparticion/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getReparticion();
            })
            .catch()

        setLoading(false)
    }

    /* async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idReparticion: id,
            siglaReparticion: formEdicion.siglaReparticion,
            reparticion: formEdicion.reparticion
        }
        await ApiPinPost('/api/v1/boletin-oficial/normas/tipos/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getReparticion();
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    } */

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idReparticion: elem.idReparticion,
            reparticion: elem.reparticion,
            siglaReparticion: elem.siglaReparticion
        })
        if (habilitarEdicion) {
            setFormEdicion({ idReparticion: null, reparticion: "", siglaReparticion: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    const getJerarquia = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario)
            }
            let data;
            await ApiPinPost('/api/v1/organismos/jerarquia', body, localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.data
                })
            setJerarquia(data)
        }
        catch (e) { }
    }

    const getSumario = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario)
            }
            let data;
            await ApiPinGet('/api/v1/boletin-oficial/sumario', body, localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.data
                })
            setSumario(data)
        }
        catch (e) { }
    }

    async function getPermisosRepa(idReparticion) {
        setLoadingPermisos(true)
        if (!idReparticion) return;
        let jerarquiaRepa = jerarquia.filter(n => n.idReparticion === idReparticion);
        let permisos = [];
        for (const item of jerarquiaRepa) {
            try {
                let body = {
                    usuario: localStorage.getItem('user_cuit'),
                    idOrgJerarquia: item.idOrgJerarquia
                }
                const { data: { data } } = await ApiPinPost('/api/v1/usuarios/permisos/reparticion', body, localStorage.getItem("token"));
                permisos = [...permisos, ...data]
            }
            catch (e) { }
        }
        setPermisosRepa(permisos);
        setLoadingPermisos(false);
    }

    async function borrarPermiso(e) {
        e.preventDefault();
        setModalBorrarPermiso({ show: false, permiso: null });
        setLoadingPermisos(true)
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
                idOrgJerarquia: jerarquia.find(elem => elem.idReparticion === modalBorrarPermiso.permiso.idReparticion &&
                    elem.idReparticionOrganismo === modalBorrarPermiso.permiso.idReparticionOrganismo).idOrgJerarquia,
                itemBorrar: modalBorrarPermiso.permiso
            }
            await ApiPinPost('/api/v1/usuarios/permisos/reparticion/borrar', body, localStorage.getItem("token"))
                .then(_ => {
                    getPermisosRepa(modalPermisos.idReparticion);
                })
                .catch()

        }
        catch (e) { setLoadingPermisos(false) }
    }

    useEffect(() => {
        //Valido el form
        if (formPermisoCarga instanceof Object && sumario) {
            //Para que el form sea válido tiene que corresponderse con un item del sumario
            let itemDelSumario = sumario.find(n => n.idSeccion === formPermisoCarga?.idSeccion &&
                n.idNormaTipo === formPermisoCarga?.idNormaTipo && n.idNormaSubtipo === formPermisoCarga?.idNormaSubtipo &&
                n.idReparticionOrganismo === formPermisoCarga?.idReparticionOrganismo &&
                n.idReparticion === formPermisoCarga?.idReparticion);
            if (itemDelSumario) {
                //Guardo el índice del ítem del sumario como una propiedad más del objeto del form
                let auxForm = formPermisoCarga;
                auxForm.indiceSumario = sumario.indexOf(itemDelSumario);
                setFormPermisoCarga(auxForm)
                setValidaFormPermisoCarga(true)
            }
            else setValidaFormPermisoCarga(false)
        }
    }, [formPermisoCarga])

    useEffect(() => {
        if (modalPermisos.show && modalPermisos.idReparticion && jerarquia?.length > 0) {
            setFormPermisoCarga(initFormPermisoCarga)
            getPermisosRepa(modalPermisos.idReparticion)
        }
    }, [modalPermisos])

    useEffect(async () => {
        setLoading(true)
        await getReparticion().catch()
        await getSumario();
        await getJerarquia();
        const secciones = await getSecciones().catch();
        setSecciones(secciones)
        const tipos = await getNormaTipos().catch();
        setTiposNorma(tipos)
        const subtipos = await getNormaSubtipos().catch();
        setSubtiposNorma(subtipos)
        setLoading(false)
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
                                    id="boton-formulario-repa"
                                >
                                    Nueva Repartición
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="reparticion">Repartición</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="reparticion"
                                                    name="reparticion"
                                                    value={form.reparticion}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="siglaReparticion">Sigla</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="siglaReparticion"
                                                    name="siglaReparticion"
                                                    value={form.siglaReparticion}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                                        </form>
                                        {errorCarga && <div className="alert alert-danger">{errorCarga}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {reparticion && reparticion.length > 0 &&
                    <>
                    <span>Se encontraron {totalP} resultados</span>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Repartición</th>
                                    <th>Sigla</th>
                                    <th></th>
                                    {habilitarEdicion && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {reparticion.map((elem) => (<tr>
                                    {habilitarEdicion && formEdicion.idReparticion === elem.idReparticion ? <>
                                        <td><input type="text" className="form-control" name="reparticion" id="reparticion"
                                            value={formEdicion.reparticion} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control" name="siglaReparticion" id="siglaReparticion"
                                            value={formEdicion.siglaReparticion} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                    </>
                                        : <>
                                            <td>{elem.reparticion}</td>
                                            <td>{elem.siglaReparticion}</td>
                                        </>}
                                    {habilitarEdicion && formEdicion.idReparticion === elem.idReparticion &&
                                        <td>
                                            {/* <button type="button" className="btn btn-primary btn-sm mr-2"
                                            onClick={(e) => guardarEdicion(e, elem.idReparticion)}>
                                            <FaCheck />
                                        </button> */}
                                        </td>}
                                    {habilitarEdicion && !(formEdicion.idReparticion === elem.idReparticion) &&
                                        <td></td>}
                                    <td style={{ maxWidth: "fit-content" }}>
                                        {/* <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                        <FaEdit />
                                    </button> */}
                                        {/* {JSON.parse(localStorage.getItem('perfiles'))[0].idPerfil === 5 &&
                                        <button type="button" className="btn btn-primary btn-sm mr-2" title="Administrar Permisos de Carga BO"
                                            onClick={() => setModalPermisos({ show: true, idReparticion: elem.idReparticion })}>
                                            Permisos
                                        </button>} */}
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTipoBorrar(elem.idReparticion); setShowModal(true) }}>
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
                    <Modal.Title>Está seguro que desea eliminar esta repartición?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarReparticion(e, tipoBorrar)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalBorrarPermiso?.show} onHide={() => setModalBorrarPermiso({ show: false, permiso: null })}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este permiso?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setModalBorrarPermiso({ show: false, permiso: null })}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarPermiso(e)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            {reparticion && reparticion.length > 0 && modalPermisos.idReparticion &&
                <Modal show={modalPermisos?.show} onHide={() => setModalPermisos({ show: false, idReparticion: null })} size="lg">
                    <Modal.Header>
                        <Modal.Title>Permisos de Carga de {reparticion.find(n => n.idReparticion === modalPermisos.idReparticion).reparticion}</Modal.Title>
                        <FiX type="button" style={{ alignSelf: "center" }} onClick={() => setModalPermisos({ show: false, idReparticion: null })} />
                    </Modal.Header>
                    <Modal.Body>
                        {!loadingPermisos ? <>
                            <br />
                            <h3>Nuevo Permiso de Carga</h3>
                            <form className="card p-3" onSubmit={e => handleSubmitPermiso(e)}>
                                <div className="row">
                                    <div class="form-group col">
                                        <label for="idSeccion">Sección</label>
                                        <select
                                            className="custom-select custom-select-sm"
                                            id="idSeccion"
                                            name="idSeccion"
                                            value={formPermisoCarga.idSeccion !== null ? formPermisoCarga.idSeccion : -1}
                                            onChange={e => handleFormPermisoCarga(e)}
                                            required
                                        >
                                            <option value={-1} selected></option>
                                            {secciones && secciones.map(seccion =>
                                                <option value={seccion.idSeccion} key={"opt-sec-" + seccion.idSeccion}>{seccion.seccion}</option>)}
                                        </select>
                                    </div>
                                    <div class="form-group col">
                                        <label for="idNormaTpo">Tipo de Norma</label>
                                        <select
                                            className="custom-select custom-select-sm"
                                            id="idNormaTipo"
                                            name="idNormaTipo"
                                            value={formPermisoCarga.idNormaTipo !== null ? formPermisoCarga.idNormaTipo : -1}
                                            onChange={e => handleFormPermisoCarga(e)}
                                            required
                                        >
                                            <option value={-1} selected></option>
                                            {sumario && [...new Map(sumario.filter(n => n.idSeccion === formPermisoCarga.idSeccion).map(item =>
                                                [item['idNormaTipo'], item])).values()].map(item =>
                                                    <option value={item.idNormaTipo} key={"opt-sec-" + item.idNormaTipo}>{item.normaTipo}</option>)}
                                        </select>
                                    </div>
                                    <div class="form-group col">
                                        <label for="idNormaSubtipo">Subtipo de Norma</label>
                                        <select
                                            className="form-control custom-select-sm"
                                            id="idNormaSubtipo"
                                            name="idNormaSubtipo"
                                            value={formPermisoCarga.idNormaSubtipo !== null ? formPermisoCarga.idNormaSubtipo : -1}
                                            onChange={e => handleFormPermisoCarga(e)}
                                            required
                                        >
                                            <option value={-1} selected></option>
                                            {sumario && [...new Map(sumario.filter(n => n.idSeccion === formPermisoCarga.idSeccion &&
                                                n.idNormaTipo === formPermisoCarga.idNormaTipo).map(item =>
                                                    [item['idNormaSubtipo'], item])).values()].map(item =>
                                                        <option value={item.idNormaSubtipo} key={"opt-sec-" + item.idNormaSubtipo}>{item.normaSubtipo}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div class="form-group col">
                                        <label for="idReparticionOrganismo">Organismo</label>
                                        <select
                                            className="custom-select custom-select-sm"
                                            id="idReparticionOrganismo"
                                            name="idReparticionOrganismo"
                                            value={formPermisoCarga.idReparticionOrganismo !== null ? formPermisoCarga.idReparticionOrganismo : -1}
                                            onChange={e => handleFormPermisoCarga(e)}
                                            required
                                        >
                                            <option value={-1} selected></option>
                                            {sumario && [...new Map(sumario.filter(n => n.idSeccion === formPermisoCarga.idSeccion &&
                                                n.idNormaTipo === formPermisoCarga.idNormaTipo && n.idNormaSubtipo === formPermisoCarga.idNormaSubtipo)
                                                .map(item => [item['idReparticionOrganismo'], item])).values()].map(item =>
                                                    <option value={item.idReparticionOrganismo} key={"opt-sec-" + item.idReparticionOrganismo}>{item.organismo}</option>)}
                                        </select>
                                    </div>
                                    <div class="form-group col">
                                        <label for="idReparticion">Reparticion</label>
                                        <select
                                            className="custom-select custom-select-sm"
                                            id="idReparticion"
                                            name="idReparticion"
                                            value={formPermisoCarga.idReparticion !== null ? formPermisoCarga.idReparticion : -1}
                                            onChange={e => handleFormPermisoCarga(e)}
                                            required
                                        >
                                            <option value={-1} selected></option>
                                            {sumario && [...new Map(sumario.filter(n => n.idSeccion === formPermisoCarga.idSeccion &&
                                                n.idNormaTipo === formPermisoCarga.idNormaTipo && n.idNormaSubtipo === formPermisoCarga.idNormaSubtipo &&
                                                n.idReparticionOrganismo === formPermisoCarga.idReparticionOrganismo).map(item =>
                                                    [item['idReparticion'], item])).values()].map(item =>
                                                        <option value={item.idReparticion} key={"opt-sec-" + item.idReparticion}>{item.reparticion}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm align-self-end" disabled={!validaFormPermisoCarga}>Agregar Permiso</button>
                            </form>
                            <br />
                            <h3>Permisos de Carga Activos</h3>
                            {permisosRepa?.length > 0 ?
                                <table className="table table-sm mt-2" style={{ fontSize: 15 }}>
                                    <thead>
                                        <tr>
                                            <th>Sección</th>
                                            <th>Tipo de Norma</th>
                                            <th>Subtipo de Norma</th>
                                            <th>Organismo</th>
                                            <th>Repartición</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {permisosRepa.map(n =>
                                            <tr>
                                                <td>{n.seccion}</td>
                                                <td>{n.normaTipo}</td>
                                                <td>{n.normaSubtipo}</td>
                                                <td>{n.organismo}</td>
                                                <td>{n.reparticion}</td>
                                                <td><button type="button" className="btn btn-danger btn-sm"
                                                    onClick={() => setModalBorrarPermiso(({ show: true, permiso: n }))}><FaTrash /></button></td>
                                            </tr>)}
                                    </tbody>
                                </table> : <><br />
                                    <span className="alert alert-primary">No se encontraron permisos de carga para este usuario</span>
                                    <br /></>}
                        </> : <Spinner />}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-link" onClick={() => setModalPermisos({ show: false, idReparticion: null })}>
                            Volver
                        </button>
                    </Modal.Footer>
                </Modal>
            }
        </>)
};

export default Reparticiones;