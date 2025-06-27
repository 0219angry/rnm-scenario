// このファイルが、プロジェクト全体で使われる唯一のPagePropsの定義元となります。
export interface PageProps {
  params?: { [key: string]: string | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
}