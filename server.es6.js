require("babel-polyfill");

const producto = require("./modulos/producto");
const express = require("express");
const moment = require("moment");
const router = express.Router();
const PORT = 8080;
const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

//objeto con el mensaje de error para producto no encontrado
const NO_PRODUCT_FOUND = {
  error: "producto no encontrado",
};
//objecto con el mensaje de error para listado no encontrado
const NO_PRODUCTS_FOUND = {
  error: "no hay productos cargados",
};
//mw para validar que los 3 campos del producto no sean falsies
const productSchemaCheckerMiddleware = (req, res, next) => {
  if (producto.schemaValidator(req.body)) {
    next();
  } else {
    res.status(400).send(`Wrong format: ${JSON.stringify(req.body)}`);
  }
};
//mw para validar que el producto buscado esté presente
const isProductPresentMiddleware = (req, res, next) => {
  const index = producto.getProductIndexById(req.params.id);
  if (index === -1) {
    res.status(404).render("productos", NO_PRODUCT_FOUND);
  } else {
    req.index = index;
    next();
  }
};
app.use(express.json());
app.use(express.urlencoded());
//metodod que devuelve el array de productos

router.get("/productos", (req, res) => {
  const prods = producto.listarProductos();
  res.render(
    "productos",
    prods.length > 0 ? { productos: prods } : NO_PRODUCTS_FOUND
  );
});

router.get("/ingreso", (req, res) => {
  res.render("input");
});

router.get("/productos/:id", isProductPresentMiddleware, (req, res) => {
  const prod = producto.buscarProducto(req.index);
  res.render("productos", { productos: [prod] });
});

//metodo que postea un nuevo producto
router.post("/productos", productSchemaCheckerMiddleware, (req, res) => {
  const prod = producto.agregarProducto(req.body);
  console.log(prod);
  io.emit("list:products", producto.productos);
  res.redirect("/api/ingreso");
});
//metodo para pisar un producto de un id dado
router.put(
  "/productos/:id",
  productSchemaCheckerMiddleware,
  isProductPresentMiddleware,
  (req, res) => {
    const prod = {};
    prod.id = Number(req.params.id);
    prod.title = req.body.title;
    prod.price = req.body.price;
    prod.thumbnail = req.body.thumbnail;
    const updatedProd = producto.actualizarProducto(req.index, prod);
    io.emit("list:products", producto.productos);
    res.send(updatedProd);
  }
);
//metodo para borrar un producto de un id dado
router.delete("/productos/:id", isProductPresentMiddleware, (req, res) => {
  const prod = producto.borrarProducto(req.index);
  res.send(prod);
  io.emit("list:products", producto.productos); //envío por socket mi array de productos
});
//agrego el alias public
app.use("/public", express.static("resources"));

app.use("/api", router);
const server = app.listen(PORT, () => console.log("server's up", PORT));

//el metodo broadcast detecta nuevas conexiones y le envía a todas las conexiones un elemento
const socketIO = require("socket.io");

const io = socketIO(server);

io.on("connection", async (socket) => {
  console.log("new connection", socket.id);
  /**
   * hago un io.sockets.emit para asegurarme que cualquier
   * cliente nuevo recibe la lista de todos los productos
   */
  io.sockets.emit("list:products", producto.productos);
  io.sockets.emit("chat:messages", await arch.leer());

  socket.on("chat:new-message", async (data) => {
    const messages = await arch.leer();
    const message = {
      email: data.email,
      date: `[${moment().format("DD/MM/YYYY hh:mm:ss")}]`,
      message: data.message,
    };
    messages.push(message);
    arch.guardar(message);

    io.sockets.emit("chat:messages", messages);
    console.log(await arch.leer());
  });
});

const fs = require("fs");
const archivo = require("./modulos/archivo.js");
const arch = new archivo("./resources/messages.json");
