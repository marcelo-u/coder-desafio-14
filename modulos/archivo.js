class Archivo {
  fs = require("fs");
  //le paso como parametro el file
  constructor(file) {
    this.file = file;
  }
  //metodo guardar recibe como parametro un producto
  async guardar(product) {
    const arr = await this.leer(); //leer() devuelve un [] parseado, con eso puedo puedo calcularle el length
    product.id = arr.length + 1; //al arr.length venga vacío o con contenido, le sumo +1 y lo asigno al atributo id
    arr.push(product); //sumo el nuevo producto al array
    try {
      //vuelvo a escribir el array que tengo en memoria al file
      await this.fs.promises.writeFile(
        this.file,
        JSON.stringify(arr, null, "\t")
      );
      //Si falla la escritura devuelve mensaje e imprime el error
    } catch (err) {
      console.error("error de guardado en el archivo", err);
    }
  }
  //lee del file el contenido
  async leer() {
    try {
      const arr = await this.fs.promises.readFile(this.file);
      return JSON.parse(arr);
    } catch {
      return []; //si no encuentra el file o no puedo accederlo devuelvo []
    }
  }
  async borrar() {
    try {
      await this.fs.promises.unlink(this.file);
    } catch (err) {
      console.error("error al intentar borrar archivo", err); //atrapo el error y lo muestro
    }
  }
}

module.exports = Archivo;
