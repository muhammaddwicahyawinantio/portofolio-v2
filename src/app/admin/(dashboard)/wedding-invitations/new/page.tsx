import Link from "next/link";
import InvitationCreateForm from "@/components/wedding/admin/InvitationCreateForm";

export default function NewInvitationPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
          New Invitation
        </h1>
        <Link href="/admin/wedding-invitations" className="text-ink-soft hover:text-ink text-xs">
          Back to list
        </Link>
      </header>
      <section className="border-line bg-card rounded-card shadow-card border p-6">
        <InvitationCreateForm />
      </section>
    </div>
  );
}
