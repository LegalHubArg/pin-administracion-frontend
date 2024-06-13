import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaMinus, FaTrash, FaUserCog } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { getOrganismos, getSecciones, getNormaTipos, getNormaSubtipos } from '../../../Helpers/consultas'

const Cuenta = props => {
    const [dataUsuario, setDataUsuario] = useState()
    const [isLoading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [permisoBorrar, setPermisoBorrar] = useState(null)
    const [reparticiones, setReparticiones] = useState(null)
    const [organismos, setOrganismos] = useState(null)
    const [usuarios, setUsuarios] = useState()
    const [tiposNorma, setTiposNorma] = useState(null)
    const [secciones, setSecciones] = useState(null)
    const [subtiposNorma, setSubtiposNorma] = useState(null)
    const [sinSubtipo, setSinSubtipo] = useState(false)
    const [jerarquia, setJerarquia] = useState(null)
    const [sumario, setSumario] = useState(null)
    const [perfiles, setPerfiles] = useState()
    const [perfilSelect, setPerfilSelect] = useState(null)
    const [modalPerfil, setModalPerfil] = useState({ show: false, idUsuariosPerfil: null })
    const [usrSelect, setUsrSelect] = useState(null)
    const [modalUsuario, setModalUsuario] = useState({ show: false, idUsuario: null })
    const [noPoder, setNoPoder] = useState(false)
    const [repasNoPoder, setRepasNoPoder] = useState(null)

    const initFormPermisoCarga = {
        idSeccion: null,
        idNormaTipo: null,
        idNormaSubtipo: null,
        idReparticion: null,
        idOrganismo: null,
    }
    const [formPermisoCarga, setFormPermisoCarga] = useState(initFormPermisoCarga)
    const [validaFormPermisoCarga, setValidaFormPermisoCarga] = useState(false)
    const { idCuenta } = useParams();

    const [autocomplete_show, set_autocomplete_show] = useState(false)
    const [organismosFiltrados, setOrganismosFiltrados] = useState()
    const [buscador, setBuscador] = useState()

    const handleFormPermisoCarga = async (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'idSeccion':
                let tipoDeSeccion = secciones.filter(n => n.idSeccion == value)[0].es_poder
                if (tipoDeSeccion == 0) {//No es poder
                    setFormPermisoCarga({ ...formPermisoCarga, idSeccion: parseInt(value), idNormaSubtipo: null, idReparticion: null, idNormaTipo: null, idOrganismo: null })
                    setNoPoder(true)
                    setTiposNorma({ idNormaTipo: 0, normaTipo: "Todos los tipos" })
                    let aux = repasNoPoder.filter(e => e.idSeccion == value)
                    setRepasNoPoder(aux)
                } else {
                    await traerTiposDeNormasPorSeccion(value)
                    setFormPermisoCarga({ ...formPermisoCarga, idSeccion: parseInt(value), idNormaSubtipo: null, idReparticion: null, idNormaTipo: null, idOrganismo: null })
                    setNoPoder(false)
                }
                break;
            case 'idReparticion':
                setFormPermisoCarga({ ...formPermisoCarga, idReparticion: parseInt(value) })
                break;
            case 'idOrganismo':
                let sigla = organismos.filter(o => o.idOrgEmisor == value)[0].sigla
                let nombre = organismos.filter(o => o.idOrgEmisor == value)[0].nombre
                // El nombre y Sigla los agrego al form y luego los envio por body al back fuera del permisosCarga porque desde el sumario no traer el nombre ni la sigla
                setFormPermisoCarga({ ...formPermisoCarga, idOrganismo: parseInt(value), sigla: sigla, nombre: nombre })
                break;
            case 'idNormaTipo':
                await traerSubtiposDeNormasPorTipo(value)
                await traerReparticionesPorTipoNorma(value)
                setFormPermisoCarga({ ...formPermisoCarga, idNormaTipo: parseInt(value), idNormaSubtipo: null, idReparticion: null })
                break;
            case 'idNormaSubtipo':
                setFormPermisoCarga({ ...formPermisoCarga, idNormaSubtipo: parseInt(value) })
                break;
        }
    }

    const traerTiposDeNormasPorSeccion = async (idSeccion) => {
        try {
            if (idSeccion !== -1) {
                let body = {
                    usuario: localStorage.getItem("user_cuit"),
                    idSeccion: idSeccion
                }
                let token = localStorage.getItem("token");
                await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipos', body, token)
                    .then((res) => {
                        setTiposNorma(res.data.data)
                    })
                    .catch(e => { throw e })
            } else {
                setTiposNorma(null)
            }

        }
        catch (error) {
        }
    }

    const traerSubtiposDeNormasPorTipo = async (idNormaTipo) => {
        try {
            let normaAux = tiposNorma.filter(n => n.idNormaTipo === parseInt(idNormaTipo))
            if (idNormaTipo !== -1) {
                let body = {
                    usuario: localStorage.getItem("user_cuit"),
                    idSumarioNormasTipo: normaAux[0].idSumarioNormasTipo
                }
                let token = localStorage.getItem("token");
                await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/subtipos', body, token)
                    .then((res) => {
                        if (res.data.data.length === 0) {
                            setSinSubtipo(true)
                            setSubtiposNorma(null)
                        } else {
                            setSinSubtipo(false)
                            setSubtiposNorma(res.data.data)
                        }

                    })
                    .catch(function (error) {
                        throw error
                    });
            } else {
                setSubtiposNorma(null)
            }
        }
        catch (error) {
            setLoading(false)
        }
    }

    const traerReparticionesPorTipoNorma = async (idNormaTipo) => {
        try {
            let repasTipo = sumario.filter(i => i.idNormaTipo == idNormaTipo && i.idSeccion == formPermisoCarga?.idSeccion)
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idSumarioNormasTipo: repasTipo[0].idSumarioNormasTipo
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/sumario/seccion/tipo/reparticiones', body, token)
                .then((res) => {
                    if (res.data.data.length === 0) {
                        setReparticiones(null)
                    }
                    setReparticiones(res.data.data)
                })
                .catch(function (error) {
                    throw error
                });
        }
        catch (error) {
            setLoading(false)
        }
    }

    const getCuenta = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idCuenta,
            }
            let data;

            await ApiPinPost('/api/v1/boletin-oficial/cuenta', body, localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.data
                })

            await ApiPinPost('/api/v1/boletin-oficial/cuenta/permisos', body, localStorage.getItem("token"))
                .then((res) => {
                    data.permisos = res.data.data
                })
            return data
        }
        catch (e) { setError(true) }
    }

    const getPerfiles = async () => {
        try {
            let data;
            await ApiPinGet('/api/v1/usuarios/perfiles', localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.data
                })
            return data
        }
        catch (e) { }
    }

    const getUsuarios = async () => {
        try {
            let data;
            await ApiPinPost('/api/v1/boletin-oficial/usuarios', { sinPaginacion: true }, localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.usuarios
                })
            return data
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
                    //setSumario({data})
                    let auxSumario = res.data.data.es_poder.concat(res.data.data.no_es_poder, res.data.data.no_es_poder_repas)
                    setSumario(auxSumario)
                    setRepasNoPoder(res.data.data.no_es_poder_repas)
                })

        }
        catch (e) { }
    }

    //Submit del form de carga de un permiso
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body
        try {
            if (noPoder) {
                body = {
                    idCuenta: dataUsuario.idCuenta,
                    usuario: localStorage.user_cuit,
                    idUsuarioAdmin: localStorage.idUsuarioBO,
                    sigla: formPermisoCarga.sigla,
                    nombre: formPermisoCarga.nombre,
                    permisosCargaUsuario: { ...formPermisoCarga }
                }
            } else {
                body = {
                    idCuenta: dataUsuario.idCuenta,
                    usuario: localStorage.user_cuit,
                    idUsuarioAdmin: localStorage.idUsuarioBO,
                    sigla: formPermisoCarga.sigla,
                    nombre: formPermisoCarga.nombre,
                    permisosCargaUsuario: { ...sumario[formPermisoCarga.indiceSumario] }
                }
            }
            await ApiPinPost('/api/v1/usuarios/permisos/crear', body, localStorage.getItem("token"))
                .then((res) => {
                    setFormPermisoCarga(initFormPermisoCarga)
                    setBuscador('')
                    getCuenta().then(r => setDataUsuario(r))
                })
            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    const handleSubmitPerfil = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let body = {
                usuario: dataUsuario.usuario,
                idUsuarioAdmin: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
                idPerfil: perfilSelect
            }
            await ApiPinPost('/api/v1/usuarios/usuario/perfil/asignar', body, localStorage.getItem("token"))
                .then(_ => {
                    getCuenta().then(r => setDataUsuario(r))
                })
            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    const handleSubmitUsr = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let body = {
                usuario: dataUsuario.usuario,
                idUsuarioAdmin: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
                idUsuario: usrSelect,
                datosEditar: { idCuenta: dataUsuario.idCuenta }
            }
            await ApiPinPost('/api/v1/boletin-oficial/usuarios/editar', body, localStorage.getItem("token"))
                .then(_ => {
                    getCuenta().then(r => setDataUsuario(r))
                })
            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    const traerOrganismosEmisores = async () => {
        try {
            setLoading(true)
            let body = {
                usuario: localStorage.getItem("user_cuit"),
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores', body, token)
                .then((res) => {
                    if (res.data.data.length === 0) {
                        throw error
                    }
                    setOrganismos(res.data.data)
                    setOrganismosFiltrados(res.data.data)
                    setLoading(false)
                })
        } catch (error) {
            setLoading(false)
        }
    }



    const borrarPerfil = async (e, idUsuariosPerfil) => {
        e.preventDefault();
        setLoading(true);
        try {
            let body = {
                usuario: dataUsuario.usuario,
                idUsuarioAdmin: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
                idUsuariosPerfil
            }
            await ApiPinPost('/api/v1/usuarios/usuario/perfil/borrar', body, localStorage.getItem("token"))
                .then(_ => {
                    setModalPerfil({ show: false, idUsuariosPerfil: null })
                    getCuenta().then(r => setDataUsuario(r))
                })
            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    async function borrarPermiso(e) {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.user_cuit,
                idCuenta: dataUsuario.idCuenta,
                idUsuarioAdmin: parseInt(JSON.parse(localStorage.idUsuarioBO)),
                itemBorrar: permisoBorrar
            }
            await ApiPinPost('/api/v1/usuarios/permisos/borrar', body, localStorage.getItem("token"))
                .then(async _ => {
                    setShowModal(false);
                    getCuenta().then(r => setDataUsuario(r));
                    let usrs = await getUsuarios();
                    usrs = usrs.filter(n => n.idCuenta === null)
                    setUsuarios(usrs)
                })
                .catch()

            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    async function borrarUsuario(e) {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: dataUsuario.usuario,
                datosEditar: { idCuenta: null },
                idUsuario: modalUsuario.idUsuario
            }

            await ApiPinPost('/api/v1/boletin-oficial/usuarios/editar', body, localStorage.getItem("token"))
                .then(async _ => {
                    await getCuenta().then(r => setDataUsuario(r));
                    setModalUsuario({ show: false, idUsuario: null });
                    let usrs = await getUsuarios();
                    usrs = usrs.filter(n => n.idCuenta === null)
                    setUsuarios(usrs)
                })
                .catch()

            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    useEffect(() => {
        //Valido el form
        if (formPermisoCarga?.idNormaTipo == 0 && formPermisoCarga?.idOrganismo !== null && formPermisoCarga?.idSeccion !== null && formPermisoCarga?.idReparticion !== null && noPoder) {
            setValidaFormPermisoCarga(true)
            return
        }
        if (formPermisoCarga instanceof Object && sumario) {
            //Para que el form sea válido tiene que corresponderse con un item del sumario
            let itemDelSumario = sumario.find(n => n.idSeccion === formPermisoCarga?.idSeccion && n.idNormaTipo === formPermisoCarga?.idNormaTipo && n.idReparticion === formPermisoCarga?.idReparticion);
            if (itemDelSumario) {
                //Guardo el índice del ítem del sumario como una propiedad más del objeto del form
                let auxForm = formPermisoCarga;
                auxForm.indiceSumario = sumario.indexOf(itemDelSumario);
                setFormPermisoCarga(auxForm)
                if (formPermisoCarga.idOrganismo) { setValidaFormPermisoCarga(true) }
            }
            else setValidaFormPermisoCarga(false)
        }
    }, [formPermisoCarga])
    console.log(formPermisoCarga)
    useEffect(async () => {
        setLoading(true)
        let dataUsuarioAux = await getCuenta()
        setDataUsuario(dataUsuarioAux)
        let perfilesAux = await getPerfiles();
        //Filtro los perfiles que ya tiene, para que no los muestre en el select.
        let perfilesUsuario = dataUsuarioAux.perfiles.map(n => n.idPerfil)
        setPerfiles(perfilesAux.filter(n => !perfilesUsuario.includes(n.idPerfil)))
        let usrs = await getUsuarios();
        usrs = usrs.filter(n => n.idCuenta === null)
        setUsuarios(usrs)
        await getSumario();
        //await getJerarquia();
        await traerOrganismosEmisores()
        //const repas = await getOrganismos().catch();
        //setReparticiones(repas)
        const secciones = await getSecciones().catch();
        setSecciones(secciones)
        //const tipos = await getNormaTipos().catch();
        //setTiposNorma(tipos)
        setSinSubtipo(false)
        //const subtipos = await getNormaSubtipos().catch();
        //setSubtiposNorma(subtipos)
        setLoading(false)
    }, [])


    if (isLoading)
        return <Spinner />
    else
        return (<>
            {dataUsuario &&
                <div className="container responsive mb-5">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td><b>Cuenta:</b></td>
                                <td>{dataUsuario.sigla}</td>
                            </tr>
                            <tr>
                                <td style={{ width: "40%" }}><b>Nombre:</b></td>
                                <td>{dataUsuario.nombre}</td>
                            </tr>
                            <tr>
                                <td><b>Email:</b></td>
                                <td>{dataUsuario.email}</td>
                            </tr>
                            <tr>
                                <td><b>Email alternativo:</b></td>
                                <td>{dataUsuario.email_alternativo}</td>
                            </tr>
                            <tr>
                                <td><b>Repartición:</b></td>
                                <td>{dataUsuario.reparticion}</td>
                            </tr>
                            <tr>
                                <td><b>Teléfono:</b></td>
                                <td>{dataUsuario.telefono}</td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <h2>Perfiles</h2>
                    <div className="d-flex align-items-start">
                        {dataUsuario?.perfiles?.length > 0 &&
                            <table className="table mr-5" style={{ width: "fit-content" }}>
                                <thead><tr><th colspan={2}>Activos</th></tr></thead>
                                {dataUsuario?.perfiles.map(n => <tr><td>{n?.descripcion}</td>
                                    <td><button className="btn btn-sm btn-danger"
                                        onClick={() => setModalPerfil({ show: true, idUsuariosPerfil: n.idUsuariosPerfil })}>
                                        <FaTrash />
                                    </button></td>
                                </tr>)}
                            </table>
                        }
                        <form className="card p-3" onSubmit={(e) => handleSubmitPerfil(e)} style={{ width: "fit-content" }}>
                            <div class="form-group">
                                <label for="idPerfil">Nuevo Perfil</label>
                                <select
                                    className="custom-select custom-select-sm"
                                    id="idPerfil"
                                    name="idPerfil"
                                    value={perfilSelect !== null ? perfilSelect : -1}
                                    onChange={e => setPerfilSelect(e.target.value)}
                                    required
                                >
                                    <option value={-1} selected></option>
                                    {perfiles && (perfiles.length > 0 ? perfiles.map(perfil =>
                                        <option value={perfil.idPerfil} key={"opt-sec-" + perfil.idPerfil}>{perfil.descripcion}</option>)
                                        : "No se encontraron perfiles disponibles para agregar a este usuario")}
                                </select>
                            </div>
                            <button className="btn btn-sm btn-primary">Agregar Perfil</button>
                        </form>
                    </div>
                    <br />
                    <br />
                    <h2>Usuarios que operan esta cuenta</h2>
                    <div className="d-flex align-items-start">
                        {dataUsuario?.usuarios?.length > 0 &&
                            <table className="table mr-5" style={{ width: "fit-content" }}>
                                <thead>
                                    <tr>
                                        <th>CUIT/CUIL</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                {dataUsuario?.usuarios.map(n =>
                                    <tr>
                                        <td>{n.usuario}</td>
                                        <td>{n.apellidoNombre}</td>
                                        <td>{n.email}</td>
                                        <td><button className="btn btn-sm btn-danger"
                                            onClick={() => setModalUsuario({ show: true, idUsuario: n.idUsuario })}>
                                            <FaTrash />
                                        </button></td>
                                    </tr>)}
                            </table>
                        }
                        <form className="card p-3" onSubmit={(e) => handleSubmitUsr(e)} style={{ width: "fit-content" }}>
                            <div class="form-group">
                                <label for="idUsuario">Usuarios</label>
                                <select
                                    className="custom-select custom-select-sm"
                                    id="idUsuario"
                                    name="idUsuario"
                                    value={usrSelect !== null ? usrSelect : -1}
                                    onChange={e => setUsrSelect(e.target.value)}
                                    required
                                >
                                    <option value={-1} selected></option>
                                    {usuarios && usuarios.map(item =>
                                        <option value={item.idUsuario} key={"opt-sec-" + item.idusuario}>{item.usuario}</option>)}
                                </select>
                            </div>
                            <button className="btn btn-sm btn-primary">Agregar usuario</button>
                        </form>
                    </div>
                    <br />
                    <br />
                    <h2>Permisos</h2>
                    <h3>Nuevo Permiso de Carga</h3>
                    <form className="card p-3" onSubmit={e => handleSubmit(e)}>
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
                                    disabled={!secciones}
                                >
                                    <option value={-1} selected>Seleccione una Sección</option>
                                    { /* secciones && secciones.map(seccion =>
                                        <option value={seccion.idSeccion} key={"opt-sec-" + seccion.idSeccion}>{seccion.seccion}</option>) */
                                        secciones && (secciones != {}) ? (
                                            <>
                                                {secciones.map((p, index) => (
                                                    <option value={p.idSeccion} key={'opt-sec-' + index}>{p.seccion}</option>
                                                ))
                                                }
                                            </>
                                        ) : (<option selected disabled>No hay secciones para mostrar</option>)
                                    }
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
                                    disabled={!tiposNorma || !formPermisoCarga?.idSeccion}
                                >
                                    <option value={-1} selected>Seleccione un Tipo de Norma</option>
                                    {(tiposNorma && formPermisoCarga.idSeccion && !noPoder) ? (
                                        <>
                                            {
                                                tiposNorma.filter(n => n.idSeccion === formPermisoCarga.idSeccion).map(item =>
                                                    <option value={item.idNormaTipo} key={"opt-sec-" + item.idNormaTipo}>{item.normaTipo}</option>)
                                            }
                                        </>
                                    ) : (<option selected value={0}>Todos los tipos</option>)
                                    }
                                </select>
                            </div>
                            {/* <div class="form-group col">
                                <label for="idNormaSubtipo">Subtipo de Norma</label>
                                <select
                                    className="form-control custom-select-sm"
                                    id="idNormaSubtipo"
                                    name="idNormaSubtipo"
                                    value={formPermisoCarga.idNormaSubtipo !== null ? formPermisoCarga.idNormaSubtipo : -1}
                                    onChange={e => handleFormPermisoCarga(e)}
                                    required
                                    disabled={!subtiposNorma || !formPermisoCarga.idNormaTipo || !formPermisoCarga.idSeccion || sinSubtipo || formPermisoCarga?.idNormaTipo === -1}
                                >
                                    <option value={-1} selected>Seleccione un Subtipo de Norma</option>
                                    {
                                        (subtiposNorma && formPermisoCarga.idNormaTipo && formPermisoCarga.idSeccion)?<>
                                            {
                                                subtiposNorma.map(item =>
                                                    <option value={item.idNormaSubtipo} key={"opt-sec-" + item.idNormaSubtipo}>{item.normaSubtipo}</option>
                                                    )
                                            }
                                        </>
                                        :<>
                                            <option selected disabled>Seleccione los campos anteriores</option> 
                                        </>
                                    }
                                </select>
                            </div> */}
                        </div>
                        <div className="row">
                            <div class="form-group col">
                                <label for="idReparticion">Reparticion</label>
                                <select
                                    className="custom-select custom-select-sm"
                                    id="idReparticion"
                                    name="idReparticion"
                                    value={formPermisoCarga.idReparticion !== null ? formPermisoCarga.idReparticion : -1}
                                    onChange={e => handleFormPermisoCarga(e)}
                                    required
                                    disabled={!formPermisoCarga.idSeccion || formPermisoCarga.idNormaTipo < 0 || formPermisoCarga?.idNormaTipo === -1}
                                >
                                    <option value={-1} selected>Seleccione una Repartición</option>
                                    {
                                        (reparticiones && formPermisoCarga?.idNormaTipo && formPermisoCarga?.idSeccion && !noPoder) ? <>
                                            {
                                                reparticiones.map(item =>
                                                    <option value={item.idReparticion}>{item.reparticion}</option>
                                                )
                                            }
                                        </> : (<>
                                            {
                                                repasNoPoder.map(item => <option value={item.idReparticion}>{item.reparticion}</option>)
                                            }
                                        </>
                                        )
                                    }
                                </select>
                            </div>
                            <div className="col">
                                <Autocomplete>
                                    <Buscador id={"organismo"} label="Organismo" value={buscador} show={autocomplete_show}
                                        disabled={formPermisoCarga.idNormaTipo == null || !organismos || formPermisoCarga?.idNormaTipo === -1}
                                        onChange={(e) => {
                                            setBuscador(e.target.value.toUpperCase());
                                            if (e.target.value.length > 0) {
                                                setOrganismosFiltrados([...organismos.filter(n => n.nombre.toUpperCase().includes(e.target.value.toUpperCase()) || n.sigla.toUpperCase().includes(e.target.value.toUpperCase()))])
                                            }
                                            else {
                                                setOrganismosFiltrados(organismos)
                                            }
                                        }}
                                        onClick={() => { set_autocomplete_show(!autocomplete_show) }} />
                                    <AutocompleteMenu show={autocomplete_show}>
                                        {(organismosFiltrados && formPermisoCarga?.idNormaTipo >= 0) && organismosFiltrados.map(item =>
                                            <AutocompleteOption value={item.idOrgEmisor} key={"opt-org-" + item.idOrgEmisor}
                                                onClick={(e) => {
                                                    setFormPermisoCarga({ ...formPermisoCarga, idOrganismo: item.idOrgEmisor, sigla: item.sigla, nombre: item.nombre });
                                                    setBuscador(item.nombre);
                                                    set_autocomplete_show(false)
                                                }} >
                                                <b className="row col">{item.nombre}</b>{item.sigla}
                                            </AutocompleteOption>
                                        )}
                                    </AutocompleteMenu>
                                </Autocomplete>
                            </div>
                            {/* <div class="form-group col">
                                <label for="idOrganismo">Organismo</label>
                                <select
                                    className="custom-select custom-select-sm"
                                    id="idOrganismo"
                                    name="idOrganismo"
                                    value={formPermisoCarga.idOrganismo !== null ? formPermisoCarga.idOrganismo : -1}
                                    onChange={e => handleFormPermisoCarga(e)}
                                    required
                                    disabled={formPermisoCarga.idNormaTipo == null || !organismos || formPermisoCarga?.idNormaTipo === -1}
                                >
                                    <option value={-1} selected>Seleccione un Organismo</option>
                                    {
                                        (organismos && formPermisoCarga?.idNormaTipo >= 0) ?
                                            <>
                                                {organismos.map(item =>
                                                    <option value={item.idOrgEmisor} key={"opt-sec-" + item.idOrgEmisor}>{item.nombre}</option>
                                                )}
                                            </>
                                            : <><option selected value={-1}>Seleccione los campos anteriores</option></>
                                    }
                                </select>
                            </div> */}
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm align-self-end" disabled={!validaFormPermisoCarga}>Agregar Permiso</button>
                    </form>
                    <br />
                    <h3>Permisos de Carga Activos</h3>
                    {dataUsuario?.permisos?.length > 0 ?
                        <table className="table table-sm mt-2" style={{ fontSize: 15 }}>
                            <thead>
                                <tr>
                                    <th>Sección</th>
                                    <th>Tipo de Norma</th>
                                    <th>Repartición</th>
                                    <th>Organismo</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {dataUsuario.permisos.map(n =>
                                    <tr>
                                        <td>{n.seccion}</td>
                                        <td>{n.normaTipo}</td>
                                        <td>{n.reparticion}</td>
                                        <td>{n.sigla} | {n.nombre}</td>
                                        <td><button type="button" className="btn btn-danger btn-sm"
                                            onClick={() => { setShowModal(true); setPermisoBorrar(n) }}><FaTrash /></button></td>
                                    </tr>)}
                            </tbody>
                        </table> : <><br /><span className="alert alert-primary">No se encontraron permisos de carga para este usuario</span><br /></>}
                </div>
            }
            {error && <div className="alert alert-danger">Se produjo un error al buscar los datos del usuario</div>}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este permiso?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarPermiso(e)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalPerfil?.show} onHide={() => setModalPerfil({ show: false, idUsuariosPerfil: null })}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este perfil?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setModalPerfil({ show: false, idUsuariosPerfil: null })}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarPerfil(e, modalPerfil.idUsuariosPerfil)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalUsuario?.show} onHide={() => setModalUsuario({ show: false, idUsuario: null })}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este usuario de la cuenta?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setModalUsuario({ show: false, idUsuario: null })}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarUsuario(e, modalUsuario.idUsuario)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

const Autocomplete = (props) => {
    return <div className="dropdown-container"><div class="dropdown" title="Seleccione un elemento de la lista o escriba para buscar.">{props.children}</div></div>
}

const AutocompleteMenu = (props) => {
    return <div className={"p-1 dropdown-menu " + (props.show ? " show" : "")} style={{ width: "100%", maxHeight: "300px", overflowY: "scroll" }}>{props.children}</div>
}

const Buscador = ({ id, label, placeholder, onChange, value, onClick, show, disabled }) => {
    if (id && onChange) {
        return (
            <>
                <div className="form-group">
                    <label for={id}>{label}</label>
                    <input className="form-control form-control-sm" id={id} placeholder={placeholder ?? ''} onChange={onChange}
                        value={value} onClick={onClick} autocomplete="off" disabled={disabled} />
                    {!disabled && <i type="button" className="bx bx-chevron-down"
                        style={{ position: "absolute", bottom: "10px", right: "10px", transition: "all 0.3s linear", transform: show ? "rotate(180deg)" : "" }}
                        onClick={onClick} />}
                </div>
            </>
        )
    }
}

const AutocompleteOption = ({ value, key, onClick, ...props }) => {
    return (
        <div type="button" className="dropdown-item col" id={value} onClick={onClick} key={key} style={{ fontSize: 12 }}>
            {props.children}
        </div>
    )
}


export default Cuenta;