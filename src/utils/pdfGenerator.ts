// src/utils/pdfGenerator.ts
import fs from 'fs';
import path from 'path';
import puppeteer, { Browser } from 'puppeteer-core';

interface PolicyData {
  id: string;
  plan: string;
  provisorio: boolean;
  beneficiario: {
    nombre: string;
    dni: string;
    celular: string;
    email: string;
    fechaEmision: string; // Ahora contendrá vigenciaInicio
    condicion: string; // Ahora contendrá vigenciaFin
  };
  domicilio: {
    direccion: string;
    cp: string;
    localidad: string;
    provincia: string;
  };
  vehiculo: {
    marca: string;
    modelo: string;
    color: string;
    patente: string;
  };
  medioPago: string;
}

export const generatePolicyPDF = async (data: PolicyData): Promise<Buffer> => {
  let browser: Browser | undefined;
  try {
    // Leer el template HTML
    const templatePath = path.join(__dirname, '../templates/policy.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Reemplazar todas las variables en el template
    const replacements = {
      '{{ID}}': data.id,
      '{{PLAN}}': data.plan,
      '{{NOMBRE}}': data.beneficiario.nombre,
      '{{FECHA_EMISION}}': data.beneficiario.fechaEmision,
      '{{DNI}}': data.beneficiario.dni,
      '{{CONDICION}}': data.beneficiario.condicion,
      '{{CELULAR}}': data.beneficiario.celular,
      '{{EMAIL}}': data.beneficiario.email,
      '{{DIRECCION}}': data.domicilio.direccion,
      '{{LOCALIDAD}}': data.domicilio.localidad,
      '{{CP}}': data.domicilio.cp,
      '{{PROVINCIA}}': data.domicilio.provincia,
      '{{MARCA}}': data.vehiculo.marca,
      '{{MODELO}}': data.vehiculo.modelo,
      '{{COLOR}}': data.vehiculo.color || '-',
      '{{PATENTE}}': data.vehiculo.patente,
      '{{MEDIO_PAGO}}': data.medioPago,
      '{{PROVISORIO_CLASS}}': data.provisorio ? '' : 'hidden',
    };

    // Reemplazar cada variable en el template
    Object.entries(replacements).forEach(([key, value]) => {
      template = template.replace(new RegExp(key, 'g'), value);
    });

    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      executablePath:
        process.env.CHROME_PATH ||
        (process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : '/usr/bin/google-chrome'),
      headless: true,
    });

    const page = await browser.newPage();
    // Si el template trae una imagen que no carga, networkidle0 se cuelga hasta
    // el timeout: con un tope de 30s el pedido falla rápido y el navegador se
    // cierra en el finally.
    await page.setContent(template, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  } finally {
    // Sin esto, cada PDF que falla deja un Chrome vivo: después de unos
    // cuantos el contenedor se queda sin procesos y ya no genera ninguno
    // ("fork: retry: Resource temporarily unavailable").
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
};
