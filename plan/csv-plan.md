# historia CSV import 実装計画

## 目的
- 既存の `JSON import/export` に加えて、表計算ソフトで編集しやすい `CSV import` を追加する。
- 初期対象を `Event` と `Person` に限定し、既存データを壊さない安全な投入フローを先に作る。
- 将来的な `Polity / HistoricalPeriod / Religion` などへの拡張に耐える共通基盤を整える。

## 現状整理
- 実装済み:
  - `JSON export`
  - `JSON import` preview
  - `Event CSV export`
  - `Person CSV export`
  - `Event CSV import`
  - `Person CSV import`
  - CSV preview
  - CSV 行単位の重複候補表示
  - CSV エラーの行番号付き検証結果
- 未実装:
  - `RoleAssignment CSV import`
  - `EventRelation CSV import`
  - `ConflictParticipant / ConflictOutcome CSV import`
  - 各種マスタ CSV import
  - file upload UI
  - 名前の曖昧一致候補 UI

## スコープ

### Phase 1: Event CSV import
- `Event` のみ対象にする。
- 1 行 1 イベントで取り込む。
- タグ、人物、国家、王朝、時代区分、宗教、宗派、地域は `名前ベース` の解決を行う。
- 関連イベント、戦争参加勢力、勝敗結果までは初期版では対象外にする。

### Phase 2: Person CSV import
- `Person` を対象に追加する。
- 地域、宗教、宗派、時代区分は `名前ベース` で解決する。
- 役職履歴は初期版では 1 列の複雑表現にせず、別 CSV に分離するか後続フェーズに回す。

### Phase 3: 補助 CSV
- `RoleAssignment CSV`
- `EventRelation CSV`
- `ConflictParticipant CSV`
- 必要になった時点で個別に追加する。

### Phase 4: マスタ CSV
- `Region CSV`
- `Polity CSV`
- `Dynasty CSV`
- `HistoricalPeriod CSV`
- `PeriodCategory CSV`
- `Religion CSV`
- `Sect CSV`
- `Tag CSV`
- 初期は依存の少ないものから追加し、参照解決に使う主要マスタを先に固める。

## 未対応データの整理

### 優先度 A: 早めに必要なもの
- `RoleAssignment CSV`
  - 理由: `Person CSV v1` で未対応の役職履歴を補完できる。
  - 主な列案:
    - `person`
    - `title`
    - `polity`
    - `dynasty`
    - `start_*`
    - `end_*`
    - `is_incumbent`
    - `note`
- `EventRelation CSV`
  - 理由: イベントを大量投入した後に前後関係・因果関係をまとめて張りたい需要が高い。
  - 主な列案:
    - `from_event`
    - `to_event`
    - `relation_type`
- `ConflictParticipant CSV`
  - 理由: 戦争・乱を Event 本体とは別に増補したい。
  - 主な列案:
    - `event`
    - `participant_type`
    - `participant_name`
    - `role`
    - `note`
- `ConflictOutcome CSV`
  - 理由: 勝者・敗者・講和要約を別投入できるようにする。
  - 主な列案:
    - `event`
    - `winner_participants`
    - `loser_participants`
    - `settlement_summary`
    - `note`

### 優先度 B: マスタ整備用
- `Region CSV`
- `PeriodCategory CSV`
- `Polity CSV`
- `Religion CSV`
- `Tag CSV`
- 理由: 他 CSV の参照先として使いやすく、依存関係が比較的単純。

### 優先度 C: 依存があるマスタ
- `Dynasty CSV`
  - `Polity` への参照が必要。
- `HistoricalPeriod CSV`
  - `PeriodCategory` と任意の `Polity / Region` への参照が必要。
- `Sect CSV`
  - `Religion` への参照が必要。

### 優先度 D: 運用高度化向け
- `Source CSV`
- `Citation CSV`
- `PolityTransition CSV`
- `DynastySuccession CSV`
- `RegionRelation CSV`
- `HistoricalPeriodRelation CSV`
- 理由: 実装価値はあるが、初回の大量データ投入よりは後回しでよい。

## 推奨実装順
1. `RoleAssignment CSV`
2. `EventRelation CSV`
3. `ConflictParticipant CSV`
4. `ConflictOutcome CSV`
5. `Region CSV`
6. `PeriodCategory CSV`
7. `Polity CSV`
8. `Religion CSV`
9. `Dynasty CSV`
10. `HistoricalPeriod CSV`
11. `Sect CSV`
12. `Tag CSV`
13. `Source CSV`
14. `Citation CSV`
15. `PolityTransition / DynastySuccession / RegionRelation / HistoricalPeriodRelation CSV`

## 依存関係メモ
- `Dynasty CSV` は `Polity CSV` より先に入れない。
- `Sect CSV` は `Religion CSV` より先に入れない。
- `HistoricalPeriod CSV` は少なくとも `PeriodCategory CSV` より後に入れる。
- `RoleAssignment CSV` は `Person` と `Polity / Dynasty` の既存データを前提にする。
- `EventRelation CSV` と `Conflict* CSV` は `Event CSV` の投入後を前提にする。

## 基本方針
- CSV import は `JSON import` と同じく `追加入力` を基本にする。
- 自動マージはしない。
- まず `preview` を必須にし、`import` はその次の操作にする。
- 既存名との一致を使って参照解決する。
- 解決できない名前は即 import せず、preview でエラー表示する。

## UI 設計

### `/manage/data`
- 既存の `JSON import` セクションの下に `CSV import` セクションを追加する。
- 対象種別:
  - `Event`
  - `Person`
- 入力方法:
  - `textarea` 貼り付け
  - 将来的には file upload を追加可能な構成にする

### preview 結果
- 件数サマリ
  - 総行数
  - 追加予定数
  - 重複候補数
  - エラー件数
- 行単位結果
  - `ok`
  - `duplicate-candidate`
  - `error`
- エラー表示
  - 行番号
  - 対象列
  - エラー理由

## CSV 仕様

### Event CSV v1
- 必須列:
  - `title`
  - `event_type`
- 任意列:
  - `description`
  - `time_label`
  - `time_calendar_era`
  - `time_start_year`
  - `time_end_year`
  - `time_is_approximate`
  - `tags`
  - `people`
  - `polities`
  - `dynasties`
  - `periods`
  - `religions`
  - `sects`
  - `regions`
- 複数値列は `|` 区切りにする。
  - 例: `tags=戦争|宗教`
  - 例: `regions=ヨーロッパ|エルサレム`

### Person CSV v1
- 必須列:
  - `name`
- 任意列:
  - `aliases`
  - `note`
  - `birth_label`
  - `birth_calendar_era`
  - `birth_start_year`
  - `birth_end_year`
  - `birth_is_approximate`
  - `death_label`
  - `death_calendar_era`
  - `death_start_year`
  - `death_end_year`
  - `death_is_approximate`
  - `regions`
  - `religions`
  - `sects`
  - `periods`

## パーサ設計

### 新規 service
- `src/server/services/csv-import.ts`

### 主な責務
- CSV テキストをパースする
- header を検証する
- 行ごとに domain input へ変換する
- 参照名を既存 ID へ解決する
- preview 結果 DTO を返す
- import 実行時は既存 service を呼ぶ

### 想定関数
- `previewEventCsvImport(rawCsv: string)`
- `applyEventCsvImport(rawCsv: string)`
- `previewPersonCsvImport(rawCsv: string)`
- `applyPersonCsvImport(rawCsv: string)`

## 参照解決ルール
- `people` 列は人物名完全一致で解決する。
- `polities` 列は国家名完全一致で解決する。
- `dynasties` 列は王朝名完全一致で解決する。
- `periods` 列は時代区分名完全一致で解決する。
- `religions` 列は宗教名完全一致で解決する。
- `sects` 列は宗派名完全一致で解決する。
- `regions` 列は地域名完全一致で解決する。
- `tags` は既存タグを再利用し、未登録なら新規作成を許可する。

## 重複判定

### Event
- `title` 一致
- かつ `time_start_year` 近接または一致
- 既存 `JSON import` の重複候補ロジックと揃える

### Person
- `name` 一致
- または `aliases` 内一致
- 生年または没年が一致する場合は強い候補として扱う

## 実装手順

### Step 1: CSV parser 基盤
- `csv-import.ts` を追加する。
- クォート付き CSV を扱える簡易パーサを入れる。
- まずは外部依存なしで実装する。
- 必要なら後で専用ライブラリに差し替える。

### Step 2: Event preview
- `Event CSV` の header 検証を実装する。
- 1 行ごとの preview DTO を返す。
- `/manage/data` に preview UI を追加する。

### Step 3: Event import
- `createEventFromInput()` を再利用して import を実装する。
- エラー行がある場合は import を拒否する。

### Step 4: Person preview/import
- `Person CSV` に同じ仕組みを適用する。
- `createPersonFromInput()` を再利用する。

### Step 5: テスト
- 正常系:
  - 単一行 import
  - 複数行 import
  - 既存名参照の解決
- 異常系:
  - 必須列不足
  - 未知の人物名や地域名
  - 不正な年値
  - 重複候補の検出

### Step 6: ドキュメント
- `README.md` に CSV import 手順を追記する。
- サンプル CSV を `design/` または `examples/` に置く。

## 完了条件
- `/manage/data` から `Event CSV` の preview/import ができる。
- `/manage/data` から `Person CSV` の preview/import ができる。
- 行番号付きエラーを確認できる。
- 参照名解決に失敗した場合、import を止められる。
- `lint / typecheck / test / build` が通る。

## 先送り項目
- file upload UI
- `RoleAssignment CSV`
- `ConflictParticipant CSV`
- `EventRelation CSV`
- `ConflictOutcome CSV`
- `Region / Polity / Dynasty / HistoricalPeriod / PeriodCategory / Religion / Sect / Tag CSV`
- `Source / Citation CSV`
- `PolityTransition / DynastySuccession / RegionRelation / HistoricalPeriodRelation CSV`
- 自動マージ
- 名前の曖昧一致候補 UI

## リスクと対策
- CSV 仕様が曖昧になりやすい
  - 対策: `v1` の対象列を固定し、未知列は warning に留める
- 参照名の揺れで import 失敗が増える
  - 対策: 初期版は完全一致に限定し、後で別名対応を強化する
- 役職履歴を 1 行に押し込むと複雑になる
  - 対策: `Person CSV v1` では役職履歴を対象外にする

## 実装時の補足
- 既存の `src/server/services/import-export.ts` とは責務を分ける。
  - `import-export.ts`: JSON/CSV export と JSON import
  - `csv-import.ts`: CSV import preview/import
- 将来的に共通 preview DTO を切り出すなら `src/types/import.ts` を追加する。
