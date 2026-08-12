export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type TicketListRow = {
  id: string;
  ticketCode: string;
  subject: string;
  status: TicketStatus;
  orderCode: string | null;
  createdAtLabel: string;
  messageCount: number;
};

export type TicketMessageData = {
  id: string;
  authorName: string;
  isAdminReply: boolean;
  body: string;
  createdAtLabel: string;
};

export type TicketDetailData = {
  id: string;
  ticketCode: string;
  subject: string;
  status: TicketStatus;
  orderCode: string | null;
  customerName?: string;
  customerEmail?: string;
  messages: TicketMessageData[];
};
