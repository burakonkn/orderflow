import { NotFoundError } from "../../common/errors/notFoundError.js";
import { prisma } from "../../db/prisma.js";

export async function getSummaryReport() {
  const result = await prisma.order.aggregate({
    where: { status: { not: "CANCELLED" } },
    _sum: { total: true },
    _avg: { total: true },
    _count: true,
  });

  return {
    totalRevenue: Number(result._sum.total ?? 0),
    orderCount: result._count,
    averageBasket: Number(result._avg.total ?? 0),
  };
}

export async function getTopProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const topProducts = await Promise.all(
    grouped.map(async (g) => {
      const product = await prisma.product.findUnique({
        where: { id: g.productId },
      });

      if (!product) {
        throw new NotFoundError("Veri bütünlüğü sorunu.");
      }

      return {
        productId: g.productId,
        name: product.name,
        totalQuantitySold: g._sum.quantity ?? 0,
      };
    }),
  );

  return topProducts;
}

export async function getCityDistribution() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { customer: { select: { city: true } } },
  });

  const orderCity = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.customer.city] = (acc[o.customer.city] ?? 0) + 1;
    return acc;
  }, {});

  const asArray = Object.entries(orderCity);
  const sorted = asArray.sort((a, b) => b[1] - a[1]);

  return sorted.map(([city, orderCount]) => ({ city, orderCount }));
}
