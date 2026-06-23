#!/usr/bin/env bash
# Sincroniza variables de .env.local a Vercel Production (sin INNGEST_DEV).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "Falta .env.local"
  exit 1
fi

upsert_env() {
  local name="$1"
  local value="$2"
  local target="$3"

  if [[ -z "$value" ]]; then
    echo "skip $name (vacío)"
    return
  fi

  printf '%s' "$value" | npx vercel env add "$name" "$target" --force --yes 2>/dev/null \
    || printf '%s' "$value" | npx vercel env add "$name" "$target" --yes
  echo "ok $name ($target)"
}

upsert_both() {
  local name="$1"
  local value="$2"
  upsert_env "$name" "$value" production
  upsert_env "$name" "$value" preview
}

get_env() {
  local name="$1"
  grep -E "^${name}=" .env.local | head -1 | cut -d= -f2- | sed 's/^"//;s/"$//'
}

SUPABASE_URL="$(get_env NEXT_PUBLIC_SUPABASE_URL)"
SUPABASE_ANON="$(get_env NEXT_PUBLIC_SUPABASE_ANON_KEY)"
SUPABASE_SERVICE="$(get_env SUPABASE_SERVICE_ROLE_KEY)"
GCP_PROJECT="$(get_env GOOGLE_CLOUD_PROJECT_ID)"
INNGEST_EVENT="$(get_env INNGEST_EVENT_KEY)"
INNGEST_SIGNING="$(get_env INNGEST_SIGNING_KEY)"
GCP_PATH="$(get_env GOOGLE_APPLICATION_CREDENTIALS)"

if [[ -n "$GCP_PATH" && -f "$GCP_PATH" ]]; then
  GCP_JSON="$(tr -d '\n' < "$GCP_PATH")"
elif [[ -n "$(get_env GOOGLE_CREDENTIALS_JSON)" ]]; then
  GCP_JSON="$(get_env GOOGLE_CREDENTIALS_JSON)"
else
  echo "ADVERTENCIA: sin credenciales GCP (GOOGLE_APPLICATION_CREDENTIALS o GOOGLE_CREDENTIALS_JSON)"
  GCP_JSON=""
fi

# URL prod: argumento o placeholder hasta primer deploy
APP_URL="${1:-https://racepics.vercel.app}"

echo "Sincronizando env a Vercel (production + preview)..."
upsert_both NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
upsert_both NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON"
upsert_both SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE"
upsert_both GOOGLE_CLOUD_PROJECT_ID "$GCP_PROJECT"
upsert_both GOOGLE_CREDENTIALS_JSON "$GCP_JSON"
upsert_env INNGEST_EVENT_KEY "$INNGEST_EVENT" production
upsert_env INNGEST_SIGNING_KEY "$INNGEST_SIGNING" production
upsert_env NEXT_PUBLIC_APP_URL "$APP_URL" production

echo "Listo. APP_URL=$APP_URL"
