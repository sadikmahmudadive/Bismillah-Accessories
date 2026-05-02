import { PackageSearch } from "lucide-react";

export function ProductEmptyState({ message }: { message?: string }) {
  return (
    <div className="mt-8 rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f6f4ee] text-neutral-950">
        <PackageSearch className="size-5" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-neutral-950">
        No products published yet
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
        {message ||
          "Add active products from the admin dashboard and they will appear here."}
      </p>
    </div>
  );
}
