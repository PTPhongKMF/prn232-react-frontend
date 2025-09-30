export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center size-full bg-[url(/imgs/bg/login.png)] min-h-[100svh] bg-cover bg-amber-50 text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-5xl font-bold text-gray-800">Welcome to Mathslide Learning!</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Your fun and interactive way to master math. Ready to start your learning adventure?
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-transform active:scale-95 hover:scale-95 hover:shadow-sm"
          >
            Get Started
          </a>
          <a
            href="/features"
            className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 shadow-md transition-transform active:scale-95 hover:scale-95 hover:shadow-sm"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}