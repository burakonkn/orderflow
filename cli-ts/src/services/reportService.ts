import { NotFoundError } from "../errors/notFoundError.js";
import { customerRepository } from "../repository/customerRepository.js";
import { orderRepository } from "../repository/orderRepository.js";
import { productRepository } from "../repository/productRepository.js";
import type {
  CityDistributionEntry,
  SummaryReport,
  TopProductEntry,
} from "../types.js";

export async function getSummaryReport(): Promise<SummaryReport> {
  const allOrder = await orderRepository.getAll();
  const activeOrders = allOrder.filter((o) => o.status !== "cancelled");

  const totalRevenue = activeOrders.reduce(
    (total, order) => total + order.total,
    0,
  );

  const orderCount = activeOrders.length;

  const averageBasket =
    activeOrders.length !== 0 ? totalRevenue / activeOrders.length : 0;

  return {
    totalRevenue,
    orderCount,
    averageBasket,
  };
}

export async function getTopProduct(
  limit: number = 5,
): Promise<TopProductEntry[]> {
  const allOrder = await orderRepository.getAll();
  const activeOrders = allOrder.filter((o) => o.status !== "cancelled");

  const allItems = activeOrders.flatMap((o) => o.items);
  const totals = allItems.reduce<Record<number, number>>((acc, item) => {
    acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
    return acc;
  }, {});

  const asArray = Object.entries(totals);
  const sorted = asArray.sort((a, b) => b[1] - a[1]);
  const topProduct = sorted.slice(0, limit);

  const topProductWithNames = await Promise.all(
    topProduct.map(async (p) => {
      const product = await productRepository.getById(Number(p[0]));

      if (!product) {
        throw new NotFoundError(
          `Data integrity issue: product ${p[0]} referenced in orders but not found.`,
        );
      }

      return {
        productId: Number(p[0]),
        name: product.name,
        totalQuantitySold: p[1],
      };
    }),
  );

  return topProductWithNames;
}

export async function getCityDistribution(): Promise<CityDistributionEntry[]> {
  const allOrder = await orderRepository.getAll();
  const activeOrder = allOrder.filter((o) => o.status !== "cancelled");

  const customers = await customerRepository.getAll();

  const cityById = customers.reduce<Record<number, string>>((acc, c) => {
    acc[c.id] = c.city;
    return acc;
  }, {});

  const orderCity = activeOrder.reduce<Record<string, number>>((acc, o) => {
    const city = cityById[o.customerId];

    if (typeof city === "undefined") {
      throw new NotFoundError(
        `Data integrity issue: city referenced in orders but not found.`,
      );
    }

    acc[city] = (acc[city] ?? 0) + 1;
    return acc;
  }, {});

  const asArray = Object.entries(orderCity);
  const sorted = asArray.sort((a, b) => b[1] - a[1]);

  return sorted.map(([city, orderCount]) => ({ city, orderCount }));
}
