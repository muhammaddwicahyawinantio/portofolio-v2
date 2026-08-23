"use client";
import { saveEvent } from "@/lib/wedding/actions";
import type { EditInvitation } from "@/lib/wedding/queries";
import ChildForm from "./ChildForm";
import { Field, TextInput, TextArea, INPUT } from "./fields";

type EventRecord = EditInvitation["events"][number];

export default function EventForm({
  invitationId,
  record,
}: {
  invitationId: string;
  record: EventRecord | null;
}) {
  const dateValue = record?.date ? new Date(record.date).toISOString().slice(0, 10) : "";
  return (
    <ChildForm
      action={saveEvent}
      invitationId={invitationId}
      recordId={record?.id ?? ""}
      submitLabel={record ? "Save event" : "Add event"}
    >
      <Field label="Title" required>
        <TextInput name="title" defaultValue={record?.title ?? ""} />
      </Field>
      <Field label="Date" required>
        <input name="date" type="date" defaultValue={dateValue} className={INPUT} />
      </Field>
      <Field label="Start Time">
        <input name="startTime" type="time" defaultValue={record?.startTime ?? ""} className={INPUT} />
      </Field>
      <Field label="End Time">
        <input name="endTime" type="time" defaultValue={record?.endTime ?? ""} className={INPUT} />
      </Field>
      <Field label="Venue Name">
        <TextInput name="venueName" defaultValue={record?.venueName ?? ""} />
      </Field>
      <Field label="Maps URL">
        <TextInput name="mapsUrl" type="url" defaultValue={record?.mapsUrl ?? ""} />
      </Field>
      <Field label="Venue Address" wide>
        <TextArea name="venueAddress" defaultValue={record?.venueAddress ?? ""} />
      </Field>
      <Field label="Description" wide>
        <TextArea name="description" defaultValue={record?.description ?? ""} />
      </Field>
      <Field label="Order">
        <TextInput name="order" type="number" defaultValue={String(record?.order ?? 0)} />
      </Field>
    </ChildForm>
  );
}
