"use client";
import { saveGift } from "@/lib/wedding/actions";
import { GIFT_TYPES } from "@/lib/wedding/validation";
import type { EditInvitation } from "@/lib/wedding/queries";
import ChildForm from "./ChildForm";
import { Field, TextInput, TextArea, SelectInput, ImageControl } from "./fields";

type GiftRecord = EditInvitation["gifts"][number];

export default function GiftForm({
  invitationId,
  record,
}: {
  invitationId: string;
  record: GiftRecord | null;
}) {
  return (
    <ChildForm
      action={saveGift}
      invitationId={invitationId}
      recordId={record?.id ?? ""}
      submitLabel={record ? "Save gift" : "Add gift"}
    >
      <Field label="Type" required>
        <SelectInput
          name="type"
          defaultValue={record?.type ?? "bank"}
          options={GIFT_TYPES.map((t) => ({ value: t, label: t }))}
        />
      </Field>
      <Field label="Provider Name">
        <TextInput name="providerName" defaultValue={record?.providerName ?? ""} />
      </Field>
      <Field label="Account Number">
        <TextInput name="accountNumber" defaultValue={record?.accountNumber ?? ""} />
      </Field>
      <Field label="Account Name">
        <TextInput name="accountName" defaultValue={record?.accountName ?? ""} />
      </Field>
      <Field label="Address" wide>
        <TextArea name="address" defaultValue={record?.address ?? ""} />
      </Field>
      <Field label="QR Image" wide>
        <ImageControl field={{ name: "qrImage", label: "QR Image", type: "image" }} record={record} />
      </Field>
      <Field label="Notes" wide>
        <TextArea name="notes" defaultValue={record?.notes ?? ""} />
      </Field>
      <Field label="Order">
        <TextInput name="order" type="number" defaultValue={String(record?.order ?? 0)} />
      </Field>
    </ChildForm>
  );
}
