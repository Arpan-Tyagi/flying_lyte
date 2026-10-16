import React from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import SEO from "../components/SEO";

const cancellationRules = [
  {
    period: "45 days or more before arrival",
    charge: "Rs.1000 per person",
    highlight: "Lowest charge",
  },
  {
    period: "44–31 days before arrival",
    charge: "30% of tour cost",
    highlight: "Partial cancellation",
  },
  {
    period: "30–11 days before arrival",
    charge: "50% of tour cost",
    highlight: "Standard cancellation",
  },
  {
    period: "10 days or less before arrival",
    charge: "70% of tour cost",
    highlight: "Late cancellation",
  },
];

const CancellationPolicyPage = () => {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 px-4 py-20 sm:px-6 lg:px-8">
      <SEO
        title="Cancellation Policy - Transparent Travel Terms"
        description="Learn about FlyingLyte's cancellation policy, timeline-based charges, peak season rules, and procedures for canceling flight and tour reservations."
        canonical="https://www.flyinglyte.com/cancellation"
      />
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 md:py-14">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-2xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 ring-1 ring-white/20">
              <ShieldCheck size={16} />
              Transparent Travel Cancellation Terms
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Cancellation Policy
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              You may cancel your travel arrangements at any time. Written
              notification or an e-mail from the person who made the booking
              must be received at our office.
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="-mt-6 grid gap-4 px-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
            <Mail className="mb-3 text-blue-600" size={26} />
            <h3 className="font-bold text-slate-900">
              Written Notice Required
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cancellation requests must be sent in writing or by e-mail.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
            <CalendarClock className="mb-3 text-blue-600" size={26} />
            <h3 className="font-bold text-slate-900">Charges by Timeline</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Charges depend on the number of days before your arrival date.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100 sm:col-span-2 lg:col-span-1">
            <AlertTriangle className="mb-3 text-amber-500" size={26} />
            <h3 className="font-bold text-slate-900">Peak Season Note</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No refund will be issued for cancellations during peak season
              after advance payment is received.
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="mt-8 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-100 sm:p-8 lg:p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Cancellation Charges Per Person
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              The applicable cancellation charges are as per the published
              cancellation policy below:
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Cancellation Period
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Cancellation Charges
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Note
                  </th>
                </tr>
              </thead>

              <tbody>
                {cancellationRules.map((rule, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/60"
                  >
                    <td className="px-6 py-5 text-sm font-medium text-slate-800">
                      {rule.period}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-blue-700">
                      {rule.charge}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {rule.highlight}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {cancellationRules.map((rule, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    Rule {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {rule.highlight}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {rule.period}
                </h3>

                <p className="mt-3 text-lg font-extrabold text-blue-700">
                  {rule.charge}
                </p>
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle
                  className="mt-1 shrink-0 text-amber-600"
                  size={22}
                />
                <div>
                  <h3 className="font-bold text-slate-900">
                    Peak Season Cancellation
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    No refund will be issued for any cancellations of bookings
                    during peak season once advance payment has been received.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex gap-3">
                <CheckCircle2
                  className="mt-1 shrink-0 text-blue-600"
                  size={22}
                />
                <div>
                  <h3 className="font-bold text-slate-900">
                    Third-Party Charges
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    The above charges may vary based on any specific
                    cancellation charges applied by third-party service
                    providers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CancellationPolicyPage;
