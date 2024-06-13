import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaHomeSDIN from '../../Pages/SDIN/HomeSDIN';

const HomeSDIN = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaHomeSDIN />
        </Layout>

    );
};

export default HomeSDIN;