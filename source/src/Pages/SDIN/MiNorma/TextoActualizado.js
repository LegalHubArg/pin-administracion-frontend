import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaCheck, FaTimes, FaEye, FaArrowRight, FaArrowLeft, FaEdit, FaPaperclip, FaDollarSign } from "react-icons/fa";
import { BiLastPage, BiFirstPage } from "react-icons/bi";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import moment from "moment";
//API PIN
import './TextoActualizado.css';
import SunEditor from 'suneditor-react';
import { ApiPinGet, ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { Button } from "@gcba/obelisco/dist/components/Button";
var b64toBlob = require('b64-to-blob');

const TextoActualizado = props => {

    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [solicitud, setSolicitud] = useState({});
    const [contentEditor, setContentEditor] = useState("");
    const location = useLocation();
    const [puedoGuardar, setPuedoGuardar] = useState(false);

    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });

    const initForm = {
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit"),
        normaAcronimoReferencia: '',
        idBoletin: '',
        boletinNumero: '',
        idReparticionOrganismo: null,
        idReparticion: null,
        idSeccion: null,
        normaNumero: '',
        normaAnio: '',
        fechaCarga: '',
        fechaLimite: '',
        fechaSugerida: '',
        fechaAprobacion: '',
        idNormasEstadoTipo: null,
        idNorma: ''
    }
    const [form, setForm] = useState(initForm);

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'idBoletin':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idBoletin']: value
                })
                break;
            case 'boletinNumero':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['boletinNumero']: value
                })
                break;
            case 'idNorma':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNorma']: value
                })
                break;
            case 'idSeccion':
                value = parseInt(e.target.value);
                setForm({
                    ...form,
                    ['idSeccion']: value
                })
                break;
            case 'normaNumero':
                if (e.target.validity.valid) {
                    value = parseInt(e.target.value);
                    if (isNaN(value)) {
                        value = ''
                    }
                    setForm({
                        ...form,
                        ['normaNumero']: value
                    })
                }
                break;
            case 'normaAnio':
                if (e.target.validity.valid) {
                    value = parseInt(e.target.value);
                    if (isNaN(value)) {
                        value = ''
                    }
                    setForm({
                        ...form,
                        ['normaAnio']: value
                    })
                }
                break;
            case 'fechaSugerida':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaSugerida']: value
                })
                break;
            case 'fechaLimite':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaLimite']: value
                })
                break;
            case 'fechaCarga':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaCarga']: value
                })
                break;
            case 'fechaAprobacion':
                value = e.target.value;
                setForm({
                    ...form,
                    ['fechaAprobacion']: value
                })
                break;
            case 'idNormasEstadoTipo':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idNormasEstadoTipo']: value
                })
                break;
            case 'idReparticionOrganismo':
                value = e.target.value;
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({
                    ...form,
                    ['idReparticionOrganismo']: value
                })
                break;
        }
    }

    const guardarDigitalizacion = async (e) => {
  
        e.preventDefault();
        setPuedoGuardar(true);
    
        let body = {};
        body.usuario = localStorage.getItem("user_cuit");
        body.idNorma = solicitud.idNorma;
        body.normaDocumento = contentEditor;
        if (solicitud.normaDocumento.hasOwnProperty('idNormaDigitalizacion')) {
          body.idNormaDigitalizacion = solicitud.normaDocumento.idNormaDigitalizacion
        }
        else {
          body.idNormaDigitalizacion = 0
        }
    
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma/editar/digitalizacion', body, token).then(res => {
          console.log('Actualizo...')
          window.location.reload();
          //setPuedoGuardar(false);
        }).catch(function (error) {
          console.log(error);
        });
    
    
      }

    const getSolicitud = async () => {
        let data = []
        try {
          let anexosAux = [];
          let body = {
            idNorma: location.state.idNorma,
            usuario: localStorage.getItem("user_cuit")
          }
          let token = localStorage.getItem("token");
          await ApiPinPost('/api/v1/boletin-oficial/normas/norma', body, token).then(res => {
            data = res.data.data[0]
            setSolicitud(data)
            setContentEditor(data.normaDocumento.normaDocumento)
            // console.log(data)
          }).catch(e => { throw e })
          setLoading(false)
    
        }
        catch (error) {
          setLoading(true)
          throw error
        }
      }
    

    const handleEditorChange = (e) => {
        setContentEditor(e)
      }

    const mostrarEditor = () => {
        console.log('EL DOC')
        //console.log(content.normaDocumento)
        return (<><SunEditor height="360px" placeholder="Escriba aquí sus observaciones..." lang="es" setOptions={editorOptions}
          setContents={contentEditor} readOnly={parseInt(JSON.parse(localStorage.getItem("perfil")).idPerfil) !== 5} onChange={e => handleEditorChange(e)}
        />
        </>)
      }

      const editorOptions = {
  
        /* addTagsWhitelist: "p | strong | span",
        pasteTagsWhitelist: "p | strong | span", */
        /*     tagsBlacklist: "span",
            pasteTagsBlacklist: "span", */
        attributesWhitelist: {
          all: "style",
          /* all: "id" */
        },
        
      /*   attributesBlacklist: {
          span: "style"
        }, */
      previewTemplate: "<div style='width:auto; max-width:900px; margin:auto;'>    <h1>Preview Template</h1>     {{contents}}     <div>_Footer_</div></div>            ",
      buttonList: [
        ["undo", "redo"],
        ["removeFormat"],
        ["font", "fontSize", "formatBlock", "bold", "underline", "italic"],
        ["fontColor", "hiliteColor"],
        ["align", "horizontalRule", "list", 'lineHeight'],
        ["table", "link"],
        ["showBlocks", "codeView"]
      ],
      imageRotation: false,
      font: [
        'Arial'
      ],
      defaultStyle: 'font-family: Arial; font-size: 11px;',
      fontSize: [11],
      colorList: [
        [
          "#828282",
          "#FF5400",
          "#676464",
          "#F1F2F4",
          "#FF9B00",
          "#F00",
          "#fa6e30",
          "#000",
          "rgba(255, 153, 0, 0.1)",
          "#FF6600",
          "#0099FF",
          "#74CC6D",
          "#FF9900",
          "#CCCCCC"
        ]
      ]
    };

    const handleSubmit = (e) => {
        e.preventDefault();
      }

    //Hook inicial
    useEffect(async () => {
        setLoading(true)
        await getSolicitud();
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <div className="container responsive mb-5" id="pagina-importar-BO">
                    <div className="accordion" id="accordion">
                        <div className="card">
                            <button
                                id="boton1"
                                className="card-header collapsed card-link"
                                data-toggle="collapse"
                                data-target="#collapse1"
                            >
                                TEXTO ACTUALIZADO
                            </button>
                            <div id="collapse1" className="collapse" data-parent="#accordion">
                                <div className="card-body">
                                    <div className="filtros-busqueda">
                                        <form className="form" onSubmit={e => handleSubmit(e)}>
                                            <div className="container" id="pagina-detalle-solicitud">
                                                    <div className="documentos">
                                                    {
                                                        (solicitud.normaDocumento.hasOwnProperty('normaDocumento')) && mostrarEditor()
                                                    }
                                                    <div>
                                                    </div>
                                                    </div>
                                            </div>
                                            <button className="btn btn-success btn-sm mr-2" type="submit" id="boton-buscar" onClick={(e) => guardarDigitalizacion(e)}>Actualizar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </>
        );

    }

};



export default TextoActualizado;

