-- タグ: 出来事などへ付与する分類タグ
CREATE TABLE `tags` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- タグID
  `name` text NOT NULL, -- タグ名
  `reading` text -- 読み方
);

-- 変更履歴: 各エンティティの変更前スナップショット
CREATE TABLE `change_histories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 変更履歴ID
  `target_type` text NOT NULL, -- 対象エンティティ種別
  `target_id` integer NOT NULL, -- 対象エンティティID
  `action` text NOT NULL REFERENCES `change_history_actions`(`code`), -- 操作種別コード
  `snapshot_json` text NOT NULL, -- 変更前後比較用のJSONスナップショット
  `changed_at` integer NOT NULL -- 変更日時のUnixタイムスタンプ
);
