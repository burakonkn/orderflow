import { customerRepository } from "../repository/customerRepository.js";
import { orderRepository } from "../repository/orderRepository.js";
import { productRepository } from "../repository/productRepository.js";

export async function getSummaryReport() {
  const all = await orderRepository.getAll();
  const activeOrders = all.filter((o) => o.status !== "cancelled");

  const totalRevenue = activeOrders.reduce(
    (total, order) => total + order.total,
    0,
  );
  const orderCount = activeOrders.length;
  const averageBasket =
    activeOrders.length !== 0 ? totalRevenue / activeOrders.length : 0;

  return {
    totalRevenue: totalRevenue,
    orderCount: orderCount,
    averageBasket: averageBasket,
  };
}

export async function getTopProduct(limit = 5) {
  const all = await orderRepository.getAll();
  const activeOrders = all.filter((o) => o.status !== "cancelled");

  const allItems = activeOrders.flatMap((o) => o.items);
  const totals = allItems.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
    return acc;
  }, {});

  const asArray = Object.entries(totals);
  const sorted = asArray.sort((a, b) => b[1] - a[1]);
  const topProduct = sorted.slice(0, limit);

  const topProductWithNames = await Promise.all(
    topProduct.map(async (p) => {
      const product = await productRepository.getById(Number(p[0]));
      return {
        productId: Number(p[0]),
        name: product.name,
        totalQuantitySold: p[1],
      };
    }),
  );

  return topProductWithNames;
}

export async function getCityDistribution() {
  const all = await orderRepository.getAll();
  const activeOrders = all.filter((o) => o.status !== "cancelled");

  const customers = await customerRepository.getAll();

  const cityById = customers.reduce((acc, c) => {
    acc[c.id] = c.city;
    return acc;
  }, {});

  const orderCity = activeOrders.reduce((acc, o) => {
    const city = cityById[o.customerId];
    acc[city] = (acc[city] ?? 0) + 1;
    return acc;
  }, {});

  const asArray = Object.entries(orderCity);
  const sorted = asArray.sort((a, b) => b[1] - a[1]);
  return sorted.map(([city, orderCount]) => ({ city, orderCount }));
}
