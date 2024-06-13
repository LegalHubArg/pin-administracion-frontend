import { FaAlignJustify, FaEdit, FaFlag, FaRegWindowRestore, FaSortAmountUp, FaTrashAlt} from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { useLocation, useNavigate, Link } from 'react-router-dom';
import moment from "moment";
import './DetalleBoletin.css';
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//DateTime
import { timestampToDateFormat } from '../../Helpers/DateTime';
//Obelisco Utils
import { arrayToTag } from '../../Helpers/Obelisco';
//Navigate
import { linkToParams } from "../../Helpers/Navigation";
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
// Modal
import {Modal, Button} from 'react-bootstrap';
import parse from 'html-react-parser';
import { rutasBO } from "../../routes";


const b64toBlob = require('b64-to-blob');


const DescargarBoletin = props => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true) //API Check
  const [puedoGuardar, setPuedoGuardar] = useState(false);

 

  //RECIBE EL idNorma EN location.state.name
  const location = useLocation();


  //INICIO
  useEffect(async () => {
    //Que pasé solo cuando viene el estado por parámetro
    if(location.state == null)
    {
        linkToParams('/home', { }, navigate)
    }
    if(location.state.idBoletin && location.state.fechaPublicacion )
    {
      if(location.state.boletinNumero != null)
      {
        setLoading(false);
      }
      else
      {
        //console.log('Boletín sin numerar')
        linkToParams('/home', { }, navigate)
      }
      
    }
    

  }, [])

  //DESCARGAR BOLETIN
  const handlePDFBoletin = async (e, idBoletin, fechaPublicacion, boletinNumero) => {
    e.preventDefault();
    setPuedoGuardar(true)
    try {
        let body = {
          usuario: localStorage.getItem("user_cuit"),
          idBoletin: idBoletin,
          fechaPublicacion: fechaPublicacion,
          boletinNumero: boletinNumero
        }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/boletin/descargar-boletin-pdf', body, token)
          .then(res => {
              let blob = b64toBlob(res.data, 'application/pdf')
              const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                const today = moment(fechaPublicacion)
                let mes = today.format('MM');
                let dia   = today.format('DD');
                let anio  = today.format('YYYY');

                link.download = `${anio}${mes}${dia}.pdf`
                link.click()
                setPuedoGuardar(false)

          })
          .catch(function (error) {
            //console.log(error);
            setPuedoGuardar(false)
          });
      }
      catch (error) {
        setPuedoGuardar(false)
        //console.log(error);
      }

}

 //DESCARGAR BOLETIN
 const handlePDFSeparata = async (e, idBoletin, fechaPublicacion, boletinNumero) => {
  e.preventDefault();
  setPuedoGuardar(true)
  try {
      let body = {
        usuario: localStorage.getItem("user_cuit"),
        idBoletin: idBoletin,
        fechaPublicacion: fechaPublicacion,
        boletinNumero: boletinNumero
      }
      let token = localStorage.getItem("token");
      await ApiPinPost('/api/v1/boletin-oficial/boletin/descargar-separata-pdf', body, token)
        .then(res => {
            let blob = b64toBlob(res.data, 'application/pdf')
            const link = document.createElement('a')
              link.href = URL.createObjectURL(blob)
              const today = moment(fechaPublicacion)
              let mes = today.format('MM');
              let dia   = today.format('DD');
              let anio  = today.format('YYYY');

              link.download = `${anio}${mes}${dia}ax.pdf`
              link.click()
              setPuedoGuardar(false)

        })
        .catch(function (error) {
          //console.log(error);
          setPuedoGuardar(false)
        });
    }
    catch (error) {
      setPuedoGuardar(false)
      //console.log(error);
    }

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
                <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                <li className="breadcrumb-item"><Link to={".."}>Boletines</Link></li>
                <li className="breadcrumb-item">Detalle de Boletín</li>
                <ol className="breadcrumb">
              
            </ol>
              </ol>
            </nav>
          </div>
        </header>
        <div className="container">
          <header>
            <h1 className="mb-3">Descargar Boletín: #{location.state.idBoletin}</h1>
            <p className="lead" align="justify">Numero de Boletín: {location.state.boletinNumero}</p>
            <button type="button" className="btn btn-primary" onClick={(e) => handlePDFBoletin(e, location.state.idBoletin, location.state.fechaPublicacion, location.state.boletinNumero)} disabled={puedoGuardar}>Descargar Boletin</button> &nbsp;&nbsp;
            <button type="button" className="btn btn-primary" onClick={(e) => handlePDFSeparata(e, location.state.idBoletin, location.state.fechaPublicacion, location.state.boletinNumero)} disabled={puedoGuardar}>Descargar Separata</button>
          </header>
          <hr />
          <div className="container responsive">

          </div>
        </div>
      </>
    );

  }

};

export default DescargarBoletin;
