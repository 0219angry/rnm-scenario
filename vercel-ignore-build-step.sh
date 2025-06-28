#!/bin/bash

# ブランチが "develop" または "main" の場合
if [[ "$VERCEL_GIT_COMMIT_REF" == "develop" || "$VERCEL_GIT_COMMIT_REF" == "main" ]] ; then
  # ビルドを実行する
  echo "✅ - Build can proceed for branch: $VERCEL_GIT_COMMIT_REF"
  exit 1;

else
  # それ以外のブランチはビルドをキャンセルする
  echo "🛑 - Build cancelled for branch: $VERCEL_GIT_COMMIT_REF"
  exit 0;
fi