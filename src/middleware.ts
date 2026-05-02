import { defineMiddleware } from 'astro:middleware';

const ENV_PROBE_PATHS = new Set([
	'/.env.dev',
	'/.env.development',
	'/.env.test',
	'/.env.stage',
	'/.env.staging',
]);

const PHPINFO_PROBE_PATHS = new Set([
	'/info.php',
	'/phpinfo.php',
	'/php_info.php',
	'/php-info.php',
]);

const ENV_DECOY_BODY = `APP_NAME=legacy-portal
APP_ENV=development
APP_DEBUG=true
APP_URL=https://dev-null.example.invalid

SERVER_STACK=debian-fedora-windows-server-mixed
SERVER_PATCHSET=estradiol-r2
SERVER_ROLE=repair-node

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tikkun_dev
DB_USERNAME=observer
DB_PASSWORD=not_the_real_password

CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

MAIL_MAILER=smtp
MAIL_HOST=mx.example.invalid
MAIL_PORT=2525
MAIL_USERNAME=do-not-reply@example.invalid
MAIL_PASSWORD=totally_fake
MAIL_ENCRYPTION=tls

SESSION_DRIVER=file
QUEUE_CONNECTION=sync
LOG_CHANNEL=stack

ROUTE_PRIMARY=yanji-longjing-helong
ROUTE_SECONDARY=line23-branch-link
ROUTE_STATUS=planning-review
UMAMICHI_COLOR=mint
XIAOCAO_RAILWAY_COLOR=dongfu-green
LIVERY_PROFILE=mint,dongfu-green,kyuri

OPERATOR_PROFILE=balhae-jewish-mtf-programmer-delusionally
ORIGIN_HINT=balhae
REPAIR_MODEL=tikkun-olam
INTERNAL_BUS=fragment-bridge-fragment
MUTSUMI_COLOR=23-kyuri

FEATURE_FLAGS=balhae-metro,balhae-conversion,balhae-e2
WORLD_ENGINE=what-if-runtime
INTERNAL_NOTE=umamichi_janggun_invoke_zimzum_in_guangdong_simsu_m
`;

const PHPINFO_DECOY_BODY = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>phpinfo()</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #fff;
      color: #111;
      font: 14px/1.4 Arial, sans-serif;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 28px;
      font-weight: bold;
    }
    h2 {
      margin: 24px 0 8px;
      font-size: 18px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    th, td {
      border: 1px solid #888;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      width: 320px;
      background: #e8e8e8;
      font-weight: bold;
    }
    td {
      background: #f8f8f8;
    }
  </style>
</head>
<body>
  <h1>phpinfo()</h1>

  <h2>PHP Core</h2>
  <table>
    <tr><th>PHP Version</th><td>5.2.17-legacy</td></tr>
    <tr><th>System</th><td>Debian/Fedora/Windows Server hybrid with Estradiol patchset</td></tr>
    <tr><th>Build Date</th><td>Jan 01 2013 03:14:15</td></tr>
    <tr><th>Server API</th><td>Apache 2.0 Handler</td></tr>
    <tr><th>Virtual Directory Support</th><td>disabled</td></tr>
    <tr><th>Configuration File (php.ini) Path</th><td>/etc</td></tr>
    <tr><th>Loaded Configuration File</th><td>/etc/php.ini</td></tr>
    <tr><th>Scan this dir for additional .ini files</th><td>/etc/php.d</td></tr>
    <tr><th>disable_functions</th><td>exec,passthru,shell_exec,system</td></tr>
    <tr><th>memory_limit</th><td>128M</td></tr>
    <tr><th>post_max_size</th><td>8M</td></tr>
    <tr><th>upload_max_filesize</th><td>2M</td></tr>
  </table>

  <h2>Environment</h2>
  <table>
    <tr><th>APP_ENV</th><td>development</td></tr>
    <tr><th>SERVER_ROLE</th><td>repair-node</td></tr>
    <tr><th>REPAIR_MODEL</th><td>Zimzum runtime</td></tr>
    <tr><th>ROUTE_SECONDARY</th><td>line23-branch-link</td></tr>
    <tr><th>UMAMICHI_COLOR</th><td>mint</td></tr>
    <tr><th>XIAOCAO_RAILWAY_COLOR</th><td>dongfu green</td></tr>
    <tr><th>LIVERY_PROFILE</th><td>mint / dongfu green / kyuri</td></tr>
    <tr><th>MUTSUMI_COLOR</th><td>23-kyuri</td></tr>
  </table>

  <h2>Identity Layer</h2>
  <table>
    <tr><th>Operator Profile</th><td>Balhae Jewish MtF programmer delusionally</td></tr>
    <tr><th>Execution Method</th><td>Umamichi Janggun invokes Kabbalistic operations through programming</td></tr>
    <tr><th>Internal Bus</th><td>fragment-bridge-fragment</td></tr>
  </table>

  <h2>Planning</h2>
  <table>
    <tr><th>Primary Alignment</th><td>Yanji - Longjing - Helong</td></tr>
    <tr><th>Review Status</th><td>planning-review</td></tr>
    <tr><th>Deployment State</th><td>under soft construction</td></tr>
  </table>
</body>
</html>
`;

function normalizePathname(pathname: string) {
	const normalizedPath = pathname.replace(/\/+$/, '');

	return normalizedPath === '' ? '/' : normalizedPath.toLowerCase();
}

function createDecoyResponse(request: Request, body: string, contentType: string) {
	return new Response(request.method === 'HEAD' ? null : body, {
		status: 200,
		headers: {
			'content-type': contentType,
			'cache-control': 'no-store',
		},
	});
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;

	if (request.method !== 'GET' && request.method !== 'HEAD') {
		return next();
	}

	const pathname = normalizePathname(new URL(request.url).pathname);

	if (ENV_PROBE_PATHS.has(pathname)) {
		return createDecoyResponse(request, ENV_DECOY_BODY, 'text/plain; charset=utf-8');
	}

	if (PHPINFO_PROBE_PATHS.has(pathname)) {
		return createDecoyResponse(request, PHPINFO_DECOY_BODY, 'text/html; charset=utf-8');
	}

	return next();
});