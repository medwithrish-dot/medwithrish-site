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
    <section className="mx-auto mt-10 max-w-5xl px-2">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Students received offers from
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center items-center gap-4 sm:gap-6">
        {universities.map((uni) => (
          <div
            key={uni.name}
            className={`flex items-center justify-center rounded-2xl px-4 py-2.5 transition-all duration-200 ${
              uni.featured
                ? "border border-blue-200 bg-white/95 shadow-sm shadow-blue-500/10 hover:border-blue-300 hover:shadow-md"
                : "border border-slate-200/80 bg-white/80 opacity-80 backdrop-blur-xs hover:opacity-100 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <Image
              src={`/universities/${uni.name}.png`}
              alt={`${uni.name} university offer`}
              width={uni.featured ? 130 : 110}
              height={uni.featured ? 60 : 50}
              className={`h-auto object-contain ${
                uni.featured ? "w-[125px]" : "w-[105px] grayscale hover:grayscale-0 transition-all duration-200"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}