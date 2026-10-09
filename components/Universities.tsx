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
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Students received offers from
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center items-center gap-5">
        {universities.map((uni) => (
          <div
            key={uni.name}
            className={`flex justify-center rounded-xl px-3.5 py-2.5 transition ${
              uni.featured
                ? "border border-slate-200 bg-white shadow-2xs"
                : "opacity-60 hover:opacity-90"
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