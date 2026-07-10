import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { listProducts } from "@/lib/catalog/products";
import { productListQuerySchema } from "@/lib/validators/catalog";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = productListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listProducts(query);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
