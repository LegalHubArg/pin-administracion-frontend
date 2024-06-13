import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../../Helpers/Navigation";
import moment from "moment";
import Logs from '../Logs';
//API PIN
import { ApiPinPost } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
//API PIN
import { ApiPinGet } from '../../../Helpers/ApiComunicator'
import { FaTimes } from 'react-icons/fa';
//HTML decode
import { decode } from 'html-entities';

const LogsDetalle = ({ norma }) => {

    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)
    const [detalle, setDetalle] = useState(1)

    useEffect(()=> {
        setLoading(false)
    }, [])

    if (isLoading) {
    return (<Spinner />)
    }
    else {
    return (
        <>
        <div className="card">
            <div className="card-body">
            <h4 className="card-title">
                DETALLE LOGS
            </h4>
            <hr />
                <div className="form-group">
                    <Logs props={{norma, detalle}}/>
                </div>
            </div>
        </div >
        </>
    )
    }

}

export default LogsDetalle;