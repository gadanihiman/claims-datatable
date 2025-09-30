import ClaimsTable from "@/components/ClaimsTable";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
	      <h1 className="mb-4 text-2xl font-semibold">Claims</h1>
	      <ClaimsTable />
      </main>
    </div>
  );
}
