import {injectable, /* inject, */ BindingScope} from '@loopback/core';
const generator = require("password-generator");
const cryptoJS = require("crypto-js");
import {configuracion} from '../config/config';
import {Usuario} from '../models';
const jwt = require('jsonwebtoken');
import {UsuarioRepository} from '../repositories';
import {repository} from '@loopback/repository';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  // en el constructor debemos inyeccion de dependencias el repositoro del usaurio y consultar la base 
  constructor(@repository(UsuarioRepository)
  public usuarioRepository: UsuarioRepository/* Add @inject to inject parameters */) {}

  //Generacion de claves
  GenerarClave() {
    const clave = generator(8, false);
    return clave;
  }

  CifrarClave(clave: String) {
    const claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }
  /*
   * Add service methods here
   */
//JWT Vamos a generar unmetodo token con los datos de un usuario 
// token es la informacion de un usaurio cifrado 
generarTokenJWT(usuario: Usuario) {
  const token = jwt.sign({
    data: {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre + " " + usuario.apellidos
    }
  }, configuracion.claveJWT)

  return token
}
//recibir el token y verificar que la informacion sea válida 
validarTokenJWT(token: string) {
  try {
    const datos = jwt.verify(token, configuracion.claveJWT);
    return datos;
  } catch (error) {
    return false;
  }
}
// identificar persona o autenticación lo que hara es verificar que  los datos sean correctos del usaurio lo cual si es verdadero retorna verdadero o falso y con eso vamo a iniciar sesion más adelante 
identificarPersona(correo: string, password: string) {
  try {
    let p = this.usuarioRepository.findOne({where: {correo: correo, password: password}})
    if (p) {
      return p;
    }
    return false;
  } catch {
    return false;
  }
}

}
