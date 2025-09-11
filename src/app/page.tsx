import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <Link href="/test" className="w-36 h-12 rounded-2xl flex items-center justify-center bg-gray-100 hover:bg-gray-300">
        前往
      </Link>
    </div>
  );
}
