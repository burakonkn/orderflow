import { AppError } from "../errors/appError.js";
import { ValidationError } from "../errors/validationError.js";
import { productRepository } from "../repository/productRepository.js";
import { createProduct } from "../services/productService.js";
import type {
  CityDistributionEntry,
  CommandResult,
  CreateOrderInput,
  OrderStatus,
  SummaryReport,
  TopProductEntry,
} from "../types.js";
import type { Customer, Order, Product } from "../validation/schemas.js";
import type { ParsedArguments } from "./arguments.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { customerRepository } from "../repository/customerRepository.js";
import {
  cancelOrder,
  createOrder,
  updateOrderStatus,
} from "../services/orderService.js";
import { createCustomer } from "../services/customerService.js";
import { orderRepository } from "../repository/orderRepository.js";
import {
  getCityDistribution,
  getSummaryReport,
  getTopProduct,
} from "../services/reportService.js";

//#region Product

async function addProduct(
  flags: Record<string, string>,
): Promise<CommandResult<Product>> {
  try {
    const input = {
      name: flags.name ?? "",
      price: Number(flags.price),
      stock: Number(flags.stock),
    };

    const product = await createProduct(input);
    return { ok: true, data: product };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

async function listProduct(): Promise<CommandResult<Product[]>> {
  try {
    const listProduct: Product[] = await productRepository.getAll();
    return { ok: true, data: listProduct };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

const productHandlers = {
  add: addProduct,
  list: listProduct,
};

//#endregion

//#region Customer

async function addCustomer(
  flags: Record<string, string>,
): Promise<CommandResult<Customer>> {
  try {
    const input = {
      name: flags.name ?? "",
      email: flags.email ?? "",
      city: flags.city ?? "",
      createdAt: new Date().toISOString(),
    };

    const customer = await createCustomer(input);
    return { ok: true, data: customer };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

async function listCustomer(): Promise<CommandResult<Customer[]>> {
  try {
    const listCustomer: Customer[] = await customerRepository.getAll();
    return { ok: true, data: listCustomer };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

const customerHandlers = {
  add: addCustomer,
  list: listCustomer,
};

//#endregion

//#region Order

async function addOrder(
  flags: Record<string, string>,
): Promise<CommandResult<Order>> {
  try {
    const raw = flags.items ?? "";
    const parts = raw.split(",");
    const parsedItems = parts.map((part) => {
      const [id, qty] = part.split(":");
      return { productId: Number(id), quantity: Number(qty) };
    });

    const input: CreateOrderInput = {
      customerId: Number(flags.customerId),
      items: parsedItems,
    };

    const order = await createOrder(input);
    return { ok: true, data: order };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

async function listOrder(): Promise<CommandResult<Order[]>> {
  try {
    const listOrder: Order[] = await orderRepository.getAll();
    return { ok: true, data: listOrder };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

function isOrderStatus(value: string): value is OrderStatus {
  return VALID_STATUSES.includes(value);
}

async function status(
  flags: Record<string, string>,
): Promise<CommandResult<Order>> {
  const rawStatus = flags.status ?? "";
  if (!isOrderStatus(rawStatus)) {
    return {
      ok: false,
      error: `Invalid status: ${rawStatus}`,
      code: "VALIDATION_ERROR",
    };
  }

  try {
    const statusOrder = await updateOrderStatus(Number(flags.id), rawStatus);
    return { ok: true, data: statusOrder };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

async function cancel(
  flags: Record<string, string>,
): Promise<CommandResult<Order>> {
  try {
    const cancelledOrder = await cancelOrder(Number(flags.id));
    return { ok: true, data: cancelledOrder };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

const orderHandlers = {
  add: addOrder,
  list: listOrder,
  status: status,
  cancel: cancel,
};

//#endregion

//#region Report

async function summary(flags: Record<string, string>): Promise<
  CommandResult<{
    summary: SummaryReport;
    topProducts: TopProductEntry[];
    cityDistribution: CityDistributionEntry[];
  }>
> {
  try {
    const summaryReport = await getSummaryReport();
    const topProducts = await getTopProduct();
    const getCity = await getCityDistribution();

    return {
      ok: true,
      data: {
        summary: summaryReport,
        topProducts,
        cityDistribution: getCity,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }
}

const reportHandlers = {
  summary: summary,
};

//#endregion

const commands: Record<
  string,
  Record<
    string,
    (flags: Record<string, string>) => Promise<CommandResult<unknown>>
  >
> = {
  product: productHandlers,
  customer: customerHandlers,
  order: orderHandlers,
  report: reportHandlers,
};

export async function runCommand(parsed: ParsedArguments): Promise<void> {
  const [entity, action] = parsed.positional;

  if (typeof entity === "undefined") {
    throw new NotFoundError("runCommand entity not found.");
  }

  if (typeof action === "undefined") {
    throw new NotFoundError("runCommand action not found.");
  }

  try {
    const group = commands[entity];
    if (!group) {
      throw new ValidationError("Geçersiz Komut!");
    }

    const handler = group[action];
    if (!handler) {
      throw new ValidationError("Geçersiz Komut!");
    }

    const result = await handler(parsed.flags);

    if (result.ok) {
      console.log("Success:", result.data);
    } else {
      console.log("Error:", result.error, `(${result.code})`);
    }
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
