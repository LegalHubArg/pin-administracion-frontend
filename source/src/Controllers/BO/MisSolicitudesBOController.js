import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaMisSolicitudesBO from '../../Pages/BO/MisSolicitudesBO';

const MisSolicitudesBO = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaMisSolicitudesBO />
        </Layout>

    );
};

export default MisSolicitudesBO;