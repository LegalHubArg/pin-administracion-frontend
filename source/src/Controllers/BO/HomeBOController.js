import React, { useState, useEffect } from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaHomeBO from '../../Pages/BO/HomeBO';
import VistaHomeError from '../../Pages/BO/HomeError';
import VistaHomeSDIN from '../../Pages/SDIN/HomeSDIN';

const HomeBO = props => {
    const [isLoading, setLoading] = useState(true)


    const checkPerfil = () => {
        let perfiles = JSON.parse(localStorage.getItem("perfiles"))
        for (const per of perfiles)
        {
            if ( per.idPerfil === 5)
            {
                let miperfil = { 
                    idPerfil : per.idPerfil,
                    descripcion : per.descripcion
                }
                localStorage.setItem("perfil",  JSON.stringify(miperfil));
                //console.log('SOS GOBO ADMIN')
                setLoading(false);
                return;
            }
        }
        for (const per of perfiles)
            {
                if ( per.idPerfil === 2)
                {
                    let miperfil = { 
                        idPerfil : per.idPerfil,
                        descripcion : per.descripcion
                    }
                    localStorage.setItem("perfil",  JSON.stringify(miperfil));
                    //console.log('SOS USUARIO EXTERNO')
                    setLoading(false);
                    return;
                }
            }
            for (const per of perfiles)
                {
                    if ( per.idPerfil === 9)
                    {
                        let miperfil = { 
                            idPerfil : per.idPerfil,
                            descripcion : per.descripcion
                        }
                        localStorage.setItem("perfil",  JSON.stringify(miperfil));
                        //console.log('SOS USUARIO SDIN')
                        setLoading(false);
                        return;
                    }
                }
        
    }

    useEffect(() => {
        checkPerfil()
      }, [])
    if(!isLoading){
        if (
            JSON.parse(localStorage.getItem("perfil")).idPerfil === 9
        )
        {
            return (
                <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
                    <VistaHomeSDIN />
                </Layout>
        
            );
        }
        return (
            <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
                <VistaHomeBO />
            </Layout>
    
        );
    }
    else
    {
        return( <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaHomeError mensaje={'El usuario no dispone de un perfil operativo en la plataforma'} />
        </Layout>)
    }

    
};

export default HomeBO;