import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaAltaSolicitudBO from '../../Pages/BO/AltaSolicitud/AltaSolicitudBO';

const AltaSolicitudBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaAltaSolicitudBO />
        </Layout>

    );
};

export default AltaSolicitudBO;