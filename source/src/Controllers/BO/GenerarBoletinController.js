import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaGenerarBoletin from '../../Pages/BO/GenerarBoletin';

const GenerarBoletin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaGenerarBoletin />
        </Layout>

    );
};

export default GenerarBoletin;