/**
 * Email service — template rendering + automation triggers via Resend.
 *
 * SQL to run in Supabase SQL editor before using this module:
 *
 * create table public.email_templates (
 *   id          uuid primary key default gen_random_uuid(),
 *   name        text not null,
 *   slug        text unique not null,
 *   description text,
 *   subject     text not null,
 *   html_body   text not null default '',
 *   text_body   text not null default '',
 *   enabled     boolean not null default true,
 *   created_at  timestamptz not null default now(),
 *   updated_at  timestamptz not null default now()
 * );
 *
 * create table public.email_automations (
 *   id          uuid primary key default gen_random_uuid(),
 *   trigger     text unique not null,
 *   label       text not null,
 *   description text,
 *   template_id uuid references public.email_templates(id) on delete set null,
 *   enabled     boolean not null default false,
 *   updated_at  timestamptz not null default now()
 * );
 *
 * insert into public.email_automations (trigger, label, description) values
 *   ('welcome', 'Welcome Email', 'Sent when a new user creates an account'),
 *   ('order_confirmation', 'Order Confirmation', 'Sent when an order is placed successfully'),
 *   ('shipping_notification', 'Shipping Notification', 'Sent when an order is marked as shipped');
 *
 * alter table public.email_templates enable row level security;
 * alter table public.email_automations enable row level security;
 * create policy "service role only" on public.email_templates using (false);
 * create policy "service role only" on public.email_automations using (false);
 */

import { Resend } from 'resend';
import { getAdminClient } from './supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);
export const EMAIL_FROM = 'Fidget WRLD <noreply@fidgetwrld.com>';

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

interface AutomationRow {
  enabled: boolean;
  template_id: string | null;
  email_templates:
    | { id: string; subject: string; html_body: string; text_body: string; enabled: boolean }
    | { id: string; subject: string; html_body: string; text_body: string; enabled: boolean }[]
    | null;
}

/** Fire-and-forget email trigger. Looks up automation config + template from DB. */
export async function triggerEmail(
  trigger: string,
  to: string,
  vars: Record<string, string>
): Promise<void> {
  try {
    const supabase = getAdminClient();
    const { data: rawAutomation } = await supabase
      .from('email_automations')
      .select('enabled, template_id, email_templates(id, subject, html_body, text_body, enabled)')
      .eq('trigger', trigger)
      .single();

    const automation = rawAutomation as AutomationRow | null;

    if (!automation?.enabled || !automation.template_id) return;

    // Supabase join returns array or object depending on relationship type
    const tpl = Array.isArray(automation.email_templates)
      ? automation.email_templates[0]
      : automation.email_templates as { id: string; subject: string; html_body: string; text_body: string; enabled: boolean } | null;

    if (!tpl?.enabled) return;

    const subject = renderTemplate(tpl.subject, vars);
    const html = renderTemplate(tpl.html_body, vars);
    const text = tpl.text_body ? renderTemplate(tpl.text_body, vars) : undefined;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      ...(text ? { text } : {}),
    });

    if (error) console.error(`[email] trigger "${trigger}" failed:`, error);
  } catch (err) {
    console.error(`[email] triggerEmail "${trigger}" error:`, err);
  }
}
