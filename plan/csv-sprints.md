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

## Sprint 5: RoleAssignment CSV

### 対象
- `RoleAssignment CSV import`

### 目的
- `Person CSV v1` で未対応だった役職履歴を別 CSV で投入できるようにする。
- 人物、国家、王朝の既存データを壊さずに、役職だけを後から追加できるようにする。

### 実装内容
- `RoleAssignment CSV v1` の列仕様を定義する。
- `previewRoleAssignmentCsvImport(rawCsv)` を実装する。
- `applyRoleAssignmentCsvImport(rawCsv)` を実装する。
- `person / polity / dynasty` の名前完全一致解決を行う。
- 在任期間の `TimeExpression` と `is_incumbent` を扱う。

### 想定列
- `person`
- `title`
- `polity`
- `dynasty`
- `start_label`
- `start_calendar_era`
- `start_start_year`
- `start_end_year`
- `start_is_approximate`
- `end_label`
- `end_calendar_era`
- `end_start_year`
- `end_end_year`
- `end_is_approximate`
- `is_incumbent`
- `note`

### 完了条件
- `/manage/data` から `RoleAssignment CSV` の preview/import ができる。
- 未知の人物・国家・王朝を検出できる。
- 同一人物への役職履歴を複数行で追加できる。

## Sprint 6: EventRelation CSV

### 対象
- `EventRelation CSV import`

### 目的
- 大量投入したイベント同士に、前後関係・因果関係・関連関係をまとめて付与できるようにする。

### 実装内容
- `EventRelation CSV v1` の列仕様を定義する。
- `previewEventRelationCsvImport(rawCsv)` を実装する。
- `applyEventRelationCsvImport(rawCsv)` を実装する。
- `from_event / to_event` の名前解決を行う。
- `relation_type` の列挙値検証を行う。

### 想定列
- `from_event`
- `to_event`
- `relation_type`

### 完了条件
- `/manage/data` から `EventRelation CSV` の preview/import ができる。
- `before / after / cause / related` のみ受け付ける。
- 未知イベントや自己参照を検出できる。

## Sprint 7: ConflictParticipant / ConflictOutcome CSV

### 対象
- `ConflictParticipant CSV import`
- `ConflictOutcome CSV import`

### 目的
- 戦争・乱イベントの参加勢力と勝敗結果を、Event 本体とは別に追加入力できるようにする。

### 実装内容
- `ConflictParticipant CSV v1` の列仕様を定義する。
- `ConflictOutcome CSV v1` の列仕様を定義する。
- 各 preview/import 関数を実装する。
- `event`、参加主体、勝者側、敗者側の参照解決を行う。

### 想定列
- `ConflictParticipant CSV`
  - `event`
  - `participant_type`
  - `participant_name`
  - `role`
  - `note`
- `ConflictOutcome CSV`
  - `event`
  - `winner_participants`
  - `loser_participants`
  - `settlement_summary`
  - `note`

### 完了条件
- `/manage/data` から `ConflictParticipant CSV` の preview/import ができる。
- `/manage/data` から `ConflictOutcome CSV` の preview/import ができる。
- 戦争・乱以外のイベントに対する不正な投入を preview で止められる。

## Sprint 8: 主要マスタ CSV 前半

### 対象
- `Region CSV import`
- `PeriodCategory CSV import`
- `Polity CSV import`
- `Religion CSV import`

### 目的
- 他 CSV の参照先になる主要マスタを、依存の少ない順でまとめて投入できるようにする。

### 実装内容
- 各マスタの `CSV v1` を定義する。
- preview/import を追加する。
- `Region` は親地域参照、`Polity` と `Religion` は時間表現を扱う。

### 完了条件
- 4 種のマスタを `/manage/data` から preview/import できる。
- 参照依存がある列は完全一致で検証できる。

## Sprint 9: 主要マスタ CSV 後半

### 対象
- `Dynasty CSV import`
- `HistoricalPeriod CSV import`
- `Sect CSV import`
- `Tag CSV import`

### 目的
- 依存があるマスタを後段で追加し、主要ドメインの一括初期投入を可能にする。

### 実装内容
- `Dynasty` は `Polity` 参照を必須にする。
- `HistoricalPeriod` は `PeriodCategory` と任意の `Polity / Region` 参照を扱う。
- `Sect` は `Religion` 参照を必須にする。
- `Tag` は最小列で軽量に import できるようにする。

### 完了条件
- 4 種のマスタを `/manage/data` から preview/import できる。
- `Dynasty / HistoricalPeriod / Sect` の親参照が壊れた行を止められる。

## Sprint 10: 運用高度化 CSV

### 対象
- `Source CSV import`
- `Citation CSV import`
- `PolityTransition CSV import`
- `DynastySuccession CSV import`
- `RegionRelation CSV import`
- `HistoricalPeriodRelation CSV import`

### 目的
- 出典・引用・主体間関係の大量投入を支え、研究用データ運用を強化する。

### 実装内容
- `Source / Citation` の import を追加する。
- 既存の関係モデル群に対する CSV import を追加する。
- 依存先の存在確認と関係種別検証を行う。

### 完了条件
- 各関係 CSV の preview/import ができる。
- 未知参照、重複関係、不正な relation type を止められる。

## Sprint 11: UI と運用改善

### 対象
- file upload UI
- 曖昧一致候補 UI
- import 履歴と結果再確認 UI

### 目的
- テキスト貼り付け中心の初期 UI を、実運用向けに改善する。

### 実装内容
- `/manage/data` に file upload を追加する。
- 名前の曖昧一致候補を preview 上で確認できるようにする。
- import 結果の保存と再表示を追加する。

### 完了条件
- ファイル選択から preview/import まで完結できる。
- 完全一致に失敗した場合も、候補確認まで UI で辿れる。

## 実装順の推奨
1. Sprint 1
2. Sprint 2
3. Sprint 3
4. Sprint 4
5. Sprint 5
6. Sprint 6
7. Sprint 7
8. Sprint 8
9. Sprint 9
10. Sprint 10
11. Sprint 11

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

### Release D
- Sprint 5 から Sprint 7
- 役職履歴、イベント関係、戦争補助データを CSV で追加入力できるようにする。

### Release E
- Sprint 8 と Sprint 9
- 主要マスタを CSV で初期投入できるようにする。

### Release F
- Sprint 10 と Sprint 11
- 出典・関係データ・運用 UI まで含めて CSV import を実用レベルへ引き上げる。

## 先送り項目
- file upload UI
- `RoleAssignment CSV`
- `EventRelation CSV`
- `ConflictParticipant CSV`
- `ConflictOutcome CSV`
- `Region CSV`
- `PeriodCategory CSV`
- `Polity CSV`
- `Religion CSV`
- `Dynasty CSV`
- `HistoricalPeriod CSV`
- `Sect CSV`
- `Tag CSV`
- `Source CSV`
- `Citation CSV`
- `PolityTransition CSV`
- `DynastySuccession CSV`
- `RegionRelation CSV`
- `HistoricalPeriodRelation CSV`
- 曖昧一致候補 UI
- 自動マージ
