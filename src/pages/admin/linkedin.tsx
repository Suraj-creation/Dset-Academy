import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LinkedInAdminPage() {
  const router = useRouter();
  const status = router.query.status as string | undefined;
  const msg = router.query.msg as string | undefined;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 560, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ color: '#5e17ea', fontSize: 14, textDecoration: 'none' }}>
          ← Admin
        </Link>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>LinkedIn Auto-Post</h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        Connect your LinkedIn account so blog posts publish automatically to the DSeT company page.
      </p>

      {status === 'connected' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#166534', fontSize: 14 }}>
          ✅ LinkedIn connected successfully! Blog posts will now auto-post to the DSeT company page.
        </div>
      )}

      {status === 'error' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#991b1b', fontSize: 14 }}>
          ❌ Connection failed. {msg ? <span><strong>Reason:</strong> {decodeURIComponent(msg)}</span> : 'Please try again.'}
        </div>
      )}

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Connect LinkedIn</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          Click below to authorize DSeT to post on the company page. You&apos;ll be redirected to LinkedIn — log in with your Content Admin account.
        </p>

        <a
          href="/api/auth/linkedin"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: '#0a66c2',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Connect with LinkedIn
        </a>
      </div>

      <div style={{ marginTop: 24, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#92400e' }}>
        <strong>Note:</strong> LinkedIn access token expires in ~2 months. Come back here to reconnect when needed.
      </div>
    </div>
  );
}
