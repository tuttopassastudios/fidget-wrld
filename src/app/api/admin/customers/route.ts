import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminAuth } from '@/lib/admin-auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

function toMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(getClientIp(request.headers), { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const caller = await verifyAdminRequest(request.headers.get('authorization'));
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Fetch all orders from Supabase
    const supabase = getAdminClient();
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Customers] Supabase error:', error);
    }

    const orders = orderData || [];

    // ---- Customer analysis (group by email) ----
    const customerMap = new Map<string, {
      email: string;
      orders: Order[];
      totalSpent: number;
      firstOrderDate: string;
      lastOrderDate: string;
    }>();

    for (const o of orders) {
      const email = o.email.toLowerCase();
      const existing = customerMap.get(email);
      if (existing) {
        existing.orders.push(o);
        existing.totalSpent += o.total || 0;
        if (o.created_at < existing.firstOrderDate) existing.firstOrderDate = o.created_at;
        if (o.created_at > existing.lastOrderDate) existing.lastOrderDate = o.created_at;
      } else {
        customerMap.set(email, {
          email,
          orders: [o],
          totalSpent: o.total || 0,
          firstOrderDate: o.created_at,
          lastOrderDate: o.created_at,
        });
      }
    }

    const customers = Array.from(customerMap.values());
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.orders.length > 1).length;
    const newCustomers = totalCustomers - repeatCustomers;
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 1000) / 10 : 0;

    // CLV stats
    const clvValues = customers.map(c => c.totalSpent);
    const avgCLV = totalCustomers > 0 ? clvValues.reduce((a, b) => a + b, 0) / totalCustomers : 0;
    const topCLVCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => ({
        email: c.email,
        totalSpent: Math.round(c.totalSpent * 100) / 100,
        orderCount: c.orders.length,
        firstOrder: c.firstOrderDate,
        lastOrder: c.lastOrderDate,
      }));

    // ---- Customer acquisition over time (Supabase Auth signup dates) ----
    const acquisitionMap = new Map<string, number>();
    // Pre-fill last 30 days
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      acquisitionMap.set(toDateKey(d.toISOString()), 0);
    }

    try {
      let pageToken: string | undefined;
      do {
        const listResult = await getAdminAuth().listUsers(1000, pageToken);
        for (const u of listResult.users) {
          if (u.metadata.creationTime) {
            const key = toDateKey(u.metadata.creationTime);
            acquisitionMap.set(key, (acquisitionMap.get(key) || 0) + 1);
          }
        }
        pageToken = listResult.pageToken;
      } while (pageToken);
    } catch {
      // Auth unavailable
    }

    const acquisitionByDay = Array.from(acquisitionMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, signups: count }));

    // ---- Retention cohorts (by first-order month) ----
    const cohortMap = new Map<string, {
      cohortMonth: string;
      customerCount: number;
      months: Map<string, Set<string>>; // month -> set of emails who ordered
    }>();

    for (const c of customers) {
      const cohortMonth = toMonthKey(c.firstOrderDate);
      if (!cohortMap.has(cohortMonth)) {
        cohortMap.set(cohortMonth, {
          cohortMonth,
          customerCount: 0,
          months: new Map(),
        });
      }
      const cohort = cohortMap.get(cohortMonth)!;
      cohort.customerCount += 1;

      // Track which months this customer placed orders
      for (const o of c.orders) {
        const orderMonth = toMonthKey(o.created_at);
        if (!cohort.months.has(orderMonth)) {
          cohort.months.set(orderMonth, new Set());
        }
        cohort.months.get(orderMonth)!.add(c.email);
      }
    }

    // Build sorted list of all months
    const allMonths = Array.from(new Set(
      orders.map(o => toMonthKey(o.created_at))
    )).sort();

    const cohorts = Array.from(cohortMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cohortMonth, data]) => {
        const retention: Record<string, number> = {};
        for (const month of allMonths) {
          if (month >= cohortMonth) {
            const activeCount = data.months.get(month)?.size || 0;
            retention[month] = data.customerCount > 0
              ? Math.round((activeCount / data.customerCount) * 1000) / 10
              : 0;
          }
        }
        return {
          cohortMonth,
          customerCount: data.customerCount,
          retention,
        };
      });

    // ---- Promo code analytics ----
    const promoMap = new Map<string, {
      code: string;
      usageCount: number;
      totalDiscount: number;
      totalRevenue: number;
      orderCount: number;
    }>();

    for (const o of orders) {
      if (o.promo_code) {
        const code = o.promo_code.toUpperCase();
        const existing = promoMap.get(code) || {
          code,
          usageCount: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          orderCount: 0,
        };
        existing.usageCount += 1;
        existing.totalDiscount += o.discount || 0;
        existing.totalRevenue += o.total || 0;
        existing.orderCount += 1;
        promoMap.set(code, existing);
      }
    }

    const promoStats = Array.from(promoMap.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .map(p => ({
        code: p.code,
        usageCount: p.usageCount,
        totalDiscount: Math.round(p.totalDiscount * 100) / 100,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100,
        avgOrderValue: p.orderCount > 0 ? Math.round((p.totalRevenue / p.orderCount) * 100) / 100 : 0,
      }));

    // ---- Guest vs registered breakdown ----
    const registeredOrders = orders.filter(o => o.user_id !== null).length;
    const guestOrders = orders.length - registeredOrders;

    return NextResponse.json({
      summary: {
        totalCustomers,
        newCustomers,
        repeatCustomers,
        repeatRate,
        avgCLV: Math.round(avgCLV * 100) / 100,
        registeredOrders,
        guestOrders,
      },
      topCustomers: topCLVCustomers,
      acquisitionByDay,
      cohorts,
      promoStats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Customers]', message);
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}
