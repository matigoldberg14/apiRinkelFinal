// src/routes/email.js
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
// src/routes/email.ts
const express_1 = __importDefault(require('express'));
const express_validator_1 = require('express-validator');
const nodemailer_1 = __importDefault(require('nodemailer'));
const pdfGenerator_1 = require('../utils/pdfGenerator');
const router = express_1.default.Router();

// Validaciones corregidas - ahora validamos en la raíz del objeto
const validateEmail = [
  (0, express_validator_1.body)('polizaNumber')
    .notEmpty()
    .withMessage('Número de póliza es requerido'),
  (0, express_validator_1.body)('cuponNumber')
    .notEmpty()
    .withMessage('Número de cupón es requerido'),
  (0, express_validator_1.body)('clientName')
    .notEmpty()
    .withMessage('Nombre del cliente es requerido'),
  (0, express_validator_1.body)('clientEmail')
    .isEmail()
    .withMessage('Email válido es requerido'),
  (0, express_validator_1.body)('dni')
    .notEmpty()
    .withMessage('DNI es requerido'),
  (0, express_validator_1.body)('telefono')
    .notEmpty()
    .withMessage('Teléfono es requerido'),
  (0, express_validator_1.body)('direccion')
    .notEmpty()
    .withMessage('Dirección es requerida'),
  (0, express_validator_1.body)('cp')
    .notEmpty()
    .withMessage('Código postal es requerido'),
  (0, express_validator_1.body)('localidad')
    .notEmpty()
    .withMessage('Localidad es requerida'),
  (0, express_validator_1.body)('provincia')
    .notEmpty()
    .withMessage('Provincia es requerida'),
  (0, express_validator_1.body)('vehicle')
    .isObject()
    .withMessage('Datos del vehículo son requeridos'),
  (0, express_validator_1.body)('vehicle.patente')
    .notEmpty()
    .withMessage('Patente es requerida'),
  (0, express_validator_1.body)('vehicle.marca')
    .notEmpty()
    .withMessage('Marca es requerida'),
  (0, express_validator_1.body)('vehicle.modelo')
    .notEmpty()
    .withMessage('Modelo es requerido'),
  // Cambios clave: validamos estos campos en la raíz
  (0, express_validator_1.body)('vigenciaInicio')
    .notEmpty()
    .withMessage('Fecha de inicio de vigencia es requerida'),
  (0, express_validator_1.body)('vigenciaFin')
    .notEmpty()
    .withMessage('Fecha de fin de vigencia es requerida'),
  (0, express_validator_1.body)('medioPago')
    .notEmpty()
    .withMessage('Medio de pago válido es requerido'),
];

// Template del email
const getEmailTemplate = (clientName, provisorio) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 25px;">
      <img 
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image003-lQUo6M0y8FjldKudsUzMZXPEtTT9Ig.png" 
        alt="Rescate Logo" 
        style="width: 200px; max-width: 100%; height: auto;"
      />
    </div>
    <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
      <h1 style="color: #E0251B; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido a nuestro servicio de grúas!</h1>
      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Estimado/a ${clientName},</p>
      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Adjunto encontrará su póliza de seguro${
        provisorio ? ' provisoria' : ''
      }.</p>
      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Ante cualquier emergencia, contacte a nuestra línea de asistencia:</p>
      <p style="text-align: center; font-weight: bold; color: #E0251B; font-size: 20px; margin: 25px 0;">
        0800 - 122 - 0498
      </p>
    </div>
  </div>
`;

// Endpoint para enviar email
router.post('/send-policy-email', validateEmail, (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const errors = (0, express_validator_1.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        polizaNumber,
        cuponNumber,
        clientName,
        clientEmail,
        dni,
        telefono,
        direccion,
        cp,
        localidad,
        provincia,
        vehicle,
        provisorio,
        vigenciaInicio,
        vigenciaFin,
        medioPago,
      } = req.body;

      const pdfData = {
        id: polizaNumber,
        plan: 'R -ILIMITADO',
        provisorio: provisorio || false,
        beneficiario: {
          nombre: clientName,
          dni: dni,
          celular: telefono,
          email: clientEmail,
          fechaEmision: vigenciaInicio,
          condicion: vigenciaFin,
        },
        domicilio: {
          direccion: direccion,
          cp: cp,
          localidad: localidad,
          provincia: provincia,
        },
        vehiculo: {
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          color: vehicle.color || '-',
          patente: vehicle.patente.toUpperCase(),
        },
        medioPago: medioPago,
      };

      const pdfBuffer = yield (0, pdfGenerator_1.generatePolicyPDF)(pdfData);

      const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: clientEmail,
        subject: `Póliza de Seguro #${polizaNumber}`,
        html: getEmailTemplate(clientName, provisorio || false),
        attachments: [
          {
            filename: `poliza-${polizaNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      };

      yield transporter.sendMail(mailOptions);

      res.status(200).json({
        message: 'Email enviado exitosamente con la póliza adjunta',
        success: true,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error al procesar la solicitud',
        error: error.message,
      });
    }
  })
);

// Nuevo endpoint para solo generar PDF
router.post('/generate-pdf', validateEmail, (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const errors = (0, express_validator_1.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        polizaNumber,
        cuponNumber,
        clientName,
        clientEmail,
        dni,
        telefono,
        direccion,
        cp,
        localidad,
        provincia,
        vehicle,
        provisorio,
        vigenciaInicio,
        vigenciaFin,
        medioPago,
      } = req.body;

      const pdfData = {
        id: polizaNumber,
        plan: 'R -ILIMITADO',
        provisorio: provisorio || false,
        beneficiario: {
          nombre: clientName,
          dni: dni,
          celular: telefono,
          email: clientEmail,
          fechaEmision: vigenciaInicio,
          condicion: vigenciaFin,
        },
        domicilio: {
          direccion: direccion,
          cp: cp,
          localidad: localidad,
          provincia: provincia,
        },
        vehiculo: {
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          color: vehicle.color || '-',
          patente: vehicle.patente.toUpperCase(),
        },
        medioPago: medioPago,
      };

      const pdfBuffer = yield (0, pdfGenerator_1.generatePolicyPDF)(pdfData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=poliza-${polizaNumber}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error al generar el PDF',
        error: error.message,
      });
    }
  })
);

exports.default = router;
