import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';

const SECTIONS = [
  { label: 'Contacts',     href: '/admin/contacts',     desc: 'Contact form submissions',         color: '#10b981', icon: '📩' },
  { label: 'Chat Leads',   href: '/admin/leads',        desc: 'Interested visitors from chatbot', color: '#5e17ea', icon: '💬' },
  { label: 'Events',       href: '/admin/events',       desc: 'Manage events and media',          color: '#1e90ff', icon: '📅' },
  { label: 'Blog',         href: '/admin/blog',         desc: 'Write and publish blog posts',     color: '#ff851b', icon: '✍️' },
  { label: 'WhatsApp',     href: '/admin/whatsapp',     desc: 'AI conversations & handovers',     color: '#25d366', icon: '📱' },
  { label: 'Academy',      href: '/admin/academy-registrations', desc: 'Cohort enrolments & payments', color: '#20c4ad', icon: '🎓' },
];

type TestStatus = 'idle' | 'loading' | 'ok' | 'fail';

function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMsg,    setTestMsg]    = useState('');

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  const handleTestEmail = async () => {
    setTestStatus('loading');
    setTestMsg('');
    try {
      const res  = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setTestStatus('ok');
        setTestMsg(`Test email sent to ${data.sentTo}. Check your inbox.`);
      } else {
        setTestStatus('fail');
        setTestMsg(data.error ?? 'Unknown error.');
      }
    } catch {
      setTestStatus('fail');
      setTestMsg('Network error. Could not reach the server.');
    }
  };

  return (
    <>
      <Head><title>Admin Dashboard — DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">DSeT Admin</h1>
              <p className="text-sm text-gray-500">Manage your website content</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="mb-4 text-3xl">{s.icon}</div>
                <h2 className="text-base font-bold text-gray-900 group-hover:text-[#5e17ea] transition-colors">
                  {s.label}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
                <div
                  className="mt-4 h-1 w-10 rounded-full transition-all group-hover:w-16"
                  style={{ backgroundColor: s.color }}
                />
              </Link>
            ))}
          </div>

          {/* Email health check */}
          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Email Notification Check</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Send a test email to verify SMTP is working correctly.
                </p>
              </div>
              <button
                onClick={handleTestEmail}
                disabled={testStatus === 'loading'}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {testStatus === 'loading' ? 'Sending…' : 'Send Test Email'}
              </button>
            </div>

            {testStatus === 'ok' && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <span className="text-lg leading-none">✅</span>
                <span>{testMsg}</span>
              </div>
            )}
            {testStatus === 'fail' && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold mb-1">❌ Email delivery failed</p>
                <p className="font-mono text-xs break-all">{testMsg}</p>
                <p className="mt-2 text-xs text-red-500">
                  Check that EMAIL_USER, EMAIL_PASS, and CONTACT_EMAIL are correctly set in your .env.local file.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminDashboard);
