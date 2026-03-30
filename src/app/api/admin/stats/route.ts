import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminAuth } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderItem {
  sku: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
}

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getShippingName(order: Order): { firstName: string; lastName: string } {
  const addr = order.shipping_address as { firstName?: string; lastName?: string } | null;
  return {
    firstName: addr?.firstName || '',
    lastName: addr?.lastName || '',
  };
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

    // Fetch all orders from Supabase
    const supabase = getAdminClient();
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Stats] Supabase error:', error);
    }

    const orderList = allOrders || [];

    // Filter orders by date range
    const orders = orderList.filter(o => new Date(o.created_at) >= cutoff);

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const paidOrders = orders.filter(o => o.status === 'paid').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

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
      const key = toDateKey(o.created_at);
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
      const items = (o.items as unknown as OrderItem[]) || [];
      for (const item of items) {
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
      { stage: 'Paid', count: paidOrders + shippedOrders + deliveredOrders },
      { stage: 'Shipped', count: shippedOrders + deliveredOrders },
      { stage: 'Delivered', count: deliveredOrders },
    ];

    // Daily orders by status for stacked chart
    const statusDailyMap = new Map<string, Record<string, number>>();
    for (const [key] of dailyMap) {
      statusDailyMap.set(key, { pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0 });
    }
    for (const o of orders) {
      const key = toDateKey(o.created_at);
      const entry = statusDailyMap.get(key);
      if (entry && o.status in entry) {
        entry[o.status] += 1;
      }
    }
    const dailyByStatus = Array.from(statusDailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    // Average fulfillment time (delivered orders: created_at → updated_at)
    const deliveredList = orders.filter(o => o.status === 'delivered');
    let avgFulfillmentHours = 0;
    if (deliveredList.length > 0) {
      const totalHours = deliveredList.reduce((sum, o) => {
        const created = new Date(o.created_at).getTime();
        const updated = new Date(o.updated_at).getTime();
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
      const prevOrders = orderList.filter(o => {
        const d = new Date(o.created_at);
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

    // Recent orders (last 10)
    const recentOrders = orderList.slice(0, 10);

    // Get user count from Supabase Auth
    let userCount = 0;
    try {
      const listResult = await getAdminAuth().listUsers(1);
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
        paid: paidOrders,
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
      recentOrders: recentOrders.map(o => {
        const names = getShippingName(o);
        return {
          id: o.id,
          orderId: o.id,
          status: o.status.toUpperCase(),
          total: o.total,
          email: o.email,
          customer: `${names.firstName} ${names.lastName}`.trim() || o.email,
          createdAt: o.created_at,
        };
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Stats]', message);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
