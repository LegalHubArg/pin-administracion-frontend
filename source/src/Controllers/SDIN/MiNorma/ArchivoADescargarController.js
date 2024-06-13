import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiPinPost } from '../../../Helpers/ApiComunicator';

const ArchivoADescargar = () => {
  const { idNormaSDIN, numero } = useParams();
  const [imagen, setImagen] = useState([]);

  // Función para obtener la imagen desde la API
  const traerImagen = async () => {
    // Configurar el cuerpo de la solicitud
    let body = {
      usuario: localStorage.getItem('user_cuit'),
      idNormaSDIN: idNormaSDIN,
      numero: numero,
      idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
    };
    let token = localStorage.getItem('token');
    try {
      // Llamar a la API para obtener la imagen
      const response = await ApiPinPost('/api/v1/sdin/norma/imagen', body, token);
      setImagen(response.data.imagen[0]);
    } catch (error) {
      // Manejar el error aquí
    }
  };

  // Llamar a traerImagen cuando idNormaSDIN cambia
  useEffect(() => {
    traerImagen();
  }, [idNormaSDIN]);

  // Descargar la imagen cuando imagen esté disponible
  useEffect(() => {
    if (imagen.imagen) {
      // Crear un enlace para descargar la imagen
      const link = document.createElement('a');
      link.href = `data:${imagen.tipo};base64,${imagen.imagen}`;
      link.download = `Archivo-${imagen.numero}.${imagen.tipo.split('/')[1].trim()}`;
      link.target = "_blank";
      // Simular un clic en el enlace para iniciar la descarga en una nueva pestaña
      link.click();
    }
  }, [imagen]);

  // No se muestra ningún contenido en la página
  return null;
};

export default ArchivoADescargar;