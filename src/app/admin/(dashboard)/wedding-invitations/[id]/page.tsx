import { notFound } from "next/navigation";
import Link from "next/link";
import { getInvitationForEdit } from "@/lib/wedding/queries";
import { deleteEvent, deleteGalleryItem, deleteGift } from "@/lib/wedding/actions";
import EditorTabs from "@/components/wedding/admin/EditorTabs";
import InvitationSectionForm from "@/components/wedding/admin/InvitationSectionForm";
import EventForm from "@/components/wedding/admin/EventForm";
import GalleryForm from "@/components/wedding/admin/GalleryForm";
import GiftForm from "@/components/wedding/admin/GiftForm";
import ChildList from "@/components/wedding/admin/ChildList";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
  ColorInput,
  Checkbox,
  ImageControl,
} from "@/components/wedding/admin/fields";
import { WEDDING_STATUSES } from "@/lib/wedding/validation";
import { TEMPLATE_OPTIONS } from "@/lib/wedding/template-registry";
import { DISPLAY_FONTS, BODY_FONTS } from "@/lib/wedding/fonts";

export default async function EditInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; saved?: string; child?: string }>;
}) {
  const { id } = await params;
  const { tab = "main", saved, child } = await searchParams;
  const record = await getInvitationForEdit(id);
  if (!record) notFound();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
          {record.brideName} &amp; {record.groomName}
        </h1>
        <div className="flex items-center gap-4">
          {saved ? <span className="text-success font-mono text-[13px]">Saved.</span> : null}
          <a
            href={`/undangan/${record.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-ink-soft hover:text-ink text-xs"
          >
            Preview
          </a>
          <Link href="/admin/wedding-invitations" className="text-ink-soft hover:text-ink text-xs">
            List
          </Link>
        </div>
      </header>

      <EditorTabs id={id} current={tab} />

      <section className="border-line bg-card rounded-card shadow-card border p-6">
        {tab === "main" ? (
          <InvitationSectionForm section="main" id={id}>
            <Field label="Title" required>
              <TextInput name="title" defaultValue={record.title} />
            </Field>
            <Field label="Slug" required>
              <TextInput name="slug" defaultValue={record.slug} />
            </Field>
            <Field label="Status">
              <SelectInput
                name="status"
                defaultValue={record.status}
                options={WEDDING_STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label="Template">
              <SelectInput
                name="templateSlug"
                defaultValue={record.templateSlug}
                options={TEMPLATE_OPTIONS.map((t) => ({ value: t.slug, label: t.label }))}
              />
            </Field>
            <Field label="Cover Image" wide>
              <ImageControl
                field={{ name: "coverImage", label: "Cover Image", type: "image" }}
                record={record}
              />
            </Field>
            <Field label="Opening Text" wide>
              <TextArea name="openingText" defaultValue={record.openingText ?? ""} />
            </Field>
            <Field label="Quote" wide>
              <TextArea name="quoteText" defaultValue={record.quoteText ?? ""} />
            </Field>
            <Field label="Story Title">
              <TextInput name="storyTitle" defaultValue={record.storyTitle ?? ""} />
            </Field>
            <Field label="Story Text" wide>
              <TextArea name="storyText" defaultValue={record.storyText ?? ""} />
            </Field>
          </InvitationSectionForm>
        ) : tab === "couple" ? (
          <InvitationSectionForm section="couple" id={id}>
            <Field label="Bride Name" required>
              <TextInput name="brideName" defaultValue={record.brideName} />
            </Field>
            <Field label="Groom Name" required>
              <TextInput name="groomName" defaultValue={record.groomName} />
            </Field>
            <Field label="Bride Full Name">
              <TextInput name="brideFullName" defaultValue={record.brideFullName ?? ""} />
            </Field>
            <Field label="Groom Full Name">
              <TextInput name="groomFullName" defaultValue={record.groomFullName ?? ""} />
            </Field>
            <Field label="Bride Parents" wide>
              <TextArea name="brideParents" defaultValue={record.brideParents ?? ""} />
            </Field>
            <Field label="Groom Parents" wide>
              <TextArea name="groomParents" defaultValue={record.groomParents ?? ""} />
            </Field>
            <Field label="Bride Photo" wide>
              <ImageControl
                field={{ name: "bridePhoto", label: "Bride Photo", type: "image" }}
                record={record}
              />
            </Field>
            <Field label="Groom Photo" wide>
              <ImageControl
                field={{ name: "groomPhoto", label: "Groom Photo", type: "image" }}
                record={record}
              />
            </Field>
          </InvitationSectionForm>
        ) : tab === "settings" ? (
          <InvitationSectionForm section="settings" id={id}>
            <Field label="Primary Color">
              <ColorInput name="primaryColor" defaultValue={record.primaryColor} />
            </Field>
            <Field label="Secondary Color">
              <ColorInput name="secondaryColor" defaultValue={record.secondaryColor} />
            </Field>
            <Field label="Accent Color">
              <ColorInput name="accentColor" defaultValue={record.accentColor} />
            </Field>
            <Field label="Background Color">
              <ColorInput name="backgroundColor" defaultValue={record.backgroundColor} />
            </Field>
            <Field label="Font Display">
              <SelectInput
                name="fontDisplay"
                defaultValue={record.fontDisplay}
                options={DISPLAY_FONTS.map((f) => ({ value: f.key, label: f.label }))}
              />
            </Field>
            <Field label="Font Body">
              <SelectInput
                name="fontBody"
                defaultValue={record.fontBody}
                options={BODY_FONTS.map((f) => ({ value: f.key, label: f.label }))}
              />
            </Field>
            <Field label="Music URL" wide>
              <TextInput name="musicUrl" type="url" defaultValue={record.musicUrl ?? ""} />
            </Field>
            <Field label="Enable Music">
              <Checkbox name="isMusicEnabled" defaultChecked={record.isMusicEnabled} />
            </Field>
            <Field label="Enable RSVP">
              <Checkbox name="isRsvpEnabled" defaultChecked={record.isRsvpEnabled} />
            </Field>
            <Field label="Enable Guestbook">
              <Checkbox name="isGuestbookEnabled" defaultChecked={record.isGuestbookEnabled} />
            </Field>
          </InvitationSectionForm>
        ) : tab === "events" ? (
          <>
            <EventForm
              key={child ?? "new"}
              invitationId={id}
              record={record.events.find((e) => e.id === child) ?? null}
            />
            <ChildList
              rows={record.events}
              tab="events"
              invitationId={id}
              deleteAction={deleteEvent}
              columns={[
                { label: "Title", get: (e) => e.title },
                { label: "Date", get: (e) => new Date(e.date).toLocaleDateString("id-ID") },
                { label: "Order", get: (e) => String(e.order) },
              ]}
            />
          </>
        ) : tab === "gallery" ? (
          <>
            <GalleryForm
              key={child ?? "new"}
              invitationId={id}
              record={record.gallery.find((g) => g.id === child) ?? null}
            />
            <ChildList
              rows={record.gallery}
              tab="gallery"
              invitationId={id}
              deleteAction={deleteGalleryItem}
              columns={[
                { label: "Image", get: (g) => g.imageUrl.slice(0, 40) },
                { label: "Caption", get: (g) => g.caption ?? "—" },
                { label: "Order", get: (g) => String(g.order) },
              ]}
            />
          </>
        ) : tab === "gifts" ? (
          <>
            <GiftForm
              key={child ?? "new"}
              invitationId={id}
              record={record.gifts.find((g) => g.id === child) ?? null}
            />
            <ChildList
              rows={record.gifts}
              tab="gifts"
              invitationId={id}
              deleteAction={deleteGift}
              columns={[
                { label: "Type", get: (g) => g.type },
                { label: "Provider", get: (g) => g.providerName ?? "—" },
                { label: "Order", get: (g) => String(g.order) },
              ]}
            />
          </>
        ) : (
          <p className="text-ink-soft text-sm">This tab ships in a later phase.</p>
        )}
      </section>
    </div>
  );
}
