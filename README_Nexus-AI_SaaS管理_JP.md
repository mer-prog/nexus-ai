# Nexus AI — AI統合型マルチテナントSaaS管理ダッシュボード

> **何を:** AI分析・リアルタイム通知・RBAC・請求管理・日英バイリンガル対応を備えたSaaS管理ダッシュボード
> **誰に:** SaaS事業者、プロダクトマネージャー、カスタマーサクセスチーム
> **技術:** Next.js 16 / React 19 / TypeScript strict / Tailwind CSS 4 / Prisma 7 / PostgreSQL 16

- **ソースコード:** [github.com/mer-prog/nexus-ai](https://github.com/mer-prog/nexus-ai)
- **デモ認証情報:**

| ロール | メールアドレス | パスワード | アクセス範囲 |
|--------|---------------|-----------|-------------|
| 管理者 | `admin@acme.com` | `password123` | 全機能（チーム管理・組織設定・危険ゾーン含む） |
| マネージャー | `manager@acme.com` | `password123` | 顧客管理・分析・請求（チーム管理・組織管理は不可） |
| メンバー | `member@acme.com` | `password123` | ダッシュボード閲覧・AIチャット・自分のプロフィールのみ |

---

## 1. このプロジェクトで証明できるスキル

| スキル | 実装内容 |
|--------|---------|
| **フルスタックアーキテクチャ** | Next.js 16 App Router + REST API 22エンドポイント + Prisma ORM + PostgreSQL。フロントエンドからデータベースまで一貫した型安全設計 |
| **認証・認可（RBAC）** | NextAuth v5 JWT認証 + 3階層ロール制御（Admin/Manager/Member）。ミドルウェアによるルート保護、API・UIの両方でロールベースアクセス制御 |
| **AIストリーミング統合** | Server-Sent Events（SSE）でトークン単位のリアルタイムストリーミング。キーワードマッチングによるモックAIエンジン + Markdownレンダリング |
| **国際化（i18n）** | 日英バイリンガル対応。Zustand + Cookie永続化。通貨（¥/\$）・日付・数値のロケール別フォーマット。UIテキスト100%翻訳済み |
| **マルチテナント設計** | 全データクエリを`organizationId`でスコープ。テナント間のデータ分離をORM層で強制 |
| **テスト戦略** | Vitest（ユニット14ファイル）+ Playwright（E2E 4ファイル）。API・コンポーネント・ストア・バリデーション・ライブラリを網羅 |
| **CI/CDパイプライン** | GitHub Actions: Lint → TypeCheck → Test（カバレッジ付き）を並列実行 → 全パス後にBuild |

---

## 2. 機能一覧

| 画面 | 機能 | 状態 |
|------|------|------|
| ログイン | Credentials認証、Zodバリデーション、デモ認証情報表示 | 実装済み |
| ダッシュボード | KPIカード4枚（MRR・アクティブユーザー・解約率・収益成長率）、収益チャート、アクティビティフィード | 実装済み |
| 顧客管理 | CRUD操作、検索・ステータスフィルター・ソート、ページネーション、顧客詳細ページ | 実装済み |
| 顧客詳細 | プロフィール表示、ステータス変更、アクティビティ履歴 | 実装済み |
| 分析 | 折れ線・円・棒グラフ、期間切替（7日/30日/90日）、CSVエクスポート、AI分析レポート | 実装済み |
| AIアシスタント | フルページUI + フローティングウィジェット、会話履歴、SSEストリーミング、Markdownレンダリング | 実装済み |
| 請求管理 | プラン比較（Free/Pro/Enterprise）、アップグレード・ダウングレード、請求書一覧・詳細・CSVエクスポート | 実装済み |
| チーム管理 | メンバー一覧、ロール変更（Admin/Manager/Member）、メンバー招待・削除 | 実装済み |
| 設定 | 組織設定、プロフィール管理、通知設定、テーマ切替（ライト/ダーク/システム）、言語切替 | 実装済み |
| 通知 | SSEリアルタイム通知、未読バッジ、個別・一括既読、自動閉じ | 実装済み |
| サイドバー | ロールベースナビゲーション、開閉トグル、モバイルオーバーレイ | 実装済み |
| 言語切替 | ヘッダーのクイックトグル + 設定ページのドロップダウン、Cookie永続化 | 実装済み |

---

## 3. 技術スタック

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| フレームワーク | Next.js 16.1.6（App Router） | サーバーコンポーネント、ストリーミング、ファイルベースルーティング |
| ランタイム | React 19.2.3 | 並行機能、`use()`フック |
| 言語 | TypeScript 5（strict mode） | `any`禁止の完全型安全 |
| スタイリング | Tailwind CSS 4 + shadcn/ui（18コンポーネント） | ユーティリティファースト + アクセシブルなUIプリミティブ |
| ORM | Prisma 7.4.1 | 型安全クエリ、マイグレーション、シーディング |
| データベース | PostgreSQL 16（Alpine） | リレーショナルデータストレージ、Docker Compose構成 |
| 認証 | NextAuth v5 (Auth.js) beta-30 | JWT戦略、Credentialsプロバイダー |
| バリデーション | Zod 4.3.6 | API境界のランタイムスキーマ検証 |
| サーバー状態 | TanStack Query 5.90.21 | キャッシュ・再検証・楽観的更新 |
| クライアント状態 | Zustand 5.0.11（5ストア） | サイドバー・テーマ・ロケール・チャット・トースト |
| グラフ | Recharts 3.7.0 | 折れ線・円・棒チャート |
| i18n | カスタムフック + Zustand | `useT()`翻訳フック + `useFormat()`ロケール別フォーマット |
| Markdownパーサー | 自前実装（依存なし） | 見出し・テーブル・コードブロック・リストのHTML変換 |
| ユニットテスト | Vitest 4.0.18 + React Testing Library 16.3.2 | コンポーネント・API・ストア・バリデーションテスト |
| E2Eテスト | Playwright 1.58.2 | 認証・ダッシュボード・顧客・AIチャットのフロー |
| CI/CD | GitHub Actions | Lint→TypeCheck→Test→Buildの4ステージ |
| デプロイ | Vercel（hnd1リージョン） | エッジ最適化 + セキュリティヘッダー |
| パスワードハッシュ | bcryptjs 3.0.3 | ソルト付きパスワードハッシュ |
| アイコン | Lucide React 0.575.0 | 軽量SVGアイコンライブラリ |

---

## 4. アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│  プレゼンテーション層                                     │
│  Next.js App Router ページ（9画面）                       │
│  shadcn/ui コンポーネント（18種）                          │
│  Zustand ストア（5個: sidebar, theme, locale, chat, toast）│
│  カスタムフック（6個: translations, format, customers,     │
│                     analytics, notifications, user-role）  │
├─────────────────────────────────────────────────────────┤
│  API層（22エンドポイント）                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Rate     │→│ Auth     │→│ RBAC     │→│ Zod        │  │
│  │ Limiter  │ │ (JWT)    │ │ (3階層)   │ │ Validation │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│                      ↓                                    │
│  REST: customers · analytics · billing · team ·           │
│        ai/chat · notifications · settings · activity      │
├─────────────────────────────────────────────────────────┤
│  ビジネスロジック層                                       │
│  ┌─────────────┐ ┌────────────┐ ┌───────────────┐       │
│  │ AIモック     │ │ アクティビティ│ │ 通知エンジン  │       │
│  │ (SSEストリーム)│ │ ログ       │ │ (SSE)        │       │
│  └─────────────┘ └────────────┘ └───────────────┘       │
├─────────────────────────────────────────────────────────┤
│  データ層                                                │
│  Prisma 7 ORM（8モデル・マルチテナント）                    │
│  PostgreSQL 16                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 5. 主要機能

### 5.1 認証・認可（RBAC）

- **NextAuth v5** の Credentials プロバイダーで認証
- JWT戦略: トークンに `id`, `role`, `organizationId`, `organizationName` を格納
- ミドルウェア（`src/middleware.ts`）で未認証ユーザーをログインページへリダイレクト
- 3階層ロール:
  - **ADMIN（管理者）**: 全機能アクセス（チーム管理、組織設定、危険ゾーン）
  - **MANAGER（マネージャー）**: 顧客管理、分析、請求（チーム管理・組織設定は不可）
  - **MEMBER（メンバー）**: ダッシュボード閲覧、AIチャット、自身のプロフィールのみ
- サイドバーのナビゲーション項目はロールに応じて動的にフィルタリング
- APIルートでもロールチェックを実施（例: チーム管理APIはADMIN/MANAGERのみ）

### 5.2 AIチャット統合

- **フローティングウィジェット**: 全ページからアクセス可能な固定位置チャットUI
- **フルページUI**: 会話サイドバー + メッセージエリア（`/dashboard/ai`）
- **SSEストリーミング**: レスポンスをトークン単位で送信、クライアントで逐次レンダリング
- **キーワードマッチング**: `revenue`, `churn`, `customer`, `team`, `billing`, `help` の6カテゴリ + デフォルトレスポンス
- **AI分析レポート**: 分析ページからワンクリックでKPIに基づくレポートを生成
- **Markdownレンダリング**: 見出し・太字・斜体・テーブル・コードブロック・リスト・水平線を自前パーサーでHTML変換

### 5.3 国際化（i18n）

- **対応言語**: 日本語（デフォルト）、英語
- **翻訳フック**: `useT("namespace")` — Zustandストアから翻訳メッセージを取得し、キーに基づいて文字列を返す
- **パラメータ補間**: `t("joined", { date: "2026/02/28" })` → `"2026/02/28 に参加"`
- **翻訳ファイル**: `src/i18n/messages/{en,ja}.json` — 12名前空間（common, nav, header, auth, dashboard, analytics, customers, team, billing, ai, settings, notifications, activity）
- **ロケール別フォーマット（`useFormat()`フック）**:
  - 通貨: `ja` → `¥5,469,000`（USD×100倍でJPY換算） / `en` → `$54,690.00`
  - 日付: `ja` → `2026/02/28` / `en` → `Feb 28, 2026`
  - 日時: `ja` → `2026/02/28 14:30` / `en` → `February 28, 2026, 02:30 PM`
  - 数値: `ja` → `2,847` / `en` → `2,847`
- **永続化**: localStorage（即時読み込み） + Cookie（サーバーサイドで`<html lang>`属性を設定）
- **切替UI**: ヘッダーのクイックトグルボタン（EN/JA表示） + 設定ページのドロップダウン。切替時にページリロードなし
- **翻訳範囲**: 全UIテキスト（ラベル・ボタン・プレースホルダー・エラーメッセージ・通知）。シードデータ（顧客名・アクティビティログ）は英語のまま

### 5.4 顧客管理

- **CRUD操作**: 作成・読み取り・更新・削除、ダイアログ形式のフォーム
- **検索**: 名前・メール・会社名でのリアルタイム検索
- **フィルタリング**: ステータス別（アクティブ/非アクティブ/解約済み/全て）
- **ソート**: カラムヘッダークリックで昇順/降順切替
- **ページネーション**: ページ番号表示 + 前後ナビゲーション
- **詳細ページ**: プロフィール表示、ステータス変更、アクティビティ履歴
- **Zodバリデーション**: 名前（1-100文字）、メール（有効なメール形式）、会社名（任意・100文字以内）、ステータス（ACTIVE/INACTIVE/CHURNED）

### 5.5 分析・レポート

- **KPI**: MRR、新規顧客数、解約率、純収益維持率（NRR）
- **チャート**: 収益トレンド（折れ線）、顧客分布（円）、日次アクティブユーザー（棒）
- **期間切替**: 7日 / 30日 / 90日
- **CSVエクスポート**: 分析データと請求書データの2種
- **AI分析**: ワンクリックでKPIに基づく分析レポートを生成

### 5.6 請求管理

- **プラン比較**: Free（無料） / Pro（$99/月） / Enterprise（$299/月）
- **プラン変更**: アップグレード・ダウングレードのフロー、確認ダイアログ付き
- **請求書一覧**: ステータス（支払済み/保留中/延滞）、発行日・支払日
- **請求書詳細**: モーダルダイアログで詳細表示
- **CSVエクスポート**: 請求書データのダウンロード

### 5.7 チーム管理

- **メンバー一覧**: 名前・メール・ロール・参加日を表示
- **ロール変更**: Admin/Manager/Memberのドロップダウンによる変更
- **メンバー招待**: メールアドレスとロールを指定して招待（モック）
- **メンバー削除**: 確認ダイアログ付きの削除
- **アクセス制御**: ADMIN以上のみアクセス可。MEMBERにはアクセス拒否画面を表示

### 5.8 リアルタイム通知

- **SSE接続**: `EventSource`による`/api/notifications/stream`への常時接続
- **未読バッジ**: ヘッダーの通知ベルに未読数を表示
- **既読管理**: 個別既読 + 一括既読
- **自動再接続**: エラー時に5秒後に再接続

### 5.9 設定

- **組織設定**: 組織名・スラッグの編集
- **プロフィール管理**: 名前・メール・パスワード変更
- **通知設定**: メール通知・プッシュ通知のオン/オフ
- **テーマ**: ライト / ダーク / システム自動検出
- **言語**: 日本語 / 英語の切替（ヘッダーと設定ページが連動）
- **危険ゾーン**: 組織削除（2段階確認 + 組織名入力による確認。モック操作）

---

## 6. データベース設計

### モデル一覧（8モデル）

| モデル | テーブル名 | 主要フィールド | リレーション |
|--------|-----------|---------------|-------------|
| Organization | `organizations` | id, name, slug(一意), plan(FREE/PRO/ENTERPRISE) | → User[], Customer[], Subscription[], Invoice[], ActivityLog[] |
| User | `users` | id, name, email(一意), password, role(ADMIN/MANAGER/MEMBER) | → Organization, AiConversation[], Notification[], ActivityLog[] |
| Customer | `customers` | id, name, email, company?, status(ACTIVE/INACTIVE/CHURNED) | → Organization |
| Subscription | `subscriptions` | id, plan, status(ACTIVE/PAST_DUE/CANCELED), currentPeriodEnd | → Organization |
| Invoice | `invoices` | id, amount(Float), status(PAID/PENDING/OVERDUE), issuedAt, paidAt? | → Organization |
| AiConversation | `ai_conversations` | id, title, userId | → User, AiMessage[] |
| AiMessage | `ai_messages` | id, role(USER/ASSISTANT), content, conversationId | → AiConversation |
| Notification | `notifications` | id, title, message, read(Boolean), userId | → User |
| ActivityLog | `activity_logs` | id, action, details?, userId, organizationId | → User, Organization |

### 列挙型（Enum）

| 列挙型 | 値 |
|--------|-----|
| Plan | FREE, PRO, ENTERPRISE |
| Role | ADMIN, MANAGER, MEMBER |
| CustomerStatus | ACTIVE, INACTIVE, CHURNED |
| SubscriptionStatus | ACTIVE, PAST_DUE, CANCELED |
| InvoiceStatus | PAID, PENDING, OVERDUE |
| MessageRole | USER, ASSISTANT |

### シードデータ

| データ | 件数 | 内容 |
|--------|------|------|
| 組織 | 2 | Acme Corporation（PRO）、TechStart Inc（ENTERPRISE） |
| ユーザー | 5 | Admin/Manager/Member（Acme）、Admin/Member（TechStart） |
| 顧客 | 50 | 35 ACTIVE、8 INACTIVE、7 CHURNED（30件=Acme、20件=TechStart） |
| サブスクリプション | 2 | PRO（Acme）、ENTERPRISE（TechStart） |
| 請求書 | 30 | 20 PAID、6 PENDING、4 OVERDUE |
| AI会話 | 3 | 収益分析、解約予測、チームパフォーマンス |
| 通知 | 5 | 新規登録、請求書延滞、メンバー追加など |
| アクティビティログ | 6 | ログイン、顧客追加、請求書送信など |

---

## 7. 画面仕様

### ダッシュボード（`/dashboard`）
- KPIカード4枚: MRR（`$54,690` / `¥5,469,000`）、アクティブユーザー（`2,847`）、解約率（`2.4%`、逆トレンド表示）、収益成長率（`12.5%`）
- 収益概要チャート: 7ヶ月の折れ線グラフ（Recharts）、ロケール別の通貨ツールチップ
- 最近のアクティビティ: アクションキーマッピングによる翻訳、相対時間表示（「たった今」「3分前」「2時間前」）

### 顧客管理（`/dashboard/customers`）
- テーブル: 名前、メール、会社、ステータス（バッジ）、作成日、操作（表示/編集/削除）
- 検索バー: 名前・メール・会社名でフィルタリング
- ステータスフィルター: 全て / アクティブ / 非アクティブ / 解約済み
- ページネーション: 「1 / 5 ページ」表示、前後ボタン

### 顧客詳細（`/dashboard/customers/[id]`）
- プロフィールカード: 名前、メール、会社、参加日
- ステータス管理カード: 現在のステータス表示 + 変更ボタン
- アクティビティ履歴カード: この顧客に関するアクティビティログ

### モバイルレスポンシブ
- サイドバー: `lg`以上で固定表示、`lg`未満でハンバーガーメニュー + オーバーレイ
- テーブル: 横スクロール対応
- KPIカード: 1列 → 2列 → 4列のレスポンシブグリッド

---

## 8. プロジェクト構成

```
nexus-ai/
├── src/                              # ソースコード（8,567行）
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                #   ルートレイアウト（動的lang属性）
│   │   ├── page.tsx                  #   ルート（/dashboardへリダイレクト）
│   │   ├── login/page.tsx            #   ログインページ（106行）
│   │   ├── api/                      #   APIルート（22エンドポイント・1,299行）
│   │   │   ├── activity/             #     アクティビティログ（GET）
│   │   │   ├── ai/                   #     AIチャット・分析・会話（4ルート）
│   │   │   ├── analytics/            #     分析データ・CSVエクスポート（2ルート）
│   │   │   ├── auth/                 #     NextAuth ルートハンドラー
│   │   │   ├── billing/              #     サブスクリプション・請求書（3ルート）
│   │   │   ├── customers/            #     顧客CRUD（2ルート）
│   │   │   ├── notifications/        #     通知・SSEストリーム（4ルート）
│   │   │   ├── settings/             #     組織・プロフィール設定（2ルート）
│   │   │   └── team/                 #     チーム管理・招待（3ルート）
│   │   └── dashboard/                #   保護されたダッシュボードページ
│   │       ├── page.tsx              #     概要（73行）
│   │       ├── layout.tsx            #     DashboardShell（認証チェック）
│   │       ├── ai/page.tsx           #     AIアシスタント（274行）
│   │       ├── analytics/page.tsx    #     分析（335行）
│   │       ├── billing/page.tsx      #     請求管理（423行）
│   │       ├── customers/page.tsx    #     顧客一覧（165行）
│   │       ├── customers/[id]/       #     顧客詳細（220行）
│   │       ├── settings/page.tsx     #     設定（511行）
│   │       └── team/page.tsx         #     チーム管理（184行）
│   ├── components/                   # UIコンポーネント
│   │   ├── ui/                       #   shadcn/uiプリミティブ（18種）
│   │   ├── layout/                   #   シェル・ヘッダー・サイドバー・通知ベル
│   │   ├── dashboard/                #   KPIカード・収益チャート・アクティビティ
│   │   ├── customers/                #   テーブル・フォーム・ページネーション
│   │   ├── ai/                       #   チャットウィジェット（359行）
│   │   └── team/                     #   チームテーブル・招待ダイアログ
│   ├── hooks/                        # カスタムフック（6個・398行）
│   ├── stores/                       # Zustandストア（5個・169行）
│   ├── lib/                          # ユーティリティ（498行）
│   │   ├── auth.ts                   #   NextAuth設定（73行）
│   │   ├── db.ts                     #   Prismaクライアントシングルトン（18行）
│   │   ├── ai-mock.ts               #   モックAIエンジン（56行）
│   │   ├── rate-limit.ts            #   インメモリレートリミッター（76行）
│   │   ├── api-helpers.ts           #   統一APIレスポンスヘルパー（31行）
│   │   ├── markdown.ts              #   Markdown→HTMLパーサー（134行）
│   │   ├── validations/             #   Zodスキーマ（customer, team）
│   │   └── ...                      #   その他ユーティリティ
│   ├── i18n/                         # 国際化
│   │   ├── config.ts                 #   ロケール設定（ja=デフォルト）
│   │   └── messages/                 #   翻訳ファイル（en: 333行、ja: 333行）
│   └── types/                        # 型定義（analytics, customer, team, next-auth）
├── prisma/
│   ├── schema.prisma                 # 8モデル・6列挙型（196行）
│   └── seed.ts                       # デモデータシーダー（385行）
├── tests/                            # テスト（1,605行）
│   ├── unit/                         #   ユニットテスト（14ファイル）
│   │   ├── api/                      #     APIルートテスト（4ファイル）
│   │   ├── components/               #     コンポーネントテスト（4ファイル）
│   │   ├── lib/                      #     ライブラリテスト（3ファイル）
│   │   ├── stores/                   #     ストアテスト（1ファイル）
│   │   └── validations/              #     バリデーションテスト（2ファイル）
│   └── e2e/                          #   E2Eテスト（4ファイル）
├── .github/workflows/ci.yml         # CIパイプライン（108行）
├── docker-compose.yml                # PostgreSQL 16 Alpine
├── vercel.json                       # デプロイ設定 + セキュリティヘッダー
└── package.json                      # 依存関係（26 deps + 16 devDeps）
```

---

## 9. セットアップ

### 前提条件

- Node.js 20以上
- Docker（PostgreSQL用）またはリモートPostgreSQLインスタンス

### 手順

```bash
# 1. クローン
git clone https://github.com/mer-prog/nexus-ai.git
cd nexus-ai

# 2. PostgreSQLを起動
docker compose up -d

# 3. 依存関係をインストール
npm install

# 4. 環境変数を設定
cp .env.example .env
# .envを編集してDATABASE_URLなどを設定

# 5. データベースのマイグレーションとシーディング
npx prisma migrate deploy
npm run db:seed

# 6. 開発サーバーを起動
npm run dev
```

http://localhost:3000 を開いてログイン。

### 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | はい | PostgreSQL接続文字列 |
| `NEXTAUTH_SECRET` | はい | JWT署名シークレット（`openssl rand -base64 32`で生成） |
| `NEXTAUTH_URL` | はい | アプリケーションURL（`http://localhost:3000`） |
| `DIRECT_URL` | Neon使用時 | マイグレーション用の直接接続URL |
| `GOOGLE_CLIENT_ID` | いいえ | Google OAuth（未設定時はCredentialsにフォールバック） |
| `AI_API_KEY` | いいえ | AI APIキー（デモではモック使用） |
| `STRIPE_SECRET_KEY` | いいえ | Stripeキー（デモではモック使用） |

### テスト実行

```bash
npm test                 # ユニットテスト実行
npm run test:coverage    # カバレッジレポート付き
npm run test:e2e         # Playwright E2E（要開発サーバー）
npm run typecheck        # TypeScript strict mode チェック
npm run lint             # ESLint
```

---

## 10. 設計判断の根拠

| 判断 | 根拠 |
|------|------|
| **カスタムi18nフック vs next-intl** | 全ページがクライアントコンポーネント（`"use client"`）のため、next-intlのサーバーコンポーネント前提の設計よりZustand+カスタムフックの方が軽量かつ柔軟 |
| **Cookie + localStorage の二重永続化** | localStorageは即時読み込み、Cookieはサーバーサイドで`<html lang>`属性を設定するために必要。両方を使うことで初回ロード時のフラッシュを防止 |
| **USD→JPY変換係数（×100）** | 内部データがUSDのため、表示時にJPYに換算。実サービスでは為替APIに差し替え可能な設計 |
| **インメモリレートリミッター** | 外部依存（Redis等）なしで動作。本番では1ファイル差し替えでRedis版に移行可能 |
| **自前Markdownパーサー** | 外部ライブラリ（marked, remark等）への依存を排除。AIレスポンスに必要な要素（見出し・テーブル・コードブロック）のみ対応し、バンドルサイズを削減 |
| **Zustand + TanStack Queryの分離** | クライアント状態（UI）とサーバー状態（API）を明確に分離。グローバルストアにサーバーデータを格納するアンチパターンを回避 |
| **全モックアーキテクチャ** | AI API・Stripe・OAuth・Email・S3を全てモック。運用コストゼロで本番同等のUI/UXを実現。各モックは1ファイル差し替えで実サービスに移行可能 |
| **JWTセッション戦略** | データベースセッションの代わりにJWTを採用。`role`と`organizationId`をトークンに格納し、追加DBクエリなしでRBACを実現 |
| **`invertTrend`プロップ** | KPIカードで解約率の色反転を実現。翻訳前は`title === "Churn Rate"`で判定していたが、i18n対応でタイトルが変わるためbooleanフラグに変更 |

---

## 11. 運用コスト

| サービス | プラン | 月額 |
|----------|--------|------|
| Vercel | Hobby | ¥0 |
| Neon PostgreSQL | Free Tier | ¥0 |
| AI API（OpenAI等） | モック使用 | ¥0 |
| Stripe | モック使用 | ¥0 |
| Google OAuth | モック使用 | ¥0 |
| メール送信 | モック使用 | ¥0 |
| S3ストレージ | モック使用 | ¥0 |
| **合計** | | **¥0** |

---

## 12. 作者

[@mer-prog](https://github.com/mer-prog)
