import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/asset";

// Necessário para o build estático (output: "export").
export const dynamic = "force-static";

const SITE_URL = (process.env.SITE_URL || "https://opportunity.ia.br").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}${BASE_PATH}/sitemap.xml`,
  };
}
