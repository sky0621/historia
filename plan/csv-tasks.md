# historia CSV import タスク分解

## 使い方
- このファイルは `csv-plan.md` を実装タスクへ分解したもの。
- 初期対象は `Event CSV import` と `Person CSV import`。
- `preview` を先に作り、その後 `import` を有効化する順で進める。
- 各タスクは `Status` を `todo / doing / done` で運用する前提。

## CSV-001 共通 CSV パーサ基盤
- Status: `todo`
- 目的: CSV import 全体で使う最低限のパーサを作る。
- 作業:
  - `src/server/services/csv-import.ts` を追加する。
  - クォート付きセル、カンマ、改行を扱える簡易 CSV パーサを実装する。
  - ヘッダ行とデータ行を分離し、行番号付き DTO を返す。
  - 空行のスキップルールを決める。
- 完了条件:
  - CSV テキストから `headers` と `rows` を安定して取得できる。
  - 行番号を保持できる。
- 依存: なし

## CSV-002 共通 preview DTO
- Status: `todo`
- 目的: `Event` と `Person` で共通に使う preview 形式を先に固定する。
- 作業:
  - preview 結果型を定義する。
  - `ok / duplicate-candidate / error` の状態を定義する。
  - 行単位エラーに `rowNumber / field / message` を持たせる。
  - 件数サマリ DTO を定義する。
- 完了条件:
  - `Event` と `Person` の preview が同じ UI で表示できる型がある。
- 依存: CSV-001

## CSV-003 参照解決ユーティリティ
- Status: `todo`
- 目的: 名前ベース参照解決を共通化する。
- 作業:
  - `people / polities / dynasties / periods / religions / sects / regions / tags` の名前解決関数を作る。
  - 完全一致のルールを実装する。
  - `tags` だけは未登録時の新規作成候補として扱えるようにする。
- 完了条件:
  - 行変換時に各ドメインの名前を ID へ変換できる。
  - 解決失敗時に列名付きエラーを返せる。
- 依存: CSV-001

## CSV-004 Event CSV v1 スキーマ
- Status: `todo`
- 目的: `Event CSV` の列仕様をコードに固定する。
- 作業:
  - 必須列 `title / event_type` を検証する。
  - 任意列 `description / time_* / tags / people / polities / dynasties / periods / religions / sects / regions` を扱う。
  - 複数値列の `|` 区切りを実装する。
  - 未知列を warning 扱いにするか無視するかを固定する。
- 完了条件:
  - `Event CSV v1` のヘッダ検証ができる。
- 依存: CSV-001, CSV-002

## CSV-005 Event preview
- Status: `todo`
- 目的: import 前に `Event CSV` を preview できるようにする。
- 作業:
  - 1 行ごとに `EventInput` へ変換する。
  - 参照解決を行う。
  - 必須列不足、不正年値、未知参照をエラー化する。
  - 重複候補を `title + 年代` ベースで検出する。
- 完了条件:
  - `previewEventCsvImport(rawCsv)` が件数サマリと行結果を返す。
- 依存: CSV-003, CSV-004

## CSV-006 Event import
- Status: `todo`
- 目的: `Event CSV` の preview 結果を実際に投入できるようにする。
- 作業:
  - `createEventFromInput()` を再利用して import を実装する。
  - preview で `error` がある場合は import を拒否する。
  - `duplicate-candidate` は import 自体は止め、ユーザーに確認させる初期仕様にする。
  - 成功件数を返す。
- 完了条件:
  - `applyEventCsvImport(rawCsv)` でイベントを追加登録できる。
- 依存: CSV-005

## CSV-007 Person CSV v1 スキーマ
- Status: `todo`
- 目的: `Person CSV` の列仕様をコードに固定する。
- 作業:
  - 必須列 `name` を検証する。
  - 任意列 `aliases / note / birth_* / death_* / regions / religions / sects / periods` を扱う。
  - 役職履歴は対象外と明記する。
- 完了条件:
  - `Person CSV v1` のヘッダ検証ができる。
- 依存: CSV-001, CSV-002

## CSV-008 Person preview
- Status: `todo`
- 目的: import 前に `Person CSV` を preview できるようにする。
- 作業:
  - 1 行ごとに `PersonInput` へ変換する。
  - 地域、宗教、宗派、時代区分の参照解決を行う。
  - `name` 一致、`aliases` 一致、生没年一致で重複候補を検出する。
  - 不正年値や未知参照をエラー化する。
- 完了条件:
  - `previewPersonCsvImport(rawCsv)` が件数サマリと行結果を返す。
- 依存: CSV-003, CSV-007

## CSV-009 Person import
- Status: `todo`
- 目的: `Person CSV` を追加登録できるようにする。
- 作業:
  - `createPersonFromInput()` を再利用して import を実装する。
  - preview で `error` がある場合は import を拒否する。
  - `duplicate-candidate` の扱いは Event と同じポリシーに揃える。
- 完了条件:
  - `applyPersonCsvImport(rawCsv)` で人物を追加登録できる。
- 依存: CSV-008

## CSV-010 `/manage/data` UI 追加
- Status: `todo`
- 目的: 管理画面から CSV preview/import を操作できるようにする。
- 作業:
  - `CSV import` セクションを追加する。
  - 対象種別 `Event / Person` を切り替えられるようにする。
  - `preview` ボタンと `import` ボタンを追加する。
  - preview の件数サマリと行結果を表示する。
- 完了条件:
  - 管理画面から CSV preview/import を操作できる。
- 依存: CSV-005, CSV-006, CSV-008, CSV-009

## CSV-011 行単位エラー表示
- Status: `todo`
- 目的: import 失敗理由を実務で追えるようにする。
- 作業:
  - `rowNumber / field / message` を UI で見えるようにする。
  - 重複候補とエラーを視覚的に区別する。
  - 件数サマリと行詳細を同時に見られるレイアウトにする。
- 完了条件:
  - どの行のどの列が失敗したか分かる。
- 依存: CSV-010

## CSV-012 テスト
- Status: `todo`
- 目的: CSV import の壊れやすい部分を自動テストで押さえる。
- 作業:
  - パーサ単体テストを追加する。
  - `Event preview` の正常系/異常系テストを追加する。
  - `Person preview` の正常系/異常系テストを追加する。
  - 重複候補検出のテストを追加する。
- 完了条件:
  - `pnpm test` で CSV import の主要ケースをカバーできる。
- 依存: CSV-001, CSV-005, CSV-008

## CSV-013 ドキュメントとサンプル
- Status: `todo`
- 目的: 実装後に使い方が分かる状態にする。
- 作業:
  - `README.md` に CSV import 手順を追記する。
  - サンプル `Event CSV` と `Person CSV` を追加する。
  - 制約事項として「完全一致」「役職履歴対象外」を明記する。
- 完了条件:
  - CSV import を README とサンプルだけで再現できる。
- 依存: CSV-010, CSV-011

## CSV-014 最終検証
- Status: `todo`
- 目的: 実装全体が既存機能を壊していないことを確認する。
- 作業:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `Event CSV` と `Person CSV` の実データ import を手動確認する。
- 完了条件:
  - CSV import を含めて既存機能が通る。
- 依存: CSV-012, CSV-013

## 推奨実装順
1. CSV-001
2. CSV-002
3. CSV-003
4. CSV-004
5. CSV-005
6. CSV-006
7. CSV-007
8. CSV-008
9. CSV-009
10. CSV-010
11. CSV-011
12. CSV-012
13. CSV-013
14. CSV-014

## Phase 単位の区切り

### Phase A
- CSV-001 から CSV-006
- `Event CSV import` 完了まで

### Phase B
- CSV-007 から CSV-009
- `Person CSV import` 完了まで

### Phase C
- CSV-010 から CSV-014
- UI、テスト、ドキュメント、最終検証
