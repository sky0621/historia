-- インポート実行履歴: CSVなどの取り込み実行記録
CREATE TABLE `import_runs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- インポート実行ID
  `source_format` text NOT NULL, -- 入力形式: csv など
  `target_type` text NOT NULL, -- 取り込み対象の種別
  `action` text NOT NULL, -- 実行種別: preview / apply など
  `file_name` text, -- 入力ファイル名
  `status` text NOT NULL, -- 実行結果ステータス
  `summary_json` text NOT NULL -- 実行結果サマリのJSON
);
