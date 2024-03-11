import express from "express";
import "dotenv/config";
import serverless from "serverless-http";
import morgan from "morgan";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(cors());

const port = process.env.port || 3000;
const router = express.Router();

app.use(express.text());
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ limit: "50mb" }));

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.post("/api/formulario", async (req, res) => {
  const {
    nombre,
    compania,
    correo,
    telefono,
    pedido_titulo,
    pedido_descripcion,
    pedido_imagenes,
  } = req.body;
  let attachments = [];
  try {
    for (let i = 0; i < pedido_imagenes.length; i++) {
      const element = pedido_imagenes[i];
      attachments.push({ filename: `image${i}`, path: `${element}` });
    }

    await transporter.sendMail({
      from: "jtk.jpaf@gmail.com",
      to: "jtk.jpaf@gmail.com",
      subject: `Compañia: ${compania}, Pedido: ${pedido_titulo}`,
      text: `Nombre: ${nombre}
  Compañia: ${compania}
  Email: ${correo}
  Telefono: ${telefono}
  Pedido Titulo : ${pedido_titulo}
  Pedido Descripcion: ${pedido_descripcion}
  `,
      attachments: attachments,
    });
    res.json({ message: "good" });
  } catch (error) {
    res.json({ message: "bad", error });
  }
});

router.get("/api", (req, res) => {
  res.json({ message: "good" });
});

app.use("/.netlify/functions/index", router);
export const handler = serverless(app);

app.listen(port);
