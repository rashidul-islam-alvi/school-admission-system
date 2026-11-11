export interface ClassItem {
  id: string;
  name: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
}

export interface Hold {
  holdId: string;
  classId: string;
  studentId: string;
  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  expiresAt: string;
}

export interface StudentApplication {
  holdId: string;
  classId: string;
  className: string;
  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  expiresAt: string;
}

export interface StudentApplication {
  holdId: string;
  classId: string;
  className: string;
  status: "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  expiresAt: string;
}
