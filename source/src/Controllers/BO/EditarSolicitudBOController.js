import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaEditarSolicitudBO from '../../Pages/BO/EditarSolicitudBO';

const AltaSolicitudBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaEditarSolicitudBO />
        </Layout>

    );
};

export default AltaSolicitudBO;