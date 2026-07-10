import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { getProductBySlug } from "@/lib/catalog/products";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleApiError(error);
  }
}
