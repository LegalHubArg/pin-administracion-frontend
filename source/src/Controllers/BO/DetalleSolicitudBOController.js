import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaDetalleSolicitudBO from '../../Pages/BO/DetalleSolicitud/DetalleSolicitudBO';

const DetalleSolicitudBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaDetalleSolicitudBO />
        </Layout>

    );
};

export default DetalleSolicitudBO;