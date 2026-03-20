# historia CSV import スプリント計画

## 目的
- `csv-plan.md` と `csv-tasks.md` を、実装順そのままで進めやすい `Sprint` 単位へまとめる。
- 初期リリース対象は `Event CSV import` と `Person CSV import`。
- 各 Sprint は「preview を安全に通す」「その後 import を有効化する」の順を守る。

## Sprint 1: CSV 基盤と Event preview

### 対象タスク
- `CSV-001` 共通 CSV パーサ基盤
- `CSV-002` 共通 preview DTO
- `CSV-003` 参照解決ユーティリティ
- `CSV-004` Event CSV v1 スキーマ
- `CSV-005` Event preview

### 目的
- `Event CSV` をまだ投入せず、安全に preview だけできる状態を先に作る。
- CSV の行番号、列名、参照解決エラー、重複候補を安定して返せる基盤を固める。

### 実装内容
- `src/server/services/csv-import.ts` を追加する。
- 共通 CSV パーサと preview DTO を定義する。
- `Event CSV v1` のヘッダ検証を実装する。
- `Event` 行を既存入力形式へ変換し、参照解決と重複候補検出を行う。

### 完了条件
- `previewEventCsvImport(rawCsv)` が動く。
- 行番号付きで `ok / duplicate-candidate / error` を返せる。
- 人物、国家、王朝、時代区分、宗教、宗派、地域、タグの名前解決ができる。
- `error` を含む preview 結果を UI なしでも確認できる。

## Sprint 2: Event import と管理画面導線

### 対象タスク
- `CSV-006` Event import
- `CSV-010` `/manage/data` UI 追加
- `CSV-011` 行単位エラー表示

### 目的
- `Event CSV` の preview 結果を管理画面から確認し、そのまま import できるようにする。
- 初期版の CSV import を、まず `Event` だけで運用開始できる状態にする。

### 実装内容
- `applyEventCsvImport(rawCsv)` を実装する。
- `/manage/data` に `CSV import` セクションを追加する。
- `Event` を対象に `preview` と `import` を操作できる UI を追加する。
- 行単位エラー、重複候補、件数サマリを表示する。

### 完了条件
- `/manage/data` から `Event CSV` の preview/import ができる。
- `error` 行がある場合は import を拒否できる。
- `duplicate-candidate` 行がある場合は import 前に止められる。
- 運用者が「どの行のどの列が失敗したか」を UI 上で判断できる。

## Sprint 3: Person preview/import

### 対象タスク
- `CSV-007` Person CSV v1 スキーマ
- `CSV-008` Person preview
- `CSV-009` Person import

### 目的
- `Person CSV import` を既存の `Event CSV import` 基盤へ追加する。
- `Person` についても preview 必須の安全な投入フローを揃える。

### 実装内容
- `Person CSV v1` のヘッダ検証を実装する。
- `previewPersonCsvImport(rawCsv)` を実装する。
- `applyPersonCsvImport(rawCsv)` を実装する。
- 地域、宗教、宗派、時代区分の名前解決を行う。
- `name / aliases / 生没年` ベースの重複候補検出を入れる。

### 完了条件
- `/manage/data` から `Person CSV` の preview/import ができる。
- 生没年の不正値、未知参照、必須列不足を検出できる。
- `Event` と `Person` の両方で共通 preview UI を再利用できる。

## Sprint 4: テスト・ドキュメント・サンプル

### 対象タスク
- `CSV-012` テスト
- `CSV-013` ドキュメントとサンプル
- `CSV-014` 最終検証

### 目的
- CSV import を一時的な実装で終わらせず、壊れにくく使い方も分かる状態にする。
- 既存の import/export や CRUD に影響がないことを確認する。

### 実装内容
- パーサ、Event preview、Person preview の自動テストを追加する。
- `README.md` に CSV import 手順を追記する。
- サンプル `Event CSV` と `Person CSV` を追加する。
- 手動確認と `lint / typecheck / test / build` を通す。

### 完了条件
- `pnpm test` で CSV import の主要ケースをカバーできる。
- README とサンプルだけで CSV import の再現手順が分かる。
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## 実装順の推奨
1. Sprint 1
2. Sprint 2
3. Sprint 3
4. Sprint 4

## リリース単位の考え方

### Release A
- Sprint 1 と Sprint 2
- `Event CSV import` を先に利用開始する。

### Release B
- Sprint 3
- `Person CSV import` を追加する。

### Release C
- Sprint 4
- テスト、ドキュメント、サンプルを揃えて安定運用に入る。

## 先送り項目
- file upload UI
- `RoleAssignment CSV`
- `EventRelation CSV`
- `ConflictParticipant CSV`
- 曖昧一致候補 UI
- 自動マージ
