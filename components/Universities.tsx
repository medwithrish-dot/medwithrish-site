import Image from "next/image";

const universities = [
  { name: "cambridge", featured: true },
  { name: "kcl", featured: false },
  { name: "manchester", featured: false },
  { name: "bristol", featured: false },
  { name: "edinburgh", featured: false },
  { name: "newcastle", featured: false },
];

export default function Universities() {
  return (
    <section className="mx-auto mt-8 max-w-5xl px-2">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
          Students received offers from
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center items-center gap-6">
        {universities.map((uni) => (
          <div
            key={uni.name}
            className={`flex justify-center rounded-2xl px-3 py-3 transition ${
              uni.featured
                ? "border border-blue-200 bg-blue-50 shadow-sm"
                : "opacity-70"
            }`}
          >
            <Image
              src={`/universities/${uni.name}.png`}
              alt={uni.name}
              width={uni.featured ? 130 : 110}
              height={uni.featured ? 60 : 50}
              className={`h-auto object-contain ${
                uni.featured ? "w-[130px]" : "w-[110px] grayscale"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}