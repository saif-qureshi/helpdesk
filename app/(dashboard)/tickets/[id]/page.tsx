import { notFound } from "next/navigation";
import { ticketById } from "@/lib/dummy-data";
import { TicketDetail } from "@/components/tickets/ticket-detail";

export default function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const ticket = Number.isFinite(id) ? ticketById(id) : undefined;
  if (!ticket) notFound();

  return <TicketDetail ticketId={ticket.id} />;
}
