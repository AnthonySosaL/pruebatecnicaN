import { Injectable } from '@nestjs/common';

@Injectable()
export class CedulaValidatorService {
  /**
   * Simula llamada a servicio externo de validación de cédula
   * Falla aleatoriamente 30% del tiempo
   */
  async validateCedula(documentNumber: string): Promise<{ valid: boolean; message: string }> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Falla aleatoria 30% del tiempo
    const shouldFail = Math.random() < 0.3;
    
    if (shouldFail) {
      throw new Error('Servicio de validación no disponible temporalmente. Intente nuevamente.');
    }

    // Validación básica de cédula ecuatoriana (algoritmo módulo 10)
    const isValid = this.validarCedulaEcuatoriana(documentNumber);

    return {
      valid: isValid,
      message: isValid 
        ? 'Cédula válida según registro civil' 
        : 'Cédula no válida o no encontrada en registro civil'
    };
  }

  private validarCedulaEcuatoriana(cedula: string): boolean {
    if (cedula.length !== 10) return false;

    const digitos = cedula.split('').map(Number);
    const provincia = parseInt(cedula.substring(0, 2));

    if (provincia < 1 || provincia > 24) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = digitos[i] * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }

    const digitoVerificador = digitos[9];
    const decenaSuperior = Math.ceil(suma / 10) * 10;
    const resultado = decenaSuperior - suma;

    return resultado === digitoVerificador || (resultado === 10 && digitoVerificador === 0);
  }
}
