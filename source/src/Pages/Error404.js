import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../Components/Layout/Layout';
import { rutasBO } from "../routes";
import { FaRegFrown } from "react-icons/fa";

const Error404 = _ => {
    const navigate = useNavigate();
    return (<>
        <Layout isHeader={true} isBotonUsuario={false} isFooter={true}>
            <header className="pt-4 pb-3 mb-4">
                <div className="container" style={{ minHeight: "400px" }}>
                    <FaRegFrown style={{ float: "right", width: "250px", height: "250px", opacity:"50%"}} />
                    <h1 style={{fontSize: "10em"}}>404</h1>
                    <h2> La página a la que intenta ingresar no existe.</h2>
                    <button className="btn btn-primary mt-4 btn-lg" onClick={_ => navigate("/")}>Ir al Home</button>
                </div>
            </header>
        </Layout>
    </>)
}

export default Error404;