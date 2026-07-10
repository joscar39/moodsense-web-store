import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { listBrands } from "@/lib/catalog/brands";

export async function GET() {
  try {
    const brands = await listBrands();
    return NextResponse.json({ data: brands });
  } catch (error) {
    return handleApiError(error);
  }
}
