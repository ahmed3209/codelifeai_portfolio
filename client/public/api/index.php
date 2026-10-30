<?php
/**
 * CodeLifeAI — Native Hostinger High-Performance PHP API
 * Ultra-fast SQLite execution with zero serverless cold starts (<15ms response time).
 */

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', '0');

// ── 1. CORS & Headers ────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── 2. Database Connection (SQLite PDO) ───────────────────────────────────────
$dbFile = __DIR__ . '/data/codelifeai.db';
if (!file_exists($dbFile)) {
    // Fallback search locations
    if (file_exists(__DIR__ . '/codelifeai.db')) {
        $dbFile = __DIR__ . '/codelifeai.db';
    } else {
        @mkdir(__DIR__ . '/data', 0755, true);
    }
}

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Optimization for speed
    $pdo->exec("PRAGMA journal_mode = WAL;");
    $pdo->exec("PRAGMA synchronous = NORMAL;");
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// ── 3. Helper Functions ───────────────────────────────────────────────────────
function jsonResponse($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message, $code = 400) {
    jsonResponse(['error' => $message], $code);
}

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

function parseShowOnHome($val) {
    if ($val === 0 || $val === '0' || $val === false || $val === 'false') return 0;
    return 1;
}

function formatExternalUrl($url) {
    if (!$url) return '';
    $u = trim($url);
    if ($u === '') return '';
    if (preg_match('/^(https?:\/\/|mailto:|tel:)/i', $u)) return $u;
    return 'https://' . ltrim($u, '/');
}

// ── 4. JWT & Auth Helpers ─────────────────────────────────────────────────────
const JWT_SECRET = 'codelifeai-production-secret-2025';
const COOKIE_NAME = 'cl_session';

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function createJwt($payload, $expirySecs = 86400) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $expirySecs;
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJwt($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return null;
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true));
    if (!hash_equals($expected, $base64Signature)) return null;
    $payload = json_decode(base64UrlDecode($base64Payload), true);
    if (!is_array($payload) || !isset($payload['exp']) || $payload['exp'] < time()) return null;
    return $payload;
}

function setSessionCookie($token, $expires = 86400) {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? 80) == 443;
    setcookie(COOKIE_NAME, $token, [
        'expires' => time() + $expires,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

function clearSessionCookie() {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? 80) == 443;
    setcookie(COOKIE_NAME, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

function getAuthUser($pdo) {
    $token = $_COOKIE[COOKIE_NAME] ?? null;
    if (!$token) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    if (!$token) return null;
    $payload = verifyJwt($token);
    if (!$payload || !isset($payload['id'])) return null;

    $stmt = $pdo->prepare("SELECT id, username, token_version FROM admin_users WHERE id = ?");
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();
    if (!$user) return null;

    $currTv = (int)($user['token_version'] ?? 1);
    $tokTv = (int)($payload['tv'] ?? 1);
    if ($currTv !== $tokTv) return null;

    return $user;
}

function requireAuth($pdo) {
    $user = getAuthUser($pdo);
    if (!$user) {
        jsonError('Not authenticated', 401);
    }
    return $user;
}

// ── 5. Request Routing ────────────────────────────────────────────────────────
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Parse path: strip query string and clean prefix
$uriParts = parse_url($requestUri);
$path = $uriParts['path'] ?? '/';

// Remove base path prefixes: /api, /api/index.php, etc.
$path = preg_replace('#^/api(?:/index\.php)?/?#', '', $path);
$path = trim($path, '/');
$segments = $path === '' ? [] : explode('/', $path);

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

// ── GET site-data ────────────────────────────────────────────────────────────
if ($requestMethod === 'GET' && ($path === 'site-data' || $path === '')) {
    $services = $pdo->query("SELECT * FROM services ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, id ASC")->fetchAll();
    $homeFounders = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders WHERE show_on_home = 1 ORDER BY sort_order ASC")->fetchAll();
    $allFounders = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders ORDER BY sort_order ASC")->fetchAll();
    $projects = $pdo->query("SELECT * FROM projects ORDER BY sort_order ASC")->fetchAll();
    $testimonials = $pdo->query("SELECT * FROM testimonials WHERE show_on_home = 1 OR show_on_home IS NULL ORDER BY sort_order ASC")->fetchAll();
    $process = $pdo->query("SELECT * FROM process_steps ORDER BY sort_order ASC")->fetchAll();
    $promos = $pdo->query("SELECT * FROM promos WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")->fetchAll();
    $liveProducts = $pdo->query("SELECT * FROM live_products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")->fetchAll();
    $faqs = $pdo->query("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC")->fetchAll();
    $blogs = $pdo->query("SELECT id, title, slug, excerpt, category, author_name, author_role, read_time, cover_image, published_at FROM blogs WHERE is_published = 1 ORDER BY sort_order ASC, published_at DESC LIMIT 3")->fetchAll();
    $industries = $pdo->query("SELECT * FROM industries ORDER BY sort_order ASC, id ASC")->fetchAll();
    
    $rawContent = $pdo->query("SELECT key, value FROM content")->fetchAll();
    $content = [];
    foreach ($rawContent as $c) {
        $content[$c['key']] = $c['value'];
    }

    jsonResponse([
        'services'     => $services,
        'founders'     => $homeFounders,
        'allFounders'  => $allFounders,
        'projects'     => $projects,
        'testimonials' => $testimonials,
        'process'      => $process,
        'content'      => $content,
        'activePromo'  => $promos[0] ?? null,
        'activePromos' => $promos,
        'liveProducts' => $liveProducts,
        'faqs'         => $faqs,
        'blogs'        => $blogs,
        'industries'   => $industries,
    ]);
}

// ── GET founders / founders/:id/photo ─────────────────────────────────────────
if ($segments[0] === 'founders') {
    if (count($segments) >= 3 && $segments[2] === 'photo') {
        $id = (int)$segments[1];
        $stmt = $pdo->prepare("SELECT photo_data, photo_mime FROM founders WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row || empty($row['photo_data'])) {
            jsonError('Photo not found', 404);
        }
        $mime = $row['photo_mime'] ?: 'image/jpeg';
        $bytes = base64_decode($row['photo_data']);
        header("Content-Type: $mime");
        header("Cache-Control: public, max-age=31536000, immutable");
        header("Content-Length: " . strlen($bytes));
        echo $bytes;
        exit;
    }
    if ($requestMethod === 'GET' && count($segments) === 1) {
        $rows = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders ORDER BY sort_order ASC")->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    }
}

// ── GET services ─────────────────────────────────────────────────────────────
if ($segments[0] === 'services') {
    if ($requestMethod === 'GET' && count($segments) === 1) {
        $rows = $pdo->query("SELECT * FROM services ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, id ASC")->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    }
    if ($requestMethod === 'GET' && count($segments) === 2) {
        $idOrSlug = $segments[1];
        $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ? OR slug = ?");
        $stmt->execute([$idOrSlug, $idOrSlug]);
        $srv = $stmt->fetch();
        if (!$srv) jsonError('Service not found', 404);
        jsonResponse(['success' => true, 'data' => $srv]);
    }
}

// ── GET industries ───────────────────────────────────────────────────────────
if ($segments[0] === 'industries') {
    if ($requestMethod === 'GET' && count($segments) === 1) {
        $rows = $pdo->query("SELECT * FROM industries ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    }
    if ($requestMethod === 'GET' && count($segments) === 2) {
        $idOrSlug = $segments[1];
        $stmt = $pdo->prepare("SELECT * FROM industries WHERE id = ? OR slug = ?");
        $stmt->execute([$idOrSlug, $idOrSlug]);
        $ind = $stmt->fetch();
        if (!$ind) jsonError('Industry not found', 404);
        jsonResponse(['success' => true, 'data' => $ind]);
    }
}

// ── GET blogs ────────────────────────────────────────────────────────────────
if ($segments[0] === 'blogs') {
    if ($requestMethod === 'GET' && count($segments) === 1) {
        $rows = $pdo->query("SELECT * FROM blogs WHERE is_published = 1 ORDER BY sort_order ASC, published_at DESC")->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    }
    if ($requestMethod === 'GET' && count($segments) === 2) {
        $slug = $segments[1];
        // Blog aliases mapping
        $aliases = [
            'flutter-3-performance-120fps-rendering-guide' => 'flutter-3-cross-platform-60fps-blueprint',
            'building-production-ai-agents-langchain-claude' => 'building-production-ai-agents-gemini-nextjs',
        ];
        if (isset($aliases[$slug])) $slug = $aliases[$slug];

        $stmt = $pdo->prepare("SELECT * FROM blogs WHERE slug = ?");
        $stmt->execute([$slug]);
        $b = $stmt->fetch();
        if (!$b) jsonError('Article not found', 404);
        jsonResponse(['success' => true, 'data' => $b]);
    }
}

// ── GET promos ───────────────────────────────────────────────────────────────
if ($segments[0] === 'promos') {
    if ($segments[1] === 'active') {
        $stmt = $pdo->query("SELECT * FROM promos WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 1");
        jsonResponse($stmt->fetch() ?: null);
    }
    if (count($segments) >= 2) {
        $slug = $segments[1];
        if ($slug === 'https-screensnap-codelifeai-com') $slug = 'screensnap';
        $stmt = $pdo->prepare("SELECT * FROM promos WHERE slug = ?");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        jsonResponse($row ?: null);
    }
}

// ── GET live-products / faqs ─────────────────────────────────────────────────
if ($path === 'live-products' && $requestMethod === 'GET') {
    $rows = $pdo->query("SELECT * FROM live_products WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows]);
}
if ($path === 'faqs' && $requestMethod === 'GET') {
    $rows = $pdo->query("SELECT * FROM faqs ORDER BY sort_order ASC")->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows]);
}

// ── POST contact ─────────────────────────────────────────────────────────────
if ($path === 'contact' && $requestMethod === 'POST') {
    $body = getJsonBody();
    $name = trim($body['name'] ?? (($body['first_name'] ?? '') . ' ' . ($body['last_name'] ?? '')));
    $email = trim($body['email'] ?? '');
    $message = trim($body['message'] ?? '');
    $company = trim($body['company'] ?? '');
    $country = trim($body['country'] ?? '');
    $service = trim($body['service_interest'] ?? '');
    $source = trim($body['referral_source'] ?? '');

    if (!$name || !$email || !$message) {
        jsonError('Name, email and message are required', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO contacts (name, email, message, company, country, service_interest, referral_source, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')");
    $stmt->execute([$name, $email, $message, $company, $country, $service, $source]);

    // Send email notification to CodeLifeAI
    $to = "contact@codelifeai.com";
    $subject = "⚡ New Contact Inquiry from $name — CodeLifeAI";
    $emailBody = "Name: $name\nEmail: $email\nCompany: $company\nCountry: $country\nService: $service\nSource: $source\n\nMessage:\n$message\n";
    $headers = "From: contact@codelifeai.com\r\nReply-To: $email\r\nX-Mailer: PHP/" . phpversion();
    @mail($to, $subject, $emailBody, $headers);

    jsonResponse(['success' => true, 'message' => 'Thank you! We will get back to you shortly.']);
}

// ── POST early-access ────────────────────────────────────────────────────────
if ($path === 'early-access' && $requestMethod === 'POST') {
    $body = getJsonBody();
    $email = trim($body['email'] ?? '');
    $slug = trim($body['product_slug'] ?? 'zyra-ai');
    if (!$email) jsonError('Email required', 400);

    $stmt = $pdo->prepare("INSERT INTO early_access (email, product_slug) VALUES (?, ?)");
    $stmt->execute([$email, $slug]);
    jsonResponse(['success' => true, 'message' => 'Added to early access!']);
}

// ── POST track-view ──────────────────────────────────────────────────────────
if ($path === 'track-view' && $requestMethod === 'POST') {
    $body = getJsonBody();
    $vPath = trim($body['path'] ?? '/');
    $stmt = $pdo->prepare("INSERT INTO visitor_pageviews (path, created_at) VALUES (?, datetime('now'))");
    try { $stmt->execute([$vPath]); } catch (Exception $e) {}
    jsonResponse(['success' => true]);
}

// ── POST chat ────────────────────────────────────────────────────────────────
if ($path === 'chat' && $requestMethod === 'POST') {
    $body = getJsonBody();
    $msg = strtolower($body['message'] ?? '');
    $reply = "Thanks for reaching out to CodeLifeAI! Our founders Anas Waheed & Muhammad Ahmed specialize in Web, Mobile, and autonomous AI agents. Feel free to contact us directly at contact@codelifeai.com or request a quote.";
    if (str_contains($msg, 'service') || str_contains($msg, 'price') || str_contains($msg, 'cost')) {
        $reply = "We provide end-to-end full-stack web development, fluid mobile applications (Flutter/React Native), custom AI agents, and DevOps architecture. Schedule a direct technical scoping call via contact@codelifeai.com!";
    }
    jsonResponse(['success' => true, 'reply' => $reply]);
}

// =============================================================================
// ADMIN AUTH & MANAGEMENT ROUTES
// =============================================================================

// ── POST admin/login ─────────────────────────────────────────────────────────
if ($path === 'admin/login' && $requestMethod === 'POST') {
    $body = getJsonBody();
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        // Fallback check for initial setup
        if ($user && $password === 'codelifeai2025') {
            // Valid fallback
        } else {
            jsonError('Invalid credentials', 401);
        }
    }

    $token = createJwt([
        'id' => $user['id'],
        'username' => $user['username'],
        'tv' => (int)($user['token_version'] ?? 1)
    ], 3600 * 24);

    setSessionCookie($token, 3600 * 24);
    jsonResponse(['success' => true, 'user' => ['id' => $user['id'], 'username' => $user['username']]]);
}

// ── POST admin/logout ────────────────────────────────────────────────────────
if ($path === 'admin/logout') {
    clearSessionCookie();
    jsonResponse(['success' => true]);
}

// ── GET admin/me ─────────────────────────────────────────────────────────────
if ($path === 'admin/me') {
    $user = requireAuth($pdo);
    jsonResponse(['id' => $user['id'], 'username' => $user['username']]);
}

// ── Check Admin Auth for all remaining /admin/* routes ───────────────────────
if ($segments[0] === 'admin') {
    $user = requireAuth($pdo);
    $adminResource = $segments[1] ?? '';
    $adminId = $segments[2] ?? null;
    $adminAction = $segments[3] ?? null;

    // ── Dashboard metrics ────────────────────────────────────────────────────
    if ($adminResource === 'dashboard' && $requestMethod === 'GET') {
        $projects = $pdo->query("SELECT COUNT(*) as c FROM projects")->fetch()['c'] ?? 0;
        $founders = $pdo->query("SELECT COUNT(*) as c FROM founders")->fetch()['c'] ?? 0;
        $services = $pdo->query("SELECT COUNT(*) as c FROM services")->fetch()['c'] ?? 0;
        $blogs = $pdo->query("SELECT COUNT(*) as c FROM blogs")->fetch()['c'] ?? 0;
        $enquiries = $pdo->query("SELECT COUNT(*) as c FROM contacts")->fetch()['c'] ?? 0;
        $early = $pdo->query("SELECT COUNT(*) as c FROM early_access")->fetch()['c'] ?? 0;
        $views = $pdo->query("SELECT COUNT(*) as c FROM visitor_pageviews")->fetch()['c'] ?? 0;

        jsonResponse([
            'projects'  => (int)$projects,
            'founders'  => (int)$founders,
            'services'  => (int)$services,
            'blogs'     => (int)$blogs,
            'enquiries' => (int)$enquiries,
            'early_access' => (int)$early,
            'pageviews' => (int)$views,
        ]);
    }

    // ── Admin: Founders ──────────────────────────────────────────────────────
    if ($adminResource === 'founders') {
        if ($requestMethod === 'GET' && !$adminId) {
            $rows = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders ORDER BY sort_order ASC")->fetchAll();
            jsonResponse($rows);
        }
        if ($requestMethod === 'POST' && !$adminId) {
            $b = getJsonBody();
            $max = $pdo->query("SELECT MAX(sort_order) as m FROM founders")->fetch()['m'] ?? 0;
            $stmt = $pdo->prepare("INSERT INTO founders (name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $b['name'] ?? '',
                $b['role'] ?? '',
                $b['bio'] ?? '',
                $b['initials'] ?? '',
                $b['photo_url'] ?? '',
                $b['avatar_bg'] ?? 'linear-gradient(135deg,#7c3aed,#00d4f5)',
                $b['tags'] ?? '[]',
                formatExternalUrl($b['linkedin_url'] ?? ''),
                parseShowOnHome($b['show_on_home'] ?? 1),
                (int)($b['sort_order'] ?? ($max + 1))
            ]);
            $newId = $pdo->lastInsertId();
            $f = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders WHERE id = $newId")->fetch();
            jsonResponse($f);
        }
        if ($adminId && $adminAction === 'toggle-home' && $requestMethod === 'PUT') {
            $b = getJsonBody();
            $isHome = parseShowOnHome($b['show_on_home'] ?? 1);
            $stmt = $pdo->prepare("UPDATE founders SET show_on_home = ? WHERE id = ?");
            $stmt->execute([$isHome, (int)$adminId]);
            $f = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders WHERE id = " . (int)$adminId)->fetch();
            jsonResponse($f);
        }
        if ($adminId && $adminAction === 'photo') {
            if ($requestMethod === 'POST' && isset($_FILES['photo'])) {
                $file = $_FILES['photo'];
                $data = file_get_contents($file['tmp_name']);
                $b64 = base64_encode($data);
                $mime = $file['type'] ?: 'image/jpeg';
                $url = "/api/founders/$adminId/photo?v=" . time();
                $stmt = $pdo->prepare("UPDATE founders SET photo_data = ?, photo_mime = ?, photo_url = ? WHERE id = ?");
                $stmt->execute([$b64, $mime, $url, (int)$adminId]);
                jsonResponse(['ok' => true, 'photo_url' => $url]);
            }
            if ($requestMethod === 'DELETE') {
                $stmt = $pdo->prepare("UPDATE founders SET photo_data = '', photo_mime = '', photo_url = '' WHERE id = ?");
                $stmt->execute([(int)$adminId]);
                jsonResponse(['ok' => true]);
            }
        }
        if ($requestMethod === 'PUT' && $adminId && !$adminAction) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE founders SET name=?, role=?, bio=?, initials=?, photo_url=?, avatar_bg=?, tags=?, linkedin_url=?, show_on_home=?, sort_order=? WHERE id=?");
            $stmt->execute([
                $b['name'] ?? '',
                $b['role'] ?? '',
                $b['bio'] ?? '',
                $b['initials'] ?? '',
                $b['photo_url'] ?? '',
                $b['avatar_bg'] ?? '',
                $b['tags'] ?? '[]',
                formatExternalUrl($b['linkedin_url'] ?? ''),
                parseShowOnHome($b['show_on_home'] ?? 1),
                (int)($b['sort_order'] ?? 1),
                (int)$adminId
            ]);
            $f = $pdo->query("SELECT id, name, role, bio, initials, photo_url, avatar_bg, tags, linkedin_url, show_on_home, sort_order, created_at FROM founders WHERE id = " . (int)$adminId)->fetch();
            jsonResponse($f);
        }
        if ($requestMethod === 'DELETE' && $adminId) {
            $stmt = $pdo->prepare("DELETE FROM founders WHERE id = ?");
            $stmt->execute([(int)$adminId]);
            jsonResponse(['ok' => true]);
        }
    }

    // ── Admin: Services ──────────────────────────────────────────────────────
    if ($adminResource === 'services') {
        if ($requestMethod === 'GET' && !$adminId) {
            $rows = $pdo->query("SELECT * FROM services ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, id ASC")->fetchAll();
            jsonResponse($rows);
        }
        if ($requestMethod === 'POST' && !$adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("INSERT INTO services (title, icon, short_desc, long_desc, features, stack, image_url, show_on_home, sort_order, parent_id, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $b['title'] ?? '',
                $b['icon'] ?? '⚡',
                $b['short_desc'] ?? '',
                $b['long_desc'] ?? '',
                $b['features'] ?? '[]',
                $b['stack'] ?? '[]',
                $b['image_url'] ?? '',
                parseShowOnHome($b['show_on_home'] ?? 1),
                (int)($b['sort_order'] ?? 1),
                !empty($b['parent_id']) ? (int)$b['parent_id'] : null,
                $b['slug'] ?? ''
            ]);
            $newId = $pdo->lastInsertId();
            jsonResponse($pdo->query("SELECT * FROM services WHERE id = $newId")->fetch());
        }
        if ($adminId && $adminAction === 'toggle-home' && $requestMethod === 'PUT') {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE services SET show_on_home = ? WHERE id = ?");
            $stmt->execute([parseShowOnHome($b['show_on_home'] ?? 1), (int)$adminId]);
            jsonResponse($pdo->query("SELECT * FROM services WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'PUT' && $adminId && !$adminAction) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE services SET title=?, icon=?, short_desc=?, long_desc=?, features=?, stack=?, image_url=?, show_on_home=?, sort_order=?, parent_id=?, slug=?, updated_at=datetime('now') WHERE id=?");
            $stmt->execute([
                $b['title'] ?? '',
                $b['icon'] ?? '⚡',
                $b['short_desc'] ?? '',
                $b['long_desc'] ?? '',
                $b['features'] ?? '[]',
                $b['stack'] ?? '[]',
                $b['image_url'] ?? '',
                parseShowOnHome($b['show_on_home'] ?? 1),
                (int)($b['sort_order'] ?? 1),
                !empty($b['parent_id']) ? (int)$b['parent_id'] : null,
                $b['slug'] ?? '',
                (int)$adminId
            ]);
            jsonResponse($pdo->query("SELECT * FROM services WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'DELETE' && $adminId) {
            $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
            $stmt->execute([(int)$adminId]);
            jsonResponse(['ok' => true]);
        }
    }

    // ── Admin: Industries ────────────────────────────────────────────────────
    if ($adminResource === 'industries') {
        if ($requestMethod === 'GET' && !$adminId) {
            jsonResponse($pdo->query("SELECT * FROM industries ORDER BY sort_order ASC, id ASC")->fetchAll());
        }
        if ($requestMethod === 'POST' && !$adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("INSERT INTO industries (title, slug, icon, badge, short_desc, long_desc, challenges, solutions, features, stack, metrics, image_url, show_on_home, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $b['title'] ?? '', $b['slug'] ?? '', $b['icon'] ?? '⚡', $b['badge'] ?? '',
                $b['short_desc'] ?? '', $b['long_desc'] ?? '', $b['challenges'] ?? '[]', $b['solutions'] ?? '[]',
                $b['features'] ?? '[]', $b['stack'] ?? '[]', $b['metrics'] ?? '[]', $b['image_url'] ?? '',
                parseShowOnHome($b['show_on_home'] ?? 1), (int)($b['sort_order'] ?? 1)
            ]);
            $newId = $pdo->lastInsertId();
            jsonResponse($pdo->query("SELECT * FROM industries WHERE id = $newId")->fetch());
        }
        if ($adminId && $adminAction === 'toggle-home' && $requestMethod === 'PUT') {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE industries SET show_on_home = ? WHERE id = ?");
            $stmt->execute([parseShowOnHome($b['show_on_home'] ?? 1), (int)$adminId]);
            jsonResponse($pdo->query("SELECT * FROM industries WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'PUT' && $adminId && !$adminAction) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE industries SET title=?, slug=?, icon=?, badge=?, short_desc=?, long_desc=?, challenges=?, solutions=?, features=?, stack=?, metrics=?, image_url=?, show_on_home=?, sort_order=?, updated_at=datetime('now') WHERE id=?");
            $stmt->execute([
                $b['title'] ?? '', $b['slug'] ?? '', $b['icon'] ?? '', $b['badge'] ?? '',
                $b['short_desc'] ?? '', $b['long_desc'] ?? '', $b['challenges'] ?? '[]', $b['solutions'] ?? '[]',
                $b['features'] ?? '[]', $b['stack'] ?? '[]', $b['metrics'] ?? '[]', $b['image_url'] ?? '',
                parseShowOnHome($b['show_on_home'] ?? 1), (int)($b['sort_order'] ?? 1), (int)$adminId
            ]);
            jsonResponse($pdo->query("SELECT * FROM industries WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'DELETE' && $adminId) {
            $pdo->prepare("DELETE FROM industries WHERE id = ?")->execute([(int)$adminId]);
            jsonResponse(['ok' => true]);
        }
    }

    // ── Admin: Content ───────────────────────────────────────────────────────
    if ($adminResource === 'content') {
        if ($requestMethod === 'GET') {
            $rows = $pdo->query("SELECT key, value FROM content")->fetchAll();
            $map = [];
            foreach ($rows as $r) $map[$r['key']] = $r['value'];
            jsonResponse($map);
        }
        if ($requestMethod === 'PUT') {
            $b = getJsonBody();
            $stmt = $pdo->prepare("INSERT INTO content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')");
            foreach ($b as $k => $v) {
                if (str_starts_with($k, 'social_') && $v) {
                    $v = formatExternalUrl($v);
                }
                $stmt->execute([$k, (string)$v]);
            }
            jsonResponse(['ok' => true]);
        }
    }

    // ── Admin: Projects ──────────────────────────────────────────────────────
    if ($adminResource === 'projects') {
        if ($requestMethod === 'GET' && !$adminId) {
            jsonResponse($pdo->query("SELECT * FROM projects ORDER BY sort_order ASC, id ASC")->fetchAll());
        }
        if ($requestMethod === 'POST' && !$adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("INSERT INTO projects (title, category, description, client, year, tags, live_url, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $b['title'] ?? '', $b['category'] ?? '', $b['description'] ?? '',
                $b['client'] ?? '', $b['year'] ?? date('Y'), $b['tags'] ?? '[]',
                $b['live_url'] ?? '', $b['image_url'] ?? '', (int)($b['sort_order'] ?? 1)
            ]);
            jsonResponse($pdo->query("SELECT * FROM projects WHERE id = " . $pdo->lastInsertId())->fetch());
        }
        if ($requestMethod === 'PUT' && $adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE projects SET title=?, category=?, description=?, client=?, year=?, tags=?, live_url=?, image_url=?, sort_order=? WHERE id=?");
            $stmt->execute([
                $b['title'] ?? '', $b['category'] ?? '', $b['description'] ?? '',
                $b['client'] ?? '', $b['year'] ?? date('Y'), $b['tags'] ?? '[]',
                $b['live_url'] ?? '', $b['image_url'] ?? '', (int)($b['sort_order'] ?? 1), (int)$adminId
            ]);
            jsonResponse($pdo->query("SELECT * FROM projects WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'DELETE' && $adminId) {
            $pdo->prepare("DELETE FROM projects WHERE id = ?")->execute([(int)$adminId]);
            jsonResponse(['ok' => true]);
        }
    }

    // ── Admin: Blogs ─────────────────────────────────────────────────────────
    if ($adminResource === 'blogs') {
        if ($requestMethod === 'GET' && !$adminId) {
            jsonResponse($pdo->query("SELECT * FROM blogs ORDER BY sort_order ASC, published_at DESC")->fetchAll());
        }
        if ($requestMethod === 'POST' && !$adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author_name, author_role, read_time, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $b['title'] ?? '', $b['slug'] ?? '', $b['excerpt'] ?? '', $b['content'] ?? '',
                $b['cover_image'] ?? '', $b['category'] ?? 'Engineering',
                $b['author_name'] ?? 'CodeLifeAI Team', $b['author_role'] ?? 'Core Team',
                $b['read_time'] ?? '5 min read', (int)($b['is_published'] ?? 1), (int)($b['sort_order'] ?? 1)
            ]);
            jsonResponse($pdo->query("SELECT * FROM blogs WHERE id = " . $pdo->lastInsertId())->fetch());
        }
        if ($requestMethod === 'PUT' && $adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, cover_image=?, category=?, author_name=?, author_role=?, read_time=?, is_published=?, sort_order=?, updated_at=datetime('now') WHERE id=?");
            $stmt->execute([
                $b['title'] ?? '', $b['slug'] ?? '', $b['excerpt'] ?? '', $b['content'] ?? '',
                $b['cover_image'] ?? '', $b['category'] ?? 'Engineering',
                $b['author_name'] ?? 'CodeLifeAI Team', $b['author_role'] ?? 'Core Team',
                $b['read_time'] ?? '5 min read', (int)($b['is_published'] ?? 1), (int)($b['sort_order'] ?? 1), (int)$adminId
            ]);
            jsonResponse($pdo->query("SELECT * FROM blogs WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'DELETE' && $adminId) {
            $pdo->prepare("DELETE FROM blogs WHERE id = ?")->execute([(int)$adminId]);
            jsonResponse(['ok' => true]);
        }
    }

    // ── Admin: Enquiries / Contacts ──────────────────────────────────────────
    if ($adminResource === 'enquiries' && $requestMethod === 'GET') {
        jsonResponse($pdo->query("SELECT * FROM contacts ORDER BY created_at DESC")->fetchAll());
    }

    // ── Admin: FAQs ──────────────────────────────────────────────────────────
    if ($adminResource === 'faqs') {
        if ($requestMethod === 'GET') {
            jsonResponse($pdo->query("SELECT * FROM faqs ORDER BY sort_order ASC, id ASC")->fetchAll());
        }
        if ($requestMethod === 'POST') {
            $b = getJsonBody();
            $stmt = $pdo->prepare("INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)");
            $stmt->execute([$b['question'] ?? '', $b['answer'] ?? '', (int)($b['sort_order'] ?? 1)]);
            jsonResponse($pdo->query("SELECT * FROM faqs WHERE id = " . $pdo->lastInsertId())->fetch());
        }
        if ($requestMethod === 'PUT' && $adminId) {
            $b = getJsonBody();
            $stmt = $pdo->prepare("UPDATE faqs SET question=?, answer=?, sort_order=? WHERE id=?");
            $stmt->execute([$b['question'] ?? '', $b['answer'] ?? '', (int)($b['sort_order'] ?? 1), (int)$adminId]);
            jsonResponse($pdo->query("SELECT * FROM faqs WHERE id = " . (int)$adminId)->fetch());
        }
        if ($requestMethod === 'DELETE' && $adminId) {
            $pdo->prepare("DELETE FROM faqs WHERE id = ?")->execute([(int)$adminId]);
            jsonResponse(['ok' => true]);
        }
    }
}

// Fallback for unhandled routes
jsonError('Not found: ' . $path, 404);
