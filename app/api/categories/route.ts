import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { listCategoryTree } from "@/lib/catalog/categories";

export async function GET() {
  try {
    const categories = await listCategoryTree();
    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}
