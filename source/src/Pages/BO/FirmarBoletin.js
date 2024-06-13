import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import './FirmarBoletin.css';
import moment from 'moment';
import { FaRegWindowRestore, FaTimes } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { rutasBO } from '../../routes';
const b64toBlob = require('b64-to-blob');

const GenerarBoletin = props => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)

    const [boletinFirmado, setBoletinFirmado] = useState({})
    const [separatasFirmadas, setSeparatasFirmadas] = useState([])
    const [validaForm, setValidaForm] = useState(false)
    const [boletinDisponible, setBoletinDisponible] = useState('')
    const [separatasDisponibles, setSeparatasDisponibles] = useState([])
    const [cargandoDocumentosDisponibles, setCargandoDocumentosDisponibles] = useState(true)
    const [firmaExitosa, setFirmaExitosa] = useState(false)
    const [errorFirmaGEDO, setErrorFirmaGEDO] = useState(null)
    const [errorCargaManual, setErrorCargaManual] = useState(null)
    const [extensionesPermitidas, setExtensionesPermitidas] = useState()
    const [modalError, setModalError] = useState({ show: false, mensaje: '' })
    const [limiteArchivo,setLimiteArchivo] = useState()

    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });

    const traerExtensiones = async () => {
        const { data: {data} } = await ApiPinGet('/api/v1/auth/extensiones', localStorage.token);
    
        setExtensionesPermitidas(data)
    }
    const traerLimiteArchivo = async () =>{
        await ApiPinGet('/api/v1/auth/limiteArchivo', localStorage.token)
          .then(res=>{
            setLimiteArchivo(parseInt(res.data.data))
          })
          .catch(err=>{
            throw Error(String(err))
          })
        //setLimiteArchivo(data)
    }

    const BotonEliminarArchivo = ({ indice, tipo }) => {
        function eliminarArchivo(indice, tipo) {
            switch (tipo) {
                case 'boletin':
                    setBoletinFirmado({})
                    break;
                case 'separata':
                    let auxSeparatas = [...separatasFirmadas]
                    auxSeparatas.splice(indice, 1)
                    setSeparatasFirmadas(auxSeparatas)
                    break;
            }
        }
        return (
            <>
                <button class="btn" onClick={() => eliminarArchivo(indice, tipo)}><FaTimes color="red" /></button>
            </>
        )
    }

    const traerDocumentosDisponibles = async () => {
        setCargandoDocumentosDisponibles(true)
        try {
            let token = localStorage.getItem("token");
            let body = {
                idBoletin: location.state.boletin.idBoletin,
                usuario: localStorage.getItem("user_cuit"),
                fechaPublicacion: location.state.boletin.fechaPublicacion,
                boletinNumero: location.state.boletin.numero
            };
            await ApiPinPost(
                '/api/v1/boletin-oficial/boletin/descargar-boletin-pdf',
                body, token
            ).then(res => {
                setBoletinDisponible(res.data)
            })
                .catch(err => {
                    throw err;
                })
            await ApiPinPost(
                '/api/v1/boletin-oficial/boletin/descargar-separata-pdf',
                body, token
            ).then(res => {
                setSeparatasDisponibles([(res.data)])
            })
                .catch(err => {
                    throw err;
                })
            setCargandoDocumentosDisponibles(false)
        }
        catch (err) {
            setCargandoDocumentosDisponibles(false)
            throw err
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        setErrorCargaManual(null)
        setErrorFirmaGEDO(null)
        try {
            let token = localStorage.getItem("token");
            let body = {
                idBoletin: location.state.boletin.idBoletin,
                usuario: localStorage.idUsuarioBO,
                cuit: localStorage.getItem("user_cuit"),
                archivoBoletin: boletinFirmado,
                anexos: separatasFirmadas
            };
            await ApiPinPost('/api/v1/boletin-oficial/boletin/firmar', body, token)
                .then(res => {
                    // console.log(res)
                })
                .catch(err => {
                    throw err;
                })
            setFirmaExitosa(true)
        }
        catch (error) {
            // console.log(error)
            setErrorCargaManual('Error al guardar los documentos.')
        }
        finally {
            setLoading(false)
        }
    };

    const handleFirmaGEDO = async (e) => {
        e.preventDefault();
        setErrorFirmaGEDO(null)
        setErrorCargaManual(null)
        setLoading(true)
        try {
            let token = localStorage.getItem("token");
            let body = {
                idBoletin: location.state.boletin.idBoletin,
                usuario: localStorage.idUsuarioBO,
                cuit: localStorage.getItem("user_cuit"),
                archivoBoletin: boletinDisponible,
                archivosSeparata: separatasDisponibles
            };
            await ApiPinPost('/api/v1/boletin-oficial/boletin/firmarGEDO', body, token)
                .then(res => {
                    // console.log(res)
                })
                .catch(err => {
                    throw err;
                })
            setFirmaExitosa(true)
        }
        catch (error) {
            setLoading(false)
            // console.log(error)
            setErrorFirmaGEDO(error.data.mensaje)
        }
    };

    const cargarBoletin = async (e) => {
        e.preventDefault();
        let docSize = e.target.files[0].size
        if (!extensionesPermitidas.includes(e.target.files[0].type)) {
          setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
          document.getElementById("file-input-boletin").value = null;
          document.getElementById("file-input-boletin").files = null;
          return;
        }
        if (docSize > limiteArchivo){
            setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
            document.getElementById("file-input-boletin").value = null;
            document.getElementById("file-input-boletin").files = null;
            return;
          }
        await convertirABase64(e.target.files[0])
            .then(res => {
                setBoletinFirmado({ nombre: e.target.files[0].name, base64: res.split(',') })
                // console.log(res)
            })
            .catch(err => {
                // console.log(err)
            })
        document.getElementById("file-input-boletin").value = null;
        document.getElementById("file-input-boletin").files = null;
    };

    const cargarSeparatas = async (e) => {
        e.preventDefault();
        let files = [...(e.target.files)]
        let auxArray = [...separatasFirmadas];
        let docSize = e.target.files[0].size
        if (!extensionesPermitidas.includes(e.target.files[0].type)) {
            setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
            setSeparatasFirmadas([...auxArray])
            document.getElementById("file-input-separata").value = null;
            document.getElementById("file-input-separata").files = null;
            return;
          }
        if(docSize > limiteArchivo){
            setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
            setSeparatasFirmadas([...auxArray])
            document.getElementById("file-input-separata").value = null;
            document.getElementById("file-input-separata").files = null;
            return;
        }
        
        for (const separata of files) {
            await convertirABase64(separata)
                .then(res => {
                    auxArray.push({ archivo: separata.name, base64: res.split(','), nombre: '', principal: auxArray.length === 0 })
                })
                .catch(err => {
                    // console.log(err)
                })
        }
        setSeparatasFirmadas([...auxArray])
        document.getElementById("file-input-separata").value = null;
        document.getElementById("file-input-separata").files = null;
    };

    const convertirABase64 = async (doc) => {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(doc);
            fileReader.onloadend = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = error => {
                reject(error);
            }
        })
    }

    const handleSeparata = async (e, i) => {
        let auxSeparatas = [...separatasFirmadas];
        switch (e.target.name) {
            case 'nombre':
                auxSeparatas[i].nombre = e.target.value;
                break;
            case 'descripcion':
                auxSeparatas[i].descripcion = e.target.value;
                break;
            case 'principal':
                auxSeparatas = auxSeparatas.map(n => ({ ...n, principal: false, nombre: '' }));
                auxSeparatas[i].principal = true;
                break;
        }
        setSeparatasFirmadas(auxSeparatas)
    }

    //Hook inicial
    useEffect(async () => {
        let es_usuario_de_firma = false;
        await traerExtensiones()
        await traerLimiteArchivo()
        await ApiPinGet('/api/v1/auth/usuario-firma', localStorage.getItem('token'))
            .then(_ => es_usuario_de_firma = true)
            .catch(_ => es_usuario_de_firma = false)

        if (location.state != null && location.state.boletin && es_usuario_de_firma) {
            setLoading(false)
            // console.log(location.state.boletin)
            await traerDocumentosDisponibles();
        }
        else {
            navigate('/', { state: {}, replace: true })
        }

    }, [])

    useEffect(() => {
        // console.log(boletinFirmado, separatasFirmadas)
        if (boletinFirmado.base64) {
            setValidaForm(true)
        }
        else {
            setValidaForm(false)
        }
    }, [boletinFirmado, separatasFirmadas])

    useEffect(() => {
        if (firmaExitosa) {
            navigate('..', { state: {}, replace: true })
        }
    }, [firmaExitosa])

    const verDocumento = (base64) => {
        const blob = b64toBlob(base64, 'application/pdf');
        const url = URL.createObjectURL(blob);
        window.open(url)
    }

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <header className="pt-4 pb-3 mb-4">
                    <div className="container">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={'/'}>Boletín Oficial</Link></li>
                                <li className="breadcrumb-item"><Link to={'..'}>Boletines</Link></li>
                                <li className="breadcrumb-item">Firmar Boletin</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">{
                            "Firma de Documentos - Boletin N°" +
                            (location.state.boletin.numero || " ") + " - " +
                            moment(location.state.boletin.fechaPublicacion.split('T')[0]).format('DD/MM/YYYY')
                        }
                        </h1>
                    </header>
                    <hr />
                    <div className="container responsive mb-5" id="pagina-firma-boletin">
                        <br />
                        <h2>Firma Automática</h2>
                        <hr />
                        <h3>Documentos disponibles en la plataforma para el Boletin N° {location.state.boletin.numero}:</h3>
                        {(boletinDisponible && boletinDisponible.length > 0) ? (
                            <button class="btn btn-link" id="ver-boletin" onClick={() => verDocumento(boletinDisponible)}>
                                Boletin Oficial <FaRegWindowRestore style={{ marginLeft: "1em" }} /> Ver Documento
                            </button>
                        ) : ('')}
                        <br />
                        {(separatasDisponibles && separatasDisponibles.length > 0) ? (
                            separatasDisponibles.map(separata => (
                                <>
                                    <button class="btn btn-link ver-separata" onClick={() => verDocumento(separata)}>
                                        Separata <FaRegWindowRestore style={{ marginLeft: "1em" }} /> Ver Documento
                                    </button>
                                    <br />
                                </>
                            ))
                        ) : ('')}
                        {cargandoDocumentosDisponibles && <h4>Buscando documentos... <div id="loading-wheel" /></h4>}
                        <br />
                        <button class="btn btn-lg mb-5" id="boton-firma-automatica"
                            onClick={(e) => handleFirmaGEDO(e)}
                            disabled={cargandoDocumentosDisponibles}>
                            Firmar Documentos
                        </button>
                        {errorFirmaGEDO && <div class="alert-wrapper">
                            <div class="alert alert-danger" role="alert">
                                <p>{errorFirmaGEDO}</p>
                            </div>
                        </div>}
                        <h2>Carga Manual de Documentos Firmados</h2>
                        <hr />
                        <div id="firma-manual">
                            <form className="form" onSubmit={e => handleSubmit(e)}>
                                <h3>Cargar Boletin Oficial Firmado</h3>
                                <div className="form-group carga-boletin">
                                    <input type="file" className="form-control-file" id="file-input-boletin"  accept={extensionesPermitidas}
                                        onChange={(e) => { cargarBoletin(e) }} />
                                </div>
                                <br />
                                <h3>Cargar Anexos Firmados</h3>
                                <div className="form-group carga-separatas">
                                    <input type="file" multiple className="form-control-file" id="file-input-separata"
                                        onChange={(e) => { cargarSeparatas(e) }}  accept={extensionesPermitidas} />
                                </div>
                                <br />
                                {errorCargaManual && <div class="alert-wrapper">
                                    <div class="alert alert-danger" role="alert">
                                        <p>{errorCargaManual}</p>
                                    </div>
                                </div>}
                                <button type="submit" className="btn btn-primary" disabled={!validaForm} id="enviar-observacion">
                                    Guardar
                                </button>
                            </form>
                            <div className="card" id="card-boletin-firmado">
                                <div >
                                    {
                                        (boletinFirmado && boletinFirmado.base64) ? (
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                {boletinFirmado.nombre}
                                                <BotonEliminarArchivo tipo="boletin" />
                                            </div>
                                        ) : ("No se ingresó Boletin")
                                    }
                                </div>
                                <hr />
                                <div style={{ maxHeight: "140px", maxWidth: "600px", overflowY: "auto" }}>
                                    {separatasFirmadas && separatasFirmadas.length > 0 ? (
                                        separatasFirmadas.map((separata, index) =>
                                            <div class="form-wrapper bg-light mb-2" style={{ display: "flex", alignItems: "center" }}>
                                                {separata.archivo}
                                                <BotonEliminarArchivo indice={index} tipo="separata" />
                                                <div class="custom-control custom-radio">
                                                    <input
                                                        className="custom-control-input"
                                                        type="radio"
                                                        name="principal"
                                                        id={"principal" + index}
                                                        defaultChecked={separata?.principal}
                                                        onChange={(e) => handleSeparata(e, index)}
                                                    />
                                                    <label className="custom-control-label" for={"principal" + index}>
                                                        Principal
                                                    </label>
                                                </div>
                                                {!separata?.principal && <input type="text" className="form-control form-control-sm m-1"
                                                    value={separata?.nombre} name="nombre" placeholder="Nombre del anexo"
                                                    onChange={e => handleSeparata(e, index)} style={{ maxWidth: "250px" }} />}
                                            </div>
                                        )) : ('No se ingresó ningún Anexo')}
                                </div>
                            </div>
                            <br />
                        </div>
                    </div>
                </div>
                
        
                <Modal show={modalError?.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
                <Modal.Header>
                    <Modal.Title>Error</Modal.Title>
                    <i className='bx bx-x bx-sm' type="button" onClick={() => setModalError({ show: false, mensaje: '' })}></i>
                </Modal.Header>
                <Modal.Body>
                    <div class="alert alert-danger" role="alert">
                    <p>{modalError?.mensaje}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
                </Modal>
            </>
        );

    }

};

export default GenerarBoletin;