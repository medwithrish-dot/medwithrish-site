"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Mail,
  MessageCircle,
  Mic2,
  Quote,
  School,
  Sparkles,
  Target,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";

type TutorTier = "rish" | "specialist";
type CheckoutStatus = "success" | "cancelled" | null;

const packages = {
  rish: {
    id: "interview-rish",
    label: "With @medwithrish",
    shortLabel: "Rish",
    price: 140,
    description:
      "Direct, personal coaching with Rish from your first technique session to your final mock feedback.",
  },
  specialist: {
    id: "interview-specialist",
    label: "With a specialist",
    shortLabel: "MedicForest specialist",
    price: 100,
    description:
      "Structured coaching with an experienced MedicForest Med Interview tutor.",
  },
} as const;

const heroFeatures = [
  { icon: Target, label: "Tailored to your universities" },
  { icon: Mic2, label: "Realistic mock practice" },
  { icon: BadgeCheck, label: "Feedback you can use" },
];

const packageFeatures = [
  "2 hours on answer structure, ethics and confident delivery",
  "2 full realistic mock interviews across MMI and panel formats",
  "Specific verbal and written feedback after each mock",
  "University-focused stations, scoring criteria and practice priorities",
];

const sessionPlan = [
  {
    number: "01",
    title: "Build the foundations",
    copy: "Sharpen answer structure, reflection, ethics and the examples that make your answers personal.",
  },
  {
    number: "02",
    title: "Practise under pressure",
    copy: "Complete two realistic mock interviews shaped around your target universities and format.",
  },
  {
    number: "03",
    title: "Leave with a plan",
    copy: "Use detailed feedback and clear priorities to focus every practice session that follows.",
  },
];

const interviewFormats = [
  {
    icon: Mic2,
    title: "MMI practice",
    copy: "Timed stations, follow-up questions and realistic transitions between topics.",
  },
  {
    icon: UsersRound,
    title: "Panel interviews",
    copy: "Longer-form questioning that tests depth, composure and natural conversation.",
  },
  {
    icon: School,
    title: "University-specific prep",
    copy: "Practice guided by the style and priorities of the medical schools on your list.",
  },
];

const whatsappHref =
  "https://wa.me/447305422619?text=Hi%20Rish%2C%20I%E2%80%99m%20interested%20in%201-1%20Med%20Interview%20tutoring.";

export function InterviewTutoringPageClient({
  checkoutStatus,
}: {
  checkoutStatus: CheckoutStatus;
}) {
  const [tutorTier, setTutorTier] = useState<TutorTier>("rish");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showContactFallback, setShowContactFallback] = useState(false);
  const selectedPackage = packages[tutorTier];

  useEffect(() => {
    if (!bookingOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingCheckout) setBookingOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookingOpen, loadingCheckout]);

  const startBooking = () => {
    setCheckoutError(null);
    setShowContactFallback(false);
    setBookingOpen(true);
  };

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingCheckout(true);
    setCheckoutError(null);
    setShowContactFallback(false);

    try {
      const response = await fetch("/api/stripe/create-tutoring-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          email: bookingEmail.trim(),
          returnTo: "interviews",
        }),
      });
      const data = (await response.json()) as {
        configured?: boolean;
        url?: string;
        error?: string;
      };

      if (response.ok && data.configured && data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError(
        response.ok
          ? "Online payment is temporarily unavailable. Contact us below and we will arrange your booking."
          : data.error ?? "We could not start checkout. Please try again."
      );
      setShowContactFallback(response.ok);
    } catch {
      setCheckoutError(
        "We could not connect to secure checkout. Contact us below or try again."
      );
      setShowContactFallback(true);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const bookingMailHref =
    "mailto:medwithrish@gmail.com?subject=" +
    encodeURIComponent(
      "Booking: 1-1 Med Interview Tutoring with " + selectedPackage.shortLabel
    ) +
    "&body=" +
    encodeURIComponent(
      "Hi Rish,\n\nI would like to book the 4-hour Med Interview tutoring package with " +
        selectedPackage.shortLabel +
        " (£" +
        selectedPackage.price +
        ").\nMy email: " +
        bookingEmail.trim() +
        "\n\nTarget universities:\nInterview date(s), if known:\nAreas I would like help with:\n\nThank you!"
    );

  return (
    <div className="relative isolate pb-[4rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[2rem] -top-[5rem] -z-10 h-[40rem] overflow-hidden"
      >
        <div className="absolute right-[-8rem] top-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[#bce9dc]/45 blur-3xl" />
        <div className="absolute left-[18%] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-white/80 blur-3xl" />
      </div>

      {checkoutStatus === "success" && (
        <div className="mb-[1.25rem] flex items-start gap-[0.75rem] rounded-[16px] border border-[#9bd5c8] bg-[#e8f8f3] p-[1rem] text-[#074f44]">
          <CheckCircle2 className="mt-[2px] h-[1.25rem] w-[1.25rem] shrink-0" aria-hidden="true" />
          <div>
            <p className="text-[0.9rem] font-bold">Your booking payment is complete.</p>
            <p className="mt-[0.2rem] text-[0.78rem] leading-[1.5]">
              We&apos;ll use your checkout email to arrange your sessions and next steps.
            </p>
          </div>
        </div>
      )}

      {checkoutStatus === "cancelled" && (
        <div className="mb-[1.25rem] flex items-start gap-[0.75rem] rounded-[16px] border border-[#e4cf9b] bg-[#fff9e9] p-[1rem] text-[#6d5112]">
          <MessageCircle className="mt-[2px] h-[1.25rem] w-[1.25rem] shrink-0" aria-hidden="true" />
          <div>
            <p className="text-[0.9rem] font-bold">Your booking was not completed.</p>
            <p className="mt-[0.2rem] text-[0.78rem] leading-[1.5]">
              No payment was taken. You can choose your package again whenever you&apos;re ready.
            </p>
          </div>
        </div>
      )}

      <section className="grid items-center gap-[2rem] xl:grid-cols-[minmax(0,0.96fr)_minmax(520px,1.04fr)] xl:gap-[3.25rem]">
        <div>
          <span className="inline-flex items-center gap-[0.45rem] rounded-full border border-[#9bded3] bg-[#ecfbf7] px-[0.8rem] py-[0.4rem] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#07665d]">
            <Sparkles className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
            1-1 Med Interview Tutoring
          </span>
          <h1 className="mt-[1rem] max-w-[760px] text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-[0.99] tracking-[-0.045em] text-[#071923]">
            Personal coaching for your{" "}
            <span className="text-[#08756a]">strongest interview yet.</span>
          </h1>
          <p className="mt-[1.2rem] max-w-[680px] text-[clamp(0.95rem,1.5vw,1.16rem)] leading-[1.65] text-[#46606b]">
            Work directly with <strong className="font-bold text-[#071923]">@medwithrish</strong>{" "}
            or a MedicForest specialist to turn prepared answers into confident, natural
            performance—with realistic practice and feedback built around your universities.
          </p>
          <div className="mt-[1.65rem] grid grid-cols-3 gap-[0.8rem] border-t border-[#d6e4e2] pt-[1.4rem]">
            {heroFeatures.map(({ icon: Icon, label }) => (
              <div key={label} className="min-w-0">
                <div className="flex h-[2.55rem] w-[2.55rem] items-center justify-center rounded-full border border-[#b8e6dd] bg-[#effbf8] text-[#08756a]">
                  <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
                </div>
                <p className="mt-[0.65rem] text-[0.74rem] font-bold leading-[1.35] text-[#19323c] sm:text-[0.82rem]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#d6e2e2] bg-white shadow-[0_18px_55px_rgba(9,55,49,0.10)]">
          <div className="flex items-center justify-between border-b border-[#e5eded] px-[1.35rem] py-[1rem] sm:px-[1.6rem]">
            <div>
              <p className="text-[1rem] font-bold text-[#071923]">Student outcome</p>
              <p className="mt-[0.15rem] text-[0.72rem] font-medium text-[#69808a]">Real message. Real result.</p>
            </div>
            <span className="inline-flex items-center gap-[0.35rem] rounded-full bg-[#e8f7f2] px-[0.65rem] py-[0.35rem] text-[0.66rem] font-bold uppercase tracking-[0.1em] text-[#08756a]">
              <BadgeCheck className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
              Verified
            </span>
          </div>
          <div className="grid gap-[1.25rem] p-[1.2rem] sm:grid-cols-[minmax(210px,0.92fr)_minmax(0,1.08fr)] sm:p-[1.5rem]">
            <div className="relative min-h-[220px] overflow-hidden rounded-[16px] bg-[#101817]">
              <Image
                src="/success-stories/story1.jpeg"
                alt="Message from a student confirming four medical school offers"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 640px) 90vw, 280px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="w-fit rounded-[7px] border border-[#afe4da] bg-[#effbf8] px-[0.6rem] py-[0.3rem] text-[0.66rem] font-bold uppercase tracking-[0.1em] text-[#08756a]">
                Medicine offers
              </span>
              <p className="mt-[0.7rem] text-[clamp(1.65rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.04em] text-[#071923]">4 out of 4</p>
              <Quote className="mt-[1rem] h-[1.15rem] w-[1.15rem] fill-[#a8ddd3] text-[#a8ddd3]" aria-hidden="true" />
              <p className="mt-[0.45rem] text-[0.82rem] leading-[1.55] text-[#4b626d]">
                “Forgot to update you but got all 4 offers! Once again thanks for all your help.”
              </p>
              <div className="mt-[1rem] border-t border-[#e5eded] pt-[0.8rem]">
                <p className="text-[0.73rem] font-bold text-[#1b333d]">Manchester · Newcastle · KCL · Liverpool</p>
                <p className="mt-[0.2rem] text-[0.68rem] text-[#71858d]">Med Interview tutoring student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-[4.5rem]" id="package">
        <div className="flex flex-col gap-[0.9rem] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#08756a]">The package</p>
            <h2 className="mt-[0.35rem] text-[clamp(1.75rem,3vw,2.55rem)] font-bold tracking-[-0.035em] text-[#071923]">
              Four focused hours. A clearer way forward.
            </h2>
            <p className="mt-[0.45rem] text-[0.9rem] leading-[1.6] text-[#526a74]">
              Choose who you want to work with. The structure and level of support stay the same.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-[0.45rem] rounded-full border border-[#cbdedb] bg-white px-[0.8rem] py-[0.45rem] text-[0.72rem] font-bold text-[#38545d] shadow-sm">
            <Clock3 className="h-[0.95rem] w-[0.95rem] text-[#08756a]" aria-hidden="true" />
            4 hours total · arranged around you
          </span>
        </div>

        <div className="mt-[1.4rem] grid gap-[1.25rem] xl:grid-cols-[minmax(0,1.28fr)_minmax(360px,0.72fr)]">
          <div className="relative overflow-hidden rounded-[24px] border border-[#91cec4] bg-white p-[1.25rem] shadow-[0_14px_42px_rgba(9,55,49,0.08)] sm:p-[1.7rem]">
            <div aria-hidden="true" className="absolute right-[-5rem] top-[-6rem] h-[16rem] w-[16rem] rounded-full bg-[#dff5ef]" />
            <div className="relative">
              <div className="grid grid-cols-2 rounded-[14px] border border-[#d8e5e3] bg-[#f3f7f6] p-[0.3rem]">
                {(Object.keys(packages) as TutorTier[]).map((tier) => {
                  const item = packages[tier];
                  const active = tutorTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTutorTier(tier)}
                      aria-pressed={active}
                      className={
                        "rounded-[10px] px-[0.7rem] py-[0.75rem] text-[0.72rem] font-bold transition sm:text-[0.8rem] " +
                        (active
                          ? "bg-[#08756a] text-white shadow-sm"
                          : "text-[#4d626b] hover:bg-white hover:text-[#17333b]")
                      }
                    >
                      {item.label} · £{item.price}
                    </button>
                  );
                })}
              </div>

              <div className="mt-[1.45rem] flex flex-col gap-[1rem] sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-[0.75rem]">
                    <div className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-full bg-[#e5f7f2] text-[#08756a]">
                      <UserRoundCheck className="h-[1.4rem] w-[1.4rem]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-[1.15rem] font-bold text-[#071923]">Complete Med Interview Preparation</h3>
                      <p className="mt-[0.2rem] text-[0.74rem] text-[#687d85]">MMI and panel coaching with realistic mock simulations</p>
                    </div>
                  </div>
                  <p className="mt-[1rem] max-w-[650px] text-[0.82rem] leading-[1.6] text-[#506873]">
                    {selectedPackage.description}
                  </p>
                </div>
                <div className="shrink-0 rounded-[14px] border border-[#c6e3dd] bg-[#effaf7] px-[1rem] py-[0.8rem] sm:text-right">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#08756a]">Full package</p>
                  <p className="mt-[0.2rem] text-[2rem] font-bold leading-none tracking-[-0.04em] text-[#071923]">£{selectedPackage.price}</p>
                  <p className="mt-[0.25rem] text-[0.68rem] text-[#6c8188]">one-off payment</p>
                </div>
              </div>

              <ul className="mt-[1.25rem] grid gap-[0.65rem] md:grid-cols-2">
                {packageFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-[0.65rem] rounded-[12px] bg-[#f5f8f7] px-[0.85rem] py-[0.75rem] text-[0.78rem] leading-[1.5] text-[#314b55]">
                    <CheckCircle2 className="mt-[0.12rem] h-[1rem] w-[1rem] shrink-0 text-[#0d9b89]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-[1.3rem] flex flex-col gap-[0.7rem] sm:flex-row">
                <button
                  type="button"
                  onClick={startBooking}
                  className="inline-flex flex-1 items-center justify-center gap-[0.55rem] rounded-[12px] bg-[#08756a] px-[1.1rem] py-[0.9rem] text-[0.82rem] font-bold text-white shadow-sm transition hover:bg-[#055c54]"
                >
                  Book with {selectedPackage.shortLabel} for £{selectedPackage.price}
                  <ArrowRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-[0.5rem] rounded-[12px] border border-[#b7d4cf] bg-white px-[1.1rem] py-[0.9rem] text-[0.82rem] font-bold text-[#07665d] transition hover:border-[#08756a] hover:bg-[#f4fbf9]"
                >
                  <MessageCircle className="h-[1rem] w-[1rem]" aria-hidden="true" />
                  Ask a question
                </a>
              </div>
              <p className="mt-[0.65rem] text-[0.66rem] text-[#72868d]">
                Secure online payment. Session dates are arranged with you after booking.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#052d29] p-[1.5rem] text-white shadow-[0_14px_42px_rgba(3,38,34,0.12)] sm:p-[1.7rem]">
            <div className="flex items-center gap-[0.6rem]">
              <GraduationCap className="h-[1.4rem] w-[1.4rem] text-[#8be4d9]" aria-hidden="true" />
              <h3 className="text-[1.05rem] font-bold">How your 4 hours work</h3>
            </div>
            <ol className="mt-[1.3rem] space-y-[1.05rem]">
              {sessionPlan.map((step, index) => (
                <li key={step.number} className="relative grid grid-cols-[2.2rem_1fr] gap-[0.75rem]">
                  {index < sessionPlan.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[1.05rem] top-[2rem] h-[calc(100%+0.6rem)] w-px bg-white/15" />
                  )}
                  <span className="relative z-10 flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-full border border-[#4d8e86] bg-[#0a3c37] text-[0.63rem] font-bold text-[#9ce8df]">
                    {step.number}
                  </span>
                  <div className="pt-[0.15rem]">
                    <p className="text-[0.82rem] font-bold text-white">{step.title}</p>
                    <p className="mt-[0.3rem] text-[0.74rem] leading-[1.55] text-[#bed5d2]">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-[1.3rem] rounded-[14px] border border-white/10 bg-white/[0.06] p-[0.9rem]">
              <p className="flex items-center gap-[0.45rem] text-[0.72rem] font-bold text-[#a5ebe3]">
                <Check className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
                Built around your interview dates
              </p>
              <p className="mt-[0.35rem] text-[0.7rem] leading-[1.5] text-[#b8cfcc]">
                Weekday and weekend availability is confirmed directly after booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-[4.5rem] rounded-[24px] border border-[#d5e2e1] bg-white p-[1.35rem] shadow-sm sm:p-[1.8rem]">
        <div className="max-w-[640px]">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#08756a]">Made personal</p>
          <h2 className="mt-[0.35rem] text-[clamp(1.55rem,2.5vw,2.15rem)] font-bold tracking-[-0.03em] text-[#071923]">
            Built for the interview you&apos;re actually facing.
          </h2>
          <p className="mt-[0.45rem] text-[0.84rem] leading-[1.6] text-[#587079]">
            No generic scripts. Your sessions focus on the format, schools and specific weaknesses that matter to you.
          </p>
        </div>
        <div className="mt-[1.35rem] grid gap-[0.8rem] md:grid-cols-3">
          {interviewFormats.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="rounded-[16px] border border-[#e0e9e8] bg-[#f4f8f7] p-[1.05rem]">
              <div className="flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-full bg-white text-[#08756a] shadow-sm">
                <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              </div>
              <h3 className="mt-[0.8rem] text-[0.84rem] font-bold text-[#142d36]">{title}</h3>
              <p className="mt-[0.35rem] text-[0.74rem] leading-[1.55] text-[#5a7078]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[1.25rem] flex flex-col gap-[1rem] rounded-[24px] bg-[#dff3ee] p-[1.4rem] sm:flex-row sm:items-center sm:justify-between sm:p-[1.8rem]">
        <div>
          <h2 className="text-[1.25rem] font-bold text-[#062f2b]">Ready to make your practice count?</h2>
          <p className="mt-[0.35rem] text-[0.8rem] leading-[1.5] text-[#365d59]">
            Choose your tutor, book securely, and we&apos;ll arrange the sessions around your interviews.
          </p>
        </div>
        <button
          type="button"
          onClick={startBooking}
          className="inline-flex shrink-0 items-center justify-center gap-[0.55rem] rounded-[12px] bg-[#08756a] px-[1.2rem] py-[0.9rem] text-[0.82rem] font-bold text-white transition hover:bg-[#055c54]"
        >
          Book the 4-hour package
          <ArrowRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
        </button>
      </section>

      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#021d1a]/70 p-[1rem] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loadingCheckout) setBookingOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-booking-title"
            className="relative w-full max-w-[520px] rounded-[24px] bg-white p-[1.4rem] shadow-2xl sm:p-[1.8rem]"
          >
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              disabled={loadingCheckout}
              aria-label="Close booking"
              className="absolute right-[1rem] top-[1rem] flex h-[2.2rem] w-[2.2rem] items-center justify-center rounded-full bg-[#f0f5f4] text-[#526a72] transition hover:bg-[#e4eeec] disabled:cursor-wait disabled:opacity-50"
            >
              <X className="h-[1rem] w-[1rem]" aria-hidden="true" />
            </button>

            <span className="inline-flex items-center gap-[0.4rem] rounded-full bg-[#e9f8f4] px-[0.7rem] py-[0.35rem] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#08756a]">
              <BadgeCheck className="h-[0.85rem] w-[0.85rem]" aria-hidden="true" />
              Secure booking
            </span>
            <h2 id="interview-booking-title" className="mt-[0.8rem] pr-[2.5rem] text-[1.55rem] font-bold tracking-[-0.03em] text-[#071923]">
              Book your interview tutoring
            </h2>
            <p className="mt-[0.45rem] text-[0.8rem] leading-[1.55] text-[#5c7179]">
              4 hours with {selectedPackage.shortLabel} for{" "}
              <strong className="font-bold text-[#17343c]">£{selectedPackage.price}</strong>.
              We&apos;ll arrange dates with you after payment.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="mt-[1.2rem]">
              <label htmlFor="interview-tutoring-email" className="text-[0.74rem] font-bold text-[#223b44]">
                Email address
              </label>
              <input
                id="interview-tutoring-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={bookingEmail}
                onChange={(event) => setBookingEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-[0.4rem] w-full rounded-[12px] border border-[#c9d9d7] bg-white px-[0.9rem] py-[0.85rem] text-[0.82rem] text-[#071923] outline-none transition placeholder:text-[#93a3a8] focus:border-[#169789] focus:ring-2 focus:ring-[#169789]/15"
              />
              <p className="mt-[0.4rem] text-[0.66rem] leading-[1.45] text-[#74868c]">
                Used for your receipt and to arrange your tutoring sessions.
              </p>

              {checkoutError && (
                <div role="alert" className="mt-[0.8rem] rounded-[10px] border border-[#efc5bf] bg-[#fff2f0] px-[0.8rem] py-[0.7rem] text-[0.72rem] leading-[1.5] text-[#8a352b]">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingCheckout}
                className="mt-[1rem] inline-flex w-full items-center justify-center gap-[0.55rem] rounded-[12px] bg-[#08756a] px-[1rem] py-[0.9rem] text-[0.82rem] font-bold text-white transition hover:bg-[#055c54] disabled:cursor-wait disabled:opacity-70"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="h-[1rem] w-[1rem] animate-spin" aria-hidden="true" />
                    Connecting to secure checkout…
                  </>
                ) : (
                  <>
                    Continue to secure payment
                    <ArrowRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {showContactFallback && (
              <div className="mt-[0.9rem] grid gap-[0.6rem] border-t border-[#e3ebea] pt-[0.9rem] sm:grid-cols-2">
                <a href={bookingMailHref} className="inline-flex items-center justify-center gap-[0.45rem] rounded-[11px] border border-[#bed4d0] px-[0.8rem] py-[0.75rem] text-[0.72rem] font-bold text-[#07665d] hover:bg-[#f4fbf9]">
                  <Mail className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
                  Email Rish
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-[0.45rem] rounded-[11px] border border-[#bed4d0] px-[0.8rem] py-[0.75rem] text-[0.72rem] font-bold text-[#07665d] hover:bg-[#f4fbf9]">
                  <MessageCircle className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            )}

            <p className="mt-[0.9rem] text-center text-[0.64rem] leading-[1.5] text-[#7b8b90]">
              Card details are entered securely on Stripe&apos;s payment page. Terms and cancellation policy apply.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
