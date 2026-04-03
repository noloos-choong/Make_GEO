import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAMES = {
  anthropic:   'office_anthropic_key',
  openrouter:  'office_openrouter_key',
} as const

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,  // 30일
}

/** GET: 어떤 제공자의 키가 등록되어 있는지 여부만 반환 (키 값 노출 없음) */
export async function GET(req: NextRequest) {
  const status = {
    anthropic:  !!req.cookies.get(COOKIE_NAMES.anthropic)?.value,
    openrouter: !!req.cookies.get(COOKIE_NAMES.openrouter)?.value,
  }
  return NextResponse.json(status)
}

/** POST: API 키를 HttpOnly 쿠키에 저장 */
export async function POST(req: NextRequest) {
  let body: { provider: keyof typeof COOKIE_NAMES; apiKey: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 })
  }

  const { provider, apiKey } = body
  if (!COOKIE_NAMES[provider]) {
    return NextResponse.json({ error: '지원하지 않는 제공자입니다.' }, { status: 400 })
  }
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'API 키를 입력해주세요.' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAMES[provider], apiKey.trim(), COOKIE_OPTS)
  return res
}

/** DELETE: API 키 쿠키 삭제 */
export async function DELETE(req: NextRequest) {
  let body: { provider: keyof typeof COOKIE_NAMES }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 })
  }

  const { provider } = body
  if (!COOKIE_NAMES[provider]) {
    return NextResponse.json({ error: '지원하지 않는 제공자입니다.' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAMES[provider], '', { ...COOKIE_OPTS, maxAge: 0 })
  return res
}
