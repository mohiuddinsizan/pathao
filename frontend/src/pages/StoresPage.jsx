import { useEffect, useState } from "react";
import { getStores } from "@/api/stores";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="h-5 w-36 rounded bg-muted animate-pulse mb-3" />
        <div className="h-4 w-48 rounded bg-muted animate-pulse mb-2" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStores()
      .then((data) => setStores(Array.isArray(data) ? data : []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your registered pickup locations
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <Card
              key={store.id}
              className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {store.branch || store.name || "Unnamed Store"}
                </CardTitle>
                <CardDescription>{store.zone ? `${store.zone}, ${store.city}` : store.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {store.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No stores found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
