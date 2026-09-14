import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/components/auth/withAuth';

declare global {
  interface Window {
    FB?: {
      init: (opts: { appId: string; autoLogAppEvents?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } }) => void,
        opts: { config_id: string; response_type: string; override_default_response_type: boolean; extras?: Record<string, unknown> },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface ExchangeResult {
  ok: boolean;
  wabaId: string | null;
  accessTokenPreview: string;
  accessToken: string;
  subscribeResult: unknown;
}

function CoexistenceSetup() {
  const { logout } = useAuth();
  const router = useRouter();

  const appId    = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.NEXT_PUBLIC_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID;

  const [sdkReady, setSdkReady] = useState(false);
  const [capturedWabaId, setCapturedWabaId] = useState<string | null>(null);
  const [capturedPhoneId, setCapturedPhoneId] = useState<string | null>(null);
  const [signupEvent, setSignupEvent] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const [result, setResult] = useState<ExchangeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => { logout(); router.replace('/auth/signin'); };

  // ── Load the Facebook JS SDK once ──
  useEffect(() => {
    if (!appId || document.getElementById('facebook-jssdk')) return;

    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, xfbml: true, version: 'v22.0' });
      setSdkReady(true);
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [appId]);

  // ── Listen for Embedded Signup's postMessage events (WABA/phone IDs land here) ──
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      let data: { type?: string; event?: string; data?: { waba_id?: string; phone_number_id?: string } };
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.type !== 'WA_EMBEDDED_SIGNUP') return;

      setSignupEvent(data.event ?? 'unknown');
      if (data.data?.waba_id) setCapturedWabaId(data.data.waba_id);
      if (data.data?.phone_number_id) setCapturedPhoneId(data.data.phone_number_id);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const exchangeCode = useCallback(async (code: string, wabaId: string | null) => {
    setExchanging(true);
    setError(null);
    try {
      const res  = await fetch('/api/whatsapp/admin/embedded-signup-exchange', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, wabaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Exchange failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Exchange failed');
    } finally {
      setExchanging(false);
    }
  }, []);

  const launchSignup = () => {
    if (!window.FB || !configId) return;
    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (code) {
          exchangeCode(code, capturedWabaId);
        } else {
          setError('Embedded Signup popup closed without completing — no code received.');
        }
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        // featureType tells Meta this is a Coexistence (WhatsApp Business App)
        // onboarding, not a plain Cloud-API-only migration — without it Meta only
        // offers "disconnect" (destructive) instead of "migrate" for numbers that
        // already have the WhatsApp Business App installed.
        extras: { sessionInfoVersion: '3', featureType: 'whatsapp_business_app_onboarding' },
      },
    );
  };

  return (
    <>
      <Head><title>Admin — WhatsApp Coexistence Setup | DSeT</title></Head>

      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Coexistence Setup</h1>
                <p className="text-sm text-gray-500">Embedded Signup — test number onboarding</p>
              </div>
              <Link href="/admin/whatsapp" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                ← WhatsApp Inbox
              </Link>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Logout
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">

          {/* Hard safety banner — always visible */}
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-5">
            <p className="font-bold text-red-800">⚠️ Test number only, right now</p>
            <p className="mt-1 text-sm text-red-700">
              When the Meta popup asks you to select or enter a WhatsApp phone number, use only the <strong>test number</strong>
              {' '}(+1 555-189-6187). Do <strong>not</strong> enter or select the live DSeT number (+91 7325 948-111) here —
              that only happens later, deliberately, after full testing and explicit sign-off.
            </p>
          </div>

          {(!appId || !configId) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              <p className="font-semibold mb-1">Not configured yet</p>
              <p>
                {!appId && <>Missing <code className="font-mono">NEXT_PUBLIC_META_APP_ID</code> in `.env.local`. </>}
                {!configId && <>Missing <code className="font-mono">NEXT_PUBLIC_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID</code> — get this by walking through
                  Meta's <strong>Embedded Signup Builder</strong> (App Dashboard → Become a Partner → Embedded Signup Builder), configuring it for
                  WhatsApp Business App / Coexistence onboarding, and copying the Configuration ID it generates.</>}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <button
              onClick={launchSignup}
              disabled={!sdkReady || !appId || !configId}
              className="rounded-lg bg-[#25d366] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1ea952] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {sdkReady ? 'Connect WhatsApp Account (Embedded Signup)' : 'Loading Facebook SDK…'}
            </button>
          </div>

          {signupEvent && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
              <p><strong>Signup event:</strong> {signupEvent}</p>
              {capturedWabaId && <p><strong>WABA ID:</strong> {capturedWabaId}</p>}
              {capturedPhoneId && <p><strong>Phone Number ID:</strong> {capturedPhoneId}</p>}
            </div>
          )}

          {exchanging && <div className="text-center text-gray-500">Exchanging code for access token…</div>}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
          )}

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 space-y-2">
              <p className="font-semibold">✅ Token exchange complete</p>
              <p><strong>WABA ID:</strong> {result.wabaId ?? 'not captured — check signupEvent above'}</p>
              <p><strong>Access token (preview):</strong> <span className="font-mono">{result.accessTokenPreview}</span></p>
              <p className="text-xs text-emerald-700">
                Full token is in the network response only — this is deliberately not auto-saved anywhere. Review it, test it manually,
                and only then decide whether to promote it into real config.
              </p>
              <p><strong>App-to-WABA subscribe result:</strong></p>
              <pre className="bg-white rounded-lg p-3 overflow-x-auto text-xs">{JSON.stringify(result.subscribeResult, null, 2)}</pre>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default withAuth(CoexistenceSetup);
