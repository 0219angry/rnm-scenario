import { z } from "zod";
import { Genre } from "@prisma/client";

export const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  playerMin: z.coerce.number().int().positive("1人以上で入力してください"),
  playerMax: z.coerce.number().int().positive("1人以上で入力してください"),
  requiresGM: z.boolean().default(false),
  genre: z.nativeEnum(Genre, {
    errorMap: () => ({ message: "ジャンルを選択してください" }),
  }),
  averageTime: z.coerce.number().int().positive("1分以上で入力してください"),
  distribution: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("有効なURLを入力してください").optional()
  ),
  priceMax: z.coerce.number().int().nonnegative("価格上限は0円以上で入力してください").optional(),
  priceMin: z.coerce.number().int().nonnegative("価格下限は0円以上で入力してください").optional(),
  isPublic: z.boolean().default(true),
  rulebookId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional()
  ),
  comment: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().max(1000, "コメントは1000文字以内で入力してください").optional()
  ),
}).refine(data => data.playerMax >= data.playerMin, {
  message: "最大プレイヤー人数は最低プレイヤー人数以上である必要があります",
  path: ["playerMax"],
}).refine(data => {
  // priceMaxとpriceMinの関係を定義
  if (data.priceMax !== undefined && data.priceMin !== undefined) {
    return data.priceMax >= data.priceMin;
  }
  return true; // どちらかが未指定ならOK
},{
  message:"最大価格は最低価格以上である必要があります",
  path: ["priceMax"]
});

export type ScenarioFormValues = z.infer<typeof formSchema>;
