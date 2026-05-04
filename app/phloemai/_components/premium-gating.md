# Premium Gating

Use `SecurePremiumGate` for anything that must not appear in HTML, the DOM or
the React Server Component payload for free users.

```tsx
import { SecurePremiumGate } from "@/app/phloemai/_components/SecurePremiumGate";

export default function Page() {
  return (
    <SecurePremiumGate title="Unlock your full AI report">
      <SensitiveReportSection />
    </SecurePremiumGate>
  );
}
```

The locked fallback renders a blurred placeholder only; it does not render the
premium children. For existing client-only UI where the content is not sensitive,
use `ClientPremiumGate` with the current plan from the profile.
