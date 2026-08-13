import { AppError } from "../errors/appError.js";
import { ValidationError } from "../errors/validationError.js";
import { customerRepository } from "../repository/customerRepository.js";
import { orderRepository } from "../repository/orderRepository.js";
import { productRepository } from "../repository/productRepository.js";
import { createCustomer } from "../services/customerService.js";
import {
  cancelOrder,
  createOrder,
  updateOrderStatus,
} from "../services/orderService.js";
import { createProduct, getProduct } from "../services/productService.js";
import {
  getCityDistribution,
  getSummaryReport,
  getTopProduct,
} from "../services/reportService.js";

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

const orderHandlers = {
  async add(flags) {
    flags.customer = Number(flags.customer);
    const raw = flags.items;

    const parts = raw.split(",");

    const parsed = parts.map((part) => {
      const [id, qty] = part.split(":");
      return { productId: Number(id), quantity: Number(qty) };
    });

    const order = await createOrder({
      customerId: flags.customer,
      items: parsed,
    });
    console.log("Sipariş Oluşturuldu:", order);
  },
  async list(flags) {
    const listOrder = await orderRepository.getAll();
    console.table(listOrder);
  },
  async status(flags) {
    const statusOrder = await updateOrderStatus(Number(flags.id), flags.status);
    console.table(statusOrder);
  },
  async cancel(flags) {
    const cancelledOrder = await cancelOrder(Number(flags.id));
    console.log("Sipariş iptal edildi:", cancelledOrder);
  },
};

const reportHandlers = {
  async summary(flags) {
    const summary = await getSummaryReport();
    const topProducts = await getTopProduct();
    const getCity = await getCityDistribution();

    console.log("Özet:", summary);
    console.log("En çok satanlar:", topProducts);
    console.table(getCity);
  },
};

const commands = {
  product: productHandlers,
  customer: customerHandlers,
  order: orderHandlers,
  report: reportHandlers,
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
