import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaCheck, FaTimes, FaEye, FaArrowRight, FaArrowLeft, FaEdit, FaPaperclip } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import moment from "moment";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import './DiseniadorBoletin.css';
import { rutasBO } from "../../routes";
import { BiWindows } from "react-icons/bi";
import { Alert } from "react-bootstrap";
var b64toBlob = require('b64-to-blob');

const GenerarBoletin = props => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [loadingEdicionBoletin, setLoadingEdicionBoletin] = useState(false)
    const [secciones, setSecciones] = useState([])
    const [boletin, setBoletin] = useState([])
    const [normasNoAsignadas, setNormasNoAsignadas] = useState([])
    const [normasAsignadas, setNormasAsignadas] = useState([])
    const [anexos, setAnexos] = useState([])
    const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([])
    const [checkedNormasAsignadas, setCheckedNormasAsignadas] = useState([])
    const [checkedNormasNoAsignadas, setCheckedNormasNoAsignadas] = useState([])

    //console.log("NORMAS Asignadas", normasAsignadas); 


    const [error, setError] = useState(false) //Flag de error de la página
    if (error) throw error //Lo catchea el ErrorBoundary

    const [puedoGuardar, setPuedoGuardar] = useState(false);

    const getSecciones = async () => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/boletin-oficial/sumario/secciones', body, token).then((res) => {
                setSecciones(res.data.data)
            }).catch(function (error) {
                setLoading(false)
                //console.log(error);
            });
            setLoading(false)
        }
        catch (error) {
            console.log(error)
            setError(error?.data?.mensaje)
            setLoading(false)
        }
    }

    const getBoletin = async (idBoletin) => {
        setLoading(true);
        let boletin;
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: idBoletin
            }

            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin', body, token).then((res) => {
                boletin = res.data.data
                setBoletin(boletin)
                setSeccionesSeleccionadas(JSON.parse(boletin.boletinSecciones).secciones)
            })
            setLoading(false)
            return boletin;
        }
        catch (error) {
            console.log(error)
            setError(error?.data?.mensaje)
            setLoading(false)
        }
    }

    const getNormas = async (idBoletin) => {
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/traerNormasDeUnBoletin', body, token).then((res) => {
                if (res.data.data.normas !== undefined) {
                    setNormasAsignadas(res.data.data.normas)
                    setAnexos(res.data.data.anexos)
                    //console.log(res.data.data)
                }
            })
            setLoading(false)
        }
        catch (error) {
            console.log(error)
            setError(error?.data?.mensaje)
            setLoading(false)
        }
    }

    const getNormasNoAsignadas = async (fechaLimite) => {
        try {
            let normasFechaLimite = [];
            let normasDesdeHasta = [];
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                fechaLimite: fechaLimite
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/traerNormasPorFechaLimite', body, token).then((res) => {
                //console.log(res.data.data)
                normasFechaLimite = (res.data.data)?.filter(n => !boletin.normas.includes(n.idNorma))
            })
            await ApiPinPost('/api/v1/boletin-oficial/boletin/traerNormasBoletinDesdeHasta', { fechaPublicacion: fechaLimite }, token).then((res) => {
                //console.log(res.data.data)
                normasDesdeHasta = (res.data.data)?.filter(n => !boletin.normas.includes(n.idNorma))
            })
            setNormasNoAsignadas([...normasFechaLimite, ...normasDesdeHasta])

        }
        catch (error) {
            console.log(error)
            setError(error?.data?.mensaje)
            setLoading(false)
        }
    }

    const SelectorSecciones = () => {
        let seccionesBotones = [];
        async function toggleSeccion(e, s) {
            e.preventDefault()
            document.body.style.cursor = 'wait';
            let boletinEditado = { ...boletin }
            let auxSecciones = []
            if (seccionesSeleccionadas.includes(s.idSeccion)) {
                auxSecciones = seccionesSeleccionadas.filter(sec => sec != s.idSeccion)
            }
            else {
                auxSecciones = seccionesSeleccionadas
                auxSecciones.push(s.idSeccion)
            }
            boletinEditado.boletinSecciones = JSON.stringify({ secciones: auxSecciones })
            let body = {
                usuario: (JSON.parse(localStorage.perfiles))[0].idUsuario,
                ...boletinEditado
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/editar', body, token).then((res) => {
                window.location.reload()
            }).catch(_ => { });
            let arrayAux = []
            if (seccionesSeleccionadas.includes(s.idSeccion)) {
                arrayAux = seccionesSeleccionadas.filter(sec => sec !== s.idSeccion);
                document.getElementById('botonSeccion' + String(s.idSeccion)).className = 'btn btn-link';
                document.getElementById('cruzSeccion' + String(s.idSeccion)).hidden = true;
            }
            else {
                arrayAux = seccionesSeleccionadas;
                arrayAux.push(s.idSeccion);
                document.getElementById('botonSeccion' + String(s.idSeccion)).className = 'btn btn-link focus';
                document.getElementById('cruzSeccion' + String(s.idSeccion)).hidden = false;
                /* if ((normasAsignadas.filter(n => n.idSeccion === s.idSeccion)).length === 0) {
                    getNormasParaAsignarASeccion((boletin.fechaPublicacion).split('T')[0], s.idSeccion);
                } */

            }
            //console.log(arrayAux)
            setSeccionesSeleccionadas(Array.from(arrayAux))
            document.body.style.cursor = 'default';
        }
        if (secciones.length > 0) {
            seccionesBotones = secciones.map(s => (
                <div className={(seccionesSeleccionadas.includes(s.idSeccion)) ? ("btn btn-link focus") : ("btn btn-link")}
                    onClick={(e) => toggleSeccion(e, s)} id={'botonSeccion' + String(s.idSeccion)}>
                    {s.seccion} <div id={'cruzSeccion' + String(s.idSeccion)} title="Deseleccionar" className="cruz"
                        hidden={(seccionesSeleccionadas.includes(s.idSeccion)) ? (false) : (true)}
                    >
                        <FaTimes />
                    </div>
                </div>
            ))
        }

        return seccionesBotones;
    }

    const obtenerColor = (n) => {
        if (n.fechaDesde !== null && n.fechaHasta !== null && [11, 12, 13].includes(n.idNormasEstadoTipo)) {
            return { backgroundColor: "rgba(255, 168, 46, 0.6)", borderRadius: "5px" }
        }
        else {
            if (n.idNormasEstadoTipo === 3) { //rojo
                return { backgroundColor: "rgba(231, 76, 60, 0.6)", borderRadius: "5px" }
            }
            else {
                if (n.normaRevisada === 1) { //celeste
                    return { backgroundColor: "rgba(0, 154, 253, 0.3)", borderRadius: "5px" }
                }
            }
        }

    }

    const SeccionNormas = ({ seccion }) => {
        function cambiarTablasDeLugar() {
            return;
        }
        return (
            <div className="card">
                <button
                    className="card-header card-link"
                    data-toggle="collapse"
                    data-target={'#collapse' + String(seccion.idSeccion)}
                >
                    {seccion.seccion + ' / Fecha Boletín: ' + moment(boletin.fechaPublicacion).format('DD/MM/YYYY')}
                </button>
                <div id={'collapse' + String(seccion.idSeccion)} className="collapse show" data-parent="#accordion">
                    <div className="card-body">
                        <TablaNormas normas={normasAsignadas.filter(n => n.idSeccion === seccion.idSeccion)} id="tablaNormasAsignadas" titulo="Normas Asignadas" idSeccion={seccion.idSeccion} asignada={true} />
                        {/* <div className='swap-icon' >
                            <button className='btn btn-link' title="Cambiar de lugar" onClick={() => cambiarTablasDeLugar()} disabled>
                            <RiArrowLeftRightLine />
                            </button>
                        </div> */}
                        <TablaNormas normas={normasNoAsignadas.filter(n => n.idSeccion === seccion.idSeccion)} id="tablaNormasNoAsignadas" titulo="Normas No Asignadas" idSeccion={seccion.idSeccion} asignada={false} />
                        <div id="accordion" hidden></div>
                    </div>
                </div>
            </div>
        )
    }

    const checkRevision = (e, n) => {
        let aux = {}
        if (e.target.checked) {
            aux = 1
        } else {
            aux = 0
        }
        let bodyAux = {
            idNorma: n.idNorma,
            checkPreRevisado: aux
        }
        try {
            let body = bodyAux
            //console.log(body)
            let token = localStorage.getItem("token");
            ApiPinPost('/api/v1/boletin-oficial/normas/revision', body, token)
                .then((res) => {
                    console.log("ok")
                })
                .catch(e => { throw e })
        }
        catch (err) {
            console.log("err", err)
        }
    }


    const TablaNormas = ({ normas, id, titulo, idSeccion, asignada }) => {
        const isButtonEnabledAsignada = checkedNormasAsignadas.length > 0 &&
            checkedNormasAsignadas.every(n => n.idSeccion === idSeccion);
        const isButtonEnabledaNoAsignada = checkedNormasNoAsignadas.length > 0 &&
            checkedNormasNoAsignadas.every(n => n.idSeccion === idSeccion);

        function checkAllAsignadas(e, normasRecibidas) {
            e.preventDefault();
            /* if (checkedNormasAsignadas.length < normasRecibidas.length) {
                setCheckedNormasAsignadas(normasRecibidas.map(n => n.idNorma))
            }
            else {
                setCheckedNormasAsignadas([])
            } */
            if (checkedNormasAsignadas.length < normasRecibidas.length) {
                setCheckedNormasAsignadas(normasRecibidas)
            }
            else {
                setCheckedNormasAsignadas([])
            }
        }
        function checkAllNoAsignadas(e, normasRecibidas) {
            e.preventDefault()
            /* if (checkedNormasNoAsignadas.length < normasRecibidas.length){
                setCheckedNormasNoAsignadas(normasRecibidas.map(n => n.idNorma))
            }else{
                setCheckedNormasNoAsignadas([])

            } */
            if (checkedNormasNoAsignadas.length < normasRecibidas.length) {
                setCheckedNormasNoAsignadas(normasRecibidas)
            } else {
                setCheckedNormasNoAsignadas([])

            }
        }

        function checkNormaAsignada(e, norma) {
            e.preventDefault();
            setCheckedNormasAsignadas(prevChecked => {
                if (prevChecked.includes(norma)) {
                    return prevChecked.filter(p => p.idNorma !== norma.idNorma);
                } else {
                    return [...prevChecked, norma];
                }
            });
        }

        function checkNormaNoAsignada(e, norma) {
            e.preventDefault();
            setCheckedNormasNoAsignadas(prevChecked => {
                if (prevChecked.includes(norma)) {
                    return prevChecked.filter(p => p.idNorma !== norma.idNorma);
                } else {
                    return [...prevChecked, norma];
                }
            });
        }


        const flagCheckNoAsignadas = (id) => {
            let response = checkedNormasNoAsignadas.includes(id)
            //console.log(response)
            return response
        }
        const flagCheckAsignadas = (id) => {
            let response = checkedNormasAsignadas.includes(id)
            // console.log(response)
            return response
        }

        return (
            <div id={id}>
                <h4>{titulo}</h4>
                <table class="table table-bordered table-hover" >
                    <thead>
                        <tr>
                            <th scope="col">idNorma</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Organismo</th>
                            <th scope="col">Reparticion</th>
                            <th scope="col">N°-Año</th>
                            <th scope="col" class="accion">Ok</th>
                            <th scope="col" class="accion"></th>
                            <th scope="col" class="accion"></th>
                            <th scope="col" class="accion"></th>
                            <th scope="col" class="accion"></th>
                            <th scope="col" class="accion"></th>
                            <th scope="col" class="accion">
                                <input id={idSeccion} type="checkbox" class="acciones-norma"
                                    onClick={(e) => asignada ? checkAllAsignadas(e, normas) : checkAllNoAsignadas(e, normas)} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            normas.length > 0 ? (
                                normas.map(n => (
                                    <tr style={obtenerColor(n)}>
                                        <td>{n.idNorma}</td>
                                        <td title={n.normaTipo}>{n.normaTipoSigla}</td>
                                        <td title={n.organismoEmisor}>{n.organismoEmisor}</td>
                                        <td title={n.reparticion}>{n.siglaReparticion}</td>
                                        <td>{String(n.normaNumero) + '-' + String(n.normaAnio).replace('20', '')}</td>
                                        <td>
                                            <input
                                                id={`normaAsignada-${n.idNorma}`}
                                                type="checkbox"
                                                class="acciones-norma"
                                                onChange={(e) => { checkRevision(e, n) }}
                                                defaultChecked={n.checkPreRevisado === 1}
                                            >
                                            </input>
                                        </td>
                                        <td class="accion">
                                            <Link to={`../../${rutasBO.normas}/${n.idNorma}`} target="_blank">
                                                <button className="btn acciones-norma"
                                                    title="Ver Norma" >
                                                    <FaEye />
                                                </button>
                                            </Link>
                                        </td>
                                        <td class="accion">
                                            <button className="btn acciones-norma"
                                                onClick={() => cambiarNormaAsignacion(n)}>
                                                {(normasNoAsignadas.map(n => n.idNorma).includes(n.idNorma)) ?
                                                    (<FaArrowLeft title="No asignar" />) :
                                                    (<FaArrowRight title="Asignar" />)}
                                            </button>
                                        </td>
                                        <td class="accion">
                                            <button className="btn acciones-norma"
                                                onClick={() => navigate(`../../${rutasBO.normas}/${n.idNorma}/${rutasBO.editar_solicitud}`, { state: { idNorma: n.idNorma } })}
                                                title="Editar" >
                                                <FaEdit />
                                            </button>
                                        </td>
                                        <td class="accion">
                                            {(anexos.length > 0) && (anexos.filter(a => a.idNorma === n.idNorma).length > 0) ?
                                            (<>
                                                    <div class="dropdown-container">
                                                        <div class="drowdown">
                                                            <button className="btn acciones-norma"
                                                                data-toggle="dropdown"
                                                                aria-haspopup="true"
                                                                aria-expanded="false"
                                                                title="Anexos"
                                                            >
                                                                <FaPaperclip />
                                                            </button>
                                                            <div class="dropdown-menu">
                                                                {(anexos.filter(a => a.idNorma === n.idNorma).length > 0) ?(anexos.filter(a => a.idNorma === n.idNorma)).map(a =>
                                                                            <button class="dropdown-item btn-sm"
                                                                                type="button"
                                                                                onClick={() => mostrarAnexo(a)}
                                                                            >{a.normaAnexoArchivo}
                                                                            </button>
                                                                        )
                                                                        : ('No hay anexos disponibles.')
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                            </>
                                            ):(<></>)}
                                        </td>
                                        <td class="accion">
                                            <input id={asignada ? `normaAsignada-${n.idNorma}` : `normaNoAsignada-${n.idNorma}`}
                                                type="checkbox" class="acciones-norma" onChange={(e) => {
                                                    asignada ? checkNormaAsignada(e, n) : checkNormaNoAsignada(e, n)
                                                }} checked={asignada ? checkedNormasAsignadas.includes(n) : checkedNormasNoAsignadas.includes(n)}>
                                            </input>
                                        </td>
                                    </tr>
                                ))
                            )
                                : (<tr><td>Sin normas...</td></tr>)
                        }
                    </tbody>
                </table>
                Total: {normas.length}
                {
                    asignada && (
                        <div style={{ textAlign: 'right' }}>
                            <button onClick={(e) => cambiarNormaAsignacionLista(checkedNormasAsignadas)} disabled={!isButtonEnabledAsignada} className="btn btn-primary btn-sm"><FaArrowRight class="acciones-norma" title="No asignar seleccionadas" /></button>
                        </div>)
                }
                {
                    !asignada && (
                        <div style={{ textAlign: 'right' }}>
                            <button onClick={(e) => cambiarNormaAsignacionLista(checkedNormasNoAsignadas)} disabled={!isButtonEnabledaNoAsignada} className="btn btn-primary btn-sm"><FaArrowLeft class="acciones-norma" title="Asignar Seleccionadas" /></button>
                        </div>)
                }

            </div>
        )
    }

    const handlePDF = async (e, idBoletin, fechaPublicacion) => {
        e.preventDefault();

        // Pone el cursor de loading
        document.body.style.cursor = 'wait';

        setPuedoGuardar(true)
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/vista-previa', body, token)
                .then(res => {
                    let blob = b64toBlob(res.data, 'application/pdf')
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    const today = moment(fechaPublicacion)
                    let mes = today.format('MM');
                    let dia = today.format('DD');
                    let anio = today.format('YYYY');

                    link.download = `${anio}${mes}${dia}.pdf`
                    link.click()

                    setPuedoGuardar(false)

                })
        }
        catch (error) {
            setPuedoGuardar(false)
            //console.log(error);
        }

        // Vuelve el cursor normal
        document.body.style.cursor = 'default';
    }

    async function guardarCambiosBoletin(norma) {
        setLoadingEdicionBoletin(true)
        try {
            let normasAsignadasFiltradas = normasAsignadas.filter(n => seccionesSeleccionadas.includes(n.idSeccion))
            if (normasAsignadasFiltradas.filter(n => n.idNorma === norma.idNorma).length === 0) {
                normasAsignadasFiltradas.push(norma)
            }
            else {
                normasAsignadasFiltradas = normasAsignadasFiltradas.filter(n => n.idNorma !== norma?.idNorma)
            }
            let boletinEditado = boletin;
            boletinEditado.boletinSecciones = JSON.stringify({ secciones: seccionesSeleccionadas });
            boletinEditado.normas = normasAsignadasFiltradas.map(n => n.idNorma);
            let body = {
                usuario: parseInt(localStorage.idUsuarioBO),
                ...boletinEditado
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/editar', body, token).then((res) => {
                //console.log(res.data)
                setLoadingEdicionBoletin(false)
                setNormasAsignadas([...normasAsignadasFiltradas]);
            })

        }
        catch (error) {
            setLoadingEdicionBoletin(false)
            throw error;
        }
    }

    async function cambiarNormaAsignacion(norma) {
        await guardarCambiosBoletin(norma)
            .then((res) => {
                let idsAsignadas = normasAsignadas.map(n => n.idNorma)
                if (idsAsignadas.includes(norma.idNorma)) {
                    let noAsignadas = normasNoAsignadas;
                    let asignadas = normasAsignadas.filter(n => n.idNorma !== norma.idNorma);
                    setNormasAsignadas(Array.from(asignadas))
                    noAsignadas.push(norma)
                    setNormasNoAsignadas(Array.from(noAsignadas))
                }
                else {
                    let noAsignadas = normasNoAsignadas.filter(n => n.idNorma !== norma.idNorma);
                    let asignadas = normasAsignadas;
                    setNormasNoAsignadas(Array.from(noAsignadas))
                    asignadas.push(norma)
                    setNormasAsignadas(Array.from(asignadas))
                }
            })
            .catch((error) => {
                //console.log(error)
            })
    }
    async function cambiarNormaAsignacionLista(normas) {
        setLoadingEdicionBoletin(true)
        try {
            let normasAsignadasFiltradas = normasAsignadas.filter(n => seccionesSeleccionadas.includes(n.idSeccion))
            if (normasAsignadasFiltradas.filter(n => normas.map(n => n.idNorma).includes(n.idNorma)).length === 0) {
                normasAsignadasFiltradas.push(...normas)
                console.log(normasAsignadasFiltradas)
            }
            else {
                normasAsignadasFiltradas = normasAsignadasFiltradas.filter(n => !(normas.map(n => n.idNorma).includes(n.idNorma)))
            }
            let boletinEditado = boletin;
            boletinEditado.boletinSecciones = JSON.stringify({ secciones: seccionesSeleccionadas });
            boletinEditado.normas = normasAsignadasFiltradas.map(n => n.idNorma);
            let body = {
                usuario: parseInt(localStorage.idUsuarioBO),
                ...boletinEditado
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/editar', body, token)
            const copiaAsignadas = [...normasAsignadas]
            const copiaNoAsignadas = [...normasNoAsignadas]

            normas.forEach(norma => {
                if (normasAsignadas.includes(norma)) {
                    let index = copiaAsignadas.indexOf(norma)
                    if (index !== -1) { copiaAsignadas.splice(index, 1) }
                    copiaNoAsignadas.push(norma)
                } else {
                    let index = copiaNoAsignadas.indexOf(norma)
                    if (index !== -1) { copiaNoAsignadas.splice(index, 1) }
                    copiaAsignadas.push(norma)
                }
                setCheckedNormasAsignadas([])
                setCheckedNormasNoAsignadas([])
                setNormasAsignadas(copiaAsignadas);
                setNormasNoAsignadas(copiaNoAsignadas)
            })
            setLoadingEdicionBoletin(false)
        }
        catch (error) {
            console.log(error)
            setLoadingEdicionBoletin(true)
            throw error;
        }
        /* const promises = normas.map(norma => guardarCambiosBoletin(norma));
    
        await Promise.allSettled(promises)
            .then((results) => {
                const copiaAsignadas = [...normasAsignadas]
                const copiaNoAsignadas = [...normasNoAsignadas]
                
                normas.forEach(norma => {
                    if (normasAsignadas.includes(norma)){
                        let index = copiaAsignadas.indexOf(norma)
                        if (index !== -1){copiaAsignadas.splice(index,1)}
                        console.log("Copia de Asignadas",copiaAsignadas)
                        copiaNoAsignadas.push(norma)
                    }else{
                        let index = copiaNoAsignadas.indexOf(norma)
                        if (index !== -1){copiaNoAsignadas.splice(index,1)}
                        console.log("Copia de No Asignadas",copiaNoAsignadas)
                        copiaAsignadas.push(norma)
                    }
                    setCheckedNormasAsignadas([])
                    setCheckedNormasNoAsignadas([])
                    setNormasAsignadas(copiaAsignadas);
                    setNormasNoAsignadas(copiaNoAsignadas)                    
                })
            })
            .catch((error) => {
                // Manejo de errores
            }); */

    }



    function salirDeBoletin(e) {
        e.preventDefault();
        navigate('/crear-boletin', { state: {} })

    }

    async function mostrarAnexo(anexo) {
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: anexo.normaAnexoArchivoS3Key }, token).then((res) => {
            let blob = b64toBlob(res.data, 'application/pdf')
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl)
        }).catch(e => { /* console.log(e) */ })
    }

    //Hook inicial
    useEffect(async () => {
        if (location.state != null && location.state.idBoletin) {
            const dataBoletin = await getBoletin(location.state.idBoletin);
            await getNormas(location.state.idBoletin)
            await getSecciones()
            if (dataBoletin && dataBoletin.fechaPublicacion && dataBoletin.normas) {
                await getNormasNoAsignadas(dataBoletin.fechaPublicacion)
            }
            setLoading(false)
        }
        else {
            setError('Ocurrió un error al intentar traer este boletín.')
        }

    }, [])

    useEffect(async () => {
        if (boletin && boletin.fechaPublicacion) {
            await getNormasNoAsignadas(boletin.fechaPublicacion)
        }
    }, [boletin])


    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                {loadingEdicionBoletin && <div id="backdrop"><Spinner /></div>}
                <header className="pt-4 pb-3 mb-4">
                    <div className="container">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                                <li className="breadcrumb-item"><Link to={'..'}>Boletines</Link></li>
                                <li className="breadcrumb-item">Diseñador: Alta de BO</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container" id="pagina-generar-boletin">
                    <header>
                        <div className="row align-items-center">
                            <div className="col">
                                <h1>Diseñador: Alta de BO</h1>
                            </div>
                            <div className="col">
                            </div>
                            <div classNAme="col text-right">
                                <h3>{'Fecha Boletín: ' + moment(boletin.fechaPublicacion).format('DD/MM/YYYY')}</h3>
                                <button type="button" class="btn btn-primary btn-sm text-right" onClick={(e) => handlePDF(e, boletin.idBoletin, boletin.fechaPublicacion)} disabled={puedoGuardar}>Vista Previa</button>
                            </div>
                        </div>
                    </header>
                    <hr />
                    <div className="container responsive">
                        <div class="secciones-seleccion m-0">
                            <h2>Secciones</h2>
                            {secciones && (secciones.length > 0 ? (SelectorSecciones()) : (''))}
                        </div>
                        <div class="codigos-colores mb-1">
                            <div><div class="sin-color" />No revisada</div>
                            <div><div class="color-celeste" />Revisada</div>
                            <div><div class="color-naranja" />Ya se publicaron</div>
                            <div><div class="color-rojo" />Observada</div>
                            <button class="btn m-2" onClick={() => window.location.reload()}>
                                Actualizar <GrUpdate />
                            </button>
                        </div>
                        <div>
                            <div className="accordion" id="accordionSeccion">
                                {seccionesSeleccionadas && (seccionesSeleccionadas.length > 0 ? ((secciones.filter(c => seccionesSeleccionadas.includes(c.idSeccion))).map(c => <SeccionNormas seccion={c} />)) : (''))}
                            </div>
                        </div>
                        {/*                         <div className="botones">
                            <button className="btn btn-secondary" id="boton-volver" onClick={(e) => salirDeBoletin(e)}>
                                Volver
                            </button>
                            <button className="btn btn-primary" id="boton-guardar-cambios" onClick={(e) => guardarCambiosBoletin(e)}>
                                Guardar cambios
                            </button>
                        </div> */}
                    </div>
                </div>
            </>
        );

    }

};

export default GenerarBoletin;
