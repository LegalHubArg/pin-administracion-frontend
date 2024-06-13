import React, { useEffect, useState } from "react";
//Obelisco
import '@gcba/obelisco/dist/obelisco.css';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import b64toBlob from 'b64-to-blob';
import { Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const Anexos = props => {

    const { fecha } = useParams();

    const [isLoading, setLoading] = useState(false)
    const [guardadoCorrectamente, setGuardadoCorrectamente] = useState(false);
    const [errorGuardado, setErrorGuardado] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [anexoSeleccionado, setAnexoSeleccionado] = useState(null);
    const [ramas, setRamas] = useState([]);
    const [opcionRadio, setOpcionRadio] = useState('firmar-generado');
    const [loadingPdf, setLoadingPdf] = useState(false)
    const [anexosFirmados, setAnexosFirmados] = useState([])
    const [documentoFirmado, setDocumentoFirmado] = useState()
    const [extensionesPermitidas, setExtensionesPermitidas] = useState()
    const [modalError, setModalError] = useState({ show: false, mensaje: '' })
    const [limiteArchivo,setLimiteArchivo] = useState()


    const leerArchivo = (archivo) => {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            try {
                fileReader.readAsDataURL(archivo);
                fileReader.onloadend = () => {
                    resolve(fileReader.result)
                }
            }
            catch (e) {
                reject(e)
            }
        })
    }

    const traerExtensiones = async () => {
        const { data: { data } } = await ApiPinGet('/api/v1/auth/extensiones', localStorage.token);

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
      }

    const firmarDocumento = async () => {
        setLoading(true)
        let token = localStorage.getItem("token");
        let body = {
            usuario: localStorage.getItem('user_cuit'),
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
            idAnexoDJ: anexoSeleccionado.idAnexoDJ,
            idRama: anexoSeleccionado.idRama,
            fecha
        }
        try {
            if (opcionRadio === 'cargar-otro' && documentoFirmado) {
                await ApiPinPost('/api/v1/dj/cargar-anexo-firmado', { ...body, ...documentoFirmado }, token)
                    .then(_ => {
                        window.location.reload()
                    })
                    .catch((err) => {
                        throw err
                    })
            }
            else {
                await ApiPinPost('/api/v1/dj/firmar-anexo', body, token)
                    .then(_ => {
                        window.location.reload()
                    })
                    .catch((err) => {
                        throw err
                    })
            }
        }
        catch (error) {
            setLoading(false)
            setErrorGuardado(true)
            setGuardadoCorrectamente(false)
        }
    }

    const traerAnexoPorTipo = async (ruta) => {
        setLoadingPdf(true)
        let token = localStorage.getItem("token");
        try {
            await ApiPinPost(`/api/v1/dj/${ruta}`, { fecha }, token)
                .then(res => {
                    let blob = b64toBlob(res.data.data, 'application/pdf');
                    let fileURL = URL.createObjectURL(blob);
                    window.open(fileURL);
                    setLoadingPdf(false)
                })
                .catch((err) => {
                    throw err
                })
        }
        catch (error) {
            setLoadingPdf(false)
        }
    }

    const traerAnexoIPorRama = async (idRama) => {
        setLoadingPdf(true)
        let token = localStorage.getItem("token");
        try {
            await ApiPinPost(`/api/v1/dj/anexoI`, { idRama, fecha }, token)
                .then(res => {
                    let blob = b64toBlob(res.data.data, 'application/pdf');
                    let fileURL = URL.createObjectURL(blob);
                    window.open(fileURL);
                    setLoadingPdf(false)
                })
                .catch((err) => {
                    throw err
                })
        }
        catch (error) {
            setLoadingPdf(false)
        }
    }

    useEffect(async () => {
        setLoading(true)
        await traerExtensiones();
        await traerLimiteArchivo()
        await ApiPinPost('/api/v1/sdin/ramas', { usuario: localStorage.getItem("user_cuit") }, localStorage.getItem("token"))
            .then((res) => {
                setRamas(res.data.ramas);
            })
            .catch(err => { })
        let body = { fecha, usuario: localStorage.getItem('user_cuit') }
        await ApiPinPost('/api/v1/dj/anexos-firmados', body, localStorage.getItem("token"))
            .then((res) => {
                setAnexosFirmados(res.data.data);
            })
            .catch(err => { })
        setLoading(false)
    }, [])

    const handleDocumento = async (e) => {
        let aux = {};
        let docSize = e.target.files[0].size
        if (Array.from(e.target.files).some(n => !extensionesPermitidas.includes(n.type))) {
            setModalError({ show: true, mensaje: "El tipo de archivo que intenta ingresar no está permitido en PIN." })
            setDocumentoFirmado();
            return;
        }
        if (docSize && docSize > limiteArchivo){
            setModalError({ show: true, mensaje: "El archivo supera el límite permitido en PIN." })
            setDocumentoFirmado();
            return;
        }
        await leerArchivo(e.target.files[0])
            .then((res) => {
                aux.base64 = res;
                aux.archivo = e.target.files[0].name;
            })
            .catch((e) => {
                //console.log(e)
            })
        setDocumentoFirmado(aux)
    }

    const abrirDocumento = async (e, doc) => {
        e.preventDefault();
        try {
            document.body.style.cursor = 'wait';
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/traerArchivoBucketS3', { nombre: doc }, token)
                .then(res => {
                    let blob = b64toBlob(res.data, 'application/pdf')
                    let link = URL.createObjectURL(blob)
                    window.open(link)
                    document.body.style.cursor = 'default';
                })
                .catch(error => {
                    document.body.style.cursor = 'default';
                    throw error
                });
        }
        catch (e) {
            //console.log(e)
        }
    }

    useEffect(() => { if (showModal) setOpcionRadio("firmar-generado") }, [showModal])

    useEffect(() => {
        if (loadingPdf) document.body.style.cursor = 'progress'
        else document.body.style.cursor = 'default'
    }, [loadingPdf])

    if (isLoading)
        return <Spinner />
    else
        return (
            <>
                <div className="container responsive">
                    <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
                        Anexo I (Listado)
                        {(anexosFirmados.find(n => n.idAnexoDJ === 1 && n.idRama === null)) ?
                            <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={(e) => { abrirDocumento(e, anexosFirmados.find(elem => elem.idAnexoDJ === 1).archivoS3) }}>Ver documento</button>
                            : <><button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoI/listado')}>Generar PDF</button>
                                <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={() => { setAnexoSeleccionado({ numero: 'I', idAnexoDJ: 1, idRama: null }); setShowModal(true) }}>Firma</button></>
                        }
                    </div>
                    <ul>
                        {ramas && ramas.map((elem) => (
                            <li style={{ marginBlock: "1em" }}>
                                {elem.rama}
                                {anexosFirmados.find(n => n.idAnexoDJ === 1 && n.idRama === elem.idRama) ?
                                    <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={(e) => { abrirDocumento(e, anexosFirmados.find(n => n.idAnexoDJ === 1 && elem.idRama === n.idRama).archivoS3) }}>Ver documento</button>
                                    : <><button type="button" disabled={loadingPdf} className="btn btn-link btn-sm ml-5" onClick={() => traerAnexoIPorRama(elem.idRama)}>Generar PDF</button>
                                        <button type="button" disabled={loadingPdf} className="btn btn-primary btn-sm ml-2" onClick={() => { setAnexoSeleccionado({ numero: String('I: ' + elem.rama), idAnexoDJ: 1, idRama: elem.idRama }); setShowModal(true) }}>Firma</button></>
                                }
                            </li>
                        ))}
                    </ul>
                    <hr />
                    <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
                        Anexo II
                        {(anexosFirmados.find(n => n.idAnexoDJ === 2)) ?
                            <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={(e) => { abrirDocumento(e, anexosFirmados.find(elem => elem.idAnexoDJ === 2).archivoS3) }}>Ver documento</button>
                            : <>
                                <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoII')}>Generar PDF</button>
                                <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={() => { setAnexoSeleccionado({ numero: 'II', idAnexoDJ: 2, idRama: null }); setShowModal(true) }}>Firma</button>
                            </>}
                    </div>
                    <hr />
                    <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
                        Anexo III
                        {(anexosFirmados.find(n => n.idAnexoDJ === 3)) ?
                            <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={(e) => { abrirDocumento(e, anexosFirmados.find(elem => elem.idAnexoDJ === 3).archivoS3) }}>Ver documento</button>
                            : <>
                                <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoIII')}>Generar PDF</button>
                                <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={() => { setAnexoSeleccionado({ numero: 'III', idAnexoDJ: 3, idRama: null }); setShowModal(true) }}>Firma</button>
                            </>}
                    </div>
                    <hr />
                    <div style={{ fontSize: "1.5em", marginBlock: "1em" }}>
                        Anexo IV
                        {(anexosFirmados.find(n => n.idAnexoDJ === 4)) ?
                            <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={(e) => { abrirDocumento(e, anexosFirmados.find(elem => elem.idAnexoDJ === 4).archivoS3) }}>Ver documento</button>
                            : <>
                                <button type="button" disabled={loadingPdf} className="btn btn-link ml-5" onClick={() => traerAnexoPorTipo('anexoIV')}>Generar PDF</button>
                                <button type="button" disabled={loadingPdf} className="btn btn-primary ml-2" onClick={() => { setAnexoSeleccionado({ numero: 'IV', idAnexoDJ: 4, idRama: null }); setShowModal(true) }}>Firma</button>
                            </>}
                    </div>

                    <Modal show={showModal} onHide={() => setShowModal(false)}>

                        <Modal.Header>
                            <Modal.Title>Firmar Anexo {anexoSeleccionado?.numero}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div class="custom-control custom-radio">
                                <input
                                    class="custom-control-input"
                                    type="radio"
                                    name="tipo-firma"
                                    id="firmar-generado"
                                    value="firmar-generado"
                                    checked={opcionRadio === "firmar-generado"}
                                    onChange={(e) => setOpcionRadio(e.target.value)}
                                />
                                <label className="custom-control-label" for="firmar-generado">
                                    Firmar Documento Generado.
                                </label>
                            </div>
                            <div class="custom-control custom-radio">
                                <input
                                    class="custom-control-input"
                                    type="radio"
                                    name="tipo-firma"
                                    id="cargar-otro"
                                    value="cargar-otro"
                                    checked={opcionRadio === "cargar-otro"}
                                    onChange={(e) => setOpcionRadio(e.target.value)}
                                />
                                <label className="custom-control-label" for="cargar-otro">
                                    Cargar Manualmente un <b>Documento Firmado</b>.
                                </label>
                            </div>
                            {opcionRadio === "cargar-otro" && <>
                                <input type="file" className="form-control-file m-2" id="file-input" onChange={(e) => handleDocumento(e)} accept={extensionesPermitidas} />
                            </>}
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-link" onClick={() => setShowModal(false)} data-dismiss="modal">
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={() => firmarDocumento()}>
                                Aceptar
                            </button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <Modal show={modalError?.show} onHide={() => setModalError({ show: false, mensaje: '' })}>
                    <Modal.Header className='d-flex justify-content-between'>Error<i type="button" className="bx bx-x" style={{ justifySelf: "end" }} onClick={_ => setModalError({ show: false, mensaje: '' })} /></Modal.Header>
                    <Modal.Body>
                        <div className="alert alert-danger">{modalError.mensaje}</div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        );
};

export default Anexos;
