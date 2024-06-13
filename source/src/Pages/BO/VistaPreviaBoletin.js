import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../Helpers/Navigation";

//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator'
import moment from "moment";
//Spinner
import Spinner from '../../Components/Spinner/Spinner';

const b64toBlob = require('b64-to-blob');

const VistaPreviaBoletin = props => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)


    //HOOK INICIO
    useEffect(() => {
        setLoading(false)
      }, [])
    
    const handlePDF = async (e) => {
        e.preventDefault();
        try {
            let body = {
              usuario: localStorage.getItem("user_cuit"),
              idBoletin: 23
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/boletin/vista-previa', body, token)
              .then(res => {
                  let blob = b64toBlob(res.data, 'application/pdf')
                  const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    const today = moment()
                    let mes = today.format('MM');
                    let dia   = today.format('DD');
                    let anio  = today.format('YYYY');

                    link.download = `${anio}${mes}${dia}.pdf`
                    link.click()
    
              })
              .catch(function (error) {
                // console.log(error);
              });
          }
          catch (error) {
            // console.log(error);
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
                                <li className="breadcrumb-item"><Link to={'/'}>Boletín Oficial</Link></li>
                                <li className="breadcrumb-item">Vista Previa Boletin</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">Vista Previa Boletín</h1>
                    </header>
                    <hr />
                    <div className="container responsive">
                        <button onClick={ e => handlePDF(e)} > Descargar PDF</button>
                    </div>
                </div>
            </>
        );

    }

};

export default VistaPreviaBoletin;
