#!/bin/bash

# 引数 or 対話入力
TABLE=$1
CSV_NAME=$2

# TABLE未指定なら対話入力
if [ -z "$TABLE" ]; then
  read -p "テーブル名を入力してください: " TABLE
fi

# CSV_NAME未指定なら対話入力
if [ -z "$CSV_NAME" ]; then
  read -p "CSV名を入力してください: " CSV_NAME
fi

# 確認
echo "-----------------------------"
echo "テーブル名: $TABLE"
echo "CSV名: $CSV_NAME"
echo "-----------------------------"

read -p "この内容で実行しますか？ (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "キャンセルしました"
  exit 1
fi

# プロンプト生成
PROMPT=$(sed \
  -e "s/{{TABLE}}/$TABLE/g" \
  -e "s/{{CSV_NAME}}/$CSV_NAME/g" \
  prompts/csv_feature.md)

# 実行
codex exec "$PROMPT"
