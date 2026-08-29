import Link from "next/link";
import { Shield, EyeOff, Trash2, Key } from "lucide-react";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <div className="flex flex-col gap-6 text-center sm:text-left mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Privacy <span className="text-primary">First</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Because SpeakMind handles sensitive conversations and emotional check-ins, 
          privacy is the cornerstone of our platform. Here is exactly how we protect 
          your personal space and data.
        </p>
      </div>

      <div className="space-y-10">
        {/* Principle 1 */}
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <EyeOff className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Minimal Data Collection</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect only the bare essentials needed to deliver personalized coping support: 
              preferred name, email for account security, age range, and your check-in history. 
              We do not ask for full names, addresses, or phone numbers.
            </p>
          </div>
        </div>

        {/* Principle 2 */}
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Key className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Server-Side Credentials & Encryption</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Database URLs and AI API keys are stored strictly as private environment variables on 
              our secure servers. Your client device (or mobile APK) never receives direct access 
              to our database or external AI keys, protecting credentials from interception. All 
              API communications are encrypted over HTTPS.
            </p>
          </div>
        </div>

        {/* Principle 3 */}
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Anonymized Insights & Administrative Privacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We never expose identifiable, private conversations to administrators, parents, or teachers by default. 
              Our administrative and demo dashboards use completely synthetic or aggregated, anonymized statistics.
            </p>
          </div>
        </div>

        {/* Principle 4 */}
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Complete User-Controlled Deletion</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You own your data. At any point, you can navigate to the privacy settings in the application 
              to wipe your account. This action instantly deletes all check-ins, chat messages, journal logs, 
              and user details from the database—permanently and completely.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-secondary p-6 text-center">
        <p className="text-sm font-medium text-secondary-foreground">
          Questions about privacy? You can check our security guidelines or contact local youth support networks.
        </p>
      </div>
    </div>
  );
}
