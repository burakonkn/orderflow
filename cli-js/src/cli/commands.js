import { AppError } from "../errors/appError.js";
import { ValidationError } from "../errors/validationError.js";
import { productRepository } from "../repository/productRepository.js";
import { createProduct, getProduct } from "../services/productService.js";

const productHandlers = {
  async add(flags) {
    flags.price = Number(flags.price);
    flags.stock = Number(flags.stock);
    const createdProduct = await createProduct(flags);
    console.log("Ürün oluşturuldu:", createdProduct);
  },

  async list(flags) {
    const listProduct = await productRepository.getAll();
    console.table(listProduct);
  },
};

const commands = {
  product: productHandlers,
};

export async function runCommand({ positional, flags }) {
  const [entity, action] = positional;

  try {
    const group = commands[entity];
    if (!group) {
      throw new ValidationError("Geçersiz Komut!");
    }

    const handler = group[action];
    if (!handler) {
      throw new ValidationError("Geçersiz Komut!");
    }

    await handler(flags);
  } catch (error) {
    if (error instanceof AppError) {
      console.log("Hata:", error.message);
    } else {
      throw error;
    }
  }
}
