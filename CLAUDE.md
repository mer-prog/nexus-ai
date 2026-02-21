# Nexus AI — AI統合型SaaSダッシュボード

## プロジェクト概要
Upworkポートフォリオ用のAI統合SaaS管理ダッシュボード。
運用コストゼロ（全外部サービスをモック）で、本番同等の完成度を持つ。

## 技術スタック
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS 4 + shadcn/ui
- Prisma + PostgreSQL
- NextAuth.js v5 (Auth.js)
- Zod (バリデーション)
- TanStack Query + Zustand (状態管理)
- Recharts (グラフ)
- Vitest + React Testing Library + Playwright (テスト)
- next-intl (i18n: EN/JP)
- GitHub Actions (CI/CD)

## コーディング規約
- TypeScript strict mode必須。anyは禁止
- コンポーネントは関数コンポーネント + hooks のみ
- APIレスポンスは必ずZodスキーマでバリデーション
- エラーハンドリングは全APIルートで統一パターン
- コミットメッセージは Conventional Commits (feat: / fix: / chore: 等)
- インポートは絶対パス (@/ エイリアス)

## ディレクトリ構造方針
- src/app/ — App Router ページ & APIルート
- src/components/ — UI + 機能別コンポーネント
- src/lib/ — ユーティリティ、DB、認証、バリデーション
- src/hooks/ — カスタムフック
- src/stores/ — Zustand ストア
- src/types/ — 型定義
- src/i18n/ — 多言語ファイル
- prisma/ — スキーマ、マイグレーション、シーダー
- tests/ — unit / integration / e2e

## モック戦略
- AI API → 事前定義レスポンスをSSEでストリーミング送信
- Stripe → ローカルモッククライアント（UIは本物同等）
- OAuth → NextAuth Credentials + Google mock provider
- Email → console.log + UI表示のみ
- S3 → ローカル public/uploads

## 品質基準
- テストカバレッジ目標: 80%以上
- Lighthouse Performance: 90+
- a11y: WAI-ARIA準拠、キーボードナビゲーション対応
- レスポンシブ: mobile / tablet / desktop
