import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Reservation } from "@/services/lab.service";

interface ViewReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
}

export function ViewReservationModal({ isOpen, onClose, reservation, onDelete, isDeleting = false }: ViewReservationModalProps) {
    if (!reservation) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#485B45] border-none text-white sm:max-w-md rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold mb-1">Detalles de la Reserva</DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Revisa la informacion de la reserva. Puedes cancelarla desde aqui.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 text-sm text-zinc-300 mt-2">
                    <div className="flex justify-between border-b border-[#354632] pb-2">
                        <span className="font-semibold text-white">Laboratorio:</span>
                        <span>{reservation.lab_nombre || `ID: ${reservation.lab_id}`}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#354632] pb-2">
                        <span className="font-semibold text-white">Fecha:</span>
                        <span>{new Date(String(reservation.fecha).split('T')[0]).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#354632] pb-2">
                        <span className="font-semibold text-white">Horario:</span>
                        <span>{reservation.hora_inicio}:00 a {reservation.hora_inicio + 1}:00</span>
                    </div>
                    <div className="flex justify-between border-b border-[#354632] pb-2">
                        <span className="font-semibold text-white">Estado:</span>
                        <span className="capitalize">{reservation.estado}</span>
                    </div>
                    {reservation.materia && (
                        <div className="flex flex-col gap-1 border-b border-[#354632] pb-2">
                            <span className="font-semibold text-white">Materia:</span>
                            <p className="bg-[#354632] p-3 rounded-xl mt-1">{reservation.materia}</p>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-3">
                        <Button
                            onClick={onClose}
                            disabled={isDeleting}
                            variant="ghost"
                            className="text-zinc-300 hover:text-white hover:bg-[#354632] disabled:opacity-50"
                        >
                            Cerrar
                        </Button>
                        <Button
                            onClick={() => onDelete(reservation.id)}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isDeleting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {isDeleting ? "Cancelando..." : "Cancelar Reserva"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
