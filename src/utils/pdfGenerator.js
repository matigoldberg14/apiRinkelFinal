'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.generatePolicyPDF = void 0;
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const puppeteer_1 = __importDefault(require('puppeteer'));

const generatePolicyPDF = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      // Leer el template HTML
      const templatePath = path_1.default.join(
        __dirname,
        '../templates/policy.html'
      );
      let template = fs_1.default.readFileSync(templatePath, 'utf-8');

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
        '{{PROVISORIO_CLASS}}': data.provisorio ? '' : 'hidden', // Agregamos esta línea
      };

      // Reemplazar cada variable en el template
      Object.entries(replacements).forEach(([key, value]) => {
        template = template.replace(new RegExp(key, 'g'), value);
      });

      // Iniciar Puppeteer
      const browser = yield puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
      const page = yield browser.newPage();

      // Cargar el HTML
      yield page.setContent(template, {
        waitUntil: 'networkidle0',
      });

      // Generar PDF
      const pdfBuffer = yield page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        printBackground: true,
      });

      yield browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  });

exports.generatePolicyPDF = generatePolicyPDF;
