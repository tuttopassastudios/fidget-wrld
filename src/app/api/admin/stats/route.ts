import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminAuth } from '@/lib/firebase-admin';
import { dcQuery } from '@/lib/data-connect-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  orders: Array<{
    id: string;
    orderId: string;
    status: string;
    total: number;
    contactEmail: string;
    createdAt: string;
    updatedAt: string;
    shipFirstName: string;
    shipLastName: string;
    orderItems_on_order: OrderItem[];
  }>;
}

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Parse date range filter
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30'; // days: 7, 30, 90, or "all"
    const now = new Date();
    const cutoff = range === 'all'
      ? new Date(0)
      : new Date(now.getTime() - Number(range) * 24 * 60 * 60 * 1000);

    // Fetch all orders via Data Connect
    // ListAllOrders may not be deployed yet — gracefully handle missing/empty data
    let allOrders: OrderData['orders'] = [];
    try {
      const result = await dcQuery<OrderData>('ListAllOrders', {});
      allOrders = result?.orders || [];
    } catch {
      // Query not deployed or Data Connect unavailable — show empty stats
    }

    // Filter orders by date range
    const orders = allOrders.filter(o => new Date(o.createdAt) >= cutoff);

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
    const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

    // Daily aggregation for charts
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    // Pre-fill date range so chart has no gaps
    const daysToFill = range === 'all' ? 30 : Number(range);
    for (let i = daysToFill - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = toDateKey(d.toISOString());
      dailyMap.set(key, { revenue: 0, orders: 0 });
    }

    for (const o of orders) {
      const key = toDateKey(o.createdAt);
      const existing = dailyMap.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += o.total || 0;
      existing.orders += 1;
      dailyMap.set(key, existing);
    }

    const dailyStats = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }));

    // Top products by revenue
    const productMap = new Map<string, { name: string; revenue: number; unitsSold: number }>();
    for (const o of orders) {
      for (const item of o.orderItems_on_order || []) {
        const key = item.name;
        const existing = productMap.get(key) || { name: item.name, revenue: 0, unitsSold: 0 };
        existing.revenue += item.price * item.quantity;
        existing.unitsSold += item.quantity;
        productMap.set(key, existing);
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        revenue: Math.round(p.revenue * 100) / 100,
        unitsSold: p.unitsSold,
      }));

    // Order funnel — cumulative counts through the pipeline
    const funnel = [
      { stage: 'Placed', count: totalOrders },
      { stage: 'Processing', count: processingOrders + shippedOrders + deliveredOrders },
      { stage: 'Shipped', count: shippedOrders + deliveredOrders },
      { stage: 'Delivered', count: deliveredOrders },
    ];

    // Daily orders by status for stacked chart
    const statusDailyMap = new Map<string, Record<string, number>>();
    for (const [key] of dailyMap) {
      statusDailyMap.set(key, { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
    }
    for (const o of orders) {
      const key = toDateKey(o.createdAt);
      const entry = statusDailyMap.get(key);
      if (entry) {
        const s = o.status.toLowerCase();
        if (s in entry) entry[s] += 1;
      }
    }
    const dailyByStatus = Array.from(statusDailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    // Average fulfillment time (delivered orders: createdAt → updatedAt)
    const deliveredList = orders.filter(o => o.status === 'DELIVERED');
    let avgFulfillmentHours = 0;
    if (deliveredList.length > 0) {
      const totalHours = deliveredList.reduce((sum, o) => {
        const created = new Date(o.createdAt).getTime();
        const updated = new Date(o.updatedAt).getTime();
        return sum + (updated - created) / (1000 * 60 * 60);
      }, 0);
      avgFulfillmentHours = Math.round((totalHours / deliveredList.length) * 10) / 10;
    }

    // All products (not just top 5) for analytics page
    const allProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(p => ({
        name: p.name,
        revenue: Math.round(p.revenue * 100) / 100,
        unitsSold: p.unitsSold,
      }));

    // Previous period comparison (for trend indicators)
    let prevPeriod = { totalOrders: 0, totalRevenue: 0, aov: 0 };
    if (range !== 'all') {
      const rangeDays = Number(range);
      const prevCutoff = new Date(cutoff.getTime() - rangeDays * 24 * 60 * 60 * 1000);
      const prevOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= prevCutoff && d < cutoff;
      });
      const prevTotal = prevOrders.length;
      const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      prevPeriod = {
        totalOrders: prevTotal,
        totalRevenue: Math.round(prevRevenue * 100) / 100,
        aov: prevTotal > 0 ? Math.round((prevRevenue / prevTotal) * 100) / 100 : 0,
      };
    }

    // Recent orders (last 10, always from full set)
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Get user count from Firebase Auth
    let userCount = 0;
    try {
      const listResult = await getAdminAuth().listUsers(1);
      // Firebase doesn't expose total count directly,
      // so we iterate through pages
      userCount = listResult.users.length;
      let pageToken = listResult.pageToken;
      while (pageToken) {
        const nextPage = await getAdminAuth().listUsers(1000, pageToken);
        userCount += nextPage.users.length;
        pageToken = nextPage.pageToken;
      }
    } catch {
      // Auth might not have users yet
    }

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      aov,
      userCount,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      dailyStats,
      dailyByStatus,
      topProducts,
      allProducts,
      funnel,
      avgFulfillmentHours,
      prevPeriod,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderId: o.orderId,
        status: o.status,
        total: o.total,
        email: o.contactEmail,
        customer: `${o.shipFirstName} ${o.shipLastName}`,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Stats]', message);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
