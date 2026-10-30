import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/asset";

// Necessário para o build estático (output: "export").
export const dynamic = "force-static";

const SITE_URL = (process.env.SITE_URL || "https://opportunity.ia.br").replace(/\/$/, "");

// Site de página única: a única URL indexável é a raiz.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}${BASE_PATH}/`, changeFrequency: "monthly", priority: 1 }];
}
