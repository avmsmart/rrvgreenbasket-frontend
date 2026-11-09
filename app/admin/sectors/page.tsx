import { redirect } from "next/navigation";

/**
 * Legacy Sectors Route Redirect
 * The Sectors module has been replaced by Category Management (/admin/categories).
 */
export default function SectorsRedirectPage() {
  redirect("/admin/categories");
}
