function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Feriyo</h1>
        <p className="text-lg text-gray-300">
          This is your landing page. Browse listings using the button below.
        </p>
        <a
          href="/listings"
          className="inline-flex mt-6 px-6 py-3 text-[#111111] bg-[#2ACFCF] hover:bg-[#2AC1C1] rounded-md font-medium"
        >
          View Listings
        </a>
      </div>
    </div>
  );
}

export default Landing;
