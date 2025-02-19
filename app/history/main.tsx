"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";

// Mock data for service history
const serviceHistory = [
  { id: 1, device: "Laptop Asus", service: "Ganti Keyboard", date: "2023-05-15", status: "Selesai" },
  { id: 2, device: "PC Dell", service: "Upgrade RAM", date: "2023-06-02", status: "Dalam Proses" },
  { id: 3, device: "Printer HP", service: "Perbaikan Cartridge", date: "2023-06-20", status: "Menunggu Sparepart" },
  { id: 4, device: "MacBook Pro", service: "Ganti Battery", date: "2023-07-05", status: "Selesai" },
  { id: 5, device: "Lenovo ThinkPad", service: "Instalasi OS", date: "2023-07-10", status: "Selesai" },
];

export default function ServiceHistory() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = serviceHistory.filter((item) => Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Riwayat Servis</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input type="search" placeholder="Cari riwayat servis..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perangkat</TableHead>
            <TableHead>Layanan</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHistory.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.device}</TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Buka menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                    <DropdownMenuItem>Cetak Resi</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Hubungi Teknisi</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
