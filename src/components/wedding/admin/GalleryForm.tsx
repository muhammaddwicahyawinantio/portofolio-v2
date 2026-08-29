"use client";
import { saveGalleryItem } from "@/lib/wedding/actions";
import type { EditInvitation } from "@/lib/wedding/queries";
import ChildForm from "./ChildForm";
import { Field, TextInput, ImageControl } from "./fields";

type GalleryRecord = EditInvitation["gallery"][number];

export default function GalleryForm({
  invitationId,
  record,
}: {
  invitationId: string;
  record: GalleryRecord | null;
}) {
  return (
    <ChildForm
      action={saveGalleryItem}
      invitationId={invitationId}
      recordId={record?.id ?? ""}
      submitLabel={record ? "Save photo" : "Add photo"}
    >
      <Field label="Image" required wide>
        <ImageControl field={{ name: "imageUrl", label: "Image", type: "image" }} record={record} />
      </Field>
      <Field label="Caption">
        <TextInput name="caption" defaultValue={record?.caption ?? ""} />
      </Field>
      <Field label="Order">
        <TextInput name="order" type="number" defaultValue={String(record?.order ?? 0)} />
      </Field>
    </ChildForm>
  );
}
