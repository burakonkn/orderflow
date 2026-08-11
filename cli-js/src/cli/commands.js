import { AppError } from "../errors/appError.js";
import { ValidationError } from "../errors/validationError.js";
import { customerRepository } from "../repository/customerRepository.js";
import { productRepository } from "../repository/productRepository.js";
import { createCustomer } from "../services/customerService.js";
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

const customerHandlers = {
  async add(flags) {
    const createdCustomer = await createCustomer(flags);
    console.log("Müşteri oluşturuldu:", createdCustomer);
  },
  async list(flags) {
    const listCustomer = await customerRepository.getAll();
    console.table(listCustomer);
  },
};

const commands = {
  product: productHandlers,
  customer: customerHandlers,
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
      if (error.details) {
        console.log("Detay:", error.details);
      }
    } else {
      throw error;
    }
  }
}
