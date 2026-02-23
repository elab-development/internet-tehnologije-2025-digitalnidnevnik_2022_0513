"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Nager.Date API type za jedan praznik
type Holiday = {
  date: string; // datum u ISO formatu (YYYY-MM-DD)
  localName: string; // naziv na srpskom
  name: string; // naziv na engleskom
  countryCode: string; // ISO kod drzave (RS)
  fixed: boolean; // da li je fiksni datum svake godine
  global: boolean; // da li vazi za celu drzavu
  types: string[]; // tipovi praznika (Public, Bank, itd.)
};
const HolidaysWidget = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const year = new Date().getFullYear();
        // Nager.Date API - besplatan, bez API kljuca
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/RS`,
        );

        if (!response.ok) {
          throw new Error("Greška pri učitavanju praznika");
        }

        const data: Holiday[] = await response.json();

        // filtriramo samo predstojece praznike
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = data
          .filter((h) => new Date(h.date) >= today)
          .slice(0, 5); // prikazujemo max 5 praznika

        setHolidays(upcoming);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nepoznata greška");
      } finally {
        setLoading(false);
      }
    }

    fetchHolidays();
  }, []);

  // formatiranje datuma na srpski
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "long",
    });
  };

  // racunanje koliko dana do praznika
  const daysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(dateString);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Predstojeći praznici</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Učitavanje praznika...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Predstojeći praznici</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Predstojeći praznici</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {holidays.length === 0 ? (
          <div className="text-sm text-slate-500">
            Nema predstojećih praznika ove godine.
          </div>
        ) : (
          holidays.map((holiday) => {
            const days = daysUntil(holiday.date);
            return (
              <div
                key={holiday.date}
                className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="font-medium text-sm">{holiday.localName}</div>
                  <div className="text-xs text-slate-500">
                    {formatDate(holiday.date)}
                  </div>
                </div>
                <Badge
                  variant={days === 0 ? "default" : "outline"}
                  className={days === 0 ? "bg-green-500" : ""}>
                  {days === 0
                    ? "Danas!"
                    : days === 1
                      ? "Sutra"
                      : `za ${days} dana`}
                </Badge>
              </div>
            );
          })
        )}
        <div className="text-xs text-slate-400 pt-2">Izvor: Nager.Date API</div>
      </CardContent>
    </Card>
  );
};

export default HolidaysWidget;
