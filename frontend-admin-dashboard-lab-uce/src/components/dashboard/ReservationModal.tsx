import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lab, CreateBookingRequest } from "@/services/lab.service";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    labs: Lab[];
    onSave: (data: CreateBookingRequest) => void;
}

export function ReservationModal({ isOpen, onClose, selectedDate, labs, onSave }: ReservationModalProps) {
    const [laboratorioId, setLaboratorioId] = useState<string>("");
    const [horaInicio, setHoraInicio] = useState("08:00");
    const [horaFin, setHoraFin] = useState("10:00");
    const [materia, setMateria] = useState("");

    const handleSave = () => {
        const startHour = parseInt(horaInicio.split(":")[0]);
        const endHour = parseInt(horaFin.split(":")[0]);

        if (startHour >= endHour) {
            alert("La hora de inicio debe ser menor a la hora de fin.");
            return;
        }

        const horas = [];
        for (let i = startHour; i < endHour; i++) horas.push(i);

        // Format to YYYY-MM-DD avoiding UTC shift timezone bugs
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const localDateStr = `${yyyy}-${mm}-${dd}`;

        onSave({
            lab_id: Number(laboratorioId),
            fecha: localDateStr,
            horas,
            materia,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#485B45] border-none text-white sm:max-w-md rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold mb-4">Nueva Reserva</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium w-16 text-zinc-300">Lab</span>
                        <Select value={laboratorioId} onValueChange={setLaboratorioId}>
                            <SelectTrigger className="w-full bg-[#354632] border-none rounded-xl focus:ring-[#D3FB52]">
                                <SelectValue placeholder="Seleccione un laboratorio" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#354632] border-[#2A3B32] text-white">
                                {labs.map(lab => (
                                    <SelectItem key={lab.id} value={lab.id.toString()}>
                                        {lab.nombre} (Cap: {lab.capacidad})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium w-16 text-zinc-300">Hora</span>
                        <div className="flex items-center gap-2 flex-1">
                            <Input
                                type="time"
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                                className="bg-[#354632] border-none rounded-xl text-center focus-visible:ring-[#D3FB52]"
                            />
                            <span className="text-zinc-400">-</span>
                            <Input
                                type="time"
                                value={horaFin}
                                onChange={(e) => setHoraFin(e.target.value)}
                                className="bg-[#354632] border-none rounded-xl text-center focus-visible:ring-[#D3FB52]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium w-16 text-zinc-300">Fecha</span>
                        <span className="text-sm font-medium">{selectedDate.toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <span className="text-sm font-medium w-16 text-zinc-300 mt-2">Materia</span>
                        <textarea
                            value={materia}
                            onChange={(e) => setMateria(e.target.value)}
                            placeholder="Nombre de la materia..."
                            className="w-full bg-[#354632] border-none rounded-xl p-3 text-sm resize-none outline-none focus:ring-1 focus:ring-[#D3FB52] placeholder:text-zinc-400 h-20"
                        />
                    </div>

                    <div className="mt-4 flex justify-start">
                        <Button
                            onClick={handleSave}
                            className="bg-[#D3FB52] text-black font-semibold hover:bg-[#bce640] rounded-xl px-8"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
