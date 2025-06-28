"use client"; // 👈 これがクライアントコンポーネントであることを示す

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  utcDate: Date | string; // UTCの日付オブジェクトまたは文字列を受け取る
  formatStr: string;      // 表示フォーマットを自由に指定できるようにする
};

export function LocalDateTime({ utcDate, formatStr }: Props) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // このコンポーネントがブラウザにマウントされた後に実行される
    // これにより、必ずブラウザのタイムゾーンでフォーマットされる
    setFormattedDate(
      format(new Date(utcDate), formatStr, { locale: ja })
    );
  }, [utcDate, formatStr]); // propsが変更されたら再実行

  // サーバーとクライアントで初回表示が異なるとエラーになるため、
  // クライアント側でレンダリングされるまで何も表示しないか、ローディング表示を出す
  if (!formattedDate) {
    return null; // または <span className="animate-pulse">...</span> のようなローディング表示
  }
  
  return <>{formattedDate}</>;
}