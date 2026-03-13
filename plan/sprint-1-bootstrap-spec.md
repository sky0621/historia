# historia Sprint 1 Bootstrap仕様

## 目的
- Sprint 1 を着手時点で迷わないように、技術選定、ディレクトリ構成、実装規約を固定する。
- この仕様は [sprints.md](/Users/sky0621/work/github.com/sky0621/historia/plan/sprints.md) の `Sprint 1: 基盤固定` を具体化したものとする。

## 技術選定
- フレームワーク: `Next.js 15系 App Router`
- 言語: `TypeScript`
- UI: `React Server Components` を基本とし、入力フォームなど操作が必要な部分のみ Client Component にする
- スタイリング: `Tailwind CSS`
- ORM: `Drizzle ORM`
- DB: `SQLite`
- バリデーション: `Zod`
- フォーム管理: `react-hook-form`
- テーブルUI: 独自の軽量テーブル部品を作り、重量級グリッドライブラリは入れない
- テスト初期方針:
  - ロジック単体: `Vitest`
  - UI/画面単位: Sprint 1 では未導入でもよい
- パッケージマネージャ: `pnpm`

## 選定理由
- `Next.js + TypeScript` は UI とサーバー処理を 1 プロジェクトで閉じやすい。
- `Drizzle + SQLite` はローカル前提の MVP で扱いやすく、スキーマをコードで追いやすい。
- `Zod + react-hook-form` は複雑な入力モデルを UI とサーバーで共有しやすい。
- Sprint 1 では可視化ライブラリや状態管理ライブラリは導入しない。必要になるまで増やさない。

## ディレクトリ構成
以下を初期構成とする。

```text
src/
  app/
    (routes)/
    layout.tsx
    page.tsx
  components/
    layout/
    list/
    detail/
    forms/
    fields/
  db/
    schema/
    client.ts
    migrations/
  features/
    events/
    people/
    polities/
    dynasties/
    periods/
    religions/
    regions/
    shared/
  lib/
    time-expression/
    validation/
    utils/
  server/
    repositories/
    services/
  types/
```

## レイヤリング方針
- `app/`: ルーティングと画面エントリのみ置く。
- `components/`: 汎用 UI 部品を置く。
- `features/`: ドメインごとの画面ロジック、フォーム、一覧定義を置く。
- `db/`: Drizzle スキーマ、DB クライアント、マイグレーション関連を置く。
- `server/repositories/`: DB アクセスを担当する。
- `server/services/`: 保存時の整形や複数テーブル更新などのユースケース処理を担当する。
- `lib/time-expression/`: `TimeExpression` の変換、表示、検証を集約する。
- `types/`: 画面やサービスで共有する DTO、enum、補助型を置く。

## ルーティング方針
- トップページはイベント一覧にリダイレクトする。
- 初期ルートは以下を用意する。
  - `/events`
  - `/people`
  - `/polities`
  - `/dynasties`
  - `/periods`
  - `/period-categories`
  - `/religions`
  - `/sects`
  - `/regions`
- 各ルートは一覧、作成、詳細、編集の 4 系統を基本とする。

## Sprint 1 で作る最低限の画面
- アプリ共通レイアウト
- グローバルナビゲーション
- プレースホルダ一覧画面
- プレースホルダ作成画面
- `TimeExpression` 単体確認用のサンプル画面または Story 相当の確認手段

## Drizzleスキーマ方針
- スキーマファイルはドメインごとに分割する。
- 共通カラムはユーティリティ化するが、抽象化しすぎない。
- 多対多リンクは中間テーブルを明示的に定義する。
- `TimeExpression` は共通埋め込みモデルではなく、各テーブルに必要なカラムを展開して持つ。

## TimeExpression仕様
Sprint 1 で以下を固定する。

- 保持項目:
  - `startYear`
  - `endYear`
  - `calendarEra`
  - `isApproximate`
  - `precision`
  - `displayLabel`
- 運用:
  - `calendarEra` は `BCE` / `CE`
  - `precision` は初期値として `year` のみ使用
  - 不明年は `startYear` と `endYear` を空にし、`displayLabel` で補助可能にする
  - 範囲年は `startYear` と `endYear` の両方を持つ
  - 継続中は `endYear` 系を空にする
- Sprint 1 の成果として、保存形式と画面入力形式の相互変換関数を必ず用意する

## バリデーション方針
- 入力スキーマは `Zod` で定義する。
- フォーム入力値と DB 永続化モデルは分ける。
- `TimeExpression` は専用の Zod スキーマを作り、各フォームで再利用する。
- 画面側だけでなくサーバー側でも同じスキーマを再利用する。

## UI方針
- UI は管理画面寄りのシンプル構成にする。
- 一覧は「表」、詳細は「セクション分割」、編集は「単一フォーム」を基本とする。
- Sprint 1 でデザイン凝りは不要。可読性、入力しやすさ、再利用性を優先する。
- モーダル依存にしない。新規作成・編集は独立ページを基本とする。

## 命名規約
- モデル名は単数形 `Event`, `Person`, `Polity` で統一する。
- DB テーブル名は複数形スネークケースで統一する。
- ルート名は複数形ケバブケースで統一する。
- 中間テーブルは `{left}_{right}_links` のような明示名にする。

## Sprint 1 の完了条件
- `pnpm install` 後にローカル起動できる。
- Drizzle で初回マイグレーションを生成・適用できる。
- 共通レイアウトとナビゲーションが表示される。
- `TimeExpression` の型、Zod スキーマ、表示関数、入力部品が存在する。
- 少なくとも 1 つのダミー一覧画面と 1 つのダミーフォーム画面が共通部品で描画される。

## Sprint 1 でやらないこと
- 全ドメインの CRUD 完成
- 本格的な検索 UI
- 可視化ライブラリ導入
- 認証
- import/export
- 高度なテスト自動化

## 実装メモ
- App Router の Server Action を使うか API Route を使うかは Sprint 1 で固定する。
- 既定は `Server Actions + server/services` とし、CRUD が複雑化するまで API Route は増やさない。
- UI 部品は早い段階で分割しすぎず、2 画面以上で再利用が見えた時点で共通化する。
