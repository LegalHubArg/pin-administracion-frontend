import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
import moment from "moment";
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { Modal } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { rutasBO } from '../../routes';

const b64toBlob = require('b64-to-blob');

const VistaDocumentosBoletin = props => {

    const location = useLocation();
    const navigate = useNavigate();
    const [boletinData, setBoletinData] = useState({})
    const [documentos, setDocumentos] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [documentoAReemplazar, setDocumentoAReemplazar] = useState({})
    const [extensionesPermitidas, setExtensionesPermitidas] = useState()
    const [limiteArchivo,setLimiteArchivo] = useState()


    //HOOK INICIO
    useEffect(async () => {
        setLoading(true)
        await getBoletin();
        await traerExtensiones()
        await traerLimiteArchivo()
    }, [])

    useEffect(async () => {
        // console.log(boletinData)
        if (Object.keys(boletinData).length > 0) {
            setLoading(true)
            await getDocumentos();
            setLoading(false)
        }
    }, [boletinData])

    const getBoletin = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: location.state.idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin', body, token)
                .then(res => {
                    setBoletinData(res.data.data)
                    // console.log(res.data.data[0])
                })
                .catch(error => {
                    throw error
                });
        }
        catch (error) {
            // console.log(error);
        }
    }

    const getDocumentos = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idBoletin: boletinData.idBoletin
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/traerDocumentosPublicados', body, token)
                .then(res => {
                    setDocumentos(res.data)
                    // console.log(res)
                })
                .catch(error => {
                    throw error
                });
        }
        catch (error) {
            // console.log(error);
        }
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
    const descargaDocumento = async (e, doc) => {
        e.preventDefault();
        try {
            document.body.style.cursor = 'wait';
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/traerArchivoFirmadoBucketS3', { nombre: doc.archivoBoletin || doc.archivoAnexo || doc.archivoNorma }, token)
                .then(res => {
                    /* let tipoArchivo = '';
                    if (doc.archivoNorma && doc.archivoNorma.substring(doc.archivoNorma.length - 4) === '.doc') {
                        tipoArchivo = 'msword'
                    } else { tipoArchivo = 'pdf' }; // console.log('application/' + tipoArchivo) */
                    let blob = b64toBlob(res.data, 'application/pdf')
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = `${doc.nombre}.pdf`

                    /* const today = moment()
                    let mes = today.format('MM');
                    let dia = today.format('DD');
                    let anio = today.format('YYYY');
                    switch (true) {
                        case doc.hasOwnProperty('idNorma'):
                            if (tipoArchivo === 'msword') {
                                link.download = `${doc.nombre.replace('Norma: ', '')}.doc`
                            } else {
                                link.download = `${doc.nombre.replace('Norma: ', '')}.pdf`
                            }
                            break;
                        case doc.hasOwnProperty('archivoAnexo'):
                            link.download = `${anio}${mes}${dia}ax.pdf`
                            break;
                        default:
                            link.download = `${anio}${mes}${dia}.pdf`
                            break;
                    } */
                    link.click()
                    document.body.style.cursor = 'default';
                })
                .catch(error => {
                    document.body.style.cursor = 'default';
                    throw error
                });
        }
        catch (e) {
            // console.log(e)
        }
    }
    const handleReemplazarDocumento = async (e, doc, pdf) => {
        e.preventDefault();
                try {
            if (!extensionesPermitidas.includes(pdf?.type)) {
                return;
            }
            let base64 = await convertirABase64(pdf);
            let token = localStorage.getItem("token");
            let body = {
                documento: doc,
                base64: base64.split(',')[1],
                nombreArchivo: pdf.name,
                cuit: localStorage.getItem("user_cuit"),
                usuario: localStorage.idUsuarioBO
            }
            await ApiPinPost('/api/v1/boletin-oficial/boletin/reemplazarDocumento', body, token)
                .then(res => {
                    // console.log(res);
                    window.location.reload();
                })
                .catch(error => {
                    throw error
                });
        }
        catch (e) {
            // console.log(e)
        }
    }

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

    const ModalReemplazarDocumento = () => {
        const [pdf, setPdf] = useState(null);
        const [mensajeErrorTamaño, setMensajeErrorTamaño] = useState('');
        const [mensajeErrorTipoArchivo, setMensajeErrorTipoArchivo] = useState('');
        /* useEffect(() => {
            if (pdf && pdf.size > 2) {
                setMensajeErrorTamaño('El tamaño del archivo no puede superar los 50mb.');
            }
            if (!extensionesPermitidas.includes(pdf?.type)) {
                setMensajeErrorTipoArchivo('El tipo de archivo que intenta ingresar no está permitido en PIN.');
            }
        }, [pdf]) */
        const handleNewPDF= async (doc) =>{
            if (doc.size > limiteArchivo){
                setMensajeErrorTamaño('El tamaño del archivo no puede superar los 50mb.')
                setPdf(doc)
                return;
            }
            if (!extensionesPermitidas.includes(pdf?.type)) {
                setMensajeErrorTipoArchivo('El tipo de archivo que intenta ingresar no está permitido en PIN.');
                setPdf(doc)
                return;
            }
            setPdf(doc)
            setMensajeErrorTamaño('')
            setMensajeErrorTipoArchivo('')
        }
        return (
            <div class="modal fade" tabindex="-1" role="dialog" id="modalReemplazarDocumento">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                Reemplazar Documento
                            </h4>
                        </div>
                        <div class="modal-body">
                            <h4>
                                Nuevo documento:
                            </h4>
                            <input type="file" id="input-nuevo-documento" accept={extensionesPermitidas} onChange={(e) => {handleNewPDF(e.target.files[0]) }} />
                            <br />
                            <br />{(pdf?.size > limiteArchivo) &&
                                <div className="alert alert-danger">
                                    {mensajeErrorTamaño}
                                </div>}
                            <div className="alert alert-danger" hidden={pdf === null || pdf === undefined || (extensionesPermitidas.includes(pdf?.type))}>
                                {mensajeErrorTipoArchivo}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-link"
                                data-dismiss="modal"
                                onClick={() => setDocumentoAReemplazar({})}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                class="btn btn-primary"
                                disabled={pdf === null || pdf === undefined || pdf.name.split('.')[1] !== 'pdf' || pdf?.size > limiteArchivo}
                                onClick={(e) => handleReemplazarDocumento(e, documentoAReemplazar, pdf)}>
                                Reemplazar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )

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
                                <li className="breadcrumb-item"><Link to={".."}>Boletines</Link></li>
                                <li className="breadcrumb-item">Documentos del Boletin</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">Documentos del Boletin N°{boletinData.boletinNumero}</h1>
                    </header>
                    <hr />
                    <div className="container responsive" id="vista-documentos-firmados">
                        <ol>
                            {(documentos && documentos.length > 0) ? (
                                documentos.map((doc) =>
                                    <li style={{ margin: "5px" }}>
                                        {(doc.archivoBoletin || doc.archivoAnexo || doc.archivoNorma) && <button class="btn btn-link btn-sm"
                                            style={{ marginRight: "5px" }}
                                            onClick={(e) => descargaDocumento(e, doc)}>
                                            <FaDownload /> {doc.nombre}
                                        </button>}
                                        <button class="btn btn-primary btn-sm" onClick={() => setDocumentoAReemplazar(doc)}
                                            data-toggle="modal"
                                            data-target="#modalReemplazarDocumento">
                                            Reemplazar Documento
                                        </button>
                                        &nbsp;&nbsp;
                                        {doc.archivoNorma && doc.archivoNorma.substring(doc.archivoNorma.length - 4) === '.pdf' &&
                                            <span className="badge badge-success"><b> PDF </b></span>
                                        }
                                        {doc.archivoBoletin && doc.archivoBoletin.substring(doc.archivoBoletin.length - 4) === '.pdf' &&
                                            <span className="badge badge-success"><b> PDF </b></span>
                                        }
                                        {doc.archivoAnexo && doc.archivoAnexo.substring(doc.archivoAnexo.length - 4) === '.pdf' &&
                                            <span className="badge badge-success"><b> PDF </b></span>
                                        }
                                    </li>
                                )
                            ) : ('')}</ol>
                    </div>
                    <ModalReemplazarDocumento />
                </div>
            </>
        );

    }

};

export default VistaDocumentosBoletin;